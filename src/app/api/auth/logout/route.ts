import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth/session";
import { isSameOrigin } from "@/lib/auth/request-security";

export async function POST(request: NextRequest) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json(
          { message: "Request tidak diizinkan." },
          { status: 403 }
      );
    }

    await deleteSession();

    return NextResponse.json({
      message: "Logout berhasil.",
    });
  } catch (error) {
    console.error("LOGOUT_ERROR:", error);

    return NextResponse.json(
      { message: "Gagal melakukan logout." },
      { status: 500 }
    );
  }
}