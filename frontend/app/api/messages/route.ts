import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCurrentUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { messageQuerySchema } from "@/lib/validation/contact";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login" }, { status: 401 });
    const query = messageQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const where: Prisma.ContactMessageWhereInput = {
      status: query.status,
      ...(query.q ? { OR: [{ name: { contains: query.q } }, { email: { contains: query.q } }, { subject: { contains: query.q } }, { message: { contains: query.q } }] } : {}),
    };
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const [data, total, fresh, read, archived, today] = await prisma.$transaction([
      prisma.contactMessage.findMany({ where, orderBy: { createdAt: "desc" }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.count({ where: { status: "NEW" } }),
      prisma.contactMessage.count({ where: { status: "READ" } }),
      prisma.contactMessage.count({ where: { status: "ARCHIVED" } }),
      prisma.contactMessage.count({ where: { createdAt: { gte: startOfDay } } }),
    ]);
    return NextResponse.json({ data, meta: { page: query.page, pageSize: query.pageSize, total, pageCount: Math.max(1, Math.ceil(total / query.pageSize)), statusCounts: { NEW: fresh, READ: read, ARCHIVED: archived }, today } });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Parameter pesan tidak valid", details: error.issues }, { status: 400 });
    console.error("Failed to list messages", error);
    return NextResponse.json({ error: "Gagal mengambil pesan" }, { status: 500 });
  }
}
