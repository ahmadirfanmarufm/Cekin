
"use client";

import { useEffect, useState } from "react";
import {
  X,
  ShieldCheck,
  ShieldAlert,
  UserRound,
  Award,
} from "lucide-react";

import { BadgeShelf } from "@/components/badges/badge-shelf";
import { BadgeChips } from "@/components/badges/badge-chips";
import { getBadgeById } from "@/lib/learning-protection/badge";

type AuthorRole = string;

type Author = {
  id: string;
  username: string;
  role?: AuthorRole | null;
};

type Props = {
  author: Author | null;
  onClose: () => void;
};

function getRoleInfo(role?: AuthorRole | null) {
  const normalizedRole = role?.toLowerCase().trim() ?? "";

  if (normalizedRole.includes("admin")) {
    return {
      label: "Administrator",
      description: "Pengelola CEKIN",
      icon: ShieldCheck,
      className:
        "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-400/20 dark:bg-purple-400/10 dark:text-purple-300",
    };
  }

  if (
    normalizedRole.includes("moderator") ||
    normalizedRole === "mod"
  ) {
    return {
      label: "Moderator",
      description: "Tim moderasi komunitas",
      icon: ShieldAlert,
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300",
    };
  }

  return {
    label: "Anggota",
    description: "Bagian dari komunitas CEKIN",
    icon: UserRound,
    className:
      "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]",
  };
}

function ProfileCard({
  author,
  onClose,
}: {
  author: Author;
  onClose: () => void;
}) {
  const [badgeIds, setBadgeIds] = useState<string[]>([]);

  const firstBadge = getBadgeById(badgeIds[0] ?? "");
  const roleInfo = getRoleInfo(author.role);
  const RoleIcon = roleInfo.icon;

  const initial =
    author.username.trim().charAt(0).toUpperCase() || "?";

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="
        fixed inset-0 z-[70]
        flex items-end justify-center
        bg-black/55 backdrop-blur-sm
        sm:items-center sm:p-4
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="author-profile-title"
        className="
          relative flex w-full flex-col
          max-h-[min(90dvh,760px)]
          overflow-hidden
          rounded-t-2xl
          border border-[var(--border)]
          bg-[var(--card)]
          text-[var(--foreground)]
          shadow-2xl shadow-black/20
          animate-in fade-in slide-in-from-bottom-3
          duration-200

          sm:max-w-md
          sm:rounded-2xl
          sm:max-h-[min(85dvh,760px)]

          md:max-w-lg
        "
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Banner */}
        <div
          className="
            relative h-24 shrink-0
            sm:h-28
          "
          style={{
            background: firstBadge
              ? `linear-gradient(135deg, ${firstBadge.from}, ${firstBadge.to})`
              : "linear-gradient(135deg, var(--brand), var(--brand-dark))",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup profil"
            className="
              absolute right-3 top-3 z-10
              flex size-9 items-center justify-center
              rounded-full
              border border-white/15
              bg-black/20 text-white
              backdrop-blur-sm
              transition-colors duration-200
              hover:bg-black/40
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-white
            "
          >
            <X size={20} />
          </button>

          {/* Avatar */}
          <div
            className="
              absolute -bottom-8 left-4
              flex size-[72px] items-center justify-center
              rounded-full
              border-4 border-[var(--card)]
              bg-[var(--brand-soft)]
              text-3xl font-extrabold
              text-[var(--brand)]
              shadow-md

              sm:left-5 sm:size-20
              sm:text-4xl
            "
          >
            {initial}
          </div>
        </div>

        {/* Profile information */}
        <div className="shrink-0 px-4 pb-4 pt-11 sm:px-5 sm:pt-12">
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex min-w-0 flex-col gap-3">
              <div className="min-w-0">
                <h2
                  id="author-profile-title"
                  className="
                    break-words
                    text-lg font-extrabold
                    tracking-tight text-[var(--foreground)]
                    sm:text-xl
                  "
                >
                  {author.username}
                </h2>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  Profil anggota komunitas
                </p>
              </div>

              {/* Badge preview */}
              {badgeIds.length > 0 && (
                <div
                  className="
                    flex w-fit max-w-full
                    items-center
                    rounded-xl
                    border border-[var(--border)]
                    bg-[var(--surface)]
                    px-2 py-1.5
                  "
                >
                  <BadgeChips
                    badgeIds={badgeIds}
                    max={4}
                    size={21}
                  />
                </div>
              )}
            </div>

            {/* Role */}
            <div
              className={`
                inline-flex w-fit max-w-full
                items-center gap-2
                rounded-lg border
                px-2.5 py-1.5
                text-[11px] font-bold
                ${roleInfo.className}
              `}
            >
              <RoleIcon size={14} className="shrink-0" />
              <span className="break-words">
                {roleInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 shrink-0 border-t border-[var(--border)] sm:mx-5" />

        {/* Scrollable badge collection */}
        <div
          className="
            min-h-0 flex-1
            overflow-y-auto overscroll-contain
            px-4 py-4
            sm:px-5 sm:py-5
          "
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Award
                  size={17}
                  className="shrink-0 text-[var(--brand)]"
                />

                <h3 className="text-sm font-bold text-[var(--foreground)]">
                  Koleksi Badge
                </h3>
              </div>

              <p className="mt-1 text-[11px] text-[var(--muted)]">
                Pencapaian yang berhasil dikumpulkan
              </p>
            </div>

            {badgeIds.length > 0 && (
              <span
                className="
                  shrink-0 rounded-full
                  bg-[var(--brand-soft)]
                  px-2.5 py-1
                  text-[10px] font-bold
                  text-[var(--brand)]
                "
              >
                {badgeIds.length} Badge
              </span>
            )}
          </div>

          <div
            className="
              min-w-0 rounded-xl
              border border-[var(--border)]
              bg-[var(--surface)]
              p-2.5
              sm:p-3
            "
          >
            <BadgeShelf
              userId={author.id}
              tone="light"
              onLoaded={setBadgeIds}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="
            flex shrink-0 flex-wrap
            items-center justify-between
            gap-3 border-t border-[var(--border)]
            bg-[var(--surface)]
            px-4 py-3
            sm:px-5
          "
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className="
                flex size-7 shrink-0 items-center justify-center
                rounded-full
                bg-[var(--brand-soft)]
                text-[var(--brand)]
              "
            >
              <RoleIcon size={14} />
            </span>

            <span className="break-words text-[10px] text-[var(--muted)]">
              {roleInfo.description}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              inline-flex min-h-9 shrink-0
              items-center justify-center
              rounded-lg
              border border-[var(--border)]
              bg-[var(--card)]
              px-4 py-2
              text-xs font-bold
              text-[var(--foreground)]
              transition-colors duration-200
              hover:border-[var(--brand)]
              hover:bg-[var(--brand-soft)]
              hover:text-[var(--brand)]
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-[var(--brand)]
            "
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export function AuthorProfileDialog({
  author,
  onClose,
}: Props) {
  if (!author) return null;

  return (
    <ProfileCard
      key={author.id}
      author={author}
      onClose={onClose}
    />
  );
}
