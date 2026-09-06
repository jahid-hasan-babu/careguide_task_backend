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
  isVerified: boolean;
  otp?: string;
  otpExpires?: Date;
  passwordResetOtp?: string;
  passwordResetExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
