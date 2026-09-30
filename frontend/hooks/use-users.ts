"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type UserRole = "SUPER_ADMIN" | "EDITOR" | "CONTRIBUTOR";
export type ManagedUser = { id: string; name: string; email: string; role: UserRole; isActive: boolean; lastLoginAt: string | null; createdAt: string; updatedAt: string };
export type UserListResponse = { data: ManagedUser[]; meta: { page: number; pageSize: number; total: number; pageCount: number; roleCounts: Record<UserRole, number>; inactive: number } };
export type UserInput = { name: string; email: string; password?: string; role: UserRole; isActive: boolean };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const body = response.status === 204 ? null : await response.json().catch(() => null) as { error?: string } | null;
  if (!response.ok) throw new Error(body?.error || "Permintaan gagal");
  return body as T;
}

export function useUsersList({ q, page, enabled }: { q?: string; page: number; enabled: boolean }) {
  const params = new URLSearchParams({ page: String(page), pageSize: "8" });
  if (q) params.set("q", q);
  return useQuery({ queryKey: ["users", { q, page }], queryFn: () => request<UserListResponse>(`/api/users?${params}`), enabled });
}

export function useCreateUser() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (input: UserInput & { password: string }) => request<{ data: ManagedUser }>("/api/users", { method: "POST", body: JSON.stringify(input) }), onSuccess: () => client.invalidateQueries({ queryKey: ["users"] }) });
}

export function useUpdateUser() {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, input }: { id: string; input: Partial<UserInput> }) => request<{ data: ManagedUser }>(`/api/users/${id}`, { method: "PATCH", body: JSON.stringify(input) }), onSuccess: () => client.invalidateQueries({ queryKey: ["users"] }) });
}

export function useDeleteUser() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (id: string) => request<void>(`/api/users/${id}`, { method: "DELETE" }), onSuccess: () => client.invalidateQueries({ queryKey: ["users"] }) });
}
