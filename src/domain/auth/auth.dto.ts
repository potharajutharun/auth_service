import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().max(150),
  password: z.string().min(8).max(128),
  tenant_id: z.coerce.number().int().positive(),
});


export const loginSchema = z.object({ 
  email: z.string().email().max(150),
  password: z.string().min(8).max(128)
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().max(150),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20),
  newPassword: z.string().min(8).max(128),
});

export const googleUserSchema = z.object({
  email: z.string().email().max(150),
  name: z.string().min(2).max(100),
  googleId: z.string().min(5) // Google's unique ID for the user
});
