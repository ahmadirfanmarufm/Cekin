import { NextRequest } from "next/server";

import { getSessionUser } from "@/lib/auth/session";

import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  communityCommentMedia,
  communityComments,
  communityMedia,
  communityPosts,
} from "@/lib/db/schema";

import { isSameOrigin } from "@/lib/auth/request-security";

import {
  supabaseAdmin,
  COMMUNITY_BUCKET,
} from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    postId: string;
  }>;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    if (!isSameOrigin(request)) {
      return Response.json(
        { success: false, message: "Request tidak diizinkan." },
        { status: 403 },
      );
    }

    const user = await getSessionUser();

    if (!user) {
      return Response.json(
        { success: false, message: "Silakan login terlebih dahulu." },
        { status: 401 },
      );
    }

    const { postId } = await params;

    if (!UUID_REGEX.test(postId)) {
      return Response.json(
        { success: false, message: "ID postingan tidak valid." },
        { status: 400 },
      );
    }

    const [post] = await db
      .select({
        id: communityPosts.id,
        authorId: communityPosts.authorId,
        status: communityPosts.status,
      })
      .from(communityPosts)
      .where(eq(communityPosts.id, postId))
      .limit(1);

    if (!post) {
      return Response.json(
        { success: false, message: "Postingan tidak ditemukan atau sudah dihapus." },
        { status: 404 },
      );
    }

    const isOwner = post.authorId === user.id;
    const isModerator = user.role === "moderator" || user.role === "admin";

    if (!isOwner && !isModerator) {
      return Response.json(
        { success: false, message: "Kamu tidak memiliki izin untuk menghapus postingan ini." },
        { status: 403 },
      );
    }

    const mediaRecords = await db
      .select({ storagePath: communityMedia.storagePath })
      .from(communityMedia)
      .where(eq(communityMedia.postId, postId));

    // BARU: lampiran komentar ikut dibersihkan. Tanpa ini, file-nya jadi yatim di Storage
    // karena baris komentar terhapus lewat cascade tetapi file-nya tidak.
    const commentMediaRecords = await db
      .select({ storagePath: communityCommentMedia.storagePath })
      .from(communityCommentMedia)
      .innerJoin(
        communityComments,
        eq(communityComments.id, communityCommentMedia.commentId),
      )
      .where(eq(communityComments.postId, postId));

    const storagePaths = [...mediaRecords, ...commentMediaRecords]
      .map((media) => media.storagePath)
      .filter((path): path is string => Boolean(path));

    await db
      .update(communityPosts)
      .set({ status: "removed", updatedAt: new Date() })
      .where(eq(communityPosts.id, postId));

    if (storagePaths.length > 0) {
      const { error: storageError } = await supabaseAdmin.storage
        .from(COMMUNITY_BUCKET)
        .remove(storagePaths);

      if (storageError) {
        console.error("Community media cleanup error:", {
          postId,
          storagePaths,
          error: storageError,
        });

        return Response.json(
          {
            success: false,
            message:
              "Postingan sudah disembunyikan, tetapi file bukti gagal dihapus dari Storage. Silakan coba hapus kembali.",
          },
          { status: 500 },
        );
      }
    }

    await db
      .delete(communityPosts)
      .where(
        and(
          eq(communityPosts.id, postId),
          eq(communityPosts.status, "removed"),
        ),
      );

    return Response.json({
      success: true,
      message: "Postingan dan seluruh media buktinya berhasil dihapus.",
      data: {
        id: postId,
        deletedMediaCount: storagePaths.length,
      },
    });
  } catch (error) {
    console.error("Delete community post error:", error);

    return Response.json(
      { success: false, message: "Terjadi kesalahan saat menghapus postingan." },
      { status: 500 },
    );
  }
}
