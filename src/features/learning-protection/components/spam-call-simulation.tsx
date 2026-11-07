"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CircleStar,
  Clock3,
  HelpCircle,
  LockKeyhole,
  PhoneCall,
  PhoneIncoming,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Mic,
  Grid3X3,
  UserPlus,
  Pause,
  Bluetooth,
  Signal,
  Wifi,
  BatteryFull,
  UserRound,
  Volume2,
  Video,
  Lock,
} from "lucide-react";
import type {
  DialogueEnding,
  SimulationConfig,
  SimulationScenario,
} from "@/types/learning-protection";
import { SpamCallTutorial, SPAM_CALL_TUTORIAL_KEY } from "./spam-call-tutorial";
import {
  DIFFICULTY_STYLES,
  DialogueNotes,
  DialogueResult,
  LevelMap,
  MasterReward,
} from "./dialogue-parts";
import {
  SPAM_CALL_MASTER_BONUS,
  SPAM_CALL_MAX_XP,
  calculateSpamCallXp,
  spamCallLevelXp,
} from "@/lib/learning-protection/xp";
import { mistakesOfPaths } from "@/lib/learning-protection/dialogue";
import { useDialogue } from "@/lib/learning-protection/use-dialogue";
import { useLearningProgress } from "@/lib/learning-protection/use-learning-progress";
import { useLoginGate } from "@/lib/learning-protection/use-login-gate";
import { LoginGate } from "./login-gate";

type Props = {
  simulation: SimulationConfig;
};

const SIMULATION_ID = "spam-call";

export function SpamCallSimulation({ simulation }: Props) {
  const scenarios = simulation.scenarios;
  const totalCount = scenarios.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [attempts, setAttempts] = useState<Record<string, string[][]>>({});
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [safeIds, setSafeIds] = useState<string[]>([]);
  const [attemptKey, setAttemptKey] = useState(0);
  const [runSeed, setRunSeed] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  const [isSavingReward, setIsSavingReward] = useState(false);
  const [rewardMessage, setRewardMessage] = useState("");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [declinedLogin, setDeclinedLogin] = useState(false);

  const [tutorialActive, setTutorialActive] = useState(false);
  const tutorialSnapshot = useRef<{
    currentIndex: number;
    completedIds: string[];
    attempts: Record<string, string[][]>;
  } | null>(null);
  const tutorialStorageKey = useRef(`${SPAM_CALL_TUTORIAL_KEY}:guest`);

  const scenarioRef = useRef<HTMLElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

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
    enabled: answered,
    startKey: attemptKey,
    shuffleSeed: `${currentScenario?.id}:${attemptNumber}:${runSeed}`,
    instant: tutorialActive || reduceMotion,
    onFinish: handleFinish,
  });

  /* ---------- XP ---------- */

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
    spamCallLevelXp(index + 1, mistakesOf(scenario)),
  );

  const earnedLevelXp = scenarios.reduce(
    (sum, scenario, index) =>
      completedIds.includes(scenario.id) ? sum + levelXpList[index] : sum,
    0,
  );

  const potentialXp =
    levelXpList.reduce((sum, xp) => sum + xp, 0) + SPAM_CALL_MASTER_BONUS;

  const currentLevelXp = levelXpList[currentIndex] ?? 0;
  const progress = totalCount ? (completedIds.length / totalCount) * 100 : 0;
  const isLastLevel = currentIndex >= totalCount - 1;

  /* ---------- Tutorial ---------- */

  const startTutorial = () => {
    tutorialSnapshot.current = { currentIndex, completedIds, attempts };
    setCurrentIndex(0);
    setCompletedIds([]);
    setAttempts({});
    setAnswered(false);
    setAttemptKey((previous) => previous + 1);
    setTutorialActive(true);
  };

  const closeTutorial = (completed: boolean) => {
    const snapshot = tutorialSnapshot.current;
    if (snapshot) {
      setCurrentIndex(snapshot.currentIndex);
      setCompletedIds(snapshot.completedIds);
      setAttempts(snapshot.attempts);
    }
    setAnswered(false);
    setAttemptKey((previous) => previous + 1);
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
      !answered &&
      completedIds.length === 0 &&
      Object.keys(attempts).length === 0,
  };

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
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

      tutorialStorageKey.current = `${SPAM_CALL_TUTORIAL_KEY}:${userId}`;

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
        <PhoneCall className="mx-auto mb-4 h-10 w-10 text-[var(--muted)]" />
        <h1 className="heading heading-2">Skenario belum tersedia</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Konten Spam Call sedang disiapkan.
        </p>
        <Link href="/learning-protection" className="button button-primary mt-6">
          Kembali ke Learning &amp; Protection
        </Link>
      </main>
    );
  }

  /* ---------- Aksi ---------- */

  const scrollToScenario = () => {
    requestAnimationFrame(() => {
      scenarioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const retryLevel = () => {
    setAnswered(false);
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
      const maxXp: number = result.maxXp ?? SPAM_CALL_MAX_XP;

      if (result.xpEarned > 0) {
        setRewardMessage(
          scoreXp >= maxXp
            ? `Sempurna! Kamu mendapatkan ${result.xpEarned} XP dari Spam Call.`
            : `Kamu mendapatkan ${result.xpEarned} XP (skor ${scoreXp}/${maxXp}). Ulangi tanpa salah untuk XP maksimal.`,
        );
      } else if ((result.bestXp ?? 0) >= maxXp) {
        setRewardMessage("Kamu sudah meraih XP maksimal di Spam Call.");
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

  const handleNext = async () => {
    if (isSavingReward || dialogue.ending?.result !== "win") return;

    if (!isLastLevel) {
      setAnswered(false);
      setCurrentIndex((previous) => previous + 1);
      scrollToScenario();
      return;
    }

    if (tutorialActive) {
      setAnswered(false);
      setAttemptKey((previous) => previous + 1);
      return;
    }

    await saveSimulationCompletion();
    setFinished(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const learning = useLearningProgress({
    simulationId: SIMULATION_ID,
    scenarioIds: scenarios.map((scenario) => scenario.id),
    attemptsShape: "dialogue",
    paused: tutorialActive,
    snapshot: { currentIndex, completedIds, safeIds, attempts, runSeed, finished, rewardMessage, declinedLogin },
    onRestore: (saved) => {
      setCurrentIndex(saved.currentIndex);
      setCompletedIds(saved.completedIds);
      setSafeIds(saved.safeIds ?? []);
      setAttempts(saved.attempts as Record<string, string[][]>);
      setRunSeed(saved.runSeed);
      setFinished(Boolean(saved.finished));
      setRewardMessage(saved.rewardMessage ?? "");
      setDeclinedLogin(Boolean(saved.declinedLogin));
      setAnswered(false);
    },
  });

  function goNextLevel() {
    setAnswered(false);
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

  const restart = () => {
    setCurrentIndex(0);
    setAttempts({});
    setCompletedIds([]);
    setAnswered(false);
    setRunSeed((previous) => previous + 1);
    setAttemptKey((previous) => previous + 1);
    setFinished(false);
    setRewardMessage("");
    scrollToScenario();
  };

  /* ---------- Layar reward ---------- */

  if (finished) {
    const wrongCounts = scenarios.map((scenario) => mistakesOf(scenario));
    const finalXp = calculateSpamCallXp(wrongCounts);
    const totalMistakes = wrongCounts.reduce((sum, wrong) => sum + wrong, 0);
    const cleanCount = scenarios.filter(
      (scenario, index) =>
        completedIds.includes(scenario.id) && wrongCounts[index] === 0,
    ).length;

    return (
      <MasterReward
        badgeName="Call Shield"
        intro={`Kamu menamatkan ${totalCount} panggilan, dari rekaman otomatis sampai video call deepfake dan penipuan pemulihan dana. Kamu kini lebih siap menghadapi telepon penipu.`}
        totalCount={totalCount}
        completedCount={completedIds.length}
        cleanCount={cleanCount}
        xp={finalXp}
        maxXp={SPAM_CALL_MAX_XP}
        totalMistakes={totalMistakes}
        principle="Penelepon yang menghubungimu lebih dulu tidak terbukti siapa pun. Nomor, nama, bahkan data yang benar bisa dipalsukan. Tutup, lalu hubungi lembaga itu lewat kanal resmi yang kamu cari sendiri."
        tips={[
          "Penelepon penipu menyuruhmu tetap di telepon. Menutupnya adalah langkah terkuat.",
          "Bank, polisi, pajak, dan operator tidak pernah meminta OTP, PIN, atau memindahkan uangmu.",
          "Larangan memberi tahu keluarga atau mengecek ke kantor resmi adalah tanda penipuan.",
          "Untuk uang, selalu verifikasi lewat jalur lain, bahkan bila wajah dan suaranya meyakinkan.",
        ]}
        rewardMessage={rewardMessage}
        onRestart={restart}
      />
    );
  }

  /* ---------- Tampilan utama ---------- */

  const sender = currentScenario.sender;
  const waiting = dialogue.phase === "revealing";

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

        <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="badge">
              <PhoneCall size={14} />
              SCAM CALL
            </div>

            <h1 className="heading heading-2 mt-4">
              Telepon dari nomor asing? Jangan langsung percaya.
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

        <div
          data-tutorial="progress"
          className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-[var(--foreground)]">Perjalananmu</span>
            <div className="flex items-center gap-3 text-xs font-semibold tabular-nums text-[var(--muted)]">
              <span>
                {completedIds.length} dari {totalCount} level selesai
              </span>
              <span className="rounded-md bg-[var(--accent-soft)] px-2.5 py-1 font-extrabold text-[var(--accent)]">
                Potensi XP {potentialXp}/{SPAM_CALL_MAX_XP}
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

        <LevelMap
          scenarios={scenarios}
          currentIndex={currentIndex}
          completedIds={completedIds}
          tutorialName="levels"
        />

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
              {/* iPhone Mockup */}
              <div
                className="relative mx-auto w-full min-w-0 max-w-[390px]"
                aria-label="Simulasi panggilan telepon pada perangkat iPhone"
              >
                {/* iPhone Side Buttons */}
                <div className="absolute -left-[7px] top-[18%] z-0 h-5 w-[4px] rounded-l-md bg-[#64748b] shadow-sm" />
                <div className="absolute -left-[7px] top-[25%] z-0 h-8 w-[4px] rounded-l-md bg-[#64748b] shadow-sm" />
                <div className="absolute -left-[7px] top-[34%] z-0 h-8 w-[4px] rounded-l-md bg-[#64748b] shadow-sm" />
                <div className="absolute -right-[7px] top-[27%] z-0 h-14 w-[4px] rounded-r-md bg-[#64748b] shadow-sm" />

                {/* iPhone Frame */}
                <div className="relative z-10 rounded-[38px] border-[5px] border-[#26364d] bg-[#26364d] p-[4px] shadow-[0_25px_65px_rgba(36,87,166,0.18)] sm:rounded-[43px] sm:border-[6px] sm:p-[5px]">
                  <div className="relative overflow-hidden rounded-[30px] bg-white sm:rounded-[35px]">

                    {/* Status Bar */}
                    <div className="relative flex h-10 items-center justify-between bg-white px-5 pt-1 text-[#202124]">
                      <span className="text-[10px] font-bold">9:41</span>

                      <div className="absolute left-1/2 top-2 h-[19px] w-[75px] -translate-x-1/2 rounded-full bg-[#111827] sm:w-[80px]" />

                      <div className="flex items-center gap-1.5">
                        <Signal size={12} />
                        <Wifi size={12} />
                        <BatteryFull size={14} />
                      </div>
                    </div>

                    {!answered ? (
                      /* ==========================================
                        INCOMING CALL
                      ========================================== */
                      <div className="relative flex min-h-[560px] flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-[#f8fafc] via-white to-[#eef2f7] px-5 py-8 text-center text-[#202124] sm:min-h-[620px] sm:px-7 sm:py-10">

                        {/* Incoming Header */}
                        <div className="relative z-10">
                          <div className="flex items-center justify-center gap-2 text-[#8a8f98]">
                            <PhoneIncoming size={13} />
                            <p className="text-[11px] font-semibold tracking-wide">
                              Panggilan Masuk
                            </p>
                          </div>

                          <h3 className="mt-7 text-2xl font-semibold tracking-tight">
                            {sender?.name ?? "Tidak Dikenal"}
                          </h3>

                          <p className="mt-2 text-xs text-[#8a8f98]">
                            {sender?.status ?? "Nomor tidak dikenal"}
                          </p>
                        </div>

                        {/* Caller Avatar */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div className="relative flex size-32 items-center justify-center rounded-full border border-[#e5e7eb] bg-white shadow-lg shadow-black/5">
                            <UserRound
                              size={58}
                              strokeWidth={1.3}
                              className="text-[#64748b]"
                            />
                          </div>

                          <p className="mt-5 text-[10px] font-medium tracking-wider text-[#a1a1aa]">
                            PANGGILAN SIMULASI
                          </p>
                        </div>

                        {/* Incoming Call Actions */}
                        <div className="relative z-10 w-full">
                          <div className="mb-8 flex items-center justify-center gap-2 text-[10px] text-[#9298a2]">
                            <PhoneIncoming size={13} />
                            Kamu sedang menerima panggilan dari nomor tidak dikenal.
                          </div>

                          <button
                            type="button"
                            data-tutorial="answer"
                            onClick={() => setAnswered(true)}
                            className="mx-auto flex w-full max-w-[230px] items-center justify-center gap-3 rounded-full bg-[#22c55e] py-4 text-sm font-bold text-white shadow-lg shadow-green-900/10 transition hover:bg-[#16a34a] active:scale-95"
                          >
                            <PhoneCall size={19} />
                            Angkat Panggilan
                          </button>

                          <p className="mt-5 text-[10px] leading-relaxed text-[#a1a1aa]">
                            Menolak panggilan dari nomor asing juga merupakan pilihan
                            yang aman. Dalam simulasi ini, kamu berlatih jika sudah
                            terlanjur mengangkatnya.
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* ==========================================
                        ACTIVE CALL
                      ========================================== */
                      <div className="flex h-full min-h-0 flex-col bg-gradient-to-b from-white to-slate-50">

                        {/* Call Information */}
                        <div className="shrink-0 px-4 pt-5 pb-3 sm:px-6">
                          <div className="flex items-center justify-center gap-2 text-[#16a34a]">
                            <span className="size-1.5 animate-pulse rounded-full bg-[#22c55e]" />
                            <span className="text-[10px] font-semibold tracking-wide">
                              {dialogue.phase === "ended"
                                ? "Panggilan Berakhir"
                                : "Panggilan Berlangsung"}
                            </span>
                          </div>

                          <h3 className="mt-3 truncate text-xl font-semibold">
                            {sender?.name ?? "Tidak Dikenal"}
                          </h3>

                          <p className="mt-1 text-[10px] text-[#9298a2]">
                            {sender?.status ?? "Nomor tidak dikenal"}
                          </p>
                        </div>

                        {/* Caller Avatar */}
                        <div className="flex shrink-0 flex-col items-center py-4">
                          <div className="flex size-[92px] items-center justify-center rounded-full border border-[#e5e7eb] bg-white shadow-md shadow-black/5">
                            <UserRound
                              size={43}
                              strokeWidth={1.3}
                              className="text-[#64748b]"
                            />
                          </div>

                          <p className="mt-3 text-[9px] font-medium tracking-[0.18em] text-[#a1a1aa]">
                            {dialogue.typing
                              ? "PENELEPON SEDANG BICARA"
                              : dialogue.phase === "ended"
                                ? "SELESAI"
                                : "TERHUBUNG"}
                          </p>
                        </div>

                        {/* Call Controls */}
                        <div className="mx-auto grid w-full max-w-[290px] grid-cols-3 gap-x-5 gap-y-4 px-5 py-3">
                          {[
                            { icon: Mic, label: "Bisukan" },
                            { icon: Grid3X3, label: "Keypad" },
                            { icon: Volume2, label: "Speaker" },
                            { icon: UserPlus, label: "Tambah" },
                            { icon: Pause, label: "Tahan" },
                            { icon: Video, label: "FaceTime" },
                          ].map(({ icon: Icon, label }) => (
                            <div
                              key={label}
                              className="flex flex-col items-center gap-1.5"
                            >
                              <div className="flex size-[48px] items-center justify-center rounded-full border border-[#e5e7eb] bg-white text-[#475569] shadow-sm">
                                <Icon size={19} strokeWidth={1.7} />
                              </div>

                              <span className="text-[9px] font-medium text-[#8a8f98]">
                                {label}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Call Transcript */}
                        <div
                          ref={chatRef}
                          data-tutorial="chat"
                          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-6"
                        >
                          <div className="mx-auto mb-2 w-fit rounded-lg bg-[#fff3c4] px-3 py-1.5 text-center text-[9px] leading-relaxed text-[#766b4f]">
                            Transkrip percakapan simulasi.
                            <br />
                            Ucapan ditampilkan dalam bentuk teks.
                          </div>

                          {dialogue.thread.map((bubble) => (
                            <div
                              key={bubble.id}
                              className={`flex ${
                                bubble.from === "them" ? "justify-start" : "justify-end"
                              }`}
                            >
                              <div
                                className={`max-w-[90%] rounded-xl m-1 px-3 py-2 ${
                                  bubble.from === "them"
                                    ? "rounded-tl-sm border border-[#e5e7eb] bg-white shadow-sm"
                                    : "rounded-tr-sm bg-[#dbeafe]"
                                }`}
                              >
                                <p
                                  className={`mb-1 text-[9px] font-bold ${
                                    bubble.from === "them"
                                      ? "text-[#64748b]"
                                      : "text-[#2563eb]"
                                  }`}
                                >
                                  {bubble.from === "them"
                                    ? sender?.name ?? "Penelepon"
                                    : "Kamu"}
                                </p>

                                <p className="whitespace-pre-line text-[11px] leading-relaxed text-[#303030]">
                                  {bubble.text}
                                </p>
                              </div>
                            </div>
                          ))}

                          {dialogue.typing && (
                            <div className="flex justify-start">
                              <div className="flex items-center gap-1 rounded-xl border border-[#e5e7eb] bg-white px-3 py-2.5">
                                <span className="size-1.5 animate-pulse rounded-full bg-[#999]" />
                                <span className="size-1.5 animate-pulse rounded-full bg-[#999] [animation-delay:150ms]" />
                                <span className="size-1.5 animate-pulse rounded-full bg-[#999] [animation-delay:300ms]" />
                              </div>
                            </div>
                          )}

                          {dialogue.phase === "ended" && (
                            <p className="mx-auto mt-3 w-fit rounded-lg bg-[#e5e7eb] px-3 py-1.5 text-[9px] text-[#64748b]">
                              Percakapan telah selesai.
                            </p>
                          )}
                        </div>

                        {/* Dialogue Choices */}
                        {dialogue.phase === "choosing" && (
                          <div
                            data-tutorial="choices"
                            className="shrink-0 border-t border-slate-200 bg-white p-3 sm:p-4"
                          >
                            <p className="mb-3 text-sm font-semibold text-slate-700">
                              Apa yang akan kamu katakan?
                            </p>

                            <div className="flex max-h-[180px] flex-col gap-2 overflow-y-auto overscroll-contain">
                              {dialogue.options.map((option) => (
                                <button
                                  key={option.id}
                                  type="button"
                                  onClick={() => dialogue.pick(option)}
                                  disabled={waiting}
                                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left font-medium leading-relaxed text-slate-700 transition hover:border-green-500 hover:bg-green-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
                                >
                                  <span className="text-xs">{option.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* iPhone Home Indicator */}
                    <div className="flex justify-center bg-white pb-2.5 pt-2">
                      <div className="h-1 w-20 rounded-full bg-[#26364d]" />
                    </div>
                  </div>
                </div>
              </div>

              {answered && <DialogueNotes flags={dialogue.flags} />}

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

          <aside className="space-y-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                <Sparkles size={20} />
              </div>

              <h3 className="mt-4 text-sm font-extrabold text-[var(--foreground)]">Misi kamu</h3>

              <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                Bertahan sampai panggilan berakhir, dan akhiri dengan benar. Penelepon penipu tidak
                menyerah setelah satu penolakan.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex items-center gap-2">
                <ShieldAlert size={17} className="text-[var(--warning)]" />
                <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                  Tanda yang perlu diwaspadai
                </h3>
              </div>

              <ul className="mt-3 space-y-3">
                {[
                  "Mengancam: blokir, denda, penangkapan, atau listrik diputus.",
                  "Meminta OTP, PIN, atau pemasangan aplikasi.",
                  "Menyuruhmu tetap di telepon dan merahasiakannya.",
                  "Menyebut datamu dengan benar sebagai “bukti”.",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-xs leading-relaxed text-[var(--muted)]"
                  >
                    <AlertTriangle size={13} className="mt-0.5 shrink-0 text-[var(--warning)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={17} className="text-[var(--accent)]" />
                <h3 className="text-sm font-extrabold text-[var(--foreground)]">Prinsip aman</h3>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
                Tutup telepon, lalu hubungi lembaga itu lewat aplikasi atau nomor resmi yang kamu
                cari sendiri.
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--brand-dark)] p-5 text-white">
              <p className="text-[10px] font-extrabold tracking-[0.15em] text-white/60">PROGRESS</p>
              <p className="mt-2 text-3xl font-extrabold">{Math.round(progress)}%</p>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="mt-3 text-xs text-white/70">
                {completedIds.length} dari {totalCount} level telah kamu selesaikan.
              </p>

              <p className="mt-3 border-t border-white/15 pt-3 text-[11px] leading-relaxed text-white/60">
                Potensi XP {potentialXp}/{SPAM_CALL_MAX_XP}. Setiap langkah keliru mengurangi XP level
                itu. Selesaikan Level {totalCount} untuk bonus {SPAM_CALL_MASTER_BONUS} XP dan
                lencana Call Shield.
              </p>
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

      <SpamCallTutorial
        active={tutorialActive}
        answered={answered}
        answerCount={dialogue.path.length}
        ended={dialogue.phase === "ended"}
        onClose={closeTutorial}
      />
    </main>
  );
}