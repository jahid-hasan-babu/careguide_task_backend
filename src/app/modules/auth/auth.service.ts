import bcrypt from "bcrypt";
import crypto from "crypto";
import httpStatus from "http-status";
import config from "../../../config";
import ApiError from "../../errors/ApiError";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import { enqueueOtpEmail } from "../../queues/email.queue";
import User from "../user/user.model";
import {
  IAuthTokens,
  IRefreshRequest,
  IRegisterUser,
  IResendOtp,
  IUserLogin,
  IVerifyOtp,
} from "./auth.interface";

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
): Promise<{ email: string; fullName: string; needsVerification: boolean }> => {
  const email = payload.email.trim().toLowerCase();

  const existing = await User.findOne({ email });
  if (existing && existing.isVerified) {
    throw new ApiError(httpStatus.CONFLICT, "User already exists with this email.");
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds)
  );

  const otp = crypto.randomInt(100000, 1000000).toString();
  const otpExpires = new Date(Date.now() + config.otp.expires_in_minutes * 60 * 1000);

  let user;
  if (existing && !existing.isVerified) {
    existing.fullName = payload.fullName;
    existing.password = hashedPassword;
    existing.role = payload.role || "USER";
    existing.interests = payload.interests || [];
    existing.otp = otp;
    existing.otpExpires = otpExpires;
    user = await existing.save();
  } else {
    user = await User.create({
      fullName: payload.fullName,
      email,
      password: hashedPassword,
      role: payload.role || "USER",
      interests: payload.interests || [],
      isVerified: false,
      otp,
      otpExpires,
    });
  }

  // Dispatch OTP email job to BullMQ queue
  await enqueueOtpEmail(user.email, user.fullName, otp);

  return {
    email: user.email,
    fullName: user.fullName,
    needsVerification: true,
  };
};

const verifyOtp = async (
  payload: IVerifyOtp
): Promise<{ _id: unknown; fullName: string; email: string; role: string } & IAuthTokens> => {
  const email = payload.email.trim().toLowerCase();
  const user = await User.findOne({ email, isDeleted: false }).select("+otp +otpExpires");

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found with this email.");
  }

  if (user.isVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email is already verified. Please login.");
  }

  if (!user.otp || !user.otpExpires) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No active OTP found. Please request a new one.");
  }

  if (new Date() > user.otpExpires) {
    throw new ApiError(httpStatus.BAD_REQUEST, "OTP has expired. Please request a new code.");
  }

  if (user.otp !== payload.otp.trim()) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid verification code.");
  }

  // Mark user as verified and clear temporary OTP fields
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

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

const resendOtp = async (
  payload: IResendOtp
): Promise<{ email: string; message: string }> => {
  const email = payload.email.trim().toLowerCase();
  const user = await User.findOne({ email, isDeleted: false });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found with this email.");
  }

  if (user.isVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email is already verified. Please login.");
  }

  const otp = crypto.randomInt(100000, 1000000).toString();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + config.otp.expires_in_minutes * 60 * 1000);
  await user.save();

  // Dispatch OTP email job to BullMQ queue
  await enqueueOtpEmail(user.email, user.fullName, otp);

  return {
    email: user.email,
    message: "A new verification code has been sent to your email.",
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

  if (!user.isVerified) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Your email is not verified. Please verify your account with the OTP sent to your email."
    );
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
  const user = await User.findById(decoded.sub).select("status isDeleted role isVerified");
  if (!user || user.isDeleted) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
  }
  if (!user.isVerified) {
    throw new ApiError(httpStatus.FORBIDDEN, "Your account is not verified.");
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
  verifyOtp,
  resendOtp,
  loginUser,
  refreshAccessToken,
  logout,
};

