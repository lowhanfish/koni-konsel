import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCurrentUser, hasRole } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { createUserSchema, userQuerySchema } from "@/lib/validation/user";

const selectUser = { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true, createdAt: true, updatedAt: true } as const;

export async function GET(request: NextRequest) {
  try {
    const current = await getCurrentUser();
    if (!current) return NextResponse.json({ error: "Belum login" }, { status: 401 });
    if (!hasRole(current, ["SUPER_ADMIN"])) return NextResponse.json({ error: "Akses khusus Super Admin" }, { status: 403 });
    const query = userQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const where: Prisma.UserWhereInput = query.q ? { OR: [{ name: { contains: query.q } }, { email: { contains: query.q } }] } : {};
    const [data, total, superAdmins, editors, contributors, inactive] = await prisma.$transaction([
      prisma.user.findMany({ where, select: selectUser, orderBy: { createdAt: "asc" }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
      prisma.user.count({ where }),
      prisma.user.count({ where: { role: "SUPER_ADMIN", isActive: true } }),
      prisma.user.count({ where: { role: "EDITOR", isActive: true } }),
      prisma.user.count({ where: { role: "CONTRIBUTOR", isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
    ]);
    return NextResponse.json({ data, meta: { page: query.page, pageSize: query.pageSize, total, pageCount: Math.max(1, Math.ceil(total / query.pageSize)), roleCounts: { SUPER_ADMIN: superAdmins, EDITOR: editors, CONTRIBUTOR: contributors }, inactive } });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Parameter pengguna tidak valid", details: error.issues }, { status: 400 });
    console.error("Failed to list users", error);
    return NextResponse.json({ error: "Gagal mengambil pengguna" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const current = await getCurrentUser();
    if (!current) return NextResponse.json({ error: "Belum login" }, { status: 401 });
    if (!hasRole(current, ["SUPER_ADMIN"])) return NextResponse.json({ error: "Akses khusus Super Admin" }, { status: 403 });
    const input = createUserSchema.parse(await request.json());
    const { password, ...profile } = input;
    const data = await prisma.user.create({ data: { ...profile, passwordHash: await hash(password, 12) }, select: selectUser });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Data pengguna tidak valid", details: error.issues }, { status: 400 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "Email sudah digunakan" }, { status: 409 });
    console.error("Failed to create user", error);
    return NextResponse.json({ error: "Gagal membuat pengguna" }, { status: 500 });
  }
}
