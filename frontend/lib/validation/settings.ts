import { z } from "zod";

const optionalUrl = z.union([z.url(), z.literal("")]).transform((value) => value || null).nullable().optional();

export const siteSettingsSchema = z.object({
  organizationName: z.string().trim().min(3).max(191),
  description: z.string().trim().min(10).max(2_000),
  email: z.email().max(191).transform((value) => value.toLowerCase()),
  phone: z.string().trim().min(6).max(40),
  address: z.string().trim().min(10).max(1_000),
  facebookUrl: optionalUrl,
  instagramUrl: optionalUrl,
  youtubeUrl: optionalUrl,
});
