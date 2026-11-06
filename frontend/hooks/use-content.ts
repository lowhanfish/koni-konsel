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

export type UploadedMedia = { id: string; name: string; mimeType: string; size: number; url: string };

async function compressImageFile(file: File, maxDimension = 1200, quality = 0.82): Promise<File> {
  if (typeof window === "undefined" || !file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(file);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) return resolve(file);
          const baseName = file.name.replace(/\.[^/.]+$/, "");
          const newFile = new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
          resolve(newFile);
        },
        "image/jpeg",
        quality,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

export async function uploadMedia(file: File, purpose: "image" | "attachment") {
  const fileToUpload = purpose === "image" ? await compressImageFile(file) : file;
  const body = new FormData();
  body.set("file", fileToUpload);
  body.set("purpose", purpose);
  const response = await fetch("/api/media", { method: "POST", body });
  const result = (await response.json().catch(() => null)) as { data?: UploadedMedia; error?: string } | null;
  if (!response.ok || !result?.data) throw new Error(result?.error || "Gagal mengunggah file");
  return result.data;
}

export async function deleteMedia(id: string) {
  const response = await fetch(`/api/media/${id}`, { method: "DELETE" });
  if (!response.ok && response.status !== 404) throw new Error("Gagal membersihkan file unggahan");
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

type CreateContentInput = Pick<ContentItem, "kind" | "title" | "status"> & Partial<Pick<ContentItem, "category" | "summary" | "metadata">> & { publishedAt?: string | Date | null };

export function useCreateContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateContentInput) => request<{ data: ContentItem }>("/api/content", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content"] }),
  });
}

type UpdateContentInput = Partial<Pick<ContentItem, "title" | "category" | "summary" | "status" | "metadata">> & { publishedAt?: string | Date | null };

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
