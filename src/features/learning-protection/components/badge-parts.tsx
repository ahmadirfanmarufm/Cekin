"use client";

import {
  Award,
  CheckCircle2,
  LogIn,
  ShieldX,
  Shield,
  Smartphone,
  Mail,
  PhoneOff,
  Dices,
  Brain,
} from "lucide-react";

import type { SimulationId } from "@/types/learning-protection";
import {
  BADGE_MISTAKE_LIMIT,
  getBadgeByKey,
  isBadgeEarned,
} from "@/lib/learning-protection/badge";
import type { TutorialStep } from "./guided-tutorial";

const BADGE_ICONS = {
  shield: Shield,
  "phone-app": Smartphone,
  mail: Mail,
  "phone-off": PhoneOff,
  dice: Dices,
  brain: Brain,
} as const;

function BadgeIcon({ icon, className }: {
  icon: keyof typeof BADGE_ICONS;
  className?: string;
}) {
  const Icon = BADGE_ICONS[icon];

  return <Icon className={className} aria-hidden="true" />;
}

export function BadgeTracker({
  simulationKey,
  mistakes,
}: {
  simulationKey: SimulationId;
  mistakes: number;
}) {
  const badge = getBadgeByKey(simulationKey);
  const lost = !isBadgeEarned(mistakes);

  return (
    <div
      data-tutorial="badge"
      className={`mb-5 flex items-center gap-3 rounded-2xl border p-4 ${
        lost
          ? "border-[var(--danger)]/25 bg-[var(--danger)]/5"
          : "border-[var(--border)] bg-[var(--card)]"
      }`}
    >
        <span
            className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${
                lost ? "bg-[var(--surface)] text-[var(--muted)] grayscale" : "text-white"
            }`}
            style={
                lost
                ? undefined
                : {
                    background: `linear-gradient(135deg, ${badge.from}, ${badge.to})`,
                    }
            }
            >
            <BadgeIcon icon={badge.icon} className="size-6" />
        </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-extrabold text-[var(--foreground)]">
          Badge: {badge.name}
        </p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--muted)]">
          {lost
            ? "Badge hangus di percobaan ini. XP tetap jalan. Mau ngejar badge? Ulangi simulasi dari awal."
            : `Boleh salah maksimal ${BADGE_MISTAKE_LIMIT - 1}x. Salah ke-${BADGE_MISTAKE_LIMIT} = badge hangus.`}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p
          className={`text-lg font-extrabold tabular-nums ${
            lost ? "text-[var(--danger)]" : "text-[var(--foreground)]"
          }`}
        >
          {Math.min(mistakes, BADGE_MISTAKE_LIMIT)}/{BADGE_MISTAKE_LIMIT}
        </p>
        <div className="mt-1 flex justify-end gap-1" aria-hidden="true">
          {Array.from({ length: BADGE_MISTAKE_LIMIT }, (_, index) => (
            <span
              key={index}
              className={`size-2 rounded-full ${
                index < mistakes ? "bg-[var(--danger)]" : "bg-[var(--border)]"
              }`}
            />
          ))}
        </div>
        <span className="sr-only">
          {mistakes} salah dari batas {BADGE_MISTAKE_LIMIT}
        </span>
      </div>
    </div>
  );
}

export function BadgeResult({
  simulationKey,
  mistakes,
  saved,
}: {
  simulationKey: SimulationId;
  mistakes: number;
  saved: boolean | null;
}) {
  const badge = getBadgeByKey(simulationKey);
  const earned = isBadgeEarned(mistakes);

  if (!earned) {
    return (
      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <ShieldX className="mt-0.5 size-5 shrink-0 text-[var(--muted)]" />
        <div>
          <p className="text-sm font-extrabold text-[var(--foreground)]">
            Badge {badge.name} belum rezeki
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
            Kamu salah {mistakes}x, sedangkan batasnya {BADGE_MISTAKE_LIMIT - 1}x. XP kamu tetap
            aman. Ulangi simulasi dari awal untuk ngejar badge-nya.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
        className="mt-5 overflow-hidden rounded-2xl p-5 text-white shadow-sm"
        style={{
            background: `linear-gradient(135deg, ${badge.from}, ${badge.to})`,
        }}
    >
      <div className="flex items-center gap-4">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-4 ring-white/25">
            <BadgeIcon icon={badge.icon} className="size-9" />
        </span>

        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-[0.18em] text-white/80">
            <Award size={13} />
            BADGE DIDAPAT{mistakes === 0 ? " · SEMPURNA ⭐" : ""}
          </p>
          <p className="mt-1 text-xl font-extrabold leading-tight">{badge.name}</p>
          <p className="mt-1 text-xs leading-relaxed text-white/85">{badge.description}</p>
        </div>
      </div>

      <p className="mt-3 flex items-center gap-1.5 border-t border-white/20 pt-3 text-[11px] font-semibold text-white/90">
        {saved === false ? (
          <>
            <LogIn size={13} />
            Login dulu biar badge-nya masuk ke profilmu.
          </>
        ) : saved === true ? (
          <>
            <CheckCircle2 size={13} />
            Sudah masuk ke profilmu dan dipamerkan di Community.
          </>
        ) : (
          <>
            <CheckCircle2 size={13} />
            Cek profilmu untuk melihat badge-nya.
          </>
        )}
      </p>
    </div>
  );
}

export const badgeTutorialStep = (simulationKey: SimulationId): TutorialStep => {
  const badge = getBadgeByKey(simulationKey);

  return {
    id: "badge",
    title: `Badge ${badge.name}`,
    body: `Tamatin semua level buat dapat badge ini. Tapi awas: kalau total salahmu sampai ${BADGE_MISTAKE_LIMIT}x, badge-nya hangus. XP tetap jalan, dan kamu bisa ulangi dari awal.`,
    target: "badge",
  };
};