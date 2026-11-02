import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter.")
    .max(30, "Username maksimal 30 karakter.")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username hanya boleh berisi huruf, angka, dan underscore."
    ),

  email: z
    .string()
    .trim()
    .email("Format email tidak valid.")
    .max(255),

  password: z
    .string()
    .min(8, "Password minimal 8 karakter.")
    .max(128, "Password maksimal 128 karakter."),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Username atau email wajib diisi."),
  password: z.string().min(1, "Password wajib diisi."),
});