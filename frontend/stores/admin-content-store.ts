"use client";

import { create } from "zustand";
import type { ContentStatus } from "@/lib/content";

type AdminContentState = {
  query: string;
  status: ContentStatus | "ALL";
  page: number;
  setQuery: (query: string) => void;
  setStatus: (status: ContentStatus | "ALL") => void;
  setPage: (page: number) => void;
  reset: () => void;
};

export const useAdminContentStore = create<AdminContentState>((set) => ({
  query: "",
  status: "ALL",
  page: 1,
  setQuery: (query) => set({ query, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setPage: (page) => set({ page }),
  reset: () => set({ query: "", status: "ALL", page: 1 }),
}));
