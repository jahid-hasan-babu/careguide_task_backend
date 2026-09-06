import { UserRole } from "../modules/user/user.interface";

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
