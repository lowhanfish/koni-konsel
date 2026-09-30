"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type SiteSettings = {
  id?: string;
  organizationName: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
};

export const fallbackSettings: SiteSettings = {
  organizationName: "KONI Kabupaten Konawe Selatan",
  description: "Bersama memajukan olahraga, mencetak atlet berprestasi, dan mengharumkan nama Konawe Selatan di tingkat daerah, nasional, dan internasional.",
  email: "konikonsel@gmail.com",
  phone: "0821 1000 9090",
  address: "Jl. Poros Andoolo, Kecamatan Andoolo, Kabupaten Konawe Selatan, Sulawesi Tenggara",
  facebookUrl: null,
  instagramUrl: null,
  youtubeUrl: null,
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const body = await response.json().catch(() => null) as { error?: string } | null;
  if (!response.ok) throw new Error(body?.error || "Permintaan gagal");
  return body as T;
}

export function useSettings() {
  return useQuery({ queryKey: ["settings"], queryFn: () => request<{ data: SiteSettings }>("/api/settings"), staleTime: 60_000 });
}

export function useUpdateSettings() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (input: SiteSettings) => request<{ data: SiteSettings }>("/api/settings", { method: "PATCH", body: JSON.stringify(input) }), onSuccess: ({ data }) => client.setQueryData(["settings"], { data }) });
}
