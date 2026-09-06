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

export const authValidation = {
  registerUser,
  loginUser,
  refreshToken,
  verifyOtp,
  resendOtp,
};
