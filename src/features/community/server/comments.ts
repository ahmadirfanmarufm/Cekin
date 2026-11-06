import { and, asc, eq, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  communityCommentLikes,
  communityCommentMedia,
  communityComments,
  communityPosts,
  users,
} from "@/lib/db/schema";
import { COMMUNITY_BUCKET, supabaseAdmin } from "@/lib/supabase/admin";
import type { CommentMediaKind, CommunityComment } from "@/features/community/types";

export async function fetchComments(params: {
  postId: string;
  viewerId: string | null;
  commentId?: string;
}): Promise<CommunityComment[]> {
  const { postId, viewerId, commentId } = params;

  const [post] = await db
    .select({ authorId: communityPosts.authorId })
    .from(communityPosts)
    .where(eq(communityPosts.id, postId))
    .limit(1);

  if (!post) return [];

  const rows = await db
    .select({
      id: communityComments.id,
      postId: communityComments.postId,
      parentId: communityComments.parentId,
      content: communityComments.content,
      status: communityComments.status,
      createdAt: communityComments.createdAt,
      authorId: users.id,
      authorName: users.username,
    })
    .from(communityComments)
    .innerJoin(users, eq(users.id, communityComments.authorId))
    .where(
      and(
        eq(communityComments.postId, postId),
        commentId
          ? eq(communityComments.id, commentId)
          : inArray(communityComments.status, ["published", "removed"]),
      ),
    )
    .orderBy(asc(communityComments.createdAt))
    .limit(300);

  if (rows.length === 0) return [];

  const ids = rows.map((row) => row.id);

  const [mediaRows, likeRows] = await Promise.all([
    db.select().from(communityCommentMedia).where(inArray(communityCommentMedia.commentId, ids)),
    db
      .select({ commentId: communityCommentLikes.commentId, userId: communityCommentLikes.userId })
      .from(communityCommentLikes)
      .where(inArray(communityCommentLikes.commentId, ids)),
  ]);

  // Satu panggilan untuk semua signed URL.
  const signedUrls = new Map<string, string>();
  const uploadPaths = mediaRows.map((m) => m.storagePath).filter((p): p is string => Boolean(p));

  if (uploadPaths.length > 0) {
    const { data, error } = await supabaseAdmin.storage
      .from(COMMUNITY_BUCKET)
      .createSignedUrls(uploadPaths, 60 * 60);

    if (error) {
      console.error("Gagal membuat signed URL komentar:", error);
    } else {
      for (const item of data) {
        if (item.path && item.signedUrl) signedUrls.set(item.path, item.signedUrl);
      }
    }
  }

  // Komentar yang dihapus hanya ditampilkan (sebagai placeholder) bila masih punya balasan.
  const parentsWithReplies = new Set(
    rows.filter((r) => r.status === "published" && r.parentId).map((r) => r.parentId as string),
  );
  const visible = commentId
    ? rows
    : rows.filter((r) => r.status === "published" || parentsWithReplies.has(r.id));

  return visible.map((row) => {
    const isDeleted = row.status === "removed";
    const media = isDeleted ? undefined : mediaRows.find((m) => m.commentId === row.id);
    const likes = isDeleted ? [] : likeRows.filter((l) => l.commentId === row.id);

    return {
      id: row.id,
      postId: row.postId,
      parentId: row.parentId,
      content: isDeleted ? "" : row.content,
      createdAt: row.createdAt.toISOString(),
      isDeleted,
      isMine: viewerId !== null && row.authorId === viewerId,
      isPostAuthor: row.authorId === post.authorId,
      author: { id: row.authorId, username: row.authorName },
      likes: {
        total: likes.length,
        hasLiked: viewerId !== null && likes.some((l) => l.userId === viewerId),
      },
      media: media
        ? {
            id: media.id,
            mediaType: media.mediaType as CommentMediaKind,
            mimeType: media.mimeType,
            duration: media.duration,
            url:
              media.source === "gif"
                ? media.externalUrl
                : media.storagePath
                  ? (signedUrls.get(media.storagePath) ?? null)
                  : null,
          }
        : null,
    };
  });
}
