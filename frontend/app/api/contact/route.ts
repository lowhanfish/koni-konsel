import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/server/prisma";
import { contactMessageSchema } from "@/lib/validation/contact";

export async function POST(request: Request) {
  try {
    const input = contactMessageSchema.parse(await request.json());
    if (input.website) return NextResponse.json({ status: "ok" }, { status: 201 });
    const data = await prisma.contactMessage.create({
      data: { name: input.name, email: input.email, subject: input.subject, message: input.message },
      select: { id: true, createdAt: true },
    });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Data pesan tidak valid", details: error.issues }, { status: 400 });
    console.error("Failed to save contact message", error);
    return NextResponse.json({ error: "Pesan belum dapat dikirim" }, { status: 500 });
  }
}
