"use client";

import { getBadgeById } from "@/lib/learning-protection/badge";
import { BadgeTip } from "./badge-icon";

export function BadgeChips({
  badgeIds,
  max = 3,
  size = 18,
}: {
  badgeIds?: string[];
  max?: number;
  size?: number;
}) {
  const badges = (badgeIds ?? [])
    .map((id) => getBadgeById(id))
    .filter((badge): badge is NonNullable<typeof badge> => Boolean(badge));

  if (badges.length === 0) return null;

  const shown = badges.slice(0, max);
  const extra = badges.length - shown.length;

  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-1.5 py-1 align-middle">
      {shown.map((badge) => (
        <BadgeTip key={badge.id} badge={badge} size={size} />
      ))}
      {extra > 0 && <span className="text-[10px] font-bold text-gray-500">+{extra}</span>}
    </span>
  );
}