import { z } from "zod";

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(191).transform((value) => value.toLowerCase()),
  subject: z.string().trim().min(2).max(191),
  message: z.string().trim().min(10).max(10_000),
  website: z.string().max(0).optional(),
});

export const messageQuerySchema = z.object({
  q: z.string().trim().max(100).optional().default(""),
  status: z.enum(["NEW", "READ", "ARCHIVED"]).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const updateMessageSchema = z.object({
  status: z.enum(["NEW", "READ", "ARCHIVED"]),
});
