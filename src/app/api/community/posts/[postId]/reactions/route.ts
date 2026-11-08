import { NextRequest } from "next/server";
import { and, count, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { communityPosts, communityReactions } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth/session";
import { isSameOrigin } from "@/lib/auth/request-security";
import { fail, UUID_REGEX } from "@/features/community/server/http";
import { notify, retract } from "@/features/community/server/notifications";

type RouteContext = { params: Promise<{ postId: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { postId } = await params;
    if (!UUID_REGEX.test(postId)) return fail(400, "ID postingan tidak valid.");

    const user = await getSessionUser();

    const [{ total }] = await db
      .select({ total: count() })
      .from(communityReactions)
      .where(eq(communityReactions.postId, postId));

    let hasLiked = false;
    if (user) {
      const [row] = await db
        .select({ id: communityReactions.id })
        .from(communityReactions)
        .where(and(eq(communityReactions.postId, postId), eq(communityReactions.userId, user.id)))
        .limit(1);
      hasLiked = Boolean(row);
    }

    return Response.json({ success: true, data: { total: Number(total), hasLiked } });
  } catch (error) {
    console.error("Get post reaction error:", error);
    return fail(500, "Gagal memuat reaksi.");
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    if (!isSameOrigin(request)) return fail(403, "Request tidak diizinkan.");

    const user = await getSessionUser();
    if (!user) return fail(401, "Silakan login terlebih dahulu.");

    const { postId } = await params;
    if (!UUID_REGEX.test(postId)) return fail(400, "ID postingan tidak valid.");

    const body = (await request.json().catch(() => null)) as { liked?: unknown } | null;
    const desired = typeof body?.liked === "boolean" ? body.liked : null;

    const [post] = await db
      .select({ status: communityPosts.status, authorId: communityPosts.authorId })
      .from(communityPosts)
      .where(eq(communityPosts.id, postId))
      .limit(1);

    if (!post || post.status !== "published") return fail(404, "Postingan tidak ditemukan.");

    const [existing] = await db
      .select({ id: communityReactions.id })
      .from(communityReactions)
      .where(and(eq(communityReactions.postId, postId), eq(communityReactions.userId, user.id)))
      .limit(1);

    const shouldLike = desired ?? !existing;
    const groupKey = `post_like:${postId}`;

    if (shouldLike && !existing) {
      const [inserted] = await db
        .insert(communityReactions)
        .values({ postId, userId: user.id, type: "helpful" })
        .onConflictDoNothing()
        .returning({ id: communityReactions.id });

      if (inserted) {
        await notify({ userId: post.authorId, type: "post_like", groupKey, postId, actorId: user.id });
      }
    } else if (!shouldLike && existing) {
      await db
        .delete(communityReactions)
        .where(and(eq(communityReactions.postId, postId), eq(communityReactions.userId, user.id)));

      await retract(post.authorId, groupKey);
    }

    const [{ total }] = await db
      .select({ total: count() })
      .from(communityReactions)
      .where(eq(communityReactions.postId, postId));

    return Response.json({ success: true, data: { total: Number(total), hasLiked: shouldLike } });
  } catch (error) {
    console.error("Set post reaction error:", error);
    return fail(500, "Gagal memperbarui reaksi.");
  }
}