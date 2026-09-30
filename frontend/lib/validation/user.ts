import { z } from "zod";

const role = z.enum(["SUPER_ADMIN", "EDITOR", "CONTRIBUTOR"]);

export const userQuerySchema = z.object({
  q: z.string().trim().max(100).optional().default(""),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(191).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
  role,
  isActive: z.boolean().optional().default(true),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: z.email().max(191).transform((value) => value.toLowerCase()).optional(),
  password: z.string().min(8).max(128).optional(),
  role: role.optional(),
  isActive: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0, "Tidak ada perubahan");
