"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CircleStar,
  Clock3,
  Crown,
  HeartHandshake,
  HelpCircle,
  Info,
  Lightbulb,
  Lock,
  Megaphone,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  X,
} from "lucide-react";

import type {
  ScenarioDifficulty,
  SimulationChoice,
  SimulationConfig,
} from "@/types/learning-protection";
import { seededShuffle } from "@/lib/learning-protection/shuffle";
import {
  GAMBLING_MASTER_BONUS,
  GAMBLING_MAX_XP,
  calculateGamblingXp,
  gamblingLevelXp,
} from "@/lib/learning-protection/xp";
import { GamblingTutorial, GAMBLING_TUTORIAL_KEY } from "./gambling-tutorial";
import { GamblingBanner, type BannerVariant } from "./gambling-banner";

type Props = {
  simulation: SimulationConfig;
};

const SIMULATION_ID = "online-gambling";

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

const BANNER_VARIANTS: BannerVariant[] = [
  "popup",
  "comment",
  "chat",
  "stream",
  "demo",
  "chat",
  "notif",
  "chat",
  "chat",
  "notif",
];

export function GamblingAwareness({ simulation }: Props) {
  const scenarios = useMemo(
    () => simulation.scenarios.filter((scenario) => scenario.gamblingDetails),
    [simulation.scenarios],
  );
  const totalCount = scenarios.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<SimulationChoice | null>(null);
  const [attempts, setAttempts] = useState<Record<string, string[]>>({});
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [safeIds, setSafeIds] = useState<string[]>([]);
  const [runSeed, setRunSeed] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [finished, setFinished] = useState(false);
  const [rewardMessage, setRewardMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const scenarioRef = useRef<HTMLElement>(null);
  const resultRef = useRef<HTMLElement>(null);

  const currentScenario = scenarios[currentIndex];
  const promo = currentScenario?.gamblingDetails;

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
    gamblingLevelXp(index + 1, wrongCountOf(scenario.id)),
  );

  const earnedLevelXp = scenarios.reduce(
    (sum, scenario, index) =>
      completedIds.includes(scenario.id) ? sum + levelXpList[index] : sum,
    0,
  );

  const potentialXp = levelXpList.reduce((sum, xp) => sum + xp, 0) + GAMBLING_MASTER_BONUS;
  const currentLevelXp = levelXpList[currentIndex] ?? 0;
  const progress = totalCount ? (completedIds.length / totalCount) * 100 : 0;

  useEffect(() => {
    if (!finished) return;

    const frame = window.requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [finished]);


  const [tutorialActive, setTutorialActive] = useState(false);
  const tutorialSnapshot = useRef<{
    currentIndex: number;
    completedIds: string[];
    safeIds: string[];
    attempts: Record<string, string[]>;
  } | null>(null);
  const tutorialStorageKey = useRef(`${GAMBLING_TUTORIAL_KEY}:guest`);

  const startTutorial = () => {
    tutorialSnapshot.current = { currentIndex, completedIds, safeIds, attempts };
    setCurrentIndex(0);
    setCompletedIds([]);
    setSafeIds([]);
    setAttempts({});
    setSelectedChoice(null);
    setShowDetails(false);
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
      }

      if (cancelled) return;

      tutorialStorageKey.current = `${GAMBLING_TUTORIAL_KEY}:${userId}`;

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

  if (!currentScenario || !promo || totalCount === 0) {
    return (
      <main className="container py-16 text-center">
        <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-[var(--warning)]" />
        <h1 className="heading heading-2">Skenario belum tersedia</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Belum ada skenario untuk simulasi ini.</p>
        <Link href="/learning-protection" className="button button-primary mt-6">
          Kembali ke Learning &amp; Protection
        </Link>
      </main>
    );
  }
  const scrollToScenario = () => {
    requestAnimationFrame(() => {
      scenarioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const saveSimulationCompletion = async () => {
    try {
      const response = await fetch("/api/learning-protection/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ simulationId: SIMULATION_ID, answers: attempts }),
      });

      if (response.status === 401) {
        setRewardMessage(
          "Level maksimal tercapai! Login untuk menyimpan progres, XP, dan lencana ke akunmu.",
        );
        return;
      }

      if (!response.ok) {
        setRewardMessage(
          "Level maksimal tercapai, tetapi progres belum berhasil disimpan. Kamu tetap bisa melihat hasilmu.",
        );
        return;
      }

      const result = await response.json();
      const scoreXp: number = result.scoreXp ?? 0;
      const maxXp: number = result.maxXp ?? GAMBLING_MAX_XP;

      if (result.xpEarned > 0) {
        setRewardMessage(
          scoreXp >= maxXp
            ? `Sempurna! Kamu mendapatkan ${result.xpEarned} XP dari Gambling Awareness.`
            : `Kamu mendapatkan ${result.xpEarned} XP (skor ${scoreXp}/${maxXp}). Ulangi tanpa salah untuk XP maksimal.`,
        );
      } else if ((result.bestXp ?? 0) >= maxXp) {
        setRewardMessage("Kamu sudah meraih XP maksimal di Gambling Awareness.");
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

  const handleNext = async () => {
    if (!selectedChoice || isSaving) return;

    // Pilihan kurang aman: ulangi level yang sama dengan urutan pilihan baru.
    if (!selectedChoice.isSafe) {
      setSelectedChoice(null);
      scrollToScenario();
      return;
    }

    if (currentIndex < totalCount - 1) {
      setCurrentIndex((previous) => previous + 1);
      setSelectedChoice(null);
      setShowDetails(false);
      scrollToScenario();
      return;
    }

    // Saat tutorial: jangan membuka hasil dan jangan menyimpan XP.
    if (tutorialActive) {
      setSelectedChoice(null);
      return;
    }

    setIsSaving(true);

    try {
      await saveSimulationCompletion();
      setFinished(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedChoice(null);
    setAttempts({});
    setCompletedIds([]);
    setSafeIds([]);
    setRunSeed((previous) => previous + 1);
    setShowDetails(false);
    setFinished(false);
    setRewardMessage("");
    setIsSaving(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ========================================
     LAYAR REWARD: LEVEL MAKSIMAL
  ======================================== */

  if (finished) {
    const wrongCounts = scenarios.map((scenario) => wrongCountOf(scenario.id));
    const finalXp = calculateGamblingXp(wrongCounts);
    const totalWrong = wrongCounts.reduce((sum, wrong) => sum + wrong, 0);
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
                {isPerfect ? "Perfect Gambling Guardian!" : "Selamat, Gambling Guardian!"}
              </h1>

              <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/80">
                Kamu menamatkan seluruh {totalCount} level, dari banner bonus sampai dorongan kambuh
                dan cara membantu teman yang terjerat.
              </p>

              <div className="relative mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-yellow-300 px-4 py-2 text-xs font-extrabold text-[var(--brand-dark)]">
                <Trophy size={16} />
                Lencana Gambling Guardian
                {isPerfect && <Star size={14} className="fill-current" />}
              </div>
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
                    <span className="text-base font-bold text-[var(--muted)]">/{GAMBLING_MAX_XP}</span>
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[var(--muted)]">Total XP</p>
                </div>
              </div>

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
                      Bonus Gambling Guardian
                    </span>
                    <span className="font-bold text-[var(--accent)]">+{finalXp.bonus} XP</span>
                  </li>
                </ul>

                <p className="mt-3 border-t border-[var(--border)] pt-3 text-xs leading-relaxed text-[var(--muted)]">
                  {isPerfect
                    ? "Tanpa satu pun keputusan kurang aman. Luar biasa!"
                    : `Kamu sempat ${totalWrong} kali memilih keputusan kurang aman. Ulangi tanpa salah untuk XP maksimal (${GAMBLING_MAX_XP} XP).`}
                </p>
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[var(--border)] p-5">
                <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]" />
                <div>
                  <h2 className="text-sm font-bold text-[var(--foreground)]">Prinsip utama</h2>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                    Tidak ada strategi, pola, atau jam yang menjamin menang. Bonus adalah umpan, kekalahan
                    tidak bisa “dikejar”, dan berutang untuk bermain hanya memperbesar masalah. Satu-satunya
                    cara pasti menghindari kerugian judi adalah tidak memulai.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[var(--brand-soft)] p-5">
                <HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" />
                <p className="text-xs leading-relaxed text-[var(--brand-dark)]">
                  Jika kamu atau orang terdekat kesulitan berhenti, hentikan transaksi, jauhkan pemicunya,
                  dan bicarakan dengan orang tepercaya atau tenaga profesional kesehatan jiwa. Meminta
                  bantuan bukan tanda lemah.
                </p>
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
                  Simulasi lainnya
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

  return (
    <main className="container py-8 pb-16 md:py-12">
      <div className="mx-auto max-w-5xl">
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
              <ShieldCheck size={14} />
              GAMBLING AWARENESS
            </div>

            <h1 className="heading heading-2 mt-4">Kenalin jebakan di balik judi online.</h1>
            
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
        <section
          data-tutorial="progress"
          className="mb-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-[var(--foreground)]">Perjalananmu</span>
            <div className="flex items-center gap-3 text-xs font-semibold tabular-nums text-[var(--muted)]">
              <span>
                {completedIds.length} dari {totalCount} level selesai
              </span>
              <span className="rounded-md bg-[var(--accent-soft)] px-2.5 py-1 font-extrabold text-[var(--accent)]">
                Potensi XP {potentialXp}/{GAMBLING_MAX_XP}
              </span>
            </div>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-[var(--surface)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>

        {/* Peta level */}
        <section data-tutorial="levels" className="mb-6">
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
        </section>

        {/* Skenario */}
        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
          <section
            ref={scenarioRef}
            className="min-w-0 scroll-mt-24 overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--card)] shadow-sm"
          >
            <div className="border-b border-[var(--border)] bg-[var(--surface)] px-5 py-4 md:px-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[10px] font-extrabold tracking-[0.16em] text-[var(--brand)]">
                  LEVEL {currentIndex + 1} DARI {totalCount}
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  {currentScenario.difficulty && (
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${DIFFICULTY_STYLES[currentScenario.difficulty]}`}
                    >
                      {currentScenario.difficulty}
                    </span>
                  )}
                  {currentScenario.topic && (
                    <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-[10px] font-bold text-[var(--brand)]">
                      {currentScenario.topic}
                    </span>
                  )}
                </div>
              </div>

              <h2 className="mt-3 text-xl font-extrabold leading-snug text-[var(--foreground)] md:text-2xl">
                {currentScenario.title}
              </h2>
            </div>

            <div className="p-5 md:p-7">
              {/* Situasi */}
              <div
                data-tutorial="situation"
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
              >
                <div className="mb-3 flex items-center gap-2 text-[var(--muted)]">
                  <Info size={16} />
                  <span className="text-[10px] font-extrabold tracking-wider">BAYANGKAN SITUASI INI</span>
                </div>

                <p className="text-sm leading-relaxed text-[var(--foreground)]">
                  {currentScenario.description}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">{currentScenario.context}</p>
              </div>

              {/* Tampilan promosi atau pesan */}
              <div
                data-tutorial="promo"
                className="mt-5 overflow-hidden rounded-2xl border border-[var(--border)]"
              >
                <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-extrabold text-[var(--foreground)]">
                      {promo.channel}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[var(--muted)]">Tampilan fiktif untuk edukasi</p>
                  </div>

                  <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-extrabold text-red-700">
                    FIKSI
                  </span>
                </div>

                <GamblingBanner
                  variant={BANNER_VARIANTS[currentIndex] ?? "popup"}
                  promo={promo}
                />

                <p className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-center text-[10px] text-[var(--muted)]">
                  Tidak ada permainan, deposit, atau transaksi sungguhan.
                </p>
              </div>

              {/* Periksa petunjuk */}
              <div className="mt-5">
                <button
                  type="button"
                  data-tutorial="inspect"
                  onClick={() => setShowDetails((open) => !open)}
                  aria-expanded={showDetails}
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--brand)]/25 bg-[var(--brand-soft)] px-4 py-2.5 text-xs font-bold text-[var(--brand)] transition hover:border-[var(--brand)]"
                >
                  <Search size={15} />
                  {showDetails ? "Tutup petunjuk" : "Periksa petunjuk"}
                </button>

                {showDetails && (
                  <div
                    data-tutorial="details"
                    className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
                  >
                    <p className="text-[10px] font-extrabold tracking-wider text-[var(--muted)]">
                      PETUNJUK DI BALIK TAMPILANNYA
                    </p>

                    <ul className="mt-3 space-y-3">
                      {promo.signals.map((signal) => (
                        <li key={signal.label} className="flex items-start gap-2 text-xs leading-5">
                          {signal.suspicious ? (
                            <AlertTriangle size={15} className="mt-0.5 shrink-0 text-[var(--warning)]" />
                          ) : (
                            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                          )}
                          <span>
                            <span className="font-bold text-[var(--foreground)]">{signal.label}: </span>
                            <span className="text-[var(--muted)]">{signal.value}</span>
                            <span
                              className={`ml-2 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                signal.suspicious
                                  ? "bg-[var(--warning)]/10 text-[#9a6700]"
                                  : "bg-[var(--accent-soft)] text-[var(--accent)]"
                              }`}
                            >
                              {signal.suspicious ? "Periksa" : "Wajar"}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Keputusan */}
              <div className="mb-4 mt-7">
                <p className="text-sm font-extrabold text-[var(--foreground)]">Apa yang akan kamu lakukan?</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Pilih respons yang menurutmu paling tepat.
                </p>
              </div>

              <div data-tutorial="choices" className="space-y-3">
                {displayChoices.map((choice, index) => {
                  const isSelected = selectedChoice?.id === choice.id;

                  return (
                    <button
                      key={choice.id}
                      type="button"
                      disabled={!!selectedChoice}
                      onClick={() => handleChoice(choice)}
                      className={`group flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                        isSelected
                          ? choice.isSafe
                            ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                            : "border-[var(--danger)] bg-[var(--danger)]/5"
                          : selectedChoice
                            ? "cursor-default border-[var(--border)] opacity-50"
                            : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${
                          isSelected
                            ? choice.isSafe
                              ? "bg-[var(--accent)] text-white"
                              : "bg-[var(--danger)] text-white"
                            : "bg-[var(--surface)] text-[var(--muted)] group-hover:bg-white group-hover:text-[var(--brand)]"
                        }`}
                      >
                        {isSelected ? (
                          choice.isSafe ? <Check size={17} /> : <X size={17} />
                        ) : (
                          String.fromCharCode(65 + index)
                        )}
                      </span>

                      <span className="flex-1 text-sm font-semibold leading-relaxed text-[var(--foreground)]">
                        {choice.label}
                      </span>

                      {!selectedChoice && (
                        <ArrowRight
                          size={16}
                          className="shrink-0 text-[var(--muted)] transition group-hover:translate-x-1 group-hover:text-[var(--brand)]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Umpan balik */}
              {selectedChoice && (
                <div className="mt-6">
                  <div data-tutorial="feedback">
                    <div
                      className={`rounded-2xl border p-5 ${
                        selectedChoice.isSafe
                          ? "border-[var(--accent)]/30 bg-[var(--accent-soft)]"
                          : "border-[var(--warning)]/40 bg-[var(--warning)]/10"
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        {selectedChoice.isSafe ? (
                          <CheckCircle2 size={20} className="text-[var(--accent)]" />
                        ) : (
                          <AlertTriangle size={20} className="text-[var(--warning)]" />
                        )}

                        <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                          {selectedChoice.isSafe
                            ? `Level ${currentIndex + 1} selesai!`
                            : "Ada risiko yang perlu kamu sadari."}
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

                      <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">
                        {selectedChoice.feedback}
                      </p>

                      {isUnsafe && (
                        <p className="mt-3 text-xs font-bold leading-relaxed text-[var(--warning)]">
                          Level ini belum selesai. Pelajari alasannya, lalu coba lagi dengan pilihan yang
                          lebih aman.
                        </p>
                      )}
                    </div>

                    <div className="mt-4 rounded-2xl border border-[var(--border)] p-5">
                      <div className="flex items-center gap-2">
                        <Info size={18} className="text-[var(--brand)]" />
                        <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                          Mengapa ini berisiko?
                        </h3>
                      </div>

                      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                        {selectedChoice.explanation}
                      </p>

                      <div className="mt-4 rounded-xl bg-[var(--brand-soft)] p-4">
                        <div className="flex items-center gap-2 text-[var(--brand)]">
                          <Lightbulb size={16} />
                          <span className="text-xs font-extrabold">Langkah yang lebih aman</span>
                        </div>

                        <p className="mt-2 text-sm leading-relaxed text-[var(--brand-dark)]">
                          {selectedChoice.saferAction}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    data-tutorial="next"
                    onClick={handleNext}
                    disabled={isSaving}
                    className={`button mt-5 w-full disabled:cursor-wait disabled:opacity-60 ${
                      isUnsafe ? "button-secondary" : "button-primary"
                    }`}
                  >
                    {isSaving ? (
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
          </section>

          {/* Panel samping */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                <Sparkles size={20} />
              </div>

              <h3 className="mt-4 text-sm font-extrabold text-[var(--foreground)]">Misi kamu</h3>

              <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                Capai Level {totalCount}. Di level tinggi, jebakannya bukan lagi iklan yang jelas, tetapi
                tekanan dari orang terdekat, utang, dan dorongan dari dalam diri sendiri.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={17} className="text-[var(--accent)]" />
                <h3 className="text-sm font-extrabold text-[var(--foreground)]">Ingat ini</h3>
              </div>

              <ul className="mt-3 space-y-2">
                {[
                  "Tidak ada strategi atau “jam gacor” yang menjamin menang.",
                  "Bonus adalah umpan agar kamu deposit.",
                  "Kekalahan tidak bisa “dikejar”.",
                  "Jangan berutang atau menyewakan rekening untuk judi.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-[var(--muted)]">
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[var(--accent)]" />
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
                Potensi XP {potentialXp}/{GAMBLING_MAX_XP}. Jawaban salah mengurangi XP level itu. Selesaikan
                Level {totalCount} untuk bonus {GAMBLING_MASTER_BONUS} XP dan lencana Gambling Guardian.
              </p>
            </div>
          </aside>
        </div>

        {/* Pengingat dukungan */}
        <section
          data-tutorial="support"
          className="mt-7 flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <HeartHandshake size={23} />
          </span>

          <div>
            <h3 className="text-sm font-extrabold text-[var(--foreground)]">
              Sulit berhenti bukan berarti kamu lemah.
            </h3>

            <p className="mt-1 text-xs leading-6 text-[var(--muted)]">
              Jika judi online mulai mengganggu kehidupanmu, hentikan transaksi, kurangi paparan promosi,
              dan bicarakan situasimu dengan orang tepercaya atau tenaga profesional kesehatan jiwa.
            </p>
          </div>
        </section>
      </div>

      <GamblingTutorial
        active={tutorialActive}
        detailsOpen={showDetails}
        hasSelectedChoice={!!selectedChoice}
        onClose={closeTutorial}
      />
    </main>
  );
}