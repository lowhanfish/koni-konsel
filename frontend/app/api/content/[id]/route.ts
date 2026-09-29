import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/server/prisma";
import { getCurrentUser, hasRole } from "@/lib/server/auth";
import { createSlug } from "@/lib/server/slug";
import { updateContentSchema } from "@/lib/validation/content";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login" }, { status: 401 });
  const { id } = await context.params;
  const data = await prisma.contentItem.findUnique({ where: { id } });
  if (!data) return NextResponse.json({ error: "Konten tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login" }, { status: 401 });
    if (!hasRole(user, ["SUPER_ADMIN", "EDITOR"])) return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    const { id } = await context.params;
    const input = updateContentSchema.parse(await request.json());
    const current = await prisma.contentItem.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: "Konten tidak ditemukan" }, { status: 404 });
    const status = input.status ?? current.status;
    const data = await prisma.contentItem.update({
      where: { id },
      data: {
        ...input,
        ...(input.slug ? { slug: createSlug(input.slug) } : {}),
        publishedAt: status === "PUBLISHED" ? input.publishedAt ?? current.publishedAt ?? new Date() : input.publishedAt,
      },
    });
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Data konten tidak valid", details: error.issues }, { status: 400 });
    }
    console.error("Failed to update content", error);
    return NextResponse.json({ error: "Gagal memperbarui konten" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login" }, { status: 401 });
  if (!hasRole(user, ["SUPER_ADMIN"])) return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  const { id } = await context.params;
  const existing = await prisma.contentItem.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Konten tidak ditemukan" }, { status: 404 });
  await prisma.contentItem.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
