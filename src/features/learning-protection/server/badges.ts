import { and, eq, gt } from "drizzle-orm";

import { db } from "@/lib/db";
import { userBadges } from "@/lib/db/schema";
import {
  BADGE_MISTAKE_LIMIT,
  getBadgeBySimulationId,
  isBadgeEarned,
} from "@/lib/learning-protection/badge";


export async function awardBadge(input: {
  userId: string;
  simulationId: string;
  mistakes: number;
}) {
  try {
    const def = getBadgeBySimulationId(input.simulationId);
    if (!def) return null;

    const base = {
    id: def.id,
    name: def.name,
    icon: def.icon,
    shape: def.shape,
    mistakes: input.mistakes,
    limit: BADGE_MISTAKE_LIMIT,
    };

    if (!isBadgeEarned(input.mistakes)) {
      const [existing] = await db
        .select({ id: userBadges.id })
        .from(userBadges)
        .where(and(eq(userBadges.userId, input.userId), eq(userBadges.badgeId, def.id)))
        .limit(1);

      return { ...base, earned: false, owned: Boolean(existing), firstTime: false };
    }

    const [inserted] = await db
      .insert(userBadges)
      .values({
        userId: input.userId,
        badgeId: def.id,
        simulationId: input.simulationId,
        mistakes: input.mistakes,
      })
      .onConflictDoNothing()
      .returning({ id: userBadges.id });

    if (!inserted) {
      await db
        .update(userBadges)
        .set({ mistakes: input.mistakes })
        .where(
          and(
            eq(userBadges.userId, input.userId),
            eq(userBadges.badgeId, def.id),
            gt(userBadges.mistakes, input.mistakes),
          ),
        );
    }

    return { ...base, earned: true, owned: true, firstTime: Boolean(inserted) };
  } catch (error) {
    console.error("AWARD_BADGE_ERROR:", error);
    return null;
  }
}