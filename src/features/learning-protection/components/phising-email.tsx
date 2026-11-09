"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleStar,
  Clock3,
  Crown,
  Eye,
  HelpCircle,
  Inbox,
  Lightbulb,
  Lock,
  Mail,
  Paperclip,
  Reply,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Trophy,
  X,
  XCircle,
} from "lucide-react";

import type {
  ScenarioDifficulty,
  SimulationChoice,
  SimulationConfig,
} from "@/types/learning-protection";
import { seededShuffle } from "@/lib/learning-protection/shuffle";
import {
  PHISHING_MASTER_BONUS,
  PHISHING_MAX_XP,
  calculatePhishingXp,
  phishingLevelXp,
} from "@/lib/learning-protection/xp";
import { PhishingTutorial, PHISHING_TUTORIAL_KEY } from "./phishing-tutorial";
import { useLearningProgress } from "@/lib/learning-protection/use-learning-progress";
import { useLoginGate } from "@/lib/learning-protection/use-login-gate";
import { LoginGate } from "./login-gate";
import { BadgeTracker, BadgeResult } from "./badge-parts";
import { BADGE_MISTAKE_LIMIT, getBadgeByKey, isBadgeEarned } from "@/lib/learning-protection/badge";

type Props = {
  simulation: SimulationConfig;
};

const SIMULATION_ID = "phishing-attack";

const HIDE_ADDRESS_FROM_INDEX = 6;

const AVATAR_COLORS = [
  "bg-red-100 text-red-700",
  "bg-amber-100 text-amber-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
];

const DIFFICULTY_STYLES: Record<ScenarioDifficulty, string> = {
  Mudah: "bg-[var(--accent-soft)] text-[var(--accent)]",
  Menengah: "bg-[var(--brand-soft)] text-[var(--brand)]",
  Sulit: "bg-[var(--warning)]/15 text-[var(--warning)]",
  Ahli: "bg-[var(--danger)]/10 text-[var(--danger)]",
};

const CONFETTI = [
  { left: "8%", top: "14%", size: 10, color: "bg-yellow-300", delay: "0s" },
  { left: "20%", top: "64%", size: 8, color: "bg-emerald-300", delay: "0.3s" },
  { left: "32%", top: "18%", size: 12, color: "bg-sky-300", delay: "0.6s" },
  { left: "46%", top: "76%", size: 9, color: "bg-pink-300", delay: "0.2s" },
  { left: "60%", top: "10%", size: 8, color: "bg-white/80", delay: "0.9s" },
  { left: "72%", top: "66%", size: 11, color: "bg-yellow-300", delay: "0.5s" },
  { left: "84%", top: "20%", size: 9, color: "bg-emerald-300", delay: "0.1s" },
  { left: "92%", top: "58%", size: 10, color: "bg-sky-300", delay: "0.8s" },
];

export function PhishingEmail({ simulation }: Props) {
  const scenarios = useMemo(
    () => simulation.scenarios.filter((scenario) => scenario.emailDetails),
    [simulation.scenarios],
  );
  const totalCount = scenarios.length;

  console.log("[PHISHING DEBUG]", {
    simulationId: simulation.id,
    totalScenarios: simulation.scenarios.length,
    scenariosWithEmailDetails: scenarios.length,
    firstScenario: simulation.scenarios[0],
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<SimulationChoice | null>(null);
  const [attempts, setAttempts] = useState<Record<string, string[]>>({});
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [safeIds, setSafeIds] = useState<string[]>([]);
  const [runSeed, setRunSeed] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [showLearningModal, setShowLearningModal] = useState(false);
  const [finished, setFinished] = useState(false);
  const [rewardMessage, setRewardMessage] = useState("");
  const [badgeSaved, setBadgeSaved] = useState<boolean | null>(null);
  const [isSavingReward, setIsSavingReward] = useState(false);
  const [declinedLogin, setDeclinedLogin] = useState(false);

  const emailDetailRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLElement>(null);

  const currentScenario = scenarios[currentIndex];
  const email = currentScenario?.emailDetails;

  const attemptNumber = currentScenario ? (attempts[currentScenario.id]?.length ?? 0) : 0;

  const displayChoices = useMemo(
    () =>
      currentScenario
        ? seededShuffle(
            currentScenario.choices,
            `${currentScenario.id}:${attemptNumber}:${runSeed}`,
          )
        : [],
    [currentScenario, attemptNumber, runSeed],
  );

  const wrongCountOf = (scenarioId: string) => {
    const scenario = scenarios.find((item) => item.id === scenarioId);
    if (!scenario) return 0;

    return (attempts[scenarioId] ?? []).filter(
      (choiceId) => !scenario.choices.find((choice) => choice.id === choiceId)?.isSafe,
    ).length;
  };

  const levelXpList = scenarios.map((scenario, index) =>
    phishingLevelXp(index + 1, wrongCountOf(scenario.id)),
  );

  const runMistakes = scenarios.reduce((sum, s) => sum + wrongCountOf(s.id), 0);

  const earnedLevelXp = scenarios.reduce(
    (sum, scenario, index) =>
      completedIds.includes(scenario.id) ? sum + levelXpList[index] : sum,
    0,
  );

  const potentialXp = levelXpList.reduce((sum, xp) => sum + xp, 0) + PHISHING_MASTER_BONUS;
  const currentLevelXp = levelXpList[currentIndex] ?? 0;
  const progress = totalCount ? (completedIds.length / totalCount) * 100 : 0;

  /* ---------- Efek ---------- */

  useEffect(() => {
    if (currentIndex === 0 || finished) return;

    const frameId = window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      emailDetailRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [currentIndex, finished]);

  useEffect(() => {
    if (!finished) return;

    const frameId = window.requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [finished]);

  useEffect(() => {
    if (!showLearningModal) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowLearningModal(false);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLearningModal]);

  /* ---------- Tutorial ---------- */

  const [tutorialActive, setTutorialActive] = useState(false);
  const tutorialSnapshot = useRef<{
    currentIndex: number;
    completedIds: string[];
    safeIds: string[];
    attempts: Record<string, string[]>;
  } | null>(null);
  const tutorialStorageKey = useRef(`${PHISHING_TUTORIAL_KEY}:guest`);

  const startTutorial = () => {
    tutorialSnapshot.current = { currentIndex, completedIds, safeIds, attempts };
    setCurrentIndex(0);
    setCompletedIds([]);
    setSafeIds([]);
    setAttempts({});
    setSelectedChoice(null);
    setShowDetails(false);
    setShowLearningModal(false);
    setTutorialActive(true);
  };

  const closeTutorial = (completed: boolean) => {
    const snapshot = tutorialSnapshot.current;
    if (snapshot) {
      setCurrentIndex(snapshot.currentIndex);
      setCompletedIds(snapshot.completedIds);
      setSafeIds(snapshot.safeIds);
      setAttempts(snapshot.attempts);
    }
    setSelectedChoice(null);
    setShowDetails(false);
    setShowLearningModal(false);
    setTutorialActive(false);
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      localStorage.setItem(tutorialStorageKey.current, completed ? "done" : "skipped");
    } catch {}
  };

  const latest = useRef({ start: startTutorial, canAutoStart: true });
  latest.current = {
    start: startTutorial,
    canAutoStart:
      !tutorialActive &&
      completedIds.length === 0 &&
      !selectedChoice &&
      Object.keys(attempts).length === 0,
  };

  // Otomatis hanya untuk yang belum pernah melihatnya dan belum menamatkan simulasi ini.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const decide = async () => {
      let userId = "guest";
      let completed = false;

      try {
        const response = await fetch(
          `/api/learning-protection/progress?simulationId=${SIMULATION_ID}`,
          { credentials: "same-origin", cache: "no-store" },
        );

        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.userId) userId = data.userId;
          completed = Boolean(data.completed);
        }
      } catch {
        // Gagal cek status: anggap tamu yang belum menyelesaikan.
      }

      if (cancelled) return;

      tutorialStorageKey.current = `${PHISHING_TUTORIAL_KEY}:${userId}`;

      if (completed) return;

      try {
        if (localStorage.getItem(tutorialStorageKey.current)) return;
      } catch {}

      timer = setTimeout(() => {
        if (!cancelled && latest.current.canAutoStart) latest.current.start();
      }, 600);
    };

    void decide();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  /* ---------- Kondisi kosong ---------- */

  if (!currentScenario || !email || totalCount === 0) {
    return (
      <main className="container py-16 text-center">
        <Mail className="mx-auto mb-4 h-10 w-10 text-[var(--muted)]" />
        <h1 className="heading heading-2">Skenario belum tersedia</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Konten Phishing sedang disiapkan.
        </p>
        <Link href="/learning-protection" className="button button-primary mt-6">
          Kembali ke Learning &amp; Protection
        </Link>
      </main>
    );
  }

  /* ---------- Aksi ---------- */

  const saveSimulationCompletion = async () => {
    try {
      const response = await fetch("/api/learning-protection/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ simulationId: SIMULATION_ID, answers: attempts }),
      });

      if (response.status === 401) {
        setBadgeSaved(false);
        setRewardMessage("Level maksimal tercapai! Login untuk menyimpan progres, XP, dan lencana ke akunmu.");
        return;
      }

      if (!response.ok) {
        setRewardMessage("Level maksimal tercapai, tetapi progres belum berhasil disimpan. Kamu tetap bisa melihat hasilmu.",);
        return;
      }

      const result = await response.json();
      setBadgeSaved(Boolean(result.badge?.owned));
      const scoreXp: number = result.scoreXp ?? 0;
      const maxXp: number = result.maxXp ?? PHISHING_MAX_XP;

      if (result.xpEarned > 0) {
        setRewardMessage(
          scoreXp >= maxXp
            ? `Sempurna! Kamu mendapatkan ${result.xpEarned} XP dari Phishing.`
            : `Kamu mendapatkan ${result.xpEarned} XP (skor ${scoreXp}/${maxXp}). Ulangi tanpa salah untuk XP maksimal.`,
        );
      } else if ((result.bestXp ?? 0) >= maxXp) {
        setRewardMessage("Kamu sudah meraih XP maksimal di Phishing.");
      } else {
        setRewardMessage(
          `Skor ${scoreXp} XP belum melebihi hasil terbaikmu (${result.bestXp} XP). Ulangi dan jawab lebih teliti untuk menambah XP.`,
        );
      }

      window.dispatchEvent(new Event("cekin-auth-change"));
    } catch {
      setRewardMessage(
        "Level maksimal tercapai, tetapi koneksi gagal menyimpan progres. Coba lagi nanti.",
      );
    }
  };

  const handleChoice = (choice: SimulationChoice) => {
    if (selectedChoice) return;

    const scenarioId = currentScenario.id;
    const isFirstTry = (attempts[scenarioId] ?? []).length === 0;

    setSelectedChoice(choice);
    setAttempts((previous) => ({
      ...previous,
      [scenarioId]: [...(previous[scenarioId] ?? []), choice.id],
    }));

    if (choice.isSafe) {
      setCompletedIds((previous) =>
        previous.includes(scenarioId) ? previous : [...previous, scenarioId],
      );

      if (isFirstTry) {
        setSafeIds((previous) =>
          previous.includes(scenarioId) ? previous : [...previous, scenarioId],
        );
      }
    }
  };

  const scrollToEmail = () => {
    requestAnimationFrame(() => {
      emailDetailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleNext = async () => {
    if (!selectedChoice || isSavingReward) return;

    setShowLearningModal(false);

    if (!selectedChoice.isSafe) {
      setSelectedChoice(null);
      scrollToEmail();
      return;
    }

    if (currentIndex < totalCount - 1) {
      if (gate.request()) return;
      goNextLevel();
      return;
    }

    if (tutorialActive) {
      setSelectedChoice(null);
      return;
    }

    setIsSavingReward(true);

    try {
      await saveSimulationCompletion();
      setFinished(true);
    } finally {
      setIsSavingReward(false);
    }
  };

  const learning = useLearningProgress({
    simulationId: SIMULATION_ID,
    scenarioIds: scenarios.map((scenario) => scenario.id),
    attemptsShape: "choices",
    paused: tutorialActive,
    snapshot: { currentIndex, completedIds, safeIds, attempts, runSeed, finished, rewardMessage, declinedLogin },
    onRestore: (saved) => {
      setCurrentIndex(saved.currentIndex);
      setCompletedIds(saved.completedIds);
      setSafeIds(saved.safeIds ?? []);
      setAttempts(saved.attempts as Record<string, string[]>);
      setRunSeed(saved.runSeed);
      setFinished(Boolean(saved.finished));
      setRewardMessage(saved.rewardMessage ?? "");
      setDeclinedLogin(Boolean(saved.declinedLogin));
      setSelectedChoice(null);
      setShowDetails(false);
    },
  });

  function goNextLevel() {
    setCurrentIndex((previous) => previous + 1);
    setSelectedChoice(null);
    setShowDetails(false);
  }

  const gate = useLoginGate({
    session: learning.session,
    declinedLogin,
    setDeclinedLogin,
    tutorialActive,
    currentIndex,
    onAdvance: goNextLevel,
  });

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedChoice(null);
    setAttempts({});
    setCompletedIds([]);
    setSafeIds([]);
    setRunSeed((previous) => previous + 1);
    setShowDetails(false);
    setShowLearningModal(false);
    setFinished(false);
    setRewardMessage("");
    setBadgeSaved(null);
    setIsSavingReward(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ========================================
     LAYAR REWARD: LEVEL MAKSIMAL
  ======================================== */

  if (finished) {
    const wrongCounts = scenarios.map((scenario) => wrongCountOf(scenario.id));
    const finalXp = calculatePhishingXp(wrongCounts);
    const totalWrong = wrongCounts.reduce((sum, wrong) => sum + wrong, 0);
    const badge = getBadgeByKey("phishing");
    const earned = isBadgeEarned(totalWrong);
    const isPerfect = totalWrong === 0;

    return (
      <main ref={resultRef} className="container py-10 md:py-16">
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
                Kamu menamatkan seluruh {totalCount} level, dari ancaman blokir akun sampai
                persetujuan izin aplikasi yang tampak sah.
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
                    {completedIds.length}/{totalCount}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[var(--muted)]">Level selesai</p>
                </div>

                <div className="rounded-2xl bg-[var(--surface)] p-5 text-center">
                  <p className="text-3xl font-extrabold text-[var(--accent)]">
                    {safeIds.length}/{totalCount}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                    Benar di percobaan pertama
                  </p>
                </div>

                <div className="rounded-2xl bg-[var(--surface)] p-5 text-center">
                  <p className="text-3xl font-extrabold text-[var(--foreground)]">
                    {finalXp.total}
                    <span className="text-base font-bold text-[var(--muted)]">/{PHISHING_MAX_XP}</span>
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[var(--muted)]">Total XP</p>
                </div>
              </div>

              <BadgeResult
                simulationKey="apps"
                mistakes={totalWrong}
                saved={badgeSaved}
              />

              <div className="mt-5 rounded-2xl border border-[var(--border)] p-5">
                <h2 className="text-sm font-extrabold text-[var(--foreground)]">Rincian reward</h2>

                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex items-center justify-between text-[var(--muted)]">
                    <span>XP dari {totalCount} level</span>
                    <span className="font-bold text-[var(--foreground)]">+{finalXp.levelXp} XP</span>
                  </li>
                  <li className="flex items-center justify-between text-[var(--muted)]">
                    <span className="flex items-center gap-2">
                      <Crown size={14} className="text-[var(--warning)]" />
                      Bonus Pemburu Phishing
                    </span>
                    <span className="font-bold text-[var(--accent)]">+{finalXp.bonus} XP</span>
                  </li>
                </ul>

                <p className="mt-3 border-t border-[var(--border)] pt-3 text-xs leading-relaxed text-[var(--muted)]">
                  {isPerfect
                    ? "Tanpa satu pun keputusan kurang aman. Luar biasa!"
                    : `Kamu sempat ${totalWrong} kali memilih keputusan kurang aman. Ulangi tanpa salah untuk XP maksimal (${PHISHING_MAX_XP} XP).`}
                </p>
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[var(--border)] p-5">
                <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]" />
                <div>
                  <h2 className="text-sm font-bold text-[var(--foreground)]">Prinsip utama Phishing</h2>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                    Nama, logo, bahkan hasil “lolos” pemeriksaan teknis tidak membuktikan sebuah email
                    asli. Jangan memberi kata sandi, kode, uang, atau izin akses lewat tautan di email.
                    Verifikasi lewat kanal resmi yang kamu buka sendiri.
                  </p>
                </div>
              </div>

              {rewardMessage && (
                <p role="status" className="mt-4 text-center text-xs leading-relaxed text-[var(--muted)]">
                  {rewardMessage}
                </p>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={handleRestart} className="button button-secondary flex-1">
                  <RotateCcw size={16} />
                  Ulangi simulasi
                </button>

                <Link href="/learning-protection" className="button button-primary flex-1">
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

  /* ========================================
     TAMPILAN UTAMA
  ======================================== */

  const isUnsafe = !!selectedChoice && !selectedChoice.isSafe;
  const isLastLevel = currentIndex >= totalCount - 1;
  const hideAddress = currentIndex >= HIDE_ADDRESS_FROM_INDEX && !showDetails;
  const showVerdict = currentIndex < 3 || !!selectedChoice;
  const avatarColor = AVATAR_COLORS[currentIndex % AVATAR_COLORS.length];

  return (
    <main className="container py-8 pb-16 md:py-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/learning-protection"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--brand)]"
        >
          <ArrowLeft size={16} />
          Learning &amp; Protection
        </Link>

        {/* Header */}
        <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="badge">
              <Mail size={14} />
              PHISHING
            </div>

            <h1 className="heading heading-2 mt-4">
              Jangan biarin orang lain ambil datamu
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
              <span className="inline-flex items-center gap-1">
                <Clock3 size={13} />
                {simulation.duration}
              </span>
              <span className="rounded-full border border-[var(--border)] px-3 py-1">
                Simulasi fiktif
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={startTutorial}
              className="button button-secondary"
            >
              <HelpCircle size={16} />
              Tutorial
            </button>

            <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1">
              <div className="flex w-8 items-center justify-center rounded-xl text-[var(--warning)]">
                <CircleStar size={21} />
              </div>

              <div className="flex justify-center items-center">
                <p className="text-xl m-2 font-extrabold leading-none text-[var(--foreground)]">
                  {earnedLevelXp}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  XP terkumpul
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div
          data-tutorial="progress"
          className="mb-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-[var(--foreground)]">Perjalanan pemeriksaan</span>
            <div className="flex items-center gap-3 text-xs font-semibold tabular-nums text-[var(--muted)]">
              <span>
                {completedIds.length} dari {totalCount} level selesai
              </span>
              <span className="rounded-md bg-[var(--accent-soft)] px-2.5 py-1 font-extrabold text-[var(--accent)]">
                Potensi XP {potentialXp}/{PHISHING_MAX_XP}
              </span>
            </div>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-[var(--surface)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {learning.resumed && (
            <p className="mt-3 text-[11px] font-semibold text-[var(--accent)]">Progres sebelumnya dilanjutkan.</p>
          )}
          {learning.session.ready && !learning.session.authenticated && (
            <p className="mt-2 text-[11px] font-semibold text-[var(--muted)]">
              {declinedLogin ? "Mode tamu: XP tidak akan dihitung." : "Mode tamu: login untuk menyimpan progres dan XP."}
            </p>
          )}
        </div>

        <BadgeTracker simulationKey="phishing" mistakes={runMistakes} />

        {/* Peta level */}
        <div data-tutorial="levels" className="mb-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">
              Peta level
            </p>
            <p className="text-[10px] font-bold text-[var(--muted)]">Makin tinggi, makin sulit</p>
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
                    {isCompleted ? <Check size={13} /> : isLocked ? <Lock size={12} /> : index + 1}
                  </span>
                  Level {index + 1}
                </div>
              );
            })}
          </div>
        </div>

        {/* Aplikasi email */}
        <div className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--card)] shadow-sm">
          <div className="flex min-h-[68px] items-center gap-3 border-b border-[var(--border)] px-4 sm:px-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
              <Mail size={21} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-bold tracking-tight text-[var(--foreground)]">CEKIN MAIL</p>
              <p className="text-[10px] font-medium text-[var(--muted)]">Email security simulation</p>
            </div>

            <div className="hidden h-10 max-w-md flex-1 items-center gap-3 rounded-full bg-[var(--surface)] px-4 text-[var(--muted)] sm:flex">
              <Search size={17} />
              <span className="text-xs">Cari email</span>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-soft)] text-sm font-extrabold text-[var(--brand)]">
              C
            </div>
          </div>

          <div className="grid min-h-[620px] md:grid-cols-[190px_minmax(0,1fr)]">
            {/* Sidebar */}
            <aside className="hidden border-r border-[var(--border)] bg-[var(--card)] p-3 md:block">
              <nav className="space-y-1 text-xs">
                <div className="flex items-center gap-3 rounded-r-full bg-[var(--brand-soft)] px-4 py-2.5 font-bold text-[var(--brand)]">
                  <Inbox size={17} />
                  Kotak masuk
                  <span className="ml-auto">1</span>
                </div>
                {[
                  { label: "Berbintang", icon: Star },
                  { label: "Terkirim", icon: Send },
                  { label: "Spam", icon: AlertTriangle },
                  { label: "Sampah", icon: Trash2 },
                ].map(({ label, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3 rounded-r-full px-4 py-2.5 text-[var(--muted)]">
                    <Icon size={17} />
                    {label}
                  </div>
                ))}
              </nav>

              <div className="mt-8 rounded-2xl bg-[var(--brand-dark)] p-4 text-white">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <ShieldCheck size={15} />
                  CEKIN Security
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-white/75">
                  Jangan terburu-buru membuka tautan. Periksa keaslian email terlebih dahulu.
                </p>
              </div>
            </aside>

            {/* Isi email */}
            <section className="min-w-0 bg-[var(--card)]">
              <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4 sm:px-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-extrabold tracking-[0.16em] text-[var(--brand)]">
                    LEVEL {currentIndex + 1} DARI {totalCount}
                  </span>
                  {currentScenario.difficulty && (
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${DIFFICULTY_STYLES[currentScenario.difficulty]}`}
                    >
                      {currentScenario.difficulty}
                    </span>
                  )}
                </div>

                {currentScenario.topic && (
                  <span className="hidden rounded-full bg-[var(--brand-soft)] px-3 py-1 text-[10px] font-bold text-[var(--brand)] sm:inline">
                    {currentScenario.topic}
                  </span>
                )}
              </div>

              <div ref={emailDetailRef} className="scroll-mt-24 px-4 py-6 sm:px-7 sm:py-8">
                <div data-tutorial="email">
                  <div className="mb-6 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-extrabold leading-snug text-[var(--foreground)] sm:text-2xl">
                          {email.subject}
                        </h2>
                        <span className="rounded-full bg-[var(--surface)] px-2.5 py-1 text-[10px] font-semibold text-[var(--muted)]">
                          Kotak masuk
                        </span>
                      </div>
                      <p className="mt-2 text-[11px] text-[var(--muted)]">{currentScenario.description}</p>
                    </div>
                  </div>

                  {/* Pengirim */}
                  <div data-tutorial="sender" className="mb-7 flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${avatarColor}`}
                    >
                      {email.senderName.slice(0, 1)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="text-sm font-bold text-[var(--foreground)]">{email.senderName}</p>
                        {hideAddress ? (
                          <p className="text-xs italic text-[var(--muted)]">alamat disembunyikan</p>
                        ) : (
                          <p className="break-all text-xs text-[var(--muted)]">&lt;{email.senderEmail}&gt;</p>
                        )}
                      </div>

                      <div className="mt-1 flex items-center gap-1 text-[11px] text-[var(--muted)]">
                        kepada saya
                        <ChevronDown size={13} />
                      </div>
                    </div>

                    <span className="hidden text-[11px] text-[var(--muted)] sm:block">09:41</span>
                  </div>

                  {/* Badan email */}
                  <div className="max-w-3xl space-y-4 text-sm leading-7 text-[var(--foreground)]">
                    {email.body.map((paragraph) => (
                      <p key={paragraph} className="whitespace-pre-line break-words">
                        {paragraph}
                      </p>
                    ))}

                    {email.links?.map((link) => (
                      <div key={link.text}>
                        <span className="inline-flex items-center rounded-lg bg-[var(--brand)] px-4 py-2 text-xs font-bold text-white">
                          {link.text}
                        </span>
                      </div>
                    ))}

                    {email.attachments?.map((file) => (
                      <div
                        key={file.name}
                        className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs"
                      >
                        <Paperclip size={14} className="text-[var(--muted)]" />
                        <span className="font-semibold text-[var(--foreground)]">{file.name}</span>
                        <span className="text-[var(--muted)]">{file.size}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Periksa detail teknis */}
                <div className="mt-6">
                  <button
                    type="button"
                    data-tutorial="inspect"
                    onClick={() => setShowDetails((open) => !open)}
                    aria-expanded={showDetails}
                    className="inline-flex items-center gap-2 rounded-xl border border-[var(--brand)]/25 bg-[var(--brand-soft)] px-4 py-2.5 text-xs font-bold text-[var(--brand)] transition hover:border-[var(--brand)]"
                  >
                    <Search size={15} />
                    {showDetails ? "Tutup detail teknis" : "Periksa detail teknis"}
                  </button>

                  {showDetails && (
                    <div
                      data-tutorial="details"
                      className="mt-3 max-w-3xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
                    >
                      <p className="text-[10px] font-extrabold tracking-wider text-[var(--muted)]">
                        DETAIL TEKNIS EMAIL
                      </p>

                      <ul className="mt-3 space-y-3">
                        <li className="text-xs leading-5">
                          <span className="font-bold text-[var(--foreground)]">Alamat pengirim sebenarnya: </span>
                          <span className="break-all text-[var(--muted)]">{email.senderEmail}</span>
                        </li>

                        {email.replyTo && (
                          <li className="text-xs leading-5">
                            <span className="font-bold text-[var(--foreground)]">Balasan dikirim ke (Reply-To): </span>
                            <span className="break-all text-[var(--muted)]">{email.replyTo}</span>
                          </li>
                        )}

                        {email.links?.map((link) => (
                          <li key={link.url} className="text-xs leading-5">
                            <span className="font-bold text-[var(--foreground)]">Tombol “{link.text}” menuju: </span>
                            <span className="break-all text-[var(--muted)]">{link.url}</span>
                          </li>
                        ))}

                        {email.checks.map((check) => (
                          <li key={check.label} className="flex items-start gap-2 text-xs leading-5">
                            {showVerdict ? (
                              check.suspicious
                                ? <AlertTriangle size={15} className="mt-0.5 shrink-0 text-[var(--warning)]" />
                                : <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                            ) : (
                              <Search size={15} className="mt-0.5 shrink-0 text-[var(--muted)]" />
                            )}

                            {showVerdict && (
                              <span className={`ml-2 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                check.suspicious ? "bg-[var(--warning)]/10 text-[#9a6700]" : "bg-[var(--accent-soft)] text-[var(--accent)]"
                              }`}>
                                {check.suspicious ? "Periksa" : "Wajar"}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap gap-2 border-t border-[var(--border)] pt-5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-[11px] font-semibold text-[var(--muted)]">
                    <Reply size={14} />
                    Balas
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-[11px] font-semibold text-[var(--muted)]">
                    <Send size={14} />
                    Teruskan
                  </div>
                </div>
              </div>

              {/* Keputusan */}
              <div className="border-t border-[var(--border)] bg-[var(--surface)] p-4 sm:p-7">
                <div className="mx-auto max-w-3xl">
                  {!selectedChoice ? (
                    <>
                      <div className="mb-4">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={19} className="text-[var(--brand)]" />
                          <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                            Apa yang akan kamu lakukan?
                          </h3>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                          Pilih tindakan yang paling tepat setelah memeriksa email tersebut.
                        </p>
                      </div>

                      <div data-tutorial="choices" className="grid gap-3 sm:grid-cols-2">
                        {displayChoices.map((choice, index) => (
                          <button
                            key={choice.id}
                            type="button"
                            onClick={() => handleChoice(choice)}
                            className="group flex min-h-[78px] items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-left transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-xs font-extrabold text-[var(--brand)]">
                              {String.fromCharCode(65 + index)}
                            </span>

                            <span className="min-w-0 flex-1 text-xs font-semibold leading-relaxed text-[var(--foreground)]">
                              {choice.label}
                            </span>

                            <ArrowRight
                              size={15}
                              className="shrink-0 text-[var(--muted)] transition group-hover:translate-x-1 group-hover:text-[var(--brand)]"
                            />
                          </button>
                        ))}
                      </div>

                      <div className="mt-5 flex items-start gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
                        <Lightbulb size={16} className="mt-0.5 shrink-0 text-[var(--warning)]" />
                        <p className="text-[11px] leading-relaxed text-[var(--muted)]">
                          Tips: perhatikan alamat pengirim, tujuan tautan, lampiran, permintaan data atau uang,
                          dan pesan yang membuatmu merasa harus segera bertindak.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div
                        data-tutorial="feedback"
                        className={`rounded-2xl border p-5 ${
                          selectedChoice.isSafe
                            ? "border-[var(--accent)]/30 bg-[var(--accent-soft)]"
                            : "border-[var(--warning)]/40 bg-[var(--warning)]/10"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {selectedChoice.isSafe ? (
                            <CheckCircle2 size={21} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                          ) : (
                            <XCircle size={21} className="mt-0.5 shrink-0 text-[var(--warning)]" />
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                                {selectedChoice.isSafe
                                  ? `Level ${currentIndex + 1} selesai!`
                                  : "Ada risiko yang perlu kamu pahami."}
                              </h3>

                              <span
                                className={`ml-auto shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold text-white ${
                                  selectedChoice.isSafe ? "bg-[var(--accent)]" : "bg-[var(--warning)]"
                                }`}
                              >
                                {selectedChoice.isSafe
                                  ? `+${currentLevelXp} XP`
                                  : `XP level ini turun ke ${currentLevelXp}`}
                              </span>
                            </div>

                            <p className="mt-2 text-xs leading-relaxed text-[var(--foreground)]">
                              {selectedChoice.feedback}
                            </p>

                            {isUnsafe && (
                              <p className="mt-3 text-xs font-bold leading-relaxed text-[var(--warning)]">
                                Level ini belum selesai. Pelajari alasannya, lalu coba lagi dengan pilihan
                                yang lebih aman.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        data-tutorial="learn-more"
                        onClick={() => setShowLearningModal(true)}
                        className="flex w-full items-center gap-3 rounded-2xl border border-[var(--brand)]/25 bg-[var(--brand-soft)] p-4 text-left transition hover:border-[var(--brand)]"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--brand)]">
                          <Lightbulb size={20} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-extrabold text-[var(--brand)]">
                            Pelajari alasan dan tindakan aman
                          </p>
                          <p className="mt-1 text-[11px] leading-relaxed text-[var(--brand-dark)]">
                            Pahami tanda bahayanya dan apa yang sebaiknya dilakukan dalam situasi nyata.
                          </p>
                        </div>

                        <ArrowRight size={17} className="shrink-0 text-[var(--brand)]" />
                      </button>

                      <button
                        type="button"
                        data-tutorial="next"
                        onClick={handleNext}
                        disabled={isSavingReward}
                        className={`button w-full disabled:cursor-not-allowed disabled:opacity-60 ${
                          isUnsafe ? "button-secondary" : "button-primary"
                        }`}
                      >
                        {isSavingReward ? (
                          "Menyimpan progres..."
                        ) : isUnsafe ? (
                          <>
                            <RotateCcw size={16} />
                            Coba lagi level ini
                          </>
                        ) : isLastLevel ? (
                          <>
                            <Trophy size={16} />
                            Klaim hasil dan reward
                          </>
                        ) : (
                          <>
                            Lanjut ke Level {currentIndex + 2}
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Panel belajar */}
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
              <Sparkles size={20} />
            </div>
            <h3 className="mt-4 text-sm font-extrabold text-[var(--foreground)]">Misi kamu</h3>
            <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
              Capai Level {totalCount}. Penipu makin lihai di level tinggi: domain bisa lolos pemeriksaan,
              isi email bisa sangat personal, dan sebagian email justru asli. Tetap verifikasi lewat jalur
              yang kamu pilih sendiri.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex items-center gap-2">
              <ShieldAlert size={18} className="text-[var(--warning)]" />
              <h3 className="text-sm font-extrabold text-[var(--foreground)]">Tanda yang perlu diwaspadai</h3>
            </div>
            <ul className="mt-3 space-y-2">
              {[
                "Tekanan waktu atau ancaman blokir.",
                "Minta kata sandi, kode, uang, atau izin akses.",
                "Domain mirip atau di luar domain resmi.",
                "Perubahan rekening atau permintaan rahasia.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-[var(--muted)]">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0 text-[var(--warning)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-[var(--brand-dark)] p-5 text-white">
            <p className="text-[10px] font-extrabold tracking-[0.15em] text-white/60">PROGRESS</p>
            <p className="mt-2 text-3xl font-extrabold tabular-nums">{Math.round(progress)}%</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-3 text-xs text-white/70">
              {completedIds.length} dari {totalCount} level telah kamu selesaikan.
            </p>
            <p className="mt-3 border-t border-white/15 pt-3 text-[11px] leading-relaxed text-white/60">
              Potensi XP {potentialXp}/{PHISHING_MAX_XP}. Jawaban salah mengurangi XP level itu. Selesaikan
              Level {totalCount} untuk bonus {PHISHING_MASTER_BONUS} XP dan badge Pemburu Phishing.
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] leading-relaxed text-[var(--muted)]">
          CEKIN Learning &amp; Protection - Phishing - Seluruh email dalam simulasi ini bersifat fiktif.
        </p>
      </div>

      {/* Modal pembelajaran */}
      {showLearningModal && selectedChoice && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="phishing-learning-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowLearningModal(false);
          }}
        >
          <div className="my-auto w-full max-w-lg overflow-hidden rounded-[26px] bg-[var(--card)] shadow-2xl">
            <div className="relative overflow-hidden bg-[var(--brand-dark)] p-6 text-white">
              <button
                type="button"
                aria-label="Tutup materi pembelajaran"
                onClick={() => setShowLearningModal(false)}
                className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
              >
                <X size={18} />
              </button>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <Lightbulb size={25} />
              </div>

              <p className="mt-5 text-[10px] font-extrabold tracking-[0.18em] text-white/60">
                PHISHING AWARENESS
              </p>

              <h2 id="phishing-learning-title" className="mt-2 pr-8 text-2xl font-extrabold leading-tight">
                Pahami sebelum membuka email berikutnya.
              </h2>
            </div>

            <div className="max-h-[60vh] space-y-5 overflow-y-auto p-6">
              <section>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]">
                    <Eye size={17} />
                  </div>
                  <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                    Mengapa keputusan ini penting?
                  </h3>
                </div>

                <p className="mt-3 text-xs leading-6 text-[var(--muted)]">{selectedChoice.explanation}</p>
              </section>

              <div className="h-px bg-[var(--border)]" />

              <section data-tutorial="learn-safer">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                    <ShieldCheck size={17} />
                  </div>
                  <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                    Tindakan yang lebih aman
                  </h3>
                </div>

                <div className="mt-3 rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent-soft)] p-4">
                  <p className="text-xs leading-relaxed text-[var(--foreground)]">{selectedChoice.saferAction}</p>
                </div>
              </section>

              <div className="h-px bg-[var(--border)]" />

              <section>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--warning)]/15 text-[var(--warning)]">
                    <AlertTriangle size={17} />
                  </div>
                  <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                    Checklist sebelum percaya email
                  </h3>
                </div>

                <div className="mt-3 space-y-3">
                  {[
                    ["Periksa alamat pengirim", "Lihat domain setelah tanda @, bukan hanya nama tampilan."],
                    ["Waspadai tekanan dan rahasia", "Ancaman, batas waktu, dan permintaan “jangan beri tahu siapa pun” patut dicurigai."],
                    ["Periksa tujuan tautan dan izin", "Jangan login atau menyetujui izin lewat tautan email. Buka layanannya sendiri."],
                    ["Verifikasi lewat jalur lain", "Untuk uang, rekening, atau dokumen penting, konfirmasi lewat telepon atau kanal resmi."],
                  ].map(([title, description], index) => (
                    <div key={title} className="flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--surface)] text-[10px] font-extrabold text-[var(--brand)]">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--foreground)]">{title}</p>
                        <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="rounded-2xl border border-[var(--brand)]/20 bg-[var(--brand-soft)] p-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert size={18} className="mt-0.5 shrink-0 text-[var(--brand)]" />
                  <p className="text-[11px] leading-relaxed text-[var(--brand-dark)]">
                    <strong>Ingat:</strong> email dari pihak resmi pun bisa muncul, dan email palsu bisa
                    lolos pemeriksaan teknis. Nilai konteks, permintaan, dan tujuan tautan, bukan satu tanda saja.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--border)] p-5">
              <button
                type="button"
                data-tutorial="learn-close"
                onClick={() => setShowLearningModal(false)}
                className="button button-primary w-full"
              >
                Aku paham
                <Check size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <LoginGate
        open={gate.open}
        earnedXp={earnedLevelXp}
        onAuthenticated={gate.onAuthenticated}
        onContinue={gate.onContinue}
      />

      <PhishingTutorial
        active={tutorialActive}
        detailsOpen={showDetails}
        hasSelectedChoice={!!selectedChoice}
        learnModalOpen={showLearningModal}
        onClose={closeTutorial}
      />
    </main>
  );
}