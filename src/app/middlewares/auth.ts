import { NextFunction, Request, Response } from "express";
import { JwtPayload, Secret } from "jsonwebtoken";
import config from "../../config";
import httpStatus from "http-status";
import { jwtHelpers } from "../helpers/jwtHelpers";
import User from "../modules/user/user.model";
import ApiError from "../errors/ApiError";

const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    _res: Response,
    next: NextFunction
  ) => {
    try {
      const headersAuth = req.headers.authorization;

      if (!headersAuth || !headersAuth.startsWith("Bearer ")) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid authorization format!");
      }

      const token = headersAuth.split(" ")[1];
      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.access_secret as Secret
      );

      const user = await User.findById(verifiedUser.id).select("status role isDeleted");

      if (!user || user.isDeleted) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
      }

      if (user.status === "BLOCKED") {
        throw new ApiError(httpStatus.FORBIDDEN, "Your account is blocked!");
      }

      req.user = verifiedUser as JwtPayload;

      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden! You are not authorized!");
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
