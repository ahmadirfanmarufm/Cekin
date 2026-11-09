
"use client";

import { useEffect, useState } from "react";
import { Award, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";

import {
  BADGES,
  BADGE_MISTAKE_LIMIT,
} from "@/lib/learning-protection/badge";
import { BadgeIcon } from "./badge-icon";

type Earned = {
  badgeId: string;
  mistakes: number;
  earnedAt: string;
};

type BadgeShelfProps = {
  userId?: string;
  showLocked?: boolean;
  tone?: "light" | "dark";
  onLoaded?: (badgeIds: string[]) => void;
};

export function BadgeShelf({
  userId,
  showLocked = false,
  onLoaded,
}: BadgeShelfProps) {
  const [earned, setEarned] = useState<Earned[] | null>(null);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const response = await fetch(
          `/api/learning-protection/badges${userId ? `?userId=${userId}` : ""}`,
          {
            cache: "no-store",
            credentials: "same-origin",
          },
        );

        if (!response.ok) {
          throw new Error("Gagal mengambil koleksi badge.");
        }

        const result = await response.json();
        const list: Earned[] = result?.data?.badges ?? [];

        if (!ignore) {
          setEarned(list);
          onLoaded?.(list.map((item) => item.badgeId));
        }
      } catch {
        if (!ignore) {
          setEarned([]);
          onLoaded?.([]);
        }
      }
    };

    void load();

    const onAuth = () => void load();

    window.addEventListener("cekin-auth-change", onAuth);

    return () => {
      ignore = true;
      window.removeEventListener("cekin-auth-change", onAuth);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Loading
  if (earned === null) {
    return (
      <div
        className="
          h-28 animate-pulse rounded-xl
          border border-[var(--border)]
          bg-[var(--surface)]
        "
        aria-busy="true"
        aria-label="Memuat koleksi badge"
      />
    );
  }

  const byId = new Map(
    earned.map((item) => [item.badgeId, item]),
  );

  const list = showLocked
    ? BADGES
    : BADGES.filter((badge) => byId.has(badge.id));

  // Empty state
  if (list.length === 0) {
    return (
      <div
        className="
          flex flex-col items-center justify-center
          rounded-xl border border-dashed
          border-[var(--border)]
          bg-[var(--card)]
          px-4 py-7 text-center
        "
      >
        <div
          className="
            mb-3 flex size-11 items-center justify-center
            rounded-xl
            bg-[var(--brand-soft)]
            text-[var(--brand)]
          "
        >
          <Award size={21} />
        </div>

        <p className="text-sm font-bold text-[var(--foreground)]">
          Belum ada badge
        </p>

        <p
          className="
            mt-1 max-w-[240px]
            text-xs leading-relaxed
            text-[var(--muted)]
          "
        >
          Selesaikan simulasi dan kumpulkan pencapaianmu
          di Learning &amp; Protection.
        </p>

        <Link
          href="/learning-protection"
          className="
            mt-4 min-h-9
            rounded-lg
            bg-[var(--brand)]
            px-4 py-2
            text-xs font-bold
            transition-colors duration-200
            hover:bg-[var(--brand-dark)]
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-[var(--brand)]
          "
        >
            <span className="text-white inline-flex items-center justify-center gap-2">
                <ShieldCheck size={14} />
                Mulai Belajar
            </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <p
        className="
          mb-3 text-[11px] font-bold
          uppercase tracking-wider
          text-[var(--muted)]
        "
      >
        Badge · {earned.length}/{BADGES.length}
      </p>

      <ul className="grid grid-cols-3 gap-2">
        {list.map((badge) => {
          const own = byId.get(badge.id);

          return (
            <li
              key={badge.id}
              title={
                own
                  ? `${badge.name}: ${badge.description}`
                  : `Tamatkan “${badge.courseName}” dengan salah maksimal ${BADGE_MISTAKE_LIMIT - 1}x`
              }
              className="
                flex min-w-0 flex-col items-center
                rounded-xl border border-[var(--border)]
                bg-[var(--card)]
                px-1.5 py-3 text-center
                transition-colors duration-200
                hover:border-[var(--brand)]/40
              "
            >
              <span className="relative">
                <BadgeIcon
                  badge={badge}
                  size={44}
                  locked={!own}
                />

                {!own && (
                  <span
                    className="
                      absolute -bottom-1 -right-1
                      flex size-4 items-center justify-center
                      rounded-full
                      bg-[var(--muted)]
                      text-white
                    "
                  >
                    <Lock size={9} />
                  </span>
                )}

                {own?.mistakes === 0 && (
                  <span
                    title="Tanpa salah"
                    className="
                      absolute -right-1.5 -top-1.5
                      text-[11px]
                    "
                    aria-label="Tanpa salah"
                  >
                    ⭐
                  </span>
                )}
              </span>

              <span
                className={`
                  mt-2 max-w-full break-words
                  text-[11px] font-bold leading-tight
                  ${
                    own
                      ? "text-[var(--foreground)]"
                      : "text-[var(--muted)]"
                  }
                `}
              >
                {badge.name}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
