import { UserRole } from "../user/user.interface";

// ─── Request body types ────────────────────────────────────────────────────────

export interface IRegisterUser {
  fullName: string;
  email: string;
  password: string;
  role?: UserRole;
  interests?: string[];
}

export interface IUserLogin {
  email: string;
  password: string;
}

export interface IRefreshRequest {
  refreshToken: string;
}

// ─── JWT payload shapes ────────────────────────────────────────────────────────

/**
 * Access token payload (short-lived, ~15 min).
 * Minimal claims only — no sensitive or unnecessary data.
 *
 * {
 *   "sub": "userId",
 *   "role": "USER",
 *   "iat": 1234567890,
 *   "exp": 1234568790
 * }
 */
export interface IAccessTokenPayload {
  sub: string;
  role: UserRole;
  iat: number;
  exp: number;
}

/**
 * Refresh token payload (long-lived, 7–30 days).
 *
 * {
 *   "sub": "userId",
 *   "type": "refresh",
 *   "iat": 1234567890,
 *   "exp": 1234567890
 * }
 */
export interface IRefreshTokenPayload {
  sub: string;
  type: "refresh";
  iat: number;
  exp: number;
}

// ─── Service response types ────────────────────────────────────────────────────

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  /** Access token lifetime in seconds (e.g. 900 for 15 minutes) */
  expiresIn: number;
}
