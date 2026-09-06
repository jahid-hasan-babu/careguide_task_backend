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
} from "./auth.interface";

// Access token TTL in seconds for the expiresIn response field.
// Parsed from config so the response stays in sync with the actual token.
const parseExpiresInSeconds = (value: string | undefined): number => {
  if (!value) return 900; // default 15 min
  const match = value.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 900;
  const amount = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return amount * (multipliers[unit] ?? 60);
};

// ─── Register ─────────────────────────────────────────────────────────────────

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

  // Minimal JWT payloads — no email, no sensitive data
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

// ─── Login ────────────────────────────────────────────────────────────────────

const loginUser = async (
  payload: IUserLogin
): Promise<{ _id: unknown; fullName: string; email: string; role: string } & IAuthTokens> => {
  const email = payload.email.trim().toLowerCase();

  const user = await User.findOne({ email, isDeleted: false }).select("+password");
  if (!user) {
    // Generic message — do not reveal whether the email exists
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password.");
  }

  if (user.status === "BLOCKED") {
    throw new ApiError(httpStatus.FORBIDDEN, "Your account is blocked.");
  }

  const isMatch = await bcrypt.compare(payload.password, user.password);
  if (!isMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password.");
  }

  // Minimal JWT payloads — sub = userId, role only
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

// ─── Refresh ─────────────────────────────────────────────────────────────────

/**
 * Issues a new access token given a valid refresh token.
 *
 * Stateless checks (JWT only, no DB):
 *   1. Valid JWT signature (refresh secret, HS256 algorithm).
 *   2. Token has not expired.
 *   3. Token type is "refresh" (rejects access tokens).
 *   4. Subject (userId) claim is present.
 *
 * One database query — only at refresh time (not at every request):
 *   5. User exists and is not deleted/blocked.
 *
 * Does NOT rotate the refresh token — client keeps the same refresh token
 * until it expires. Rotation can be added as a future enhancement.
 */
const refreshAccessToken = async (
  payload: IRefreshRequest
): Promise<Pick<IAuthTokens, "accessToken" | "expiresIn">> => {
  const { refreshToken } = payload;

  // 1-4: Verify JWT (signature, expiry, type, sub) — all inside verifyRefreshToken
  let decoded;
  try {
    decoded = jwtHelpers.verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
  }

  if (!decoded.sub) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
  }

  // 5: One DB check per refresh cycle (not per request)
  const user = await User.findById(decoded.sub).select("status isDeleted role");
  if (!user || user.isDeleted) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
  }
  if (user.status === "BLOCKED") {
    throw new ApiError(httpStatus.FORBIDDEN, "Your account is blocked.");
  }

  // Issue new access token
  const accessToken = jwtHelpers.generateAccessToken(decoded.sub, user.role);

  return {
    accessToken,
    expiresIn: parseExpiresInSeconds(config.jwt.access_expires_in),
  };
};

// ─── Logout ──────────────────────────────────────────────────────────────────
//
// The system is STRICTLY STATELESS — no server-side token blacklist or session.
//
// Security note / trade-off:
//   An already-issued access token remains technically valid until its expiration
//   because the server maintains no authentication state.
//   The short access token TTL (~15 minutes) minimises the exposure window.
//   Clients MUST delete both tokens from storage on logout.
//
// This function exists only to provide a documented API endpoint with the
// trade-off explanation.

const logout = (): { message: string; instructions: string } => {
  return {
    message: "Logout successful.",
    instructions:
      "Delete your access token and refresh token from client storage. " +
      "The access token remains technically valid until expiration (~15 min). " +
      "No server-side session was created.",
  };
};

export const AuthServices = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logout,
};
