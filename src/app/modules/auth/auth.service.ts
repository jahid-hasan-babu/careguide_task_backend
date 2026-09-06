import bcrypt from "bcrypt";
import httpStatus from "http-status";
import config from "../../../config";
import ApiError from "../../errors/ApiError";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import User from "../user/user.model";
import {
  IAuthTokens,
  IRefreshRequest,
  IRegisterUser,
  IUserLogin,
} from "./auth.interface"


const parseExpiresInSeconds = (value: string | undefined): number => {
  if (!value) return 900;
  const match = value.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 900;
  const amount = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return amount * (multipliers[unit] ?? 60);
};

const registerUser = async (
  payload: IRegisterUser
): Promise<{ _id: unknown; fullName: string; email: string; role: string } & IAuthTokens> => {
  const email = payload.email.trim().toLowerCase();

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, "User already exists with this email.");
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds)
  );

  const user = await User.create({
    fullName: payload.fullName,
    email,
    password: hashedPassword,
    role: payload.role || "USER",
    interests: payload.interests || [],
  });


  const userId = (user._id as object).toString();
  const accessToken = jwtHelpers.generateAccessToken(userId, user.role);
  const refreshToken = jwtHelpers.generateRefreshToken(userId);

  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    accessToken,
    refreshToken,
    expiresIn: parseExpiresInSeconds(config.jwt.access_expires_in),
  };
};

const loginUser = async (
  payload: IUserLogin
): Promise<{ _id: unknown; fullName: string; email: string; role: string } & IAuthTokens> => {
  const email = payload.email.trim().toLowerCase();

  const user = await User.findOne({ email, isDeleted: false }).select("+password");
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password.");
  }

  if (user.status === "BLOCKED") {
    throw new ApiError(httpStatus.FORBIDDEN, "Your account is blocked.");
  }

  const isMatch = await bcrypt.compare(payload.password, user.password);
  if (!isMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password.");
  }

  const userId = (user._id as object).toString();
  const accessToken = jwtHelpers.generateAccessToken(userId, user.role);
  const refreshToken = jwtHelpers.generateRefreshToken(userId);

  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    accessToken,
    refreshToken,
    expiresIn: parseExpiresInSeconds(config.jwt.access_expires_in),
  };
};


const refreshAccessToken = async (
  payload: IRefreshRequest
): Promise<Pick<IAuthTokens, "accessToken" | "expiresIn">> => {
  const { refreshToken } = payload;
  let decoded;
  try {
    decoded = jwtHelpers.verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
  }

  if (!decoded.sub) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
  }
  const user = await User.findById(decoded.sub).select("status isDeleted role");
  if (!user || user.isDeleted) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
  }
  if (user.status === "BLOCKED") {
    throw new ApiError(httpStatus.FORBIDDEN, "Your account is blocked.");
  }

  const accessToken = jwtHelpers.generateAccessToken(decoded.sub, user.role);

  return {
    accessToken,
    expiresIn: parseExpiresInSeconds(config.jwt.access_expires_in),
  };
};

const logout = (): { message: string; instructions: string } => {
  return {
    message: "Logout successful.",
    instructions:
      "HttpOnly refresh cookie cleared. " +
      "Delete any client-stored access tokens from memory/storage. " +
      "The short-lived access token remains technically valid until expiration (~15 min). " +
      "No server-side session was created.",
  };
};

export const AuthServices = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logout,
};
