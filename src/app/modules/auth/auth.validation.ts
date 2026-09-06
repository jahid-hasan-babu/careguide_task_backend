import { z } from "zod";

const registerUser = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["USER", "ADMIN"]).optional(),
  interests: z.array(z.string()).optional(),
});

const loginUser = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

const refreshToken = z.object({
  refreshToken: z.string().optional(),
});

const verifyOtp = z.object({
  email: z.string().email("Invalid email"),
  otp: z.string().min(4, "OTP must be at least 4 characters").max(8),
});

const resendOtp = z.object({
  email: z.string().email("Invalid email"),
});

const forgotPassword = z.object({
  email: z.string().email("Invalid email address"),
});

const verifyResetOtp = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().min(4, "OTP must be at least 4 characters").max(8),
});

const resetPassword = z.object({
  resetToken: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

const changePassword = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const authValidation = {
  registerUser,
  loginUser,
  refreshToken,
  verifyOtp,
  resendOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  changePassword,
};
