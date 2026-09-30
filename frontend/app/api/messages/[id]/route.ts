import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCurrentUser, hasRole } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { updateMessageSchema } from "@/lib/validation/contact";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login" }, { status: 401 });
    const { id } = await context.params;
    const input = updateMessageSchema.parse(await request.json());
    const existing = await prisma.contactMessage.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "Pesan tidak ditemukan" }, { status: 404 });
    const data = await prisma.contactMessage.update({ where: { id }, data: input });
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Status pesan tidak valid", details: error.issues }, { status: 400 });
    console.error("Failed to update message", error);
    return NextResponse.json({ error: "Gagal memperbarui pesan" }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login" }, { status: 401 });
  if (!hasRole(user, ["SUPER_ADMIN"])) return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  const { id } = await context.params;
  const result = await prisma.contactMessage.deleteMany({ where: { id } });
  if (!result.count) return NextResponse.json({ error: "Pesan tidak ditemukan" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
