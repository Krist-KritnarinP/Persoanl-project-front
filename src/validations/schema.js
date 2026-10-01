import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "auth.passwordRule")
  .refine(
    (v) => new TextEncoder().encode(v).length <= 72,
    "validation.passwordBytes",
  );
export const registerSchema = z
  .object({
    username: z.string().trim().min(1, "validation.usernameRequired").min(4, "validation.username").max(50, "validation.usernameMax"),
    email: z.string().trim().min(1, "validation.emailRequired").email("validation.email").max(100, "validation.emailMax"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "validation.confirm"),
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: "auth.passwordMismatch",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("validation.email"),
  password: z.string().min(1, "validation.password"),
});
