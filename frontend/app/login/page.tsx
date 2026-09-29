import { redirect } from "next/navigation";
import { getCurrentUser, safeNextPath } from "@/lib/server/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const user = await getCurrentUser();
  const { next } = await searchParams;
  const nextPath = safeNextPath(next);
  if (user) redirect(nextPath);
  return <LoginForm nextPath={nextPath} />;
}
