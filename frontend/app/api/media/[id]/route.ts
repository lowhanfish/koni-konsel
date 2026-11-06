import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasRole } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const media = await prisma.mediaFile.findUnique({ where: { id } });
  if (!media) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });
  const isDownload = request.nextUrl.searchParams.get("download") === "1";
  const headers: Record<string, string> = {
    "Content-Type": media.mimeType,
    "Content-Length": String(media.size),
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  };

  if (isDownload) {
    // HTTP headers require ASCII here; preserve the Unicode name in filename*.
    const safeName = media.originalName.replace(/[^\x20-\x7e]|["\\]/g, "_");
    const encodedName = encodeURIComponent(media.originalName).replace(/[!'()*]/g, (character) =>
      `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
    );
    headers["Content-Disposition"] = `attachment; filename="${safeName}"; filename*=UTF-8''${encodedName}`;
  }

  return new Response(new Uint8Array(media.data), { headers });
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login" }, { status: 401 });
  if (!hasRole(user, ["SUPER_ADMIN", "EDITOR", "CONTRIBUTOR"])) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }
  const { id } = await context.params;
  await prisma.mediaFile.deleteMany({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
