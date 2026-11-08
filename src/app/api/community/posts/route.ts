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
  communityReports,
  userBadges,
  users,
} from "@/lib/db/schema";

import { getSessionUser } from "@/lib/auth/session";
import { isModeratorRole } from "@/features/community/lib/rules";

import {
  validateCommunityMedia,
  CommunityMediaValidationError,
} from "@/features/community/lib/validation";

import { rankFeed, parseSeen } from "@/features/community/server/feed-ranking";

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

const POOL_SIZE = 200; // kandidat yang diranking
const PAGE_SIZE = 30; // yang dikirim ke klien

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();

    const viewer = {
      isAuthenticated: Boolean(user),
      userId: user?.id ?? null,
      role: user?.role ?? null,
    };

    const { searchParams } = new URL(request.url);
    const seen = parseSeen(searchParams.get("seen"));
    const offset = Math.min(Math.max(0, Number(searchParams.get("offset")) || 0), POOL_SIZE);

    const pool = await db
      .select({
        id: communityPosts.id,
        category: communityPosts.category,
        createdAt: communityPosts.createdAt,
        verificationStatus: communityPosts.verificationStatus,
      })
      .from(communityPosts)
      .where(eq(communityPosts.status, "published"))
      .orderBy(desc(communityPosts.createdAt))
      .limit(POOL_SIZE);

    if (pool.length === 0) {
      return Response.json({ success: true, data: [], hasMore: false, viewer });
    }

    const poolIds = pool.map((post) => post.id);

    const [likeRows, commentRows, reportRows] = await Promise.all([
      db
        .select({ postId: communityReactions.postId, total: count() })
        .from(communityReactions)
        .where(inArray(communityReactions.postId, poolIds))
        .groupBy(communityReactions.postId),
      db
        .select({ postId: communityComments.postId, total: count() })
        .from(communityComments)
        .where(
          and(
            inArray(communityComments.postId, poolIds),
            eq(communityComments.status, "published"),
          ),
        )
        .groupBy(communityComments.postId),
      db
        .select({ postId: communityReports.postId, total: count() })
        .from(communityReports)
        .where(
          and(
            inArray(communityReports.postId, poolIds),
            eq(communityReports.status, "pending"),
          ),
        )
        .groupBy(communityReports.postId),
    ]);

    const toMap = (rows: { postId: string; total: number }[]) =>
      new Map(rows.map((row) => [row.postId, Number(row.total)]));

    const likeCounts = toMap(likeRows);
    const commentCounts = toMap(commentRows);
    const reportCounts = toMap(reportRows);

    const now = Math.floor(Date.now() / 300_000) * 300_000;

    const ranked = rankFeed(
      pool.map((post) => ({
        ...post,
        likeCount: likeCounts.get(post.id) ?? 0,
        commentCount: commentCounts.get(post.id) ?? 0,
        reportCount: reportCounts.get(post.id) ?? 0,
      })),
      { now, seenByCategory: seen },
    );

    const pageIds = ranked.slice(offset, offset + PAGE_SIZE).map((post) => post.id);
    const hasMore = offset + PAGE_SIZE < ranked.length;

    if (pageIds.length === 0) {
      return Response.json({ success: true, data: [], hasMore: false, viewer });
    }

    const [posts, mediaRecords, myReactions] = await Promise.all([
      db
      .select({
        id: communityPosts.id,
        category: communityPosts.category,
        title: communityPosts.title,
        content: communityPosts.content,
        status: communityPosts.status,
        verificationStatus: communityPosts.verificationStatus,
        createdAt: communityPosts.createdAt,
        updatedAt: communityPosts.updatedAt,
        editedAt: communityPosts.editedAt,
        reviewNote: communityPosts.reviewNote,
        authorId: users.id,
        author: users.username,
        authorRole: users.role,
      })
      .from(communityPosts)
      .innerJoin(users, eq(communityPosts.authorId, users.id))
      .where(inArray(communityPosts.id, pageIds)),
      db
        .select()
        .from(communityMedia)
        .where(inArray(communityMedia.postId, pageIds))
        .orderBy(communityMedia.position),
      user
        ? db
            .select({ postId: communityReactions.postId })
            .from(communityReactions)
            .where(
              and(
                inArray(communityReactions.postId, pageIds),
                eq(communityReactions.userId, user.id),
              ),
            )
        : Promise.resolve([] as { postId: string }[]),
    ]);

    const authorIds = [...new Set(posts.map((post) => post.authorId))];

    const badgeRows = authorIds.length
      ? await db
          .select({ userId: userBadges.userId, badgeId: userBadges.badgeId })
          .from(userBadges)
          .where(inArray(userBadges.userId, authorIds))
          .orderBy(userBadges.earnedAt)
      : [];

    const badgesByUser = new Map<string, string[]>();
    for (const row of badgeRows) {
      badgesByUser.set(row.userId, [...(badgesByUser.get(row.userId) ?? []), row.badgeId]);
    }

    const mediaWithUrls = await Promise.all(
      mediaRecords.map(async (media) => {
        const { data, error } = await supabaseAdmin.storage
          .from(COMMUNITY_BUCKET)
          .createSignedUrl(media.storagePath, 60 * 60);

        if (error) {
          console.error("Gagal membuat signed URL:", media.storagePath, error);
        }

        return {
          id: media.id,
          postId: media.postId,
          mediaType: media.mediaType,
          mimeType: media.mimeType,
          fileSize: media.fileSize,
          duration: media.duration,
          position: media.position,
          url: error ? null : data.signedUrl,
        };
      }),
    );

    const postsById = new Map(posts.map((post) => [post.id, post]));
    const reactedIds = new Set(myReactions.map((row) => row.postId));

    const data = pageIds.flatMap((id) => {
      const post = postsById.get(id);
      if (!post) return [];

      return [
        {
          id: post.id,
          category: post.category,
          title: post.title,
          content: post.content,
          status: post.status,
          verificationStatus: post.verificationStatus,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          editedAt: post.editedAt,

          reviewNote: user && (post.authorId === user.id || isModeratorRole(user.role)) ? post.reviewNote : null,

          reportCount: user && isModeratorRole(user.role) ? (reportCounts.get(post.id) ?? 0) : 0,

          author: {
            id: post.authorId,
            username: post.author,
            role: post.authorRole,
            badges: badgesByUser.get(post.authorId) ?? [],
          },

          media: mediaWithUrls.filter((media) => media.postId === post.id),

          reactions: {
            total: likeCounts.get(post.id) ?? 0,
            hasReacted: reactedIds.has(post.id),
          },

          commentCount: commentCounts.get(post.id) ?? 0,
          isMine: user ? post.authorId === user.id : false,
        },
      ];
    });

    return Response.json({ success: true, data, hasMore, viewer });
  } catch (error) {
    console.error("Get community posts error:", error);

    return Response.json(
      { success: false, message: "Gagal mengambil postingan Community." },
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