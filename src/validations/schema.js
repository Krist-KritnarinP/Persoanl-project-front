import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(15, "auth.passwordRule")
  .refine(
    (v) => new TextEncoder().encode(v).length <= 72,
    "validation.passwordBytes",
  );
export const registerSchema = z
  .object({
    username: z.string().min(4, "validation.username"),
    email: z.string().email("validation.email"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "validation.confirm"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "auth.passwordMismatch",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("validation.email"),
  password: z.string().min(1, "validation.password"),
});
