
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  communityPosts,
  communityModerationLogs,
} from "@/lib/db/schema";

import { getSessionUser } from "@/lib/auth/session";
import { isSameOrigin } from "@/lib/auth/request-security";

const VERIFICATION_STATUSES = [
  "under_review",
  "verified",
  "needs_info",
  "rejected",
] as const;

type VerificationStatus =
  (typeof VERIFICATION_STATUSES)[number];

type RouteContext = {
  params: Promise<{
    postId: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    // 1. Validasi origin request
    if (!isSameOrigin(request)) {
      return NextResponse.json(
        {
          success: false,
          message: "Request tidak diizinkan.",
        },
        { status: 403 },
      );
    }

    // 2. Pastikan pengguna sudah login
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Silakan login terlebih dahulu.",
        },
        { status: 401 },
      );
    }

    // 3. Pastikan pengguna memiliki hak moderasi
    if (!["moderator", "admin"].includes(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Kamu tidak memiliki akses untuk melakukan moderasi.",
        },
        { status: 403 },
      );
    }

    // 4. Ambil post ID dari URL
    const { postId } = await context.params;

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(postId)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID laporan tidak valid.",
        },
        { status: 400 },
      );
    }

    // 5. Baca dan validasi request body
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("verificationStatus" in body)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Status verifikasi wajib diisi.",
        },
        { status: 400 },
      );
    }

    const verificationStatus = body.verificationStatus;

    if (
      typeof verificationStatus !== "string" ||
      !VERIFICATION_STATUSES.includes(
        verificationStatus as VerificationStatus,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Status verifikasi tidak valid.",
        },
        { status: 400 },
      );
    }

    const note =
      "note" in body ? body.note : undefined;

    if (
      note !== undefined &&
      note !== null &&
      typeof note !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Catatan moderasi harus berupa teks.",
        },
        { status: 400 },
      );
    }

    const normalizedNote =
      typeof note === "string" ? note.trim() : null;

    if (normalizedNote && normalizedNote.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          message: "Catatan moderasi maksimal 2.000 karakter.",
        },
        { status: 400 },
      );
    }

    if (
      ["needs_info", "rejected"].includes(verificationStatus) &&
      !normalizedNote
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Catatan wajib diisi untuk status ini agar pelapor memahami hasil pemeriksaan.",
        },
        { status: 400 },
      );
    }

    // 6. Update status dan simpan riwayat dalam satu transaksi
    const result = await db.transaction(async (tx) => {
      const [post] = await tx
        .select({
          id: communityPosts.id,
          verificationStatus:
            communityPosts.verificationStatus,
        })
        .from(communityPosts)
        .where(eq(communityPosts.id, postId))
        .limit(1);

      if (!post) {
        return {
          notFound: true as const,
        };
      }

      const previousStatus = post.verificationStatus;

      // Hindari membuat riwayat perubahan yang tidak diperlukan
      if (previousStatus === verificationStatus) {
        return {
          unchanged: true as const,
          postId: post.id,
          verificationStatus: previousStatus,
        };
      }

      const reviewedAt = new Date();

      await tx
        .update(communityPosts)
        .set({
          verificationStatus,
          reviewedBy: user.id,
          reviewedAt,
          reviewNote: normalizedNote,
          updatedAt: reviewedAt,
        })
        .where(eq(communityPosts.id, postId));

      await tx.insert(communityModerationLogs).values({
        postId,
        moderatorId: user.id,
        previousVerificationStatus: previousStatus,
        newVerificationStatus: verificationStatus,
        note: normalizedNote,
        createdAt: reviewedAt,
      });

      return {
        updated: true as const,
        postId,
        previousStatus,
        verificationStatus,
        reviewedAt,
      };
    });

    if ("notFound" in result) {
      return NextResponse.json(
        {
          success: false,
          message: "Laporan tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    if ("unchanged" in result) {
      return NextResponse.json({
        success: true,
        message: "Laporan sudah memiliki status tersebut.",
        data: result,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Status verifikasi laporan berhasil diperbarui.",
      data: result,
    });
  } catch (error) {
    console.error(
      "Update community verification error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memperbarui status verifikasi.",
      },
      { status: 500 },
    );
  }
}
