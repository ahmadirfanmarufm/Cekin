import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { and, count, eq, gte } from "drizzle-orm";

import { db } from "@/lib/db";
import { communityCommentMedia, communityComments, communityPosts } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth/session";
import { isSameOrigin } from "@/lib/auth/request-security";
import { COMMUNITY_BUCKET, supabaseAdmin } from "@/lib/supabase/admin";

import { CommunityMediaValidationError } from "@/features/community/lib/validation";
import { COMMENT_LIMITS } from "@/features/community/lib/comment-limits";
import { validateCommentMedia } from "@/features/community/lib/comment-validation";
import { fetchComments } from "@/features/community/server/comments";
import { notify } from "@/features/community/server/notifications";
import { fail, UUID_REGEX } from "@/features/community/server/http";
import { gifMimeType, isAllowedGifUrl } from "@/features/community/server/gif-provider";

type RouteContext = { params: Promise<{ postId: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { postId } = await params;
    if (!UUID_REGEX.test(postId)) return fail(400, "ID postingan tidak valid.");

    const user = await getSessionUser();

    const [post] = await db
      .select({ status: communityPosts.status })
      .from(communityPosts)
      .where(eq(communityPosts.id, postId))
      .limit(1);

    if (!post || post.status !== "published") return fail(404, "Postingan tidak ditemukan.");

    const comments = await fetchComments({ postId, viewerId: user?.id ?? null });

    return Response.json({ success: true, data: { comments } });
  } catch (error) {
    console.error("Get community comments error:", error);
    return fail(500, "Gagal memuat komentar.");
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const uploadedPaths: string[] = [];

  try {
    if (!isSameOrigin(request)) return fail(403, "Request tidak diizinkan.");

    const user = await getSessionUser();
    if (!user) return fail(401, "Silakan login terlebih dahulu.");

    const { postId } = await params;
    if (!UUID_REGEX.test(postId)) return fail(400, "ID postingan tidak valid.");

    const [post] = await db
      .select({ status: communityPosts.status, authorId: communityPosts.authorId })
      .from(communityPosts)
      .where(eq(communityPosts.id, postId))
      .limit(1);

    if (!post || post.status !== "published") return fail(404, "Postingan tidak ditemukan.");

    const [{ total }] = await db
      .select({ total: count() })
      .from(communityComments)
      .where(
        and(
          eq(communityComments.authorId, user.id),
          gte(communityComments.createdAt, new Date(Date.now() - 60_000)),
        ),
      );

    if (Number(total) >= COMMENT_LIMITS.MAX_PER_MINUTE) {
      return fail(429, "Terlalu banyak komentar dalam waktu singkat. Tunggu sebentar.");
    }

    const formData = await request.formData();

    const rawContent = formData.get("content");
    const content = typeof rawContent === "string" ? rawContent.trim() : "";
    if (content.length > COMMENT_LIMITS.MAX_CONTENT) {
      return fail(400, `Komentar maksimal ${COMMENT_LIMITS.MAX_CONTENT} karakter.`);
    }

    const rawFile = formData.get("media");
    const file = rawFile instanceof File && rawFile.size > 0 ? rawFile : null;

    const rawGif = formData.get("gifUrl");
    const gifUrl = typeof rawGif === "string" && rawGif.trim() ? rawGif.trim() : null;

    if (file && gifUrl) return fail(400, "Pilih salah satu: file atau GIF.");
    if (!content && !file && !gifUrl) return fail(400, "Tulis komentar atau lampirkan media.");

    let parentId: string | null = null;
    let repliedToId: string | null = null;
    let repliedToAuthorId: string | null = null;
    const rawParent = formData.get("parentId");

    if (typeof rawParent === "string" && rawParent) {
      if (!UUID_REGEX.test(rawParent)) return fail(400, "Komentar yang dibalas tidak valid.");

      const [parent] = await db
        .select({
          id: communityComments.id,
          parentId: communityComments.parentId,
          postId: communityComments.postId,
          status: communityComments.status,
          authorId: communityComments.authorId,
        })
        .from(communityComments)
        .where(eq(communityComments.id, rawParent))
        .limit(1);

      if (!parent || parent.postId !== postId || parent.status !== "published") {
        return fail(404, "Komentar yang dibalas tidak ditemukan.");
      }

      parentId = parent.parentId ?? parent.id;
      repliedToId = parent.id;
      repliedToAuthorId = parent.authorId;
    }

    const commentId = randomUUID();
    let mediaRecord: typeof communityCommentMedia.$inferInsert | null = null;

    if (file) {
      const rawDuration = formData.get("videoDuration");
      const durationSeconds =
        typeof rawDuration === "string" && rawDuration.trim() !== "" ? Number(rawDuration) : undefined;

      const validated = await validateCommentMedia(file, durationSeconds);
      const storagePath = `${user.id}/comments/${commentId}/${randomUUID()}.${validated.extension}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from(COMMUNITY_BUCKET)
        .upload(storagePath, file, { contentType: validated.mimeType, upsert: false });

      if (uploadError) throw new Error(`Gagal mengunggah lampiran: ${uploadError.message}`);
      uploadedPaths.push(storagePath);

      mediaRecord = {
        commentId,
        source: "upload",
        mediaType: validated.mediaType,
        storagePath,
        mimeType: validated.mimeType,
        fileSize: validated.fileSize,
        duration: validated.duration,
      };
    } else if (gifUrl) {
      if (!isAllowedGifUrl(gifUrl)) return fail(400, "GIF tidak valid.");

      mediaRecord = {
        commentId,
        source: "gif",
        mediaType: "gif",
        externalUrl: gifUrl,
        mimeType: gifMimeType(gifUrl),
        fileSize: 0,
      };
    }

    await db.transaction(async (tx) => {
      await tx.insert(communityComments).values({
        id: commentId,
        postId,
        authorId: user.id,
        parentId,
        content,
        status: "published",
      });

      if (mediaRecord) await tx.insert(communityCommentMedia).values(mediaRecord);
    });

    if (repliedToId && repliedToAuthorId) {
      await notify({
        userId: repliedToAuthorId,
        type: "comment_reply",
        groupKey: `comment_reply:${repliedToId}`,
        postId,
        actorId: user.id,
      });
    }

    if (repliedToAuthorId !== post.authorId) {
      await notify({
        userId: post.authorId,
        type: "post_comment",
        groupKey: `post_comment:${postId}`,
        postId,
        actorId: user.id,
      });
    }

    const [comment] = await fetchComments({ postId, viewerId: user.id, commentId });

    return Response.json({ success: true, message: "Komentar terkirim.", data: comment }, { status: 201 });
  } catch (error) {
    if (uploadedPaths.length > 0) {
      const { error: cleanupError } = await supabaseAdmin.storage.from(COMMUNITY_BUCKET).remove(uploadedPaths);
      if (cleanupError) console.error("Gagal membersihkan lampiran komentar:", cleanupError);
    }

    if (error instanceof CommunityMediaValidationError) return fail(400, error.message);

    console.error("Create community comment error:", error);
    return fail(500, "Terjadi kesalahan saat mengirim komentar.");
  }
}
