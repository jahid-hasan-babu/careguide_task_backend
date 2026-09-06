import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import httpStatus from "http-status";
import { jwtHelpers } from "../helpers/jwtHelpers";
import ApiError from "../errors/ApiError";

/**
 * STATELESS authentication middleware.
 *
 * Validates the JWT signature and claims only — ZERO database queries.
 * After this middleware runs, `req.user` is populated with { id, role }.
 *
 * Trade-off: an already-issued access token remains technically valid until
 * its expiration even if the user is later blocked/deleted in the database.
 * Mitigated by keeping access token TTL short (~15 minutes).
 * Use the refresh endpoint to do the one-per-refresh database check.
 */
const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Validate the Bearer format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Authentication required"
      );
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Authentication required");
    }

    // 2. Verify JWT signature + expiration (algorithm pinned to HS256 inside helper)
    //    Never query the database here.
    let payload;
    try {
      payload = jwtHelpers.verifyAccessToken(token);
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
      }
      if (err instanceof jwt.JsonWebTokenError) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
      }
      // Re-throw anything unexpected so globalErrorHandler catches it
      throw err;
    }

    // 3. Validate required claims
    if (!payload.sub || !payload.role) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
    }

    // 4. Attach minimal user object — typed by IRequestUser (see interface/index.ts)
    req.user = {
      id: payload.sub,
      role: payload.role as "USER" | "ADMIN",
    };

    next();
  } catch (err) {
    next(err);
  }
};

export { authenticate };
export default authenticate;
