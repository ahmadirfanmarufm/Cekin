import { NextRequest, NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { registerSchema } from "@/features/auth/types";
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

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: parsed.error.issues[0]?.message ?? "Data tidak valid.",
        },
        { status: 400 }
      );
    }

    const username = parsed.data.username.toLowerCase();
    const email = parsed.data.email.toLowerCase();
    const password = parsed.data.password;

    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(
        or(
          eq(users.username, username),
          eq(users.email, email)
        )
      )
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "Username atau email sudah digunakan." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        username,
        email,
        passwordHash,
      })
      .returning({
        id: users.id,
      });

    if (!newUser) {
      return NextResponse.json(
        { message: "Gagal membuat akun." },
        { status: 500 }
      );
    }

    await createSession(newUser.id);

    return NextResponse.json(
      {
        message: "Registrasi berhasil.",
        user: {
          id: newUser.id,
          username,
          email,
          totalXp: 0,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER_ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}