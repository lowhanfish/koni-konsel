import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { createSession, SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { loginSchema } from "@/lib/validation/auth";

export async function POST(request: NextRequest) {
  try {
    const input = loginSchema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !user.isActive || !(await compare(input.password, user.passwordHash))) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    const session = await createSession(user.id);
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const response = NextResponse.json({ data: { id: user.id, name: user.name, email: user.email, role: user.role } });
    response.cookies.set(SESSION_COOKIE, session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
      expires: session.expiresAt,
    });
    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Data login tidak valid", details: error.issues }, { status: 400 });
    }
    console.error("Login failed", error);
    return NextResponse.json({ error: "Login gagal" }, { status: 500 });
  }
}
