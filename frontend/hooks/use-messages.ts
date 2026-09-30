"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type MessageStatus = "NEW" | "READ" | "ARCHIVED";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
};

export type MessageListResponse = {
  data: ContactMessage[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
    statusCounts: Record<MessageStatus, number>;
    today: number;
  };
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const body = response.status === 204 ? null : await response.json().catch(() => null) as { error?: string } | null;
  if (!response.ok) throw new Error(body?.error || "Permintaan gagal");
  return body as T;
}

export function useMessagesList({ q, status, page, enabled = true }: { q?: string; status?: MessageStatus; page: number; enabled?: boolean }) {
  const params = new URLSearchParams({ page: String(page), pageSize: "8" });
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  return useQuery({ queryKey: ["messages", { q, status, page }], queryFn: () => request<MessageListResponse>(`/api/messages?${params}`), enabled });
}

export function useUpdateMessage() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: MessageStatus }) => request<{ data: ContactMessage }>(`/api/messages/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["messages"] }),
  });
}

export function useDeleteMessage() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => request<void>(`/api/messages/${id}`, { method: "DELETE" }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["messages"] }),
  });
}
