import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/server/prisma";
import { createSlug } from "@/lib/server/slug";
import { contentQuerySchema, createContentSchema } from "@/lib/validation/content";

export async function GET(request: NextRequest) {
  try {
    const query = contentQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const where: Prisma.ContentItemWhereInput = {
      kind: query.kind,
      status: query.status,
      ...(query.q
        ? { OR: [{ title: { contains: query.q } }, { category: { contains: query.q } }, { summary: { contains: query.q } }] }
        : {}),
    };
    const [data, total] = await prisma.$transaction([
      prisma.contentItem.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.contentItem.count({ where }),
    ]);
    return NextResponse.json({
      data,
      meta: { page: query.page, pageSize: query.pageSize, total, pageCount: Math.max(1, Math.ceil(total / query.pageSize)) },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Parameter pencarian tidak valid", details: error.issues }, { status: 400 });
    }
    console.error("Failed to list content", error);
    return NextResponse.json({ error: "Gagal mengambil konten" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = createContentSchema.parse(await request.json());
    const baseSlug = createSlug(input.slug || input.title);
    const duplicate = await prisma.contentItem.count({ where: { kind: input.kind, slug: baseSlug } });
    const slug = duplicate ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;
    const publishedAt = input.status === "PUBLISHED" ? input.publishedAt ?? new Date() : input.publishedAt;
    const data = await prisma.contentItem.create({ data: { ...input, slug, publishedAt } });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Data konten tidak valid", details: error.issues }, { status: 400 });
    }
    console.error("Failed to create content", error);
    return NextResponse.json({ error: "Gagal membuat konten" }, { status: 500 });
  }
}
