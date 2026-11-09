import { and, eq, inArray, isNull, lte, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { communityNotifications as n, users } from "@/lib/db/schema";
import { MODERATOR_ROLES } from "@/features/community/lib/rules";
import type { NotificationType } from "@/features/community/types";

type NotifyInput = {
  userId: string;
  type: NotificationType;
  groupKey: string;
  postId?: string | null;
  actorId?: string | null;
  meta?: string | null;
  /** true = angka bertambah (like, komentar). false = selalu 1 (status, dll). */
  aggregate?: boolean;
};

export async function notify(input: NotifyInput) {
  try {
    if (input.actorId && input.actorId === input.userId) return;

    const aggregate = input.aggregate ?? true;
    const now = new Date();

    await db
      .insert(n)
      .values({
        userId: input.userId,
        type: input.type,
        groupKey: input.groupKey,
        postId: input.postId ?? null,
        actorId: input.actorId ?? null,
        meta: input.meta ?? null,
        count: 1,
      })
      .onConflictDoUpdate({
        target: [n.userId, n.groupKey],
        set: {
          count: aggregate
            ? sql`case when ${n.readAt} is null then ${n.count} + 1 else 1 end`
            : sql`1`,
          readAt: null,
          actorId: input.actorId ?? null,
          meta: input.meta ?? null,
          updatedAt: now,
        },
      });
  } catch (error) {
    console.error("Notify error:", error);
  }
}

export async function retract(userId: string, groupKey: string) {
  try {
    await db
      .update(n)
      .set({ count: sql`greatest(${n.count} - 1, 0)` })
      .where(and(eq(n.userId, userId), eq(n.groupKey, groupKey), isNull(n.readAt)));

    await db
      .delete(n)
      .where(
        and(eq(n.userId, userId), eq(n.groupKey, groupKey), isNull(n.readAt), lte(n.count, 0)),
      );
  } catch (error) {
    console.error("Retract notification error:", error);
  }
}

export async function notifyModerators(input: Omit<NotifyInput, "userId">) {
  try {
    const moderators = await db
      .select({ id: users.id })
      .from(users)
      .where(inArray(users.role, [...MODERATOR_ROLES]));

    await Promise.all(moderators.map((moderator) => notify({ ...input, userId: moderator.id })));
  } catch (error) {
    console.error("Notify moderators error:", error);
  }
}