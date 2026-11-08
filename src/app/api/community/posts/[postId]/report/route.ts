import { NextRequest } from "next/server";
import { and, count, eq, gte } from "drizzle-orm";

import { db } from "@/lib/db";
import { communityPosts, communityReports } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth/session";
import { isSameOrigin } from "@/lib/auth/request-security";
import { fail, UUID_REGEX } from "@/features/community/server/http";
import {
  REPORT_DETAIL_MAX,
  REPORT_OTHER_MIN,
  REPORT_REASONS,
} from "@/features/community/lib/rules";
import { notifyModerators } from "@/features/community/server/notifications";

type RouteContext = { params: Promise<{ postId: string }> };

const MAX_REPORTS_PER_HOUR = 10;

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    if (!isSameOrigin(request)) return fail(403, "Request tidak diizinkan.");

    const user = await getSessionUser();
    if (!user) return fail(401, "Silakan login terlebih dahulu.");

    const { postId } = await params;
    if (!UUID_REGEX.test(postId)) return fail(400, "ID postingan tidak valid.");

    const body = (await request.json().catch(() => null)) as {
      reason?: unknown;
      detail?: unknown;
    } | null;

    const reason = typeof body?.reason === "string" ? body.reason : "";
    const detail = typeof body?.detail === "string" ? body.detail.trim() : "";

    if (!REPORT_REASONS.some((item) => item.value === reason)) {
      return fail(400, "Pilih alasan pelaporan.");
    }
    if (detail.length > REPORT_DETAIL_MAX) {
      return fail(400, `Penjelasan maksimal ${REPORT_DETAIL_MAX} karakter.`);
    }
    if (reason === "other" && detail.length < REPORT_OTHER_MIN) {
      return fail(400, `Jelaskan singkat alasanmu (minimal ${REPORT_OTHER_MIN} karakter).`);
    }

    const [post] = await db
      .select({ authorId: communityPosts.authorId, status: communityPosts.status })
      .from(communityPosts)
      .where(eq(communityPosts.id, postId))
      .limit(1);

    if (!post || post.status !== "published") return fail(404, "Postingan tidak ditemukan.");
    if (post.authorId === user.id) return fail(400, "Kamu tidak bisa melaporkan postinganmu sendiri.");

    const [{ total }] = await db
      .select({ total: count() })
      .from(communityReports)
      .where(
        and(
          eq(communityReports.reporterId, user.id),
          gte(communityReports.createdAt, new Date(Date.now() - 3_600_000)),
        ),
      );

    if (Number(total) >= MAX_REPORTS_PER_HOUR) {
      return fail(429, "Terlalu banyak laporan dalam waktu singkat. Coba lagi nanti.");
    }

    const [inserted] = await db
      .insert(communityReports)
      .values({ postId, reporterId: user.id, reason, description: detail || null })
      .onConflictDoNothing()
      .returning({ id: communityReports.id });

    if (!inserted) return fail(409, "Kamu sudah melaporkan postingan ini.");

    await notifyModerators({
      type: "post_report",
      groupKey: `post_report:${postId}`,
      postId,
      actorId: user.id,
      meta: reason,
    });

    return Response.json(
      { success: true, message: "Terima kasih, laporanmu sudah diterima moderator." },
      { status: 201 },
    );
  } catch (error) {
    console.error("Report post error:", error);
    return fail(500, "Gagal mengirim laporan.");
  }
}