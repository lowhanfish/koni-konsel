"use client";

import { useQuery } from "@tanstack/react-query";
import type { ContentItem, ContentKind } from "@/lib/content";

type PublicContentResponse = { data: ContentItem[]; meta: { page: number; pageSize: number; total: number; pageCount: number } };

export function usePublicContent({ kind, q, page = 1, pageSize = 12 }: { kind: ContentKind; q?: string; page?: number; pageSize?: number }) {
  const params = new URLSearchParams({ kind, page: String(page), pageSize: String(pageSize) });
  if (q) params.set("q", q);
  return useQuery({
    queryKey: ["public-content", { kind, q, page, pageSize }],
    queryFn: async () => {
      const response = await fetch(`/api/public/content?${params}`);
      const body = await response.json() as PublicContentResponse & { error?: string };
      if (!response.ok) throw new Error(body.error || "Gagal memuat konten");
      return body;
    },
    staleTime: 30_000,
  });
}
