import { NextRequest } from "next/server";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { communityNotifications, communityReports, users } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth/session";
import { isSameOrigin } from "@/lib/auth/request-security";
import { isModeratorRole } from "@/features/community/lib/rules";
import { fail, UUID_REGEX } from "@/features/community/server/http";

type RouteContext = { params: Promise<{ postId: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getSessionUser();
    if (!user) return fail(401, "Silakan login terlebih dahulu.");
    if (!isModeratorRole(user.role)) return fail(403, "Tidak punya akses.");

    const { postId } = await params;
    if (!UUID_REGEX.test(postId)) return fail(400, "ID postingan tidak valid.");

    const rows = await db
      .select({
        id: communityReports.id,
        reason: communityReports.reason,
        detail: communityReports.description,
        status: communityReports.status,
        createdAt: communityReports.createdAt,
        reporterUsername: users.username,
      })
      .from(communityReports)
      .innerJoin(users, eq(users.id, communityReports.reporterId))
      .where(eq(communityReports.postId, postId))
      .orderBy(desc(communityReports.createdAt))
      .limit(100);

    return Response.json(
      { success: true, data: rows },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Get post reports error:", error);
    return fail(500, "Gagal memuat laporan.");
  }
}

/** Tandai semua laporan yang masih menunggu: "resolved" atau "dismissed". */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    if (!isSameOrigin(request)) return fail(403, "Request tidak diizinkan.");

    const user = await getSessionUser();
    if (!user) return fail(401, "Silakan login terlebih dahulu.");
    if (!isModeratorRole(user.role)) return fail(403, "Tidak punya akses.");

    const { postId } = await params;
    if (!UUID_REGEX.test(postId)) return fail(400, "ID postingan tidak valid.");

    const body = (await request.json().catch(() => null)) as { status?: unknown } | null;
    const status = body?.status;

    if (status !== "resolved" && status !== "dismissed") return fail(400, "Status tidak valid.");

    await db
      .update(communityReports)
      .set({ status })
      .where(and(eq(communityReports.postId, postId), eq(communityReports.status, "pending")));

    // Bersihkan notifikasi laporan milik semua moderator untuk postingan ini.
    await db
      .delete(communityNotifications)
      .where(eq(communityNotifications.groupKey, `post_report:${postId}`));

    return Response.json({ success: true, message: "Laporan ditandai selesai." });
  } catch (error) {
    console.error("Resolve post reports error:", error);
    return fail(500, "Gagal memperbarui laporan.");
  }
}