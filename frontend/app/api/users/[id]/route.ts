import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCurrentUser, hasRole } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { updateUserSchema } from "@/lib/validation/user";

type Context = { params: Promise<{ id: string }> };
const selectUser = { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true, createdAt: true, updatedAt: true } as const;

async function authorize() {
  const current = await getCurrentUser();
  if (!current) return { error: NextResponse.json({ error: "Belum login" }, { status: 401 }) };
  if (!hasRole(current, ["SUPER_ADMIN"])) return { error: NextResponse.json({ error: "Akses khusus Super Admin" }, { status: 403 }) };
  return { current };
}

export async function PATCH(request: Request, context: Context) {
  try {
    const auth = await authorize();
    if (auth.error) return auth.error;
    const current = auth.current;
    const { id } = await context.params;
    const input = updateUserSchema.parse(await request.json());
    const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true, isActive: true } });
    if (!target) return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    if (id === current.id && (input.isActive === false || (input.role && input.role !== "SUPER_ADMIN"))) {
      return NextResponse.json({ error: "Akun sendiri tidak dapat dinonaktifkan atau diturunkan perannya" }, { status: 400 });
    }
    if (target.role === "SUPER_ADMIN" && target.isActive && (input.isActive === false || (input.role && input.role !== "SUPER_ADMIN"))) {
      const activeSuperAdmins = await prisma.user.count({ where: { role: "SUPER_ADMIN", isActive: true } });
      if (activeSuperAdmins <= 1) return NextResponse.json({ error: "Super Admin aktif terakhir harus dipertahankan" }, { status: 400 });
    }
    const { password, ...changes } = input;
    const data = await prisma.user.update({ where: { id }, data: { ...changes, ...(password ? { passwordHash: await hash(password, 12), sessions: { deleteMany: {} } } : {}) }, select: selectUser });
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Data pengguna tidak valid", details: error.issues }, { status: 400 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "Email sudah digunakan" }, { status: 409 });
    console.error("Failed to update user", error);
    return NextResponse.json({ error: "Gagal memperbarui pengguna" }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: Context) {
  const auth = await authorize();
  if (auth.error) return auth.error;
  const current = auth.current;
  const { id } = await context.params;
  if (id === current.id) return NextResponse.json({ error: "Akun yang sedang digunakan tidak dapat dihapus" }, { status: 400 });
  const target = await prisma.user.findUnique({ where: { id }, select: { role: true, isActive: true } });
  if (!target) return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
  if (target.role === "SUPER_ADMIN" && target.isActive) {
    const activeSuperAdmins = await prisma.user.count({ where: { role: "SUPER_ADMIN", isActive: true } });
    if (activeSuperAdmins <= 1) return NextResponse.json({ error: "Super Admin aktif terakhir harus dipertahankan" }, { status: 400 });
  }
  await prisma.user.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
