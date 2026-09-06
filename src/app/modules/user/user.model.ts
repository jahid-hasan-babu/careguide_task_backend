import { Schema, model, Document } from "mongoose";
import { IUser } from "./user.interface";

export interface IUserDocument extends IUser, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    interests: { type: [String], default: [] },
    status: { type: String, enum: ["ACTIVE", "BLOCKED"], default: "ACTIVE" },
    isDeleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    passwordResetOtp: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, createdAt: -1 });

const User = model<IUserDocument>("User", userSchema);

export default User;
