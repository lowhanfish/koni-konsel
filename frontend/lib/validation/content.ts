import { z } from "zod";
import { contentKinds, contentStatuses } from "@/lib/content";

export const contentQuerySchema = z.object({
  kind: z.enum(contentKinds).optional(),
  status: z.enum(contentStatuses).optional(),
  q: z.string().trim().max(100).optional().default(""),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const contentFormSchema = z.object({
  title: z.string().trim().min(3).max(191),
  category: z.string().trim().max(100).nullable().optional(),
  summary: z.string().trim().max(10_000).nullable().optional(),
  status: z.enum(contentStatuses).optional().default("DRAFT"),
});

export const createContentSchema = contentFormSchema.extend({
  kind: z.enum(contentKinds),
  slug: z.string().trim().min(1).max(191).optional(),
  metadata: z.record(z.string(), z.json()).optional(),
  publishedAt: z.coerce.date().nullable().optional(),
});

export const updateContentSchema = createContentSchema.omit({ kind: true }).partial();
