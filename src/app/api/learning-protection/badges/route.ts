import { connection, NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { userBadges } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth/session";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  await connection();

  try {
    const requested = request.nextUrl.searchParams.get("userId");
    let userId: string | null = null;

    if (requested) {
      if (!UUID_REGEX.test(requested)) {
        return NextResponse.json({ success: false, message: "ID tidak valid." }, { status: 400 });
      }
      userId = requested;
    } else {
      userId = (await getSessionUser())?.id ?? null;
    }

    if (!userId) {
      return NextResponse.json({ success: true, data: { badges: [] } });
    }

    const rows = await db
      .select({
        badgeId: userBadges.badgeId,
        mistakes: userBadges.mistakes,
        earnedAt: userBadges.earnedAt,
      })
      .from(userBadges)
      .where(eq(userBadges.userId, userId))
      .orderBy(asc(userBadges.earnedAt));

    return NextResponse.json(
      {
        success: true,
        data: {
          badges: rows.map((row) => ({
            badgeId: row.badgeId,
            mistakes: row.mistakes,
            earnedAt: row.earnedAt.toISOString(),
          })),
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("GET_BADGES_ERROR:", error);
    return NextResponse.json({ success: false, message: "Gagal memuat badge." }, { status: 500 });
  }
}