import { NextRequest } from "next/server";
import { and, count, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  communityCommentLikes,
  communityCommentMedia,
  communityComments,
} from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth/session";
import { isSameOrigin } from "@/lib/auth/request-security";
import { COMMUNITY_BUCKET, supabaseAdmin } from "@/lib/supabase/admin";
import { fail, UUID_REGEX } from "@/features/community/server/http";

type RouteContext = { params: Promise<{ commentId: string }> };

/**
 * - Tanpa balasan  -> dihapus permanen.
 * - Ada balasan    -> isi & lampiran dibersihkan, balasan tetap tampil di bawah placeholder.
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    if (!isSameOrigin(request)) return fail(403, "Request tidak diizinkan.");

    const user = await getSessionUser();
    if (!user) return fail(401, "Silakan login terlebih dahulu.");

    const { commentId } = await params;
    if (!UUID_REGEX.test(commentId)) return fail(400, "ID komentar tidak valid.");

    const [comment] = await db
      .select({
        id: communityComments.id,
        authorId: communityComments.authorId,
        status: communityComments.status,
      })
      .from(communityComments)
      .where(eq(communityComments.id, commentId))
      .limit(1);

    if (!comment || comment.status !== "published") return fail(404, "Komentar tidak ditemukan.");

    const isModerator = user.role === "moderator" || user.role === "admin";
    if (comment.authorId !== user.id && !isModerator) {
      return fail(403, "Kamu tidak memiliki izin untuk menghapus komentar ini.");
    }

    const mediaRows = await db
      .select({ storagePath: communityCommentMedia.storagePath })
      .from(communityCommentMedia)
      .where(eq(communityCommentMedia.commentId, commentId));

    const paths = mediaRows.map((m) => m.storagePath).filter((p): p is string => Boolean(p));

    if (paths.length > 0) {
      const { error } = await supabaseAdmin.storage.from(COMMUNITY_BUCKET).remove(paths);
      if (error) {
        console.error("Community comment media cleanup error:", { commentId, paths, error });
        return fail(500, "Lampiran gagal dihapus dari Storage. Silakan coba lagi.");
      }
    }

    const [{ replies }] = await db
      .select({ replies: count() })
      .from(communityComments)
      .where(and(eq(communityComments.parentId, commentId), eq(communityComments.status, "published")));

    if (Number(replies) === 0) {
      await db.delete(communityComments).where(eq(communityComments.id, commentId)); // media & like ikut terhapus (cascade)
      return Response.json({ success: true, message: "Komentar dihapus.", data: { id: commentId, mode: "hard" } });
    }

    await db.delete(communityCommentMedia).where(eq(communityCommentMedia.commentId, commentId));
    await db.delete(communityCommentLikes).where(eq(communityCommentLikes.commentId, commentId));
    await db
      .update(communityComments)
      .set({ status: "removed", content: "", updatedAt: new Date() })
      .where(eq(communityComments.id, commentId));

    return Response.json({ success: true, message: "Komentar dihapus.", data: { id: commentId, mode: "soft" } });
  } catch (error) {
    console.error("Delete community comment error:", error);
    return fail(500, "Terjadi kesalahan saat menghapus komentar.");
  }
}
