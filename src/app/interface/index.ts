import { UserRole } from "../modules/user/user.interface";

/**
 * Minimal user object attached to req.user by the authenticate middleware.
 * Contains only what was encoded in the JWT — no database data.
 */
export interface IRequestUser {
  id: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: IRequestUser;
    }
  }
}