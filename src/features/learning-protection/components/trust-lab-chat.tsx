"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  X,
  UserRound,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BatteryFull,
  CheckCheck,
  CircleStar,
  Clock3,
  HelpCircle,
  LockKeyhole,
  MessageCircle,
  MoreVertical,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Signal,
  Sparkles,
  Video,
  Wifi,
} from "lucide-react";
import type {
  DialogueEnding,
  SimulationConfig,
  SimulationScenario,
} from "@/types/learning-protection";
import {
  TrustLabTutorial,
  TRUST_LAB_TUTORIAL_KEY,
} from "./trust-lab-tutorial";
import {
  DIFFICULTY_STYLES,
  DialogueNotes,
  DialogueResult,
  LevelMap,
  MasterReward,
} from "./dialogue-parts";
import {
  TRUST_LAB_MASTER_BONUS,
  TRUST_LAB_MAX_XP,
  calculateTrustLabXp,
  trustLabLevelXp,
} from "@/lib/learning-protection/xp";
import { mistakesOfPaths } from "@/lib/learning-protection/dialogue";
import { useDialogue } from "@/lib/learning-protection/use-dialogue";
import {
  useLearningProgress,
} from "@/lib/learning-protection/use-learning-progress";
import { useLoginGate } from "@/lib/learning-protection/use-login-gate";
import { LoginGate } from "./login-gate";
import { BadgeTracker } from "./badge-parts";

type Props = {
  simulation: SimulationConfig;
};

const SIMULATION_ID = "trust-lab";

export function TrustLabChat({ simulation }: Props) {
  const scenarios = simulation.scenarios;
  const totalCount = scenarios.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [attempts, setAttempts] = useState<Record<string, string[][]>>({});
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [attemptKey, setAttemptKey] = useState(0);
  const [runSeed, setRunSeed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [isSavingReward, setIsSavingReward] = useState(false);
  const [rewardMessage, setRewardMessage] = useState("");
  const [badgeSaved, setBadgeSaved] = useState<boolean | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [tutorialActive, setTutorialActive] = useState(false);
  const tutorialSnapshot = useRef<{
    currentIndex: number;
    completedIds: string[];
    attempts: Record<string, string[][]>;
  } | null>(null);
  const tutorialStorageKey = useRef(`${TRUST_LAB_TUTORIAL_KEY}:guest`);

  const scenarioRef = useRef<HTMLElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const [gateOpen, setGateOpen] = useState(false);
  const [declinedLogin, setDeclinedLogin] = useState(false);

  const learning = useLearningProgress({
    simulationId: SIMULATION_ID,
    scenarioIds: scenarios.map((scenario) => scenario.id),
    attemptsShape: "dialogue",
    paused: tutorialActive,
    snapshot: {
      currentIndex,
      completedIds,
      attempts,
      runSeed,
      finished,
      rewardMessage,
      declinedLogin,
    },
    onRestore: (saved) => {
      setCurrentIndex(saved.currentIndex);
      setCompletedIds(saved.completedIds);
      setAttempts(saved.attempts as Record<string, string[][]>);
      setRunSeed(saved.runSeed);
      setFinished(Boolean(saved.finished));
      setRewardMessage(saved.rewardMessage ?? "");
      setDeclinedLogin(Boolean(saved.declinedLogin));
      setAttemptKey((previous) => previous + 1);
    },
  });
  const session = learning.session;

  const currentScenario = scenarios[currentIndex];
  const attemptNumber = currentScenario
    ? (attempts[currentScenario.id]?.length ?? 0)
    : 0;

  function handleFinish(path: string[], ending: DialogueEnding) {
    if (!currentScenario) return;

    const scenarioId = currentScenario.id;

    setAttempts((previous) => ({
      ...previous,
      [scenarioId]: [...(previous[scenarioId] ?? []), path],
    }));

    if (ending.result === "win") {
      setCompletedIds((previous) =>
        previous.includes(scenarioId) ? previous : [...previous, scenarioId],
      );
    }
  }

  const dialogue = useDialogue({
    scenario: currentScenario,
    startKey: attemptKey,
    shuffleSeed: `${currentScenario?.id}:${attemptNumber}:${runSeed}`,
    instant: tutorialActive || reduceMotion,
    onFinish: handleFinish,
  });

  /* ---------- Hitungan level & XP ---------- */

  // Jumlah langkah keliru di sebuah level, termasuk percakapan yang sedang berjalan.
  const mistakesOf = (scenario: SimulationScenario) => {
    if (!scenario.dialogue) return 0;

    const paths = [...(attempts[scenario.id] ?? [])];

    if (
      scenario.id === currentScenario?.id &&
      dialogue.phase !== "ended" &&
      dialogue.path.length > 0
    ) {
      paths.push(dialogue.path);
    }

    return mistakesOfPaths(scenario.dialogue, paths);
  };

  const levelXpList = scenarios.map((scenario, index) =>
    trustLabLevelXp(index + 1, mistakesOf(scenario)),
  );

  const earnedLevelXp = scenarios.reduce(
    (sum, scenario, index) =>
      completedIds.includes(scenario.id) ? sum + levelXpList[index] : sum,
    0,
  );

  const runMistakes = scenarios.reduce(
    (sum, scenario) => sum + mistakesOf(scenario),
    0,
  );

  const potentialXp =
    levelXpList.reduce((sum, xp) => sum + xp, 0) + TRUST_LAB_MASTER_BONUS;

  const currentLevelXp = levelXpList[currentIndex] ?? 0;
  const progress = totalCount ? (completedIds.length / totalCount) * 100 : 0;
  const isLastLevel = currentIndex >= totalCount - 1;

  useEffect(() => {
    setShowProfile(false);
  }, [currentIndex, attemptKey]);

  /* ---------- Tutorial ---------- */

  const startTutorial = () => {
    tutorialSnapshot.current = { currentIndex, completedIds, attempts };
    setCurrentIndex(0);
    setCompletedIds([]);
    setAttempts({});
    setAttemptKey((previous) => previous + 1);
    setTutorialActive(true);
  };

  const closeTutorial = (completed: boolean) => {
    // Kembalikan progres asli seperti sebelum tutorial.
    const snapshot = tutorialSnapshot.current;
    if (snapshot) {
      setCurrentIndex(snapshot.currentIndex);
      setCompletedIds(snapshot.completedIds);
      setAttempts(snapshot.attempts);
    }
    setAttemptKey((previous) => previous + 1);
    setTutorialActive(false);
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      localStorage.setItem(
        tutorialStorageKey.current,
        completed ? "done" : "skipped",
      );
    } catch {}
  };

  // Nilai terbaru untuk dipakai efek auto-start tanpa nilai usang.
  const latest = useRef({ start: startTutorial, canAutoStart: true });
  latest.current = {
    start: startTutorial,
    canAutoStart:
      !tutorialActive &&
      completedIds.length === 0 &&
      Object.keys(attempts).length === 0 &&
      dialogue.path.length === 0,
  };

  useEffect(() => {
    setReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

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

      tutorialStorageKey.current = `${TRUST_LAB_TUTORIAL_KEY}:${userId}`;

      if (completed) return;

      try {
        if (localStorage.getItem(tutorialStorageKey.current)) return;
      } catch {}

      timer = setTimeout(() => {
        if (!cancelled && latest.current.canAutoStart) {
          latest.current.start();
        }
      }, 600);
    };

    decide();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Selalu gulir chat ke pesan terbaru.
  useEffect(() => {
    const element = chatRef.current;
    if (!element) return;

    element.scrollTo({
      top: element.scrollHeight,
      behavior: reduceMotion || tutorialActive ? "auto" : "smooth",
    });
  }, [dialogue.thread.length, dialogue.typing, reduceMotion, tutorialActive]);

  if (!totalCount || !currentScenario) {
    return (
      <main className="container py-16 text-center">
        <MessageCircle className="mx-auto mb-4 h-10 w-10 text-[var(--muted)]" />
        <h1 className="heading heading-2">Skenario belum tersedia</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Konten Penipuan Chat sedang disiapkan.
        </p>
        <Link
          href="/learning-protection"
          className="button button-primary mt-6"
        >
          Kembali ke Learning & Protection
        </Link>
      </main>
    );
  }

  /* ---------- Aksi ---------- */

  const scrollToScenario = () => {
    requestAnimationFrame(() => {
      scenarioRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const retryLevel = () => {
    setAttemptKey((previous) => previous + 1);
    scrollToScenario();
  };

  const saveSimulationCompletion = async () => {
    if (isSavingReward) return;

    setIsSavingReward(true);

    try {
      const response = await fetch("/api/learning-protection/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          simulationId: SIMULATION_ID,
          answers: attempts,
        }),
      });

      if (response.status === 401) {
        setBadgeSaved(false);

        setRewardMessage("Level maksimal tercapai! Login untuk menyimpan progres, XP, dan lencana ke akunmu.");
        return;
      }

      if (!response.ok) {
        setRewardMessage(
          "Level maksimal tercapai, tetapi progres belum berhasil disimpan. Kamu tetap bisa melihat hasilmu.",
        );
        return;
      }

      const result = await response.json();
      setBadgeSaved(Boolean(result.badge?.owned));
      const scoreXp: number = result.scoreXp ?? 0;
      const maxXp: number = result.maxXp ?? TRUST_LAB_MAX_XP;

      if (result.xpEarned > 0) {
        setRewardMessage(
          scoreXp >= maxXp
            ? `Sempurna! Kamu mendapatkan ${result.xpEarned} XP dari Penipuan Chat.`
            : `Kamu mendapatkan ${result.xpEarned} XP (skor ${scoreXp}/${maxXp}). Ulangi simulasi tanpa salah untuk meraih XP maksimal.`,
        );
      } else if ((result.bestXp ?? 0) >= maxXp) {
        setRewardMessage("Kamu sudah meraih XP maksimal di Penipuan Chat.");
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
    } finally {
      setIsSavingReward(false);
    }
  };

  function goNextLevel() {
    setCurrentIndex((previous) => previous + 1);
    scrollToScenario();
  }

  const gate = useLoginGate({
    session: learning.session,
    declinedLogin,
    setDeclinedLogin,
    tutorialActive,
    currentIndex,
    onAdvance: goNextLevel,
  });

  const handleNext = async () => {
    if (isSavingReward || dialogue.ending?.result !== "win") return;

    if (!isLastLevel) {
      if (gate.request()) return;
      goNextLevel();
      return;
    }

    if (tutorialActive) {
      setAttemptKey((previous) => previous + 1);
      return;
    }

    await saveSimulationCompletion();
    setFinished(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restart = () => {
    setCurrentIndex(0);
    setAttempts({});
    setCompletedIds([]);
    setRunSeed((previous) => previous + 1);
    setAttemptKey((previous) => previous + 1);
    setFinished(false);
    setRewardMessage("");
    setDeclinedLogin(false);

    scrollToScenario();
  };

  /* ========================================
     LAYAR REWARD: LEVEL MAKSIMAL
  ======================================== */

  if (finished) {
    const wrongCounts = scenarios.map((scenario) => mistakesOf(scenario));
    const finalXp = calculateTrustLabXp(wrongCounts);
    const totalMistakes = wrongCounts.reduce((sum, wrong) => sum + wrong, 0);
    const cleanCount = scenarios.filter(
      (scenario, index) =>
        completedIds.includes(scenario.id) && wrongCounts[index] === 0,
    ).length;

    return (
      <MasterReward
        badgeKey="trust"
        badgeSaved={badgeSaved}
        intro={`Kamu menamatkan ${totalCount} percakapan, dari bujukan sederhana sampai penipuan yang tampak sangat meyakinkan. Kamu kini lebih siap menghadapi modus digital masa kini.`}
        totalCount={totalCount}
        completedCount={completedIds.length}
        cleanCount={cleanCount}
        xp={finalXp}
        maxXp={TRUST_LAB_MAX_XP}
        totalMistakes={totalMistakes}
        principle="Jangan mengirim uang, data pribadi, kata sandi, atau kode OTP hanya karena diminta lewat chat. Nomor, suara, centang, bahkan data yang benar tidak membuktikan identitas seseorang. Verifikasi lewat kanal resmi yang kamu cari sendiri."
        tips={[
          "Penipu tidak menyerah setelah satu penolakan. Tekanan akan makin kuat, jadi tetap bertahan.",
          "Cara penipu bereaksi saat kamu memeriksa adalah petunjuk terbaik.",
          "Hubungi orang yang bersangkutan lewat jalur lain yang sudah kamu percaya.",
          "Jangan membayar atau membagikan kode demi “mencairkan” sesuatu.",
        ]}
        rewardMessage={rewardMessage}
        onRestart={restart}
      />
    );
  }

  /* ========================================
     TAMPILAN UTAMA
  ======================================== */

  const sender = currentScenario.sender;
  const profile = currentScenario.profile;
  const reveal = dialogue.phase === "ended";
  const waiting = dialogue.phase === "revealing";

  return (
    <main className="container py-8 pb-16 md:py-12">
      <div className="mx-auto">
        <Link
          href="/learning-protection"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--brand)]"
        >
          <ArrowLeft size={16} />
          Learning & Protection
        </Link>

        {/* Header */}
        <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="badge">
              <MessageCircle size={14} />
              PENIPUAN CHAT
            </div>

            <h1 className="heading heading-2 mt-4">
              Jangan mudah percaya sebelum memeriksa.
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
            <button onClick={startTutorial} className="button button-secondary">
              <HelpCircle size={16} />
              Tutorial
            </button>

            <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1">
              <div className="flex w-8 items-center justify-center rounded-xl text-[var(--warning)]">
                <CircleStar size={21} />
              </div>

              <div className="flex items-center justify-center">
                <p className="m-2 text-xl font-extrabold leading-none text-[var(--foreground)]">
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
          className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-[var(--foreground)]">
              Perjalananmu
            </span>
            <div className="flex items-center gap-3 text-xs font-semibold tabular-nums text-[var(--muted)]">
              <span>
                {completedIds.length} dari {totalCount} level selesai
              </span>
              <span className="rounded-md bg-[var(--accent-soft)] px-2.5 py-1 font-extrabold text-[var(--accent)]">
                Potensi XP {potentialXp}/{TRUST_LAB_MAX_XP}
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
            <p className="mt-3 text-[11px] font-semibold text-[var(--accent)]">
              Progres sebelumnya dilanjutkan.
            </p>
          )}

          {session.ready && !session.authenticated && (
            <p className="mt-2 text-[11px] font-semibold text-[var(--muted)]">
              {declinedLogin
                ? "Mode tamu: XP tidak akan dihitung."
                : "Mode tamu: login untuk menyimpan progres dan XP."}
            </p>
          )}
        </div>

        <BadgeTracker
          simulationKey="trust"
          mistakes={runMistakes}
        />

        <LevelMap
          scenarios={scenarios}
          currentIndex={currentIndex}
          completedIds={completedIds}
          tutorialName="levels"
        />

        {/* Main content */}
        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
          <section
            ref={scenarioRef}
            className="min-w-0 scroll-mt-24 overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--card)] shadow-sm"
          >
            {/* Scenario header */}
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

                  {/* Nama modus baru terungkap setelah percakapan selesai */}
                  {dialogue.ending && currentScenario.topic && (
                    <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-[10px] font-bold text-[var(--brand)]">
                      Modus: {currentScenario.topic}
                    </span>
                  )}
                </div>
              </div>

              <h2 className="mt-3 text-xl font-extrabold leading-snug text-[var(--foreground)] md:text-2xl">
                {currentScenario.title}
              </h2>

              {currentScenario.description && (
                <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                  {currentScenario.description}
                </p>
              )}
            </div>

            <div className="p-4 md:p-6">
              {/* WhatsApp mockup */}
              <div
                className="relative mx-auto w-full max-w-[390px]"
                aria-label="Simulasi percakapan WhatsApp pada perangkat iPhone"
              >
                <div className="absolute -left-[7px] top-[18%] z-0 h-5 w-[4px] rounded-l-md bg-[#64748b] shadow-sm" />
                <div className="absolute -left-[7px] top-[25%] z-0 h-8 w-[4px] rounded-l-md bg-[#64748b] shadow-sm" />
                <div className="absolute -left-[7px] top-[34%] z-0 h-8 w-[4px] rounded-l-md bg-[#64748b] shadow-sm" />
                <div className="absolute -right-[7px] top-[27%] z-0 h-14 w-[4px] rounded-r-md bg-[#64748b] shadow-sm" />

                <div className="relative z-10 rounded-[38px] border-[5px] border-[#26364d] bg-[#26364d] p-[4px] shadow-[0_25px_65px_rgba(36,87,166,0.18)] sm:rounded-[43px] sm:border-[6px] sm:p-[5px]">
                  <div className="relative overflow-hidden rounded-[30px] bg-[#efeae2] sm:rounded-[35px]">
                    {/* Status bar */}
                    <div className="relative flex h-10 items-center justify-between bg-[#075e54] px-5 pt-1 text-white">
                      <span className="text-[10px] font-bold">9:41</span>
                      <div className="absolute left-1/2 top-2 h-[19px] w-[75px] -translate-x-1/2 rounded-full bg-[#111827] sm:w-[80px]" />
                      <div className="flex items-center gap-1.5">
                        <Signal size={12} />
                        <Wifi size={12} />
                        <BatteryFull size={14} />
                      </div>
                    </div>

                    {/* WhatsApp header */}
                    <button
                      type="button"
                      data-tutorial="profile"
                      onClick={() => setShowProfile(true)}
                      className="flex w-full items-center gap-3 bg-[#075e54] px-3 py-3 text-left text-white"
                      aria-label="Lihat info kontak"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
                        <MessageCircle size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{sender?.name ?? "Kontak Tidak Dikenal"}</p>
                        <p className="mt-0.5 truncate text-[10px] text-white/70">
                          {dialogue.typing ? "sedang mengetik..." : "ketuk untuk info kontak"}
                        </p>
                      </div>

                      <Video size={18} className="shrink-0 text-white/90" />
                      <Phone size={17} className="shrink-0 text-white/90" />
                      <MoreVertical size={18} className="shrink-0 text-white/90" />
                    </button>

                    {/* Chat */}
                    <div
                      ref={chatRef}
                      data-tutorial="chat"
                      className="h-[400px] space-y-2.5 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4"
                      style={{
                        backgroundImage:
                          "radial-gradient(rgba(0,0,0,0.035) 1px, transparent 1px)",
                        backgroundSize: "14px 14px",
                      }}
                    >
                      <div className="mx-auto w-fit rounded-lg bg-[#fff3c4] px-3 py-1.5 text-center text-[9px] font-medium leading-relaxed text-[#766b4f] shadow-sm">
                        Percakapan simulasi untuk pembelajaran.
                        <br />
                        Bukan percakapan sungguhan.
                      </div>

                      {dialogue.thread.map((bubble) =>
                        bubble.from === "them" ? (
                          <div key={bubble.id} className="flex justify-start">
                            <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 shadow-sm">
                              <p className="whitespace-pre-line text-[12px] leading-[1.65] text-[#303030]">
                                {bubble.text}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div key={bubble.id} className="flex justify-end">
                            <div className="max-w-[88%] rounded-2xl rounded-tr-sm bg-[#d9fdd3] px-3.5 py-2.5 shadow-sm">
                              <p className="text-[12px] leading-[1.65] text-[#303030]">
                                {bubble.text}
                              </p>
                              <div className="mt-0.5 flex justify-end text-[#6b8b7e]">
                                <CheckCheck size={13} />
                              </div>
                            </div>
                          </div>
                        ),
                      )}

                      {dialogue.typing && (
                        <div className="flex justify-start">
                          <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm">
                            <span className="size-1.5 animate-pulse rounded-full bg-[#999]" />
                            <span className="size-1.5 animate-pulse rounded-full bg-[#999] [animation-delay:150ms]" />
                            <span className="size-1.5 animate-pulse rounded-full bg-[#999] [animation-delay:300ms]" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Composer */}
                    <div
                      data-tutorial="choices"
                      className="min-h-[200px] border-t border-[#ddd7cf] bg-[#f0f0f0] p-3 sm:p-4"
                    >
                      {dialogue.phase === "choosing" ? (
                        <>
                          <p className="mb-2.5 px-1 text-[10px] font-bold text-[#626262]">
                            Balas apa?
                          </p>

                          <div className="space-y-2">
                            {dialogue.options.map((option, index) => (
                              <button
                                key={option.id}
                                onClick={() => dialogue.pick(option)}
                                className="group flex w-full items-center gap-3 rounded-xl border border-[#d8e0dc] bg-white p-3 text-left transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
                              >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#e9f0ed] text-[10px] font-extrabold text-[#527366] group-hover:bg-white group-hover:text-[var(--brand)]">
                                  {String.fromCharCode(65 + index)}
                                </span>

                                <span className="flex-1 text-[11px] font-semibold leading-relaxed text-[#303030]">
                                  {option.label}
                                </span>

                                <ArrowRight
                                  size={14}
                                  className="shrink-0 text-[#999] transition group-hover:translate-x-1 group-hover:text-[var(--brand)]"
                                />
                              </button>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="flex h-full min-h-[170px] items-center justify-center">
                          <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3">
                            <LockKeyhole size={15} className="text-[#84918b]" />
                            <p className="text-[10px] text-[#84918b]">
                              {waiting
                                ? "Menunggu balasan..."
                                : dialogue.phase === "ended"
                                  ? "Percakapan selesai"
                                  : "Menyiapkan percakapan..."}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center bg-[#f0f0f0] pb-2.5 pt-1">
                      <div className="h-1 w-20 rounded-full bg-[#17233b]" />
                    </div>

                    {showProfile && profile && (
  <div className="absolute inset-0 z-20 flex flex-col bg-[#f0f2f5]">
    <div className="flex items-center gap-3 bg-[#075e54] px-3 py-3 text-white">
      <button
        type="button"
        onClick={() => setShowProfile(false)}
        aria-label="Tutup info kontak"
        className="flex size-8 items-center justify-center rounded-full bg-white/15"
      >
        <X size={16} />
      </button>
      <p className="text-sm font-bold">Info kontak</p>
    </div>

    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex flex-col items-center text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-[#dfe5e7] text-[#8696a0]">
          <UserRound size={40} />
        </div>
        <p className="mt-3 text-base font-bold text-[#111b21]">{sender?.name}</p>
        <p className="text-xs text-[#667781]">{profile.phone}</p>
        {profile.about && (
          <p className="mt-2 rounded-lg bg-white px-3 py-2 text-xs italic text-[#3b4a54]">
            “{profile.about}”
          </p>
        )}
      </div>

      <ul className="mt-4 space-y-2">
        {profile.items.map((item) => (
          <li key={item.label} className="rounded-xl bg-white p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#667781]">
              {item.label}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-[#111b21]">
              {item.value}
              {reveal && (
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    item.suspicious
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {item.suspicious ? "Janggal" : "Wajar"}
                </span>
              )}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-center text-[10px] leading-relaxed text-[#667781]">
        Info profil hanya petunjuk. Akun asli bisa tampak sederhana, dan akun palsu bisa tampak rapi.
        {!reveal && " Penilaian tiap info baru dibuka setelah percakapan selesai."}
      </p>
    </div>
  </div>
)}
                  </div>
                </div>
              </div>

              <DialogueNotes flags={dialogue.flags} />

              {dialogue.ending && (
                <DialogueResult
                  ending={dialogue.ending}
                  takeaway={currentScenario.takeaway}
                  levelNumber={currentIndex + 1}
                  levelXp={currentLevelXp}
                  isLastLevel={isLastLevel}
                  isSaving={isSavingReward}
                  onNext={handleNext}
                  onRetry={retryLevel}
                />
              )}
            </div>
          </section>

          {/* Learning side panel */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                <Sparkles size={20} />
              </div>

              <h3 className="mt-4 text-sm font-extrabold text-[var(--foreground)]">
                Misi kamu
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                Bertahan sampai akhir percakapan, dan keluar dengan benar.
                Penipu tidak menyerah setelah satu penolakan.
              </p>
            </div>

            <div
              data-tutorial="red-flags"
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert size={17} className="text-[var(--warning)]" />
                <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                  Tanda yang perlu diwaspadai
                </h3>
              </div>

              <ul className="mt-3 space-y-3">
                {[
                  "Meminta biaya di muka untuk pekerjaan, hadiah, atau penarikan dana.",
                  "Mendesak dengan hitung mundur atau ancaman.",
                  "Meminta kode OTP atau menyuruh memasang file .apk.",
                  "Melarangmu menelepon, mengecek, atau memberi tahu orang lain.",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-xs leading-relaxed text-[var(--muted)]"
                  >
                    <AlertTriangle
                      size={13}
                      className="mt-0.5 shrink-0 text-[var(--warning)]"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={17} className="text-[var(--accent)]" />
                <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                  Prinsip aman
                </h3>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
                Berhenti sejenak, periksa lewat jalur lain yang kamu percaya,
                dan jangan ikuti tekanan.
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--brand-dark)] p-5 text-white">
              <p className="text-[10px] font-extrabold tracking-[0.15em] text-white/60">
                PROGRESS
              </p>

              <p className="mt-2 text-3xl font-extrabold">
                {Math.round(progress)}%
              </p>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="mt-3 text-xs text-white/70">
                {completedIds.length} dari {totalCount} level telah kamu
                selesaikan.
              </p>

              <div className="mt-4 border-t border-white/15 pt-3">
                <p className="text-[10px] font-extrabold tracking-[0.15em] text-white/60">
                  POTENSI XP
                </p>
                <p className="mt-1 text-lg font-extrabold">
                  {potentialXp}
                  <span className="text-xs font-bold text-white/60">
                    /{TRUST_LAB_MAX_XP}
                  </span>
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-white/60">
                  Level tinggi bernilai lebih besar. Setiap langkah keliru
                  mengurangi XP level itu. Selesaikan Level {totalCount} untuk
                  bonus {TRUST_LAB_MASTER_BONUS} XP dan badge Si Kebal Tipu.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <LoginGate
        open={gate.open}
        earnedXp={earnedLevelXp}
        onAuthenticated={gate.onAuthenticated}
        onContinue={gate.onContinue}
      />

      <TrustLabTutorial
        active={tutorialActive}
        answerCount={dialogue.path.length}
        ended={dialogue.phase === "ended"}
        onClose={closeTutorial}
      />
    </main>
  );
}