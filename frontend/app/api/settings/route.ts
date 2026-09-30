import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCurrentUser, hasRole } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { siteSettingsSchema } from "@/lib/validation/settings";

const defaultSettings = {
  id: "main",
  organizationName: "KONI Kabupaten Konawe Selatan",
  description: "Bersama memajukan olahraga, mencetak atlet berprestasi, dan mengharumkan nama Konawe Selatan di tingkat daerah, nasional, dan internasional.",
  email: "konikonsel@gmail.com",
  phone: "0821 1000 9090",
  address: "Jl. Poros Andoolo, Kecamatan Andoolo, Kabupaten Konawe Selatan, Sulawesi Tenggara",
  facebookUrl: null,
  instagramUrl: null,
  youtubeUrl: null,
};

export async function GET() {
  try {
    const data = await prisma.siteSetting.findUnique({ where: { id: "main" } });
    return NextResponse.json({ data: data ?? defaultSettings });
  } catch (error) {
    console.error("Failed to read settings", error);
    return NextResponse.json({ error: "Gagal mengambil pengaturan" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login" }, { status: 401 });
    if (!hasRole(user, ["SUPER_ADMIN"])) return NextResponse.json({ error: "Akses khusus Super Admin" }, { status: 403 });
    const input = siteSettingsSchema.parse(await request.json());
    const data = await prisma.siteSetting.upsert({ where: { id: "main" }, create: { id: "main", ...input }, update: input });
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Data pengaturan tidak valid", details: error.issues }, { status: 400 });
    console.error("Failed to update settings", error);
    return NextResponse.json({ error: "Gagal menyimpan pengaturan" }, { status: 500 });
  }
}
