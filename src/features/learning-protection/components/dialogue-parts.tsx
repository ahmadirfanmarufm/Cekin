"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Crown,
  Flag,
  Lightbulb,
  Lock,
  RotateCcw,
  ShieldCheck,
  Star,
  Trophy,
} from "lucide-react";
import type {
  DialogueEnding,
  ScenarioDifficulty,
  SimulationScenario,
} from "@/types/learning-protection";
import { BadgeResult } from "./badge-parts";
import { getBadgeByKey, isBadgeEarned } from "@/lib/learning-protection/badge";
import type { SimulationId } from "@/types/learning-protection";

export const DIFFICULTY_STYLES: Record<ScenarioDifficulty, string> = {
  Mudah: "bg-[var(--accent-soft)] text-[var(--accent)]",
  Menengah: "bg-[var(--brand-soft)] text-[var(--brand)]",
  Sulit: "bg-[var(--warning)]/15 text-[var(--warning)]",
  Ahli: "bg-[var(--danger)]/10 text-[var(--danger)]",
};

/* ========================================
   PETA LEVEL
======================================== */

export function LevelMap({
  scenarios,
  currentIndex,
  completedIds,
  tutorialName,
}: {
  scenarios: SimulationScenario[];
  currentIndex: number;
  completedIds: string[];
  tutorialName: string;
}) {
  return (
    <div data-tutorial={tutorialName} className="mb-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">
          Peta level
        </p>
        <p className="text-[10px] font-bold text-[var(--muted)]">
          Makin tinggi, makin sulit
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {scenarios.map((scenario, index) => {
          const isCurrent = index === currentIndex;
          const isCompleted = completedIds.includes(scenario.id);
          const isLocked = !isCompleted && !isCurrent;

          return (
            <div
              key={scenario.id}
              title={isLocked ? "Selesaikan level sebelumnya" : scenario.title}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold ${
                isCurrent
                  ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                  : isCompleted
                    ? "border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--card)] text-[var(--muted)] opacity-70"
              }`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-black/5 text-[10px]">
                {isCompleted ? (
                  <Check size={13} />
                ) : isLocked ? (
                  <Lock size={12} />
                ) : (
                  index + 1
                )}
              </span>
              Level {index + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ========================================
   CATATAN TANDA BAHAYA
======================================== */

export function DialogueNotes({ flags }: { flags: string[] }) {
  return (
    <div
      data-tutorial="notes"
      className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
    >
      <div className="flex items-center gap-2">
        <Flag size={15} className="text-[var(--warning)]" />
        <h3 className="text-xs font-extrabold text-[var(--foreground)]">
          Tanda bahaya yang kamu temukan
        </h3>
        <span className="ml-auto rounded-full bg-[var(--warning)]/15 px-2 py-0.5 text-[10px] font-extrabold tabular-nums text-[var(--warning)]">
          {flags.length}
        </span>
      </div>

      {flags.length ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {flags.map((flag) => (
            <li
              key={flag}
              className="rounded-full bg-[var(--warning)]/10 px-3 py-1 text-[11px] font-semibold text-[var(--foreground)]"
            >
              🚩 {flag}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[11px] leading-relaxed text-[var(--muted)]">
          Belum ada. Balas dengan cerdas untuk membuka tanda bahayanya.
        </p>
      )}
    </div>
  );
}

/* ========================================
   KARTU HASIL PERCAKAPAN
======================================== */

export function DialogueResult({
  ending,
  takeaway,
  levelNumber,
  levelXp,
  isLastLevel,
  isSaving,
  onNext,
  onRetry,
}: {
  ending: DialogueEnding;
  takeaway?: string;
  levelNumber: number;
  levelXp: number;
  isLastLevel: boolean;
  isSaving: boolean;
  onNext: () => void;
  onRetry: () => void;
}) {
  const won = ending.result === "win";

  return (
    <div className="mt-5">
      <div
        data-tutorial="result"
        className={`rounded-2xl border p-5 ${
          won
            ? "border-[var(--accent)]/30 bg-[var(--accent-soft)]"
            : "border-[var(--warning)]/40 bg-[var(--warning)]/10"
        }`}
      >
        <div className="flex items-center gap-2">
          {won ? (
            <CheckCircle2 size={20} className="shrink-0 text-[var(--accent)]" />
          ) : (
            <AlertTriangle size={20} className="shrink-0 text-[var(--warning)]" />
          )}

          <h3 className="text-sm font-extrabold text-[var(--foreground)]">
            {won ? `Level ${levelNumber} selesai!` : "Kamu kena jebakan."}
          </h3>

          <span
            className={`ml-auto shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold text-white ${
              won ? "bg-[var(--accent)]" : "bg-[var(--warning)]"
            }`}
          >
            {won ? `+${levelXp} XP` : `XP level ini turun ke ${levelXp}`}
          </span>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">
          {ending.why}
        </p>

        {takeaway && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-[var(--card)]/70 p-3">
            <Lightbulb size={14} className="mt-0.5 shrink-0 text-[var(--brand)]" />
            <p className="text-xs leading-relaxed text-[var(--foreground)]">
              <span className="font-extrabold">Aturan emas: </span>
              {takeaway}
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        data-tutorial="next"
        onClick={won ? onNext : onRetry}
        disabled={isSaving}
        className={`button mt-4 w-full disabled:cursor-not-allowed disabled:opacity-60 ${
          won ? "button-primary" : "button-secondary"
        }`}
      >
        {isSaving ? (
          "Menyimpan progres..."
        ) : !won ? (
          <>
            <RotateCcw size={16} />
            Coba lagi dari awal
          </>
        ) : isLastLevel ? (
          <>
            <Trophy size={16} />
            Klaim hasil dan reward
          </>
        ) : (
          <>
            Lanjut ke Level {levelNumber + 1}
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </div>
  );
}

/* ========================================
   LAYAR REWARD LEVEL MAKSIMAL
======================================== */

const CONFETTI = [
  { left: "6%", top: "12%", size: 10, color: "bg-yellow-300", delay: "0s" },
  { left: "16%", top: "62%", size: 8, color: "bg-emerald-300", delay: "0.3s" },
  { left: "24%", top: "20%", size: 12, color: "bg-sky-300", delay: "0.6s" },
  { left: "34%", top: "78%", size: 9, color: "bg-pink-300", delay: "0.2s" },
  { left: "44%", top: "8%", size: 8, color: "bg-white/80", delay: "0.9s" },
  { left: "56%", top: "70%", size: 11, color: "bg-yellow-300", delay: "0.5s" },
  { left: "64%", top: "16%", size: 9, color: "bg-emerald-300", delay: "0.1s" },
  { left: "74%", top: "58%", size: 12, color: "bg-sky-300", delay: "0.8s" },
  { left: "84%", top: "22%", size: 8, color: "bg-pink-300", delay: "0.4s" },
  { left: "92%", top: "72%", size: 10, color: "bg-white/80", delay: "0.7s" },
  { left: "10%", top: "40%", size: 7, color: "bg-sky-300", delay: "1s" },
  { left: "88%", top: "46%", size: 7, color: "bg-yellow-300", delay: "0.15s" },
];

export function MasterReward({
  badgeKey,
  badgeSaved = null,
  intro,
  totalCount,
  completedCount,
  cleanCount,
  xp,
  maxXp,
  totalMistakes,
  principle,
  tips,
  rewardMessage,
  onRestart,
}: {
  badgeKey: SimulationId;
  badgeSaved?: boolean | null;
  intro: string;
  totalCount: number;
  completedCount: number;
  /** Jumlah level yang selesai tanpa satu pun kekeliruan. */
  cleanCount: number;
  xp: { total: number; levelXp: number; bonus: number };
  maxXp: number;
  totalMistakes: number;
  principle: string;
  tips: string[];
  rewardMessage: string;
  onRestart: () => void;
}) {
  const badge = getBadgeByKey(badgeKey);
  const earned = isBadgeEarned(totalMistakes);
  const isPerfect = totalMistakes === 0;

  return (
    <main className="container py-10 md:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--card)] shadow-sm">
          <div className="relative overflow-hidden bg-[var(--brand-dark)] px-6 py-12 text-center text-white md:px-10">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

            {CONFETTI.map((piece, index) => (
              <span
                key={index}
                aria-hidden="true"
                className={`absolute animate-bounce rounded-full motion-reduce:animate-none ${piece.color}`}
                style={{
                  left: piece.left,
                  top: piece.top,
                  width: piece.size,
                  height: piece.size,
                  animationDelay: piece.delay,
                  animationDuration: "1.8s",
                }}
              />
            ))}

            <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-[28px] bg-white/15 ring-4 ring-white/20">
              <Crown className="h-12 w-12 text-yellow-300" />
            </div>

            <p className="relative text-xs font-bold tracking-[0.2em] text-yellow-200">
              LEVEL MAKSIMAL TERCAPAI
            </p>

            <h1 className="relative mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
              {earned
                ? isPerfect
                  ? `Sempurna! ${badge.name}`
                  : `Mantap, ${badge.name}!`
                : "Tamat! Badge-nya Belum Rezeki"}
            </h1>

            <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/80">
              {intro}
            </p>

            {earned && (
              <div className="relative mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-yellow-300 px-4 py-2 text-xs font-extrabold text-[var(--brand-dark)]">
                <Trophy size={14} />
                Badge {badge.name}
                {isPerfect && <Star size={14} className="fill-current" />}
              </div>
            )}
          </div>

          <div className="p-6 md:p-9">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-[var(--surface)] p-5 text-center">
                <p className="text-3xl font-extrabold text-[var(--brand)]">
                  {completedCount}/{totalCount}
                </p>
                <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                  Level selesai
                </p>
              </div>

              <BadgeResult
                simulationKey={badgeKey}
                mistakes={totalMistakes}
                saved={badgeSaved}
              />

              <div className="rounded-2xl bg-[var(--surface)] p-5 text-center">
                <p className="text-3xl font-extrabold text-[var(--accent)]">
                  {cleanCount}/{totalCount}
                </p>
                <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                  Tanpa satu pun salah
                </p>
              </div>

              <div className="rounded-2xl bg-[var(--surface)] p-5 text-center">
                <p className="text-3xl font-extrabold text-[var(--foreground)]">
                  {xp.total}
                  <span className="text-base font-bold text-[var(--muted)]">
                    /{maxXp}
                  </span>
                </p>
                <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                  Total XP
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[var(--border)] p-5">
              <h2 className="text-sm font-extrabold text-[var(--foreground)]">
                Rincian reward
              </h2>

              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex items-center justify-between text-[var(--muted)]">
                  <span>XP dari {totalCount} level</span>
                  <span className="font-bold text-[var(--foreground)]">
                    +{xp.levelXp} XP
                  </span>
                </li>
                <li className="flex items-center justify-between text-[var(--muted)]">
                  <span className="flex items-center gap-2">
                    <Crown size={14} className="text-[var(--warning)]" />
                    Bonus tamat
                  </span>
                  <span className="font-bold text-[var(--accent)]">
                    +{xp.bonus} XP
                  </span>
                </li>
              </ul>

              <p className="mt-3 border-t border-[var(--border)] pt-3 text-xs leading-relaxed text-[var(--muted)]">
                {isPerfect
                  ? "Tanpa satu pun langkah keliru. Luar biasa!"
                  : `Kamu sempat ${totalMistakes} kali melangkah keliru. Ulangi simulasi tanpa salah untuk meraih XP maksimal (${maxXp} XP).`}
              </p>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[var(--border)] p-5">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
              <p className="text-sm leading-relaxed text-[var(--muted)]">
                {principle}
              </p>
            </div>

            <div className="mt-4 rounded-2xl bg-[var(--brand-soft)] p-5">
              <div className="flex items-center gap-2 text-[var(--brand)]">
                <Lightbulb size={17} />
                <h3 className="text-sm font-extrabold">Ingat selalu</h3>
              </div>

              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-[var(--brand-dark)]">
                {tips.map((tip) => (
                  <li key={tip} className="flex gap-2">
                    <Check size={14} className="mt-0.5 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {rewardMessage && (
              <p className="mt-4 text-center text-xs leading-relaxed text-[var(--muted)]">
                {rewardMessage}
              </p>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onRestart}
                className="button button-secondary flex-1"
              >
                <RotateCcw size={16} />
                Ulangi simulasi
              </button>

              <Link
                href="/learning-protection"
                className="button button-primary flex-1"
              >
                Selesai
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}