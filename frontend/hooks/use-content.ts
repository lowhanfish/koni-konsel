"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ContentItem, ContentKind, ContentListResponse, ContentStatus } from "@/lib/content";

type ContentQuery = { kind?: ContentKind; q?: string; status?: ContentStatus; page?: number; pageSize?: number; enabled?: boolean };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || "Permintaan gagal");
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function useContentList({ enabled = true, ...query }: ContentQuery) {
  const params = new URLSearchParams();
  if (query.kind) params.set("kind", query.kind);
  if (query.q) params.set("q", query.q);
  if (query.status) params.set("status", query.status);
  params.set("page", String(query.page ?? 1));
  params.set("pageSize", String(query.pageSize ?? 10));
  return useQuery({
    queryKey: ["content", query],
    queryFn: () => request<ContentListResponse>(`/api/content?${params}`),
    enabled,
  });
}

export function useContentItem(id?: string) {
  return useQuery({
    queryKey: ["content", "detail", id],
    queryFn: () => request<{ data: ContentItem }>(`/api/content/${id}`),
    enabled: Boolean(id),
  });
}

type CreateContentInput = Pick<ContentItem, "kind" | "title" | "status"> & Partial<Pick<ContentItem, "category" | "summary">>;

export function useCreateContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateContentInput) => request<{ data: ContentItem }>("/api/content", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content"] }),
  });
}

type UpdateContentInput = Partial<Pick<ContentItem, "title" | "category" | "summary" | "status">>;

export function useUpdateContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateContentInput }) =>
      request<{ data: ContentItem }>(`/api/content/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(["content", "detail", data.id], { data });
      return queryClient.invalidateQueries({ queryKey: ["content"] });
    },
  });
}

export function useDeleteContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => request<void>(`/api/content/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content"] }),
  });
}
