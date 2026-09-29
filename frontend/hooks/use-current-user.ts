"use client";

import { useQuery } from "@tanstack/react-query";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "EDITOR" | "CONTRIBUTOR";
  isActive: boolean;
};

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me");
      if (!response.ok) throw new Error("Session berakhir");
      return response.json() as Promise<{ data: CurrentUser }>;
    },
    staleTime: 60_000,
  });
}
