import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email tidak valid").trim().toLowerCase(),
  password: z.string().min(8, "Password minimal 8 karakter").max(128),
});
