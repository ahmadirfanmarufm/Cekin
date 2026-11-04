
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  communityModerationLogs,
  users,
} from "@/lib/db/schema";

import { getSessionUser } from "@/lib/auth/session";

type RouteContext = {
  params: Promise<{
    postId: string;
  }>;
};

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Silakan login terlebih dahulu.",
        },
        { status: 401 },
      );
    }

    if (!["moderator", "admin"].includes(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Kamu tidak memiliki akses melihat riwayat moderasi.",
        },
        { status: 403 },
      );
    }

    const { postId } = await context.params;

    if (!uuidRegex.test(postId)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID laporan tidak valid.",
        },
        { status: 400 },
      );
    }

    const logs = await db
      .select({
        id: communityModerationLogs.id,
        postId: communityModerationLogs.postId,
        previousVerificationStatus:
          communityModerationLogs.previousVerificationStatus,
        newVerificationStatus:
          communityModerationLogs.newVerificationStatus,
        note: communityModerationLogs.note,
        createdAt: communityModerationLogs.createdAt,
        moderatorId: communityModerationLogs.moderatorId,
        moderatorUsername: users.username,
      })
      .from(communityModerationLogs)
      .leftJoin(
        users,
        eq(
          communityModerationLogs.moderatorId,
          users.id,
        ),
      )
      .where(
        eq(communityModerationLogs.postId, postId),
      )
      .orderBy(
        desc(communityModerationLogs.createdAt),
      )
      .limit(50);

    return NextResponse.json(
      {
        success: true,
        message: "Riwayat moderasi berhasil diambil.",
        data: logs,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Get community moderation logs error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Terjadi kesalahan saat mengambil riwayat moderasi.",
      },
      { status: 500 },
    );
  }
}
