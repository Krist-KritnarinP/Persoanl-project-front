import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(15, "Use at least 15 characters")
  .refine(
    (v) => new TextEncoder().encode(v).length <= 72,
    "Password must not exceed 72 UTF-8 bytes",
  );
export const registerSchema = z
  .object({
    username: z.string().min(4, "Username must be at least 4 characters"),
    email: z.string().email("Invalid email address"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Confirm password must match password",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
