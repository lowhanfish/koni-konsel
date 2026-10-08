import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasRole } from "@/lib/server/auth";
import {
  ATTACHMENT_MAX_BYTES,
  ATTACHMENT_MIME_TYPES,
  detectMediaMimeType,
  IMAGE_MAX_BYTES,
  IMAGE_MIME_TYPES,
} from "@/lib/server/media";
import { prisma } from "@/lib/server/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login" }, { status: 401 });
    if (!hasRole(user, ["SUPER_ADMIN", "EDITOR", "CONTRIBUTOR"])) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const form = await request.formData();
    const file = form.get("file");
    const purpose = form.get("purpose");
    if (!(file instanceof File) || (purpose !== "image" && purpose !== "attachment")) {
      return NextResponse.json({ error: "File unggahan tidak valid" }, { status: 400 });
    }

    const maxBytes = purpose === "image" ? IMAGE_MAX_BYTES : ATTACHMENT_MAX_BYTES;
    if (file.size === 0 || file.size > maxBytes) {
      return NextResponse.json({ error: `Ukuran file maksimal ${maxBytes / 1024 / 1024} MB` }, { status: 400 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const mimeType = detectMediaMimeType(bytes);
    const allowedTypes = purpose === "image" ? IMAGE_MIME_TYPES : ATTACHMENT_MIME_TYPES;
    if (!mimeType || !allowedTypes.includes(mimeType as never)) {
      return NextResponse.json({ error: purpose === "image" ? "Format gambar harus JPG, PNG, WebP, atau GIF" : "Lampiran harus berupa PDF, JPG, PNG, WebP, atau GIF" }, { status: 400 });
    }

    const originalName = file.name.trim().slice(0, 191) || (mimeType === "application/pdf" ? "lampiran.pdf" : "gambar");
    const media = await prisma.mediaFile.create({ data: { originalName, mimeType, size: file.size, data: Buffer.from(bytes) } });
    return NextResponse.json({
      data: { id: media.id, name: media.originalName, mimeType: media.mimeType, size: media.size, url: `/api/media/${media.id}` },
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to upload media", error);
    return NextResponse.json({ error: "Gagal mengunggah file" }, { status: 500 });
  }
}
