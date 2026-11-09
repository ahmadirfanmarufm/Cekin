
import { NextRequest } from "next/server";
import { and, count, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { communityCommentLikes, communityComments } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth/session";
import { isSameOrigin } from "@/lib/auth/request-security";
import { fail, UUID_REGEX } from "@/features/community/server/http";
import { notify, retract } from "@/features/community/server/notifications";

type RouteContext = { params: Promise<{ commentId: string }> };

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    if (!isSameOrigin(request)) return fail(403, "Request tidak diizinkan.");

    const user = await getSessionUser();
    if (!user) return fail(401, "Silakan login terlebih dahulu.");

    const { commentId } = await params;
    if (!UUID_REGEX.test(commentId)) return fail(400, "ID komentar tidak valid.");

    const body = (await request.json().catch(() => null)) as { liked?: unknown } | null;
    const desired = typeof body?.liked === "boolean" ? body.liked : null;

    const [comment] = await db
      .select({
        status: communityComments.status,
        authorId: communityComments.authorId,
        postId: communityComments.postId,
      })
      .from(communityComments)
      .where(eq(communityComments.id, commentId))
      .limit(1);

    if (!comment || comment.status !== "published") {
      return fail(404, "Komentar tidak ditemukan.");
    }

    const [existing] = await db
      .select({ id: communityCommentLikes.id })
      .from(communityCommentLikes)
      .where(
        and(
          eq(communityCommentLikes.commentId, commentId),
          eq(communityCommentLikes.userId, user.id),
        ),
      )
      .limit(1);

    const shouldLike = desired ?? !existing;
    const groupKey = `comment_like:${commentId}`;

    if (shouldLike && !existing) {
      const [inserted] = await db
        .insert(communityCommentLikes)
        .values({ commentId, userId: user.id })
        .onConflictDoNothing()
        .returning({ id: communityCommentLikes.id });

      if (inserted) {
        await notify({
          userId: comment.authorId,
          type: "comment_like",
          groupKey,
          postId: comment.postId,
          actorId: user.id,
        });
      }
    } else if (!shouldLike && existing) {
      const [deleted] = await db
        .delete(communityCommentLikes)
        .where(
          and(
            eq(communityCommentLikes.commentId, commentId),
            eq(communityCommentLikes.userId, user.id),
          ),
        )
        .returning({ id: communityCommentLikes.id });

      if (deleted) {
        await retract(comment.authorId, groupKey);
      }
    }

    const [{ total }] = await db
      .select({ total: count() })
      .from(communityCommentLikes)
      .where(eq(communityCommentLikes.commentId, commentId));

    return Response.json({
      success: true,
      data: { total: Number(total), hasLiked: shouldLike },
    });
  } catch (error) {
    console.error("Set comment like error:", error);
    return fail(500, "Gagal memperbarui like.");
  }
}