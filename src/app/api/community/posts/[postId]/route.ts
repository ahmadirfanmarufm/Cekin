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

import { inArray } from "drizzle-orm";
import { communityModerationLogs } from "@/lib/db/schema";
import {
  COMMUNITY_CATEGORY_VALUES,
  EDITABLE_STATUSES,
  canEditPost,
} from "@/features/community/lib/rules";
import { notifyModerators } from "@/features/community/server/notifications";

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

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    if (!isSameOrigin(request)) {
      return Response.json({ success: false, message: "Request tidak diizinkan." }, { status: 403 });
    }

    const user = await getSessionUser();
    if (!user) {
      return Response.json({ success: false, message: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const { postId } = await params;
    if (!UUID_REGEX.test(postId)) {
      return Response.json({ success: false, message: "ID postingan tidak valid." }, { status: 400 });
    }

    const body = (await request.json().catch(() => null)) as {
      category?: unknown;
      title?: unknown;
      content?: unknown;
    } | null;

    const category = body?.category;
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const content = typeof body?.content === "string" ? body.content.trim() : "";

    if (
      typeof category !== "string" ||
      !(COMMUNITY_CATEGORY_VALUES as readonly string[]).includes(category)
    ) {
      return Response.json({ success: false, message: "Kategori tidak valid." }, { status: 400 });
    }
    if (!title || title.length > 150) {
      return Response.json({ success: false, message: "Judul wajib diisi, maksimal 150 karakter." }, { status: 400 });
    }
    if (!content || content.length > 10000) {
      return Response.json({ success: false, message: "Deskripsi wajib diisi, maksimal 10.000 karakter." }, { status: 400 });
    }

    const [post] = await db
      .select({
        authorId: communityPosts.authorId,
        status: communityPosts.status,
        verificationStatus: communityPosts.verificationStatus,
      })
      .from(communityPosts)
      .where(eq(communityPosts.id, postId))
      .limit(1);

    if (!post || post.status !== "published") {
      return Response.json({ success: false, message: "Postingan tidak ditemukan." }, { status: 404 });
    }

    if (post.authorId !== user.id) {
      return Response.json({ success: false, message: "Hanya pembuat laporan yang bisa mengedit." }, { status: 403 });
    }

    if (!canEditPost(post.verificationStatus)) {
      return Response.json(
        { success: false, message: "Laporan ini sudah ditinjau sehingga tidak bisa diedit lagi." },
        { status: 409 },
      );
    }

    const now = new Date();
    const resubmitted = post.verificationStatus === "needs_info";

    // Update bersyarat: jika moderator mengubah status di saat yang sama, edit ditolak.
    const updated = await db.transaction(async (tx) => {
      const [row] = await tx
        .update(communityPosts)
        .set({
          category,
          title,
          content,
          editedAt: now,
          updatedAt: now,
          ...(resubmitted ? { verificationStatus: "unverified" } : {}),
        })
        .where(
          and(
            eq(communityPosts.id, postId),
            eq(communityPosts.authorId, user.id),
            inArray(communityPosts.verificationStatus, [...EDITABLE_STATUSES]),
          ),
        )
        .returning({ id: communityPosts.id });

      if (!row) return false;

      // Hanya perubahan status yang dicatat, supaya riwayat tidak penuh oleh edit kecil.
      if (resubmitted) {
        await tx.insert(communityModerationLogs).values({
          postId,
          moderatorId: null,
          previousVerificationStatus: "needs_info",
          newVerificationStatus: "unverified",
          eventType: "edited",
          note: null,
          createdAt: now,
        });
      }

      return true;
    });

    if (!updated) {
      return Response.json(
        { success: false, message: "Status laporan berubah saat kamu mengedit. Muat ulang lalu coba lagi." },
        { status: 409 },
      );
    }

    if (resubmitted) {
      await notifyModerators({
        type: "post_resubmitted",
        groupKey: `post_resubmitted:${postId}`,
        postId,
        actorId: user.id,
        aggregate: false,
      });
    }

    return Response.json({
      success: true,
      message: resubmitted
        ? "Laporan diperbarui dan dikirim ulang untuk ditinjau."
        : "Laporan berhasil diperbarui.",
      data: { id: postId, resubmitted },
    });
  } catch (error) {
    console.error("Edit community post error:", error);
    return Response.json({ success: false, message: "Terjadi kesalahan saat menyimpan perubahan." }, { status: 500 });
  }
}