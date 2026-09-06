import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../errors/ApiError";
import { UserRole } from "../modules/user/user.interface";

const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(httpStatus.UNAUTHORIZED, "Authentication required"));
      return;
    }

    const userRole = req.user.role as UserRole;

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      next(
        new ApiError(
          httpStatus.FORBIDDEN,
          "Insufficient permissions"
        )
      );
      return;
    }

    next();
  };
};

export { authorize };
export default authorize;
