import { NextRequest } from "next/server";
import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { communityModerationLogs, communityPosts, users } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth/session";
import { isModeratorRole } from "@/features/community/lib/rules";
import { fail, UUID_REGEX } from "@/features/community/server/http";

type RouteContext = { params: Promise<{ postId: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { postId } = await params;
    if (!UUID_REGEX.test(postId)) return fail(400, "ID postingan tidak valid.");

    const user = await getSessionUser();
    const isMod = isModeratorRole(user?.role);

    const [post] = await db
      .select({ authorId: communityPosts.authorId, status: communityPosts.status })
      .from(communityPosts)
      .where(eq(communityPosts.id, postId))
      .limit(1);

    if (!post || (post.status !== "published" && !isMod)) {
      return fail(404, "Postingan tidak ditemukan.");
    }

    const isOwner = Boolean(user) && post.authorId === user?.id;

    const rows = await db
      .select({
        id: communityModerationLogs.id,
        postId: communityModerationLogs.postId,
        previousVerificationStatus: communityModerationLogs.previousVerificationStatus,
        newVerificationStatus: communityModerationLogs.newVerificationStatus,
        note: communityModerationLogs.note,
        eventType: communityModerationLogs.eventType,
        createdAt: communityModerationLogs.createdAt,
        moderatorId: communityModerationLogs.moderatorId,
        moderatorUsername: users.username,
      })
      .from(communityModerationLogs)
      .leftJoin(users, eq(communityModerationLogs.moderatorId, users.id))
      .where(eq(communityModerationLogs.postId, postId))
      .orderBy(desc(communityModerationLogs.createdAt))
      .limit(50);

    const data = rows.map((row) => ({
      id: row.id,
      postId: row.postId,
      previousVerificationStatus: row.previousVerificationStatus,
      newVerificationStatus: row.newVerificationStatus,
      eventType: row.eventType,
      createdAt: row.createdAt,
      note: isMod || isOwner ? row.note : null,
      actorLabel: row.eventType === "edited" ? "Pelapor" : isMod ? (row.moderatorUsername ?? "Moderator (akun dihapus)") : "Admin",
      moderatorId: isMod ? row.moderatorId : null,
      moderatorUsername: isMod ? row.moderatorUsername : null,
    }));

    return Response.json(
      { success: true, data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Get post history error:", error);
    return fail(500, "Gagal mengambil riwayat.");
  }
}