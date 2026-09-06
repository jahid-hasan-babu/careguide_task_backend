import { z } from "zod";

const createUser = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["USER", "ADMIN"]).optional(),
  interests: z.array(z.string()).optional(),
});

const updateUser = z.object({
  fullName: z.string().min(1).optional(),
  interests: z.array(z.string()).optional(),
  status: z.enum(["ACTIVE", "BLOCKED"]).optional(),
});

export const userValidation = { createUser, updateUser };
