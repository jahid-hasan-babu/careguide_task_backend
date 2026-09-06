import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../errors/ApiError";
import { UserRole } from "../modules/user/user.interface";

/**
 * Authorization middleware — answers "Is this user allowed to do this?"
 *
 * Must always be used AFTER `authenticate`.
 *
 * Usage:
 *   router.delete("/users/:id", authenticate, authorize("ADMIN"), controller.deleteUser);
 *   router.get("/notes",        authenticate, authorize("USER", "ADMIN"), controller.getNotes);
 *
 * Returns:
 *   401  — if req.user is missing (middleware ordering error; authenticate was not called first)
 *   403  — if the user's role is not in the allowed list
 */
const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // Guard: authenticate should have run before this middleware
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
