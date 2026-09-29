import { requirePageUser } from "@/lib/server/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requirePageUser();
  return children;
}
