import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/server/prisma";
import { getCurrentUser, hasRole } from "@/lib/server/auth";
import { sanitizeRichText } from "@/lib/server/sanitize-rich-text";
import { createSlug } from "@/lib/server/slug";
import { contentQuerySchema, createContentSchema } from "@/lib/validation/content";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login" }, { status: 401 });
    const query = contentQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const where: Prisma.ContentItemWhereInput = {
      kind: query.kind,
      status: query.status,
      ...(query.q
        ? { OR: [{ title: { contains: query.q } }, { category: { contains: query.q } }, { summary: { contains: query.q } }] }
        : {}),
    };
    const statusWhere = (status: "DRAFT" | "PUBLISHED" | "ACTIVE" | "SCHEDULED" | "ARCHIVED") => ({ kind: query.kind, status });
    const [data, total, draft, published, active, scheduled, archived] = await prisma.$transaction([
      prisma.contentItem.findMany({
        where,
        orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.contentItem.count({ where }),
      prisma.contentItem.count({ where: statusWhere("DRAFT") }),
      prisma.contentItem.count({ where: statusWhere("PUBLISHED") }),
      prisma.contentItem.count({ where: statusWhere("ACTIVE") }),
      prisma.contentItem.count({ where: statusWhere("SCHEDULED") }),
      prisma.contentItem.count({ where: statusWhere("ARCHIVED") }),
    ]);
    const statusCounts = { DRAFT: draft, PUBLISHED: published, ACTIVE: active, SCHEDULED: scheduled, ARCHIVED: archived };
    return NextResponse.json({
      data,
      meta: { page: query.page, pageSize: query.pageSize, total, pageCount: Math.max(1, Math.ceil(total / query.pageSize)), statusCounts },
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
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login" }, { status: 401 });
    if (!hasRole(user, ["SUPER_ADMIN", "EDITOR", "CONTRIBUTOR"])) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }
    const input = createContentSchema.parse(await request.json());
    const baseSlug = createSlug(input.slug || input.title);
    const duplicate = await prisma.contentItem.count({ where: { kind: input.kind, slug: baseSlug } });
    const slug = duplicate ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;
    const status = user.role === "CONTRIBUTOR" ? "DRAFT" : input.status;
    const publishedAt = status === "PUBLISHED" ? input.publishedAt ?? new Date() : input.publishedAt;
    const data = await prisma.contentItem.create({ data: { ...input, summary: sanitizeRichText(input.summary), status, slug, publishedAt } });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Data konten tidak valid", details: error.issues }, { status: 400 });
    }
    console.error("Failed to create content", error);
    return NextResponse.json({ error: "Gagal membuat konten" }, { status: 500 });
  }
}
