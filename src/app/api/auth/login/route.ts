import { NextRequest, NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { loginSchema } from "@/features/auth/types";
import { isSameOrigin } from "@/lib/auth/request-security";

export async function POST(request: NextRequest) {
  try {
    if (!isSameOrigin(request)) {
        return NextResponse.json(
            { message: "Request tidak diizinkan." },
            { status: 403 }
        );
    }

    const body: unknown = await request.json();

    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: parsed.error.issues[0]?.message ?? "Data tidak valid.",
        },
        { status: 400 }
      );
    }

    const identifier = parsed.data.identifier.toLowerCase();
    const password = parsed.data.password;

    const [user] = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.username, identifier),
          eq(users.email, identifier)
        )
      )
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { message: "Username/email atau password salah." },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(
      user.passwordHash,
      password
    );

    if (!isValid) {
      return NextResponse.json(
        { message: "Username/email atau password salah." },
        { status: 401 }
      );
    }

    await createSession(user.id);

    return NextResponse.json({
      message: "Login berhasil.",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        totalXp: user.totalXp,
      },
    });
  } catch (error) {
    console.error("LOGIN_ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}