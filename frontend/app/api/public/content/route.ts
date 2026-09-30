import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/server/prisma";
import { contentQuerySchema } from "@/lib/validation/content";

export async function GET(request: NextRequest) {
  try {
    const query = contentQuerySchema.omit({ status: true }).parse(Object.fromEntries(request.nextUrl.searchParams));
    if (!query.kind) return NextResponse.json({ error: "Jenis konten wajib dipilih" }, { status: 400 });
    const where: Prisma.ContentItemWhereInput = {
      kind: query.kind,
      status: { in: ["PUBLISHED", "ACTIVE"] },
      ...(query.q ? { OR: [{ title: { contains: query.q } }, { category: { contains: query.q } }, { summary: { contains: query.q } }] } : {}),
    };
    const [data, total] = await prisma.$transaction([
      prisma.contentItem.findMany({ where, orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }], skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
      prisma.contentItem.count({ where }),
    ]);
    return NextResponse.json({ data, meta: { page: query.page, pageSize: query.pageSize, total, pageCount: Math.max(1, Math.ceil(total / query.pageSize)) } });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Parameter konten tidak valid", details: error.issues }, { status: 400 });
    console.error("Failed to list public content", error);
    return NextResponse.json({ error: "Gagal mengambil konten publik" }, { status: 500 });
  }
}
