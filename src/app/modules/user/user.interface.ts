export type UserRole = "USER" | "ADMIN";
export type UserStatus = "ACTIVE" | "BLOCKED";

export interface IUser {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  interests: string[];
  status: UserStatus;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
