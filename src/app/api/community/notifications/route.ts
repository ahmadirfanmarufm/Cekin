import { NextRequest } from "next/server";
import { and, count, desc, eq, inArray, isNotNull, isNull, lt } from "drizzle-orm";

import { db } from "@/lib/db";
import { communityNotifications as n, communityPosts, users } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth/session";
import { isSameOrigin } from "@/lib/auth/request-security";
import { fail, UUID_REGEX } from "@/features/community/server/http";

const LIMIT = 30;
const KEEP_READ_DAYS = 30;

async function unreadCountOf(userId: string) {
  const [{ total }] = await db
    .select({ total: count() })
    .from(n)
    .where(and(eq(n.userId, userId), isNull(n.readAt)));
  return Number(total);
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return fail(401, "Silakan login terlebih dahulu.");

    const headers = { "Cache-Control": "no-store" };

    if (request.nextUrl.searchParams.get("countOnly") === "1") {
      return Response.json(
        { success: true, data: { unreadCount: await unreadCountOf(user.id) } },
        { headers },
      );
    }

    // Bersihkan notifikasi lama yang sudah dibaca agar daftar tidak menumpuk.
    await db
      .delete(n)
      .where(
        and(
          eq(n.userId, user.id),
          isNotNull(n.readAt),
          lt(n.updatedAt, new Date(Date.now() - KEEP_READ_DAYS * 86_400_000)),
        ),
      );

    const rows = await db
      .select({
        id: n.id,
        type: n.type,
        count: n.count,
        meta: n.meta,
        postId: n.postId,
        readAt: n.readAt,
        updatedAt: n.updatedAt,
        actorName: users.username,
        postTitle: communityPosts.title,
      })
      .from(n)
      .leftJoin(users, eq(users.id, n.actorId))
      .leftJoin(communityPosts, eq(communityPosts.id, n.postId))
      .where(eq(n.userId, user.id))
      .orderBy(desc(n.updatedAt))
      .limit(LIMIT);

    const items = rows.map((row) => ({
      id: row.id,
      type: row.type,
      count: row.count,
      meta: row.meta,
      postId: row.postId,
      postTitle: row.postTitle,
      // Pengubah status tidak pernah dibuka ke pelapor.
      actorName: row.type === "post_review" ? null : row.actorName,
      isRead: row.readAt !== null,
      updatedAt: row.updatedAt.toISOString(),
    }));

    return Response.json(
      { success: true, data: { unreadCount: await unreadCountOf(user.id), items } },
      { headers },
    );
  } catch (error) {
    console.error("Get notifications error:", error);
    return fail(500, "Gagal memuat notifikasi.");
  }
}

/** Body: { all: true } atau { ids: string[] } */
export async function PATCH(request: NextRequest) {
  try {
    if (!isSameOrigin(request)) return fail(403, "Request tidak diizinkan.");

    const user = await getSessionUser();
    if (!user) return fail(401, "Silakan login terlebih dahulu.");

    const body = (await request.json().catch(() => null)) as {
      all?: unknown;
      ids?: unknown;
    } | null;

    const now = new Date();

    if (body?.all === true) {
      await db.update(n).set({ readAt: now }).where(and(eq(n.userId, user.id), isNull(n.readAt)));
    } else if (
      Array.isArray(body?.ids) &&
      body.ids.length > 0 &&
      body.ids.length <= 50 &&
      body.ids.every((id) => typeof id === "string" && UUID_REGEX.test(id))
    ) {
      await db
        .update(n)
        .set({ readAt: now })
        .where(and(eq(n.userId, user.id), isNull(n.readAt), inArray(n.id, body.ids as string[])));
    } else {
      return fail(400, "Permintaan tidak valid.");
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Mark notifications read error:", error);
    return fail(500, "Gagal memperbarui notifikasi.");
  }
}