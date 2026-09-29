import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";

export const SESSION_COOKIE = "koni_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
} as const;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  await prisma.$transaction([
    prisma.session.deleteMany({ where: { expiresAt: { lte: new Date() } } }),
    prisma.session.create({ data: { userId, tokenHash: hashToken(token), expiresAt } }),
  ]);
  return { token, expiresAt };
}

export async function deleteSession(token?: string) {
  if (!token) return;
  await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
}

export async function getUserFromToken(token?: string): Promise<AuthUser | null> {
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: publicUserSelect } },
  });
  if (!session || session.expiresAt <= new Date() || !session.user.isActive) {
    if (session) await prisma.session.delete({ where: { id: session.id } });
    return null;
  }
  return session.user;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  return getUserFromToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function requirePageUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  return user;
}

export function hasRole(user: AuthUser, roles: UserRole[]) {
  return roles.includes(user.role);
}

export function safeNextPath(value: string | null | undefined) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/admin";
}
