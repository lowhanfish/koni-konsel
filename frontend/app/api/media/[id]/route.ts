import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasRole } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const media = await prisma.mediaFile.findUnique({ where: { id } });
  if (!media) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });
  const disposition = request.nextUrl.searchParams.get("download") === "1" ? "attachment" : "inline";
  const safeName = media.originalName.replace(/[\r\n"]/g, "_");
  return new Response(new Uint8Array(media.data), {
    headers: {
      "Content-Type": media.mimeType,
      "Content-Length": String(media.size),
      "Content-Disposition": `${disposition}; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(media.originalName)}`,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
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
