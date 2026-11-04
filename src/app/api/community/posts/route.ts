import { randomUUID } from "node:crypto";

import { db } from "@/lib/db";
import {
  and,
  count,
  desc,
  eq,
  inArray,
} from "drizzle-orm";
import {
  communityComments,
  communityMedia,
  communityPosts,
  communityReactions,
  users,
} from "@/lib/db/schema";

import { getSessionUser } from "@/lib/auth/session";

import {
  validateCommunityMedia,
  CommunityMediaValidationError,
} from "@/features/community/lib/validation";

import {
  supabaseAdmin,
  COMMUNITY_BUCKET,
} from "@/lib/supabase/admin";

const COMMUNITY_CATEGORIES = [
  "whatsapp-scam",
  "phishing",
  "marketplace-scam",
  "investment-scam",
  "job-scam",
  "fake-giveaway",
  "fake-account",
  "other",
] as const;

export async function GET() {
  try {
    const user = await getSessionUser();

    const viewer = {
      isAuthenticated: Boolean(user),
      userId: user?.id ?? null,
      role: user?.role ?? null,
    };

    const posts = await db
      .select({
        id: communityPosts.id,
        category: communityPosts.category,
        title: communityPosts.title,
        content: communityPosts.content,
        status: communityPosts.status,
        verificationStatus: communityPosts.verificationStatus,
        createdAt: communityPosts.createdAt,
        updatedAt: communityPosts.updatedAt,
        authorId: users.id,
        author: users.username,
      })
      .from(communityPosts)
      .innerJoin(
        users,
        eq(communityPosts.authorId, users.id),
      )
      .where(eq(communityPosts.status, "published"))
      .orderBy(desc(communityPosts.createdAt))
      .limit(30);

    if (posts.length === 0) {
      return Response.json({
        success: true,
        data: [],
        viewer,
      });
    }

    const postIds = posts.map((post) => post.id);

    const mediaRecords = await db
      .select()
      .from(communityMedia)
      .where(inArray(communityMedia.postId, postIds))
      .orderBy(communityMedia.position);

    const reactionRecords = await db
      .select({
        postId: communityReactions.postId,
        userId: communityReactions.userId,
      })
      .from(communityReactions)
      .where(inArray(communityReactions.postId, postIds));

    const commentCounts = await db
      .select({
        postId: communityComments.postId,
        total: count(),
      })
      .from(communityComments)
      .where(
        and(
          inArray(communityComments.postId, postIds),
          eq(communityComments.status, "published"),
        ),
      )
      .groupBy(communityComments.postId);

    const mediaWithUrls = await Promise.all(
      mediaRecords.map(async (media) => {
        const { data, error } = await supabaseAdmin.storage
          .from(COMMUNITY_BUCKET)
          .createSignedUrl(media.storagePath, 60 * 60);

        if (error) {
          console.error(
            "Gagal membuat signed URL:",
            media.storagePath,
            error,
          );

          return {
            id: media.id,
            postId: media.postId,
            mediaType: media.mediaType,
            mimeType: media.mimeType,
            fileSize: media.fileSize,
            duration: media.duration,
            position: media.position,
            url: null,
          };
        }

        return {
          id: media.id,
          postId: media.postId,
          mediaType: media.mediaType,
          mimeType: media.mimeType,
          fileSize: media.fileSize,
          duration: media.duration,
          position: media.position,
          url: data.signedUrl,
        };
      }),
    );

    const data = posts.map((post) => {
      const postMedia = mediaWithUrls.filter(
        (media) => media.postId === post.id,
      );

      const postReactions = reactionRecords.filter(
        (reaction) => reaction.postId === post.id,
      );

      const commentCount =
        commentCounts.find(
          (item) => item.postId === post.id,
        )?.total ?? 0;

      return {
        id: post.id,
        category: post.category,
        title: post.title,
        content: post.content,
        status: post.status,
        verificationStatus: post.verificationStatus,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,

        author: {
          id: post.authorId,
          username: post.author,
        },

        media: postMedia,

        reactions: {
          total: postReactions.length,
          hasReacted: user ? postReactions.some(
            (reaction) => reaction.userId === user.id,
          ) : false,
        },

        commentCount: Number(commentCount),
        isMine: user ? post.authorId === user.id : false,
      };
    });

    return Response.json({
        success: true,
        data,
        viewer,
    });
  } catch (error) {
    console.error("Get community posts error:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengambil postingan Community.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const uploadedPaths: string[] = [];

  try {
    const user = await getSessionUser();

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Silakan login terlebih dahulu.",
        },
        { status: 401 },
      );
    }

    const formData = await request.formData();

    const category = formData.get("category");
    const title = formData.get("title");
    const content = formData.get("content");

    if (
      typeof category !== "string" ||
      !COMMUNITY_CATEGORIES.includes(
        category as (typeof COMMUNITY_CATEGORIES)[number],
      )
    ) {
      return Response.json(
        {
          success: false,
          message: "Kategori laporan tidak valid.",
        },
        { status: 400 },
      );
    }

    if (typeof title !== "string" || !title.trim()) {
      return Response.json(
        {
          success: false,
          message: "Judul laporan wajib diisi.",
        },
        { status: 400 },
      );
    }

    if (title.trim().length > 150) {
      return Response.json(
        {
          success: false,
          message: "Judul maksimal 150 karakter.",
        },
        { status: 400 },
      );
    }

    if (typeof content !== "string" || !content.trim()) {
      return Response.json(
        {
          success: false,
          message: "Kronologi atau deskripsi laporan wajib diisi.",
        },
        { status: 400 },
      );
    }

    if (content.trim().length > 10000) {
      return Response.json(
        {
          success: false,
          message: "Deskripsi maksimal 10.000 karakter.",
        },
        { status: 400 },
      );
    }

    const mediaFiles = formData.getAll("media").filter((value): value is File => value instanceof File);

    const durationValue = formData.get("videoDuration");

    const durationSeconds =
      typeof durationValue === "string" &&
      durationValue.trim() !== "" ? Number(durationValue) : undefined;
    const mediaInputs = mediaFiles.map((file) => ({
      file,
      ...(file.type.startsWith("video/") ? { durationSeconds } : {}),
    }));

    const validatedMedia =
      await validateCommunityMedia(mediaInputs);

    const postId = randomUUID();

    const mediaRecords: (typeof communityMedia.$inferInsert)[] = [];

    for (let index = 0; index < validatedMedia.length; index++) {
      const media = validatedMedia[index];

      const storagePath =
        `${user.id}/${postId}/${randomUUID()}.${media.extension}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from(COMMUNITY_BUCKET)
        .upload(storagePath, media.file, {
          contentType: media.mimeType,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(
          `Gagal mengunggah media: ${uploadError.message}`,
        );
      }

      uploadedPaths.push(storagePath);

      mediaRecords.push({
        postId,
        storagePath,
        mediaType: media.mediaType,
        mimeType: media.mimeType,
        fileSize: media.fileSize,
        duration: media.duration,
        position: index,
      });
    }

    // 7. Simpan postingan dan metadata media
    await db.transaction(async (tx) => {
      await tx.insert(communityPosts).values({
        id: postId,
        authorId: user.id,
        category,
        title: title.trim(),
        content: content.trim(),
        status: "published",
        verificationStatus: "unverified",
      });

      await tx.insert(communityMedia).values(mediaRecords);
    });

    // 8. Berikan respons sukses
    return Response.json(
      {
        success: true,
        message: "Laporan berhasil dipublikasikan.",
        data: {
          id: postId,
          category,
          title: title.trim(),
          content: content.trim(),
          author: {
            id: user.id,
            username: user.username,
          },
          verificationStatus: "unverified",
          media: mediaRecords.map((media) => ({
            mediaType: media.mediaType,
            mimeType: media.mimeType,
            fileSize: media.fileSize,
            duration: media.duration,
            position: media.position,
          })),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    // 9. Hapus file yang sudah terunggah jika proses gagal
    if (uploadedPaths.length > 0) {
      const { error: cleanupError } = await supabaseAdmin.storage
        .from(COMMUNITY_BUCKET)
        .remove(uploadedPaths);

      if (cleanupError) {
        console.error(
          "Gagal membersihkan media:",
          cleanupError,
        );
      }
    }

    if (error instanceof CommunityMediaValidationError) {
      return Response.json(
        {
          success: false,
          message: error.message,
        },
        { status: 400 },
      );
    }

    console.error("Create community post error:", error);

    return Response.json(
      {
        success: false,
        message: "Terjadi kesalahan saat membuat laporan.",
      },
      { status: 500 },
    );
  }
}