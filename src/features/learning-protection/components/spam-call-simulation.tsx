"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  CheckCircle2,
  Clock3,
  Crown,
  HelpCircle,
  Info,
  Lightbulb,
  Lock,
  Phone,
  PhoneCall,
  PhoneOff,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  UserRound,
  Video,
  Volume2,
  X,
} from "lucide-react";

import type {
  ScenarioDifficulty,
  SimulationChoice,
  SimulationConfig,
  SimulationScenario,
} from "@/types/learning-protection";
import {
  SpamCallTutorial,
  SPAM_CALL_TUTORIAL_KEY,
  type CallTutorialView,
} from "./spam-call-tutorial";
import {
  SPAM_CALL_MASTER_BONUS,
  SPAM_CALL_MAX_XP,
  calculateSpamCallXp,
  spamCallLevelXp,
} from "@/lib/learning-protection/xp";
import { seededShuffle } from "@/lib/learning-protection/shuffle";

type Props = {
  simulation: SimulationConfig;
};

const SIMULATION_ID = "spam-call";

const DIFFICULTY_STYLES: Record<ScenarioDifficulty, string> = {
  Mudah: "bg-[var(--accent-soft)] text-[var(--accent)]",
  Menengah: "bg-[var(--brand-soft)] text-[var(--brand)]",
  Sulit: "bg-[var(--warning)]/15 text-[var(--warning)]",
  Ahli: "bg-[var(--danger)]/10 text-[var(--danger)]",
};

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

function scrollIntoViewSafe(element: HTMLElement | null) {
  if (!element) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  element.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  });
}

export function SpamCallSimulation({ simulation }: Props) {
  const scenarios = simulation.scenarios;
  const totalCount = scenarios.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [callState, setCallState] = useState<"ringing" | "talking">("ringing");
  const [declined, setDeclined] = useState(false);
  const [selectedChoice, setSelectedChoice] =
    useState<SimulationChoice | null>(null);
  // Riwayat pilihan per level, berisi id pilihan berurutan (termasuk percobaan gagal).
  const [attempts, setAttempts] = useState<Record<string, string[]>>({});
  // Level yang sudah selesai (dijawab aman).
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  // Level yang langsung dijawab aman pada percobaan pertama.
  const [safeIds, setSafeIds] = useState<string[]>([]);
  const [runSeed, setRunSeed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showLearningModal, setShowLearningModal] = useState(false);
  const [modalShake, setModalShake] = useState(false);
  const [rewardMessage, setRewardMessage] = useState("");
  const [isSavingReward, setIsSavingReward] = useState(false);

  const [tutorialActive, setTutorialActive] = useState(false);
  const tutorialSnapshot = useRef<{
    currentIndex: number;
    completedIds: string[];
    safeIds: string[];
    attempts: Record<string, string[]>;
  } | null>(null);
  // Kunci localStorage per akun (atau "guest") agar tutorial tidak berulang.
  const tutorialStorageKey = useRef(`${SPAM_CALL_TUTORIAL_KEY}:guest`);

  const scenarioRef = useRef<HTMLElement>(null);
  const resultRef = useRef<HTMLElement>(null);

  const currentScenario = scenarios[currentIndex];

  // Tampilan di dalam layar ponsel.
  const view: CallTutorialView = selectedChoice
    ? "result"
    : declined
      ? "declined"
      : callState;

  /* ---------- Hitungan level & XP ---------- */

  const wrongCountOf = (scenario: SimulationScenario) =>
    (attempts[scenario.id] ?? []).filter(
      (choiceId) =>
        !scenario.choices.find((choice) => choice.id === choiceId)?.isSafe,
    ).length;

  // XP tiap level berdasarkan jumlah jawaban salah sejauh ini.
  const levelXpList = scenarios.map((scenario, index) =>
    spamCallLevelXp(index + 1, wrongCountOf(scenario)),
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

  // Urutan pilihan diacak; berubah setiap kali level diulang.
  const attemptNumber = currentScenario
    ? (attempts[currentScenario.id]?.length ?? 0)
    : 0;

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

  const callerName = currentScenario?.sender?.name ?? "Nomor Tidak Dikenal";
  const callerNumber =
    currentScenario?.sender?.status ??
    `+62 800-0000-${String(currentIndex + 1).padStart(4, "0")}`;
  const isVideoCall = /video/i.test(callerNumber);

  const dialogueLines = currentScenario?.messages?.length
    ? currentScenario.messages
    : [currentScenario?.context ?? ""];

  /* ---------- Tutorial ---------- */

  const startTutorial = () => {
    tutorialSnapshot.current = {
      currentIndex,
      completedIds,
      safeIds,
      attempts,
    };
    setCurrentIndex(0);
    setCompletedIds([]);
    setSafeIds([]);
    setAttempts({});
    setSelectedChoice(null);
    setDeclined(false);
    setCallState("ringing");
    setShowLearningModal(false);
    setTutorialActive(true);
  };

  const closeTutorial = (completed: boolean) => {
    // Kembalikan progres asli seperti sebelum tutorial.
    const snapshot = tutorialSnapshot.current;
    if (snapshot) {
      setCurrentIndex(snapshot.currentIndex);
      setCompletedIds(snapshot.completedIds);
      setSafeIds(snapshot.safeIds);
      setAttempts(snapshot.attempts);
    }
    setSelectedChoice(null);
    setDeclined(false);
    setCallState("ringing");
    setShowLearningModal(false);
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
      !selectedChoice &&
      callState === "ringing" &&
      Object.keys(attempts).length === 0,
  };

  /**
   * Tutorial otomatis hanya untuk:
   * - pengunjung baru / tamu yang belum pernah melihatnya,
   * - user login yang BELUM menyelesaikan simulasi ini.
   * User yang sudah menyelesaikannya tidak diganggu
   * (tombol "Tutorial" tetap bisa dipakai kapan saja).
   */
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

  /* ---------- Efek scroll & modal ---------- */

  // Tampilkan hasil jawaban (kecuali saat tutorial, yang mengatur scroll sendiri).
  useEffect(() => {
    if (!selectedChoice || tutorialActive) return;

    const frameId = window.requestAnimationFrame(() =>
      scrollIntoViewSafe(scenarioRef.current),
    );

    return () => window.cancelAnimationFrame(frameId);
  }, [selectedChoice, tutorialActive]);

  // Kembali ke simulasi saat berganti level.
  useEffect(() => {
    if (currentIndex === 0 || finished || tutorialActive) return;

    const frameId = window.requestAnimationFrame(() =>
      scrollIntoViewSafe(scenarioRef.current),
    );

    return () => window.cancelAnimationFrame(frameId);
  }, [currentIndex, finished, tutorialActive]);

  useEffect(() => {
    if (!finished) return;

    const frameId = window.requestAnimationFrame(() =>
      scrollIntoViewSafe(resultRef.current),
    );

    return () => window.cancelAnimationFrame(frameId);
  }, [finished]);

  // Kunci scroll halaman selama modal penjelasan terbuka.
  useEffect(() => {
    if (!showLearningModal) return;

    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [showLearningModal]);

  /* ---------- Aksi ---------- */

  async function saveSimulationCompletion() {
    try {
      const response = await fetch("/api/learning-protection/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          simulationId: SIMULATION_ID,
          answers: attempts,
        }),
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
            ? `Sempurna! Kamu mendapatkan ${result.xpEarned} XP dari Scam Call.`
            : `Kamu mendapatkan ${result.xpEarned} XP (skor ${scoreXp}/${maxXp}). Ulangi simulasi tanpa salah untuk meraih XP maksimal.`,
        );
      } else if ((result.bestXp ?? 0) >= maxXp) {
        setRewardMessage("Kamu sudah meraih XP maksimal di Scam Call.");
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
  }

  function handleAnswerCall() {
    setDeclined(false);
    setCallState("talking");
  }

  // Menolak panggilan itu aman, tetapi tidak menyelesaikan level (agar tetap berlatih).
  function handleDeclineCall() {
    if (selectedChoice) return;

    setDeclined(true);
  }

  function handleListenAnyway() {
    setDeclined(false);
    setCallState("talking");
  }

  function handleChoice(choice: SimulationChoice) {
    if (selectedChoice) return;

    const scenarioId = currentScenario.id;
    const isFirstTry = (attempts[scenarioId] ?? []).length === 0;

    setSelectedChoice(choice);

    setAttempts((previous) => ({
      ...previous,
      [scenarioId]: [...(previous[scenarioId] ?? []), choice.id],
    }));

    // Level hanya selesai jika jawabannya aman.
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
  }

  // Salah menjawab: ulangi level yang sama dengan urutan pilihan baru.
  function retryLevel() {
    setSelectedChoice(null);
    setShowLearningModal(false);
    setCallState("talking");
  }

  // Klik di luar modal tidak menutupnya, hanya menggoyangkan modal.
  function handleModalBackdropClick() {
    setModalShake(true);
  }

  async function handleNext() {
    if (!selectedChoice || isSavingReward) return;

    setShowLearningModal(false);

    // Jawaban kurang aman: level belum selesai, ulangi.
    if (!selectedChoice.isSafe) {
      retryLevel();
      return;
    }

    if (currentIndex < totalCount - 1) {
      setCurrentIndex((previous) => previous + 1);
      setSelectedChoice(null);
      setDeclined(false);
      setCallState("ringing");
      return;
    }

    // Saat tutorial: tidak membuka hasil dan tidak menyimpan XP.
    if (tutorialActive) {
      setSelectedChoice(null);
      setCallState("ringing");
      return;
    }

    setIsSavingReward(true);
    await saveSimulationCompletion();
    setIsSavingReward(false);
    setFinished(true);
  }

  function handleRestart() {
    setCurrentIndex(0);
    setCallState("ringing");
    setDeclined(false);
    setSelectedChoice(null);
    setAttempts({});
    setCompletedIds([]);
    setSafeIds([]);
    setRunSeed((previous) => previous + 1);
    setFinished(false);
    setShowLearningModal(false);
    setRewardMessage("");
    setIsSavingReward(false);
  }

  if (!totalCount || !currentScenario) {
    return (
      <main className="container py-16 text-center">
        <PhoneCall className="mx-auto mb-4 h-10 w-10 text-[var(--muted)]" />
        <h1 className="heading heading-2">Skenario belum tersedia</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Konten Scam Call sedang disiapkan.
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

  /* ========================================
     LAYAR REWARD: LEVEL MAKSIMAL
  ======================================== */

  if (finished) {
    const wrongCounts = scenarios.map((scenario) => wrongCountOf(scenario));
    const finalXp = calculateSpamCallXp(wrongCounts);
    const totalWrong = wrongCounts.reduce((sum, wrong) => sum + wrong, 0);
    const isPerfect = totalWrong === 0;

    return (
      <main
        ref={resultRef}
        className="container scroll-mt-24 py-10 md:py-16"
      >
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
                {isPerfect ? "Perfect Call Guardian!" : "Selamat, Call Guardian!"}
              </h1>

              <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/80">
                Kamu menamatkan seluruh {totalCount} level, dari rekaman
                otomatis sampai video call deepfake dan penipuan pemulihan
                dana. Kamu kini lebih siap menghadapi panggilan mencurigakan.
              </p>

              <div className="relative mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-yellow-300 px-4 py-2 text-xs font-extrabold text-[var(--brand-dark)]">
                <Trophy size={16} />
                Lencana Call Guardian
                {isPerfect && <Star size={14} className="fill-current" />}
              </div>
            </div>

            <div className="p-6 md:p-9">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-[var(--surface)] p-5 text-center">
                  <p className="text-3xl font-extrabold text-[var(--brand)]">
                    {completedIds.length}/{totalCount}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                    Level selesai
                  </p>
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
                    <span className="text-base font-bold text-[var(--muted)]">
                      /{SPAM_CALL_MAX_XP}
                    </span>
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                    Total XP
                  </p>
                </div>
              </div>

              {/* Rincian reward */}
              <div className="mt-5 rounded-2xl border border-[var(--border)] p-5">
                <h2 className="text-sm font-extrabold text-[var(--foreground)]">
                  Rincian reward
                </h2>

                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex items-center justify-between text-[var(--muted)]">
                    <span>XP dari {totalCount} level</span>
                    <span className="font-bold text-[var(--foreground)]">
                      +{finalXp.levelXp} XP
                    </span>
                  </li>
                  <li className="flex items-center justify-between text-[var(--muted)]">
                    <span className="flex items-center gap-2">
                      <Crown size={14} className="text-[var(--warning)]" />
                      Bonus Call Guardian
                    </span>
                    <span className="font-bold text-[var(--accent)]">
                      +{finalXp.bonus} XP
                    </span>
                  </li>
                </ul>

                <p className="mt-3 border-t border-[var(--border)] pt-3 text-xs leading-relaxed text-[var(--muted)]">
                  {isPerfect
                    ? "Tanpa satu pun jawaban kurang aman. Luar biasa!"
                    : `Kamu sempat ${totalWrong} kali memilih respons kurang aman. Ulangi simulasi tanpa salah untuk meraih XP maksimal (${SPAM_CALL_MAX_XP} XP).`}
                </p>
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[var(--border)] p-5">
                <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]" />
                <div>
                  <h2 className="text-sm font-bold text-[var(--foreground)]">
                    Hal penting yang perlu diingat
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                    Jangan pernah memberikan OTP, PIN, kata sandi, atau data
                    pribadi lewat telepon. Nomor, nama, suara, wajah, bahkan
                    data yang benar tidak membuktikan identitas penelepon. Tutup
                    panggilan lalu hubungi lembaga lewat kanal resmi yang kamu
                    cari sendiri.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-[var(--brand-soft)] p-5">
                <div className="flex items-center gap-2 text-[var(--brand)]">
                  <ShieldCheck size={17} />
                  <h3 className="text-sm font-extrabold">
                    Sebelum menjawab telepon asing
                  </h3>
                </div>

                <ul className="mt-3 space-y-2 text-xs leading-relaxed text-[var(--brand-dark)]">
                  <li className="flex gap-2">
                    <Check size={14} className="mt-0.5 shrink-0" />
                    Kamu boleh tidak menjawab, dan boleh menutup kapan saja.
                  </li>
                  <li className="flex gap-2">
                    <Check size={14} className="mt-0.5 shrink-0" />
                    Waspadai desakan, ancaman, dan larangan memberi tahu orang lain.
                  </li>
                  <li className="flex gap-2">
                    <Check size={14} className="mt-0.5 shrink-0" />
                    Jangan membacakan kode atau memasang aplikasi atas permintaan penelepon.
                  </li>
                  <li className="flex gap-2">
                    <Check size={14} className="mt-0.5 shrink-0" />
                    Verifikasi lewat jalur lain yang sudah kamu percaya.
                  </li>
                </ul>
              </div>

              {rewardMessage && (
                <div
                  role="status"
                  className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center text-xs font-semibold text-[var(--muted)]"
                >
                  {rewardMessage}
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleRestart}
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

  /* ========================================
     TAMPILAN UTAMA
  ======================================== */

  const isUnsafeAnswer = !!selectedChoice && !selectedChoice.isSafe;
  const isLastLevel = currentIndex >= totalCount - 1;

  return (
    <main className="container py-8 pb-16 md:py-12">
      <div className="mx-auto max-w-5xl">
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
              <PhoneCall size={14} />
              SCAM CALL
            </div>

            <h1 className="heading heading-2 mt-4">
              Kenali manipulasi melalui panggilan telepon.
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
              Naiki {totalCount} level. Makin tinggi levelnya, makin
              meyakinkan penelepon yang kamu hadapi.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface)] px-3 py-1.5 text-[10px] font-bold text-[var(--muted)]">
                <Clock3 size={12} />
                {simulation.duration}
              </span>

              <span className="rounded-full bg-[var(--surface)] px-3 py-1.5 text-[10px] font-bold text-[var(--muted)]">
                {simulation.difficulty}
              </span>

              <span className="rounded-full bg-[var(--warning)]/10 px-3 py-1.5 text-[10px] font-bold text-[var(--warning)]">
                SIMULASI FIKTIF
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={startTutorial}
              className="button button-secondary"
            >
              <HelpCircle size={16} />
              Tutorial
            </button>

            <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <ShieldCheck size={21} />
              </div>

              <div>
                <p className="text-2xl font-extrabold leading-none text-[var(--foreground)]">
                  {earnedLevelXp}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  XP terkumpul
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div
          data-tutorial="progress"
          className="mb-7 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-[var(--foreground)]">
              Perjalananmu
            </span>

            <div className="flex items-center gap-3 text-xs font-semibold tabular-nums text-[var(--muted)]">
              <span>
                {completedIds.length} dari {totalCount} level selesai
              </span>
              <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 font-extrabold text-[var(--accent)]">
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
        </div>

        {/* Peta level */}
        <div data-tutorial="levels" className="mb-6">
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

        {/* Simulation layout */}
        <div className="grid items-start gap-5 lg:grid-cols-[1fr_280px]">
          {/* Phone simulation */}
          <section ref={scenarioRef} className="min-w-0 scroll-mt-24">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--brand)]">
                  Level {currentIndex + 1} dari {totalCount}
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
                <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-[10px] font-bold text-[var(--brand)]">
                  {currentScenario.topic}
                </span>
              )}
            </div>

            <h2 className="mb-1 text-lg font-extrabold leading-snug text-[var(--foreground)] md:text-xl">
              {currentScenario.title}
            </h2>

            {currentScenario.description && (
              <p className="mb-4 text-xs leading-relaxed text-[var(--muted)]">
                {currentScenario.description}
              </p>
            )}

            <div className="mx-auto w-full max-w-[390px] rounded-[2.8rem] border-[7px] border-[#263247] bg-[#263247] p-2 shadow-xl">
              {/* Phone notch */}
              <div className="relative z-20 mx-auto -mb-3 h-6 w-28 rounded-b-2xl bg-[#263247]" />

              {/* Phone screen */}
              <div className="relative min-h-[650px] overflow-hidden rounded-[2.2rem] bg-[var(--card)] text-[var(--foreground)]">
                {/* Status bar */}
                <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-6 pb-3 pt-4 text-[10px] font-semibold text-[var(--muted)]">
                  <span>09:41</span>

                  <div className="flex items-center gap-1.5">
                    <Volume2 size={12} />
                    <span className="h-2 w-5 rounded-sm border border-[var(--muted)]">
                      <span className="block h-full w-3/4 rounded-sm bg-[var(--muted)]" />
                    </span>
                  </div>
                </div>

                {/* Panggilan masuk */}
                {view === "ringing" && (
                  <div className="flex min-h-[600px] flex-col items-center px-5 pb-8 pt-10 text-center">
                    <span className="mb-3 text-[10px] font-bold tracking-[0.2em] text-[var(--warning)]">
                      {isVideoCall ? "PANGGILAN VIDEO MASUK" : "PANGGILAN MASUK"}
                    </span>

                    <span className="mb-8 inline-flex items-center gap-1.5 rounded-full border border-[var(--warning)]/30 bg-[var(--warning)]/10 px-3 py-1.5 text-[10px] font-semibold text-[var(--warning)]">
                      <span className="size-1.5 animate-pulse rounded-full bg-[var(--warning)]" />
                      SIMULASI PANGGILAN MENCURIGAKAN
                    </span>

                    <div data-tutorial="caller" className="flex flex-col items-center">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 animate-ping rounded-full bg-[var(--brand-soft)] motion-reduce:animate-none" />

                        <div className="relative flex size-28 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                          <UserRound size={48} className="text-[var(--muted)]" />
                        </div>

                        <span className="absolute bottom-1 right-1 flex size-7 items-center justify-center rounded-full border-4 border-[var(--card)] bg-[var(--warning)] text-white">
                          {isVideoCall ? <Video size={12} /> : <Phone size={12} />}
                        </span>
                      </div>

                      <h2 className="text-2xl font-bold text-[var(--foreground)]">
                        {callerName}
                      </h2>

                      <p className="mt-2 max-w-[280px] text-sm text-[var(--muted)]">
                        {callerNumber}
                      </p>
                    </div>

                    <div className="mt-7 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                      <p className="text-xs leading-5 text-[var(--muted)]">
                        Seseorang sedang mencoba menghubungimu. Apakah kamu
                        akan menjawab panggilan ini?
                      </p>
                    </div>

                    <div className="mt-auto grid w-full grid-cols-2 gap-8 pt-8">
                      <button
                        type="button"
                        data-tutorial="decline-button"
                        onClick={handleDeclineCall}
                        className="group flex flex-col items-center gap-2.5"
                      >
                        <span className="flex size-14 items-center justify-center rounded-full bg-[var(--danger)] text-white shadow-lg transition group-hover:scale-105">
                          <PhoneOff size={23} />
                        </span>

                        <span className="text-xs font-semibold text-[var(--foreground)]">
                          Tolak
                        </span>
                      </button>

                      <button
                        type="button"
                        data-tutorial="answer-button"
                        onClick={handleAnswerCall}
                        className="group flex flex-col items-center gap-2.5"
                      >
                        <span className="flex size-14 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-lg transition group-hover:scale-105">
                          <Phone size={23} />
                        </span>

                        <span className="text-xs font-semibold text-[var(--foreground)]">
                          Jawab
                        </span>
                      </button>
                    </div>

                    <p className="mt-8 text-[10px] text-[var(--muted)]">
                      Tidak ada panggilan sungguhan yang dilakukan.
                    </p>
                  </div>
                )}

                {/* Setelah menolak panggilan */}
                {view === "declined" && (
                  <div className="flex min-h-[600px] flex-col items-center justify-center px-6 pb-8 text-center">
                    <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                      <ShieldCheck size={30} />
                    </div>

                    <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[var(--muted)]">
                      PANGGILAN DITOLAK
                    </p>

                    <h2 className="mt-2 text-lg font-extrabold text-[var(--foreground)]">
                      Menolak itu pilihan yang aman.
                    </h2>

                    <p className="mt-2 max-w-[280px] text-[11px] leading-5 text-[var(--muted)]">
                      Kamu tidak memberi penelepon kesempatan untuk menekanmu.
                      Nomor asing tidak selalu penipuan, jadi jika panggilan itu
                      penting, periksa lewat kanal resmi.
                    </p>

                    <div className="mt-4 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-left">
                      <p className="text-[10px] leading-4 text-[var(--muted)]">
                        Untuk berlatih, dengarkan rekaman simulasi panggilan
                        tadi dan tentukan responsmu. Menolak tidak mengubah XP.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleListenAnyway}
                      className="button button-primary mt-5 w-full text-xs"
                    >
                      Dengarkan rekaman simulasi
                      <ArrowRight size={15} />
                    </button>
                  </div>
                )}

                {/* Percakapan aktif */}
                {view === "talking" && (
                  <div className="flex min-h-[600px] flex-col px-4 pb-4 pt-5">
                    <div className="flex flex-col items-center border-b border-[var(--border)] pb-3 text-center">
                      <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-[var(--brand-soft)]">
                        {isVideoCall ? (
                          <Video size={22} className="text-[var(--brand)]" />
                        ) : (
                          <UserRound size={23} className="text-[var(--brand)]" />
                        )}
                      </div>

                      <h2 className="text-sm font-bold text-[var(--foreground)]">
                        {callerName}
                      </h2>

                      <p className="mt-0.5 max-w-[280px] text-[11px] text-[var(--muted)]">
                        {callerNumber}
                      </p>

                      <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[9px] font-semibold text-[var(--accent)]">
                        <span className="size-1.5 rounded-full bg-[var(--accent)]" />
                        {isVideoCall ? "VIDEO CALL SIMULASI" : "PANGGILAN SIMULASI"}
                      </span>
                    </div>

                    {/* Ucapan penelepon */}
                    <div data-tutorial="dialogue" className="py-4">
                      <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                        <Volume2 size={12} />
                        {isVideoCall ? "Ucapan di video call" : "Suara penelepon"}
                      </div>

                      <div className="space-y-2">
                        {dialogueLines.map((line, lineIndex) => (
                          <div
                            key={lineIndex}
                            className="rounded-2xl rounded-tl-sm border border-[var(--border)] bg-[var(--surface)] p-3.5"
                          >
                            <p className="whitespace-pre-line text-xs leading-6 text-[var(--foreground)]">
                              {line}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 flex items-start gap-2 rounded-xl bg-[var(--warning)]/10 px-3 py-2.5">
                        <AlertTriangle
                          size={13}
                          className="mt-0.5 shrink-0 text-[var(--warning)]"
                        />

                        <p className="text-[10px] leading-4 text-[var(--muted)]">
                          Jangan terburu-buru mengikuti instruksi. Kamu berhak
                          menghentikan panggilan kapan saja.
                        </p>
                      </div>
                    </div>

                    {/* Pilihan respons */}
                    <div
                      data-tutorial="choices"
                      className="mt-auto border-t border-[var(--border)] pt-3"
                    >
                      <h3 className="text-xs font-extrabold text-[var(--foreground)]">
                        Bagaimana kamu merespons?
                      </h3>

                      <p className="mb-2 mt-1 text-[10px] text-[var(--muted)]">
                        Pilih tindakan yang akan kamu lakukan.
                      </p>

                      <div className="space-y-2">
                        {displayChoices.map((choice, index) => (
                          <button
                            key={choice.id}
                            type="button"
                            onClick={() => handleChoice(choice)}
                            className="group flex w-full items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] p-2.5 text-left transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
                          >
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-[var(--surface)] text-[10px] font-bold text-[var(--muted)] group-hover:bg-[var(--card)] group-hover:text-[var(--brand)]">
                              {String.fromCharCode(65 + index)}
                            </span>

                            <span className="min-w-0 flex-1 text-[11px] font-medium leading-5 text-[var(--foreground)]">
                              {choice.label}
                            </span>

                            <ArrowRight
                              size={13}
                              className="shrink-0 text-[var(--muted)] group-hover:text-[var(--brand)]"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Hasil jawaban */}
                {view === "result" && selectedChoice && (
                  <div className="flex min-h-[600px] flex-col px-4 py-5">
                    <div className="flex flex-1 flex-col items-center justify-center text-center">
                      <div data-tutorial="feedback" className="w-full">
                        <div
                          className={`mx-auto mb-3 flex size-16 items-center justify-center rounded-2xl ${
                            selectedChoice.isSafe
                              ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                              : "bg-[var(--warning)]/15 text-[var(--warning)]"
                          }`}
                        >
                          {selectedChoice.isSafe ? (
                            <ShieldCheck size={30} />
                          ) : (
                            <AlertTriangle size={30} />
                          )}
                        </div>

                        <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[var(--muted)]">
                          PANGGILAN BERAKHIR
                        </p>

                        <h2 className="mt-2 text-lg font-extrabold text-[var(--foreground)]">
                          {selectedChoice.isSafe
                            ? `Level ${currentIndex + 1} selesai!`
                            : "Kamu perlu lebih berhati-hati."}
                        </h2>

                        <span
                          className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[10px] font-extrabold text-white ${
                            selectedChoice.isSafe
                              ? "bg-[var(--accent)]"
                              : "bg-[var(--warning)]"
                          }`}
                        >
                          {selectedChoice.isSafe
                            ? `+${currentLevelXp} XP`
                            : `XP level ini turun ke ${currentLevelXp}`}
                        </span>

                        <p className="mx-auto mt-3 max-w-[280px] text-[11px] leading-5 text-[var(--muted)]">
                          {selectedChoice.feedback}
                        </p>

                        {/* Reaksi penelepon */}
                        <div className="mt-4 w-full rounded-2xl rounded-tl-sm border border-[var(--border)] bg-[var(--surface)] p-3 text-left">
                          <p className="mb-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]">
                            <Volume2 size={11} />
                            Reaksi penelepon
                          </p>
                          <p className="text-[11px] leading-5 text-[var(--foreground)]">
                            {selectedChoice.reply ?? "Panggilan berakhir."}
                          </p>
                        </div>

                        <div
                          className={`mt-3 w-full rounded-xl border p-3 text-left ${
                            selectedChoice.isSafe
                              ? "border-[var(--accent)]/25 bg-[var(--accent-soft)]"
                              : "border-[var(--warning)]/30 bg-[var(--warning)]/10"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {selectedChoice.isSafe ? (
                              <CheckCircle2
                                size={14}
                                className="text-[var(--accent)]"
                              />
                            ) : (
                              <Info size={14} className="text-[var(--warning)]" />
                            )}

                            <p className="text-[11px] font-bold text-[var(--foreground)]">
                              {selectedChoice.isSafe
                                ? "Keputusan yang lebih aman"
                                : "Level ini belum selesai"}
                            </p>
                          </div>

                          <p className="mt-1.5 text-[10px] leading-4 text-[var(--muted)]">
                            {selectedChoice.isSafe
                              ? "Kamu berhasil mengambil keputusan yang lebih aman."
                              : "Pelajari alasannya, lalu coba lagi dengan pilihan yang lebih aman."}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        data-tutorial="learn-more"
                        onClick={() => setShowLearningModal(true)}
                        className="button button-secondary mt-3 w-full text-xs"
                      >
                        <Lightbulb size={14} />
                        Pelajari alasan & tindakan aman
                      </button>
                    </div>

                    <div className="mt-4 border-t border-[var(--border)] pt-3">
                      <button
                        type="button"
                        data-tutorial="next"
                        onClick={handleNext}
                        disabled={isSavingReward}
                        className={`button w-full text-xs disabled:cursor-not-allowed disabled:opacity-60 ${
                          isUnsafeAnswer ? "button-secondary" : "button-primary"
                        }`}
                      >
                        {isSavingReward ? (
                          "Menyimpan progres..."
                        ) : isUnsafeAnswer ? (
                          <>
                            <RotateCcw size={15} />
                            Coba lagi level ini
                          </>
                        ) : isLastLevel ? (
                          <>
                            <Trophy size={15} />
                            Klaim hasil dan reward
                          </>
                        ) : (
                          <>
                            Lanjut ke Level {currentIndex + 2}
                            <ArrowRight size={15} />
                          </>
                        )}
                      </button>

                      <p className="mt-2 text-center text-[9px] text-[var(--muted)]">
                        CEKIN · Scam Call Simulation
                      </p>
                    </div>
                  </div>
                )}
              </div>
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
                Capai Level {totalCount}. Di level tinggi, nomor bisa mirip
                lembaga resmi, suara dan wajah bisa dipalsukan, dan data
                pribadimu bisa disebut dengan benar. Tetap verifikasi lewat
                jalur lain.
              </p>
            </div>

            <div
              data-tutorial="red-flags"
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert size={17} className="text-[var(--warning)]" />
                <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                  Tanda penelepon penipu
                </h3>
              </div>

              <ul className="mt-3 space-y-3">
                {[
                  "Mengaku dari bank, polisi, operator, atau kurir lalu mendesakmu.",
                  "Meminta OTP, PIN, kode SMS, atau menyuruh memasang aplikasi.",
                  "Melarangmu memberi tahu orang lain atau menutup telepon.",
                  "Memakai nomor, nama, atau data yang benar sebagai “bukti”.",
                  "Meminta transfer ke “rekening aman” atau biaya pencairan.",
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
                  Ingat ini
                </h3>
              </div>

              <ul className="mt-3 space-y-3 text-xs leading-relaxed text-[var(--muted)]">
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={14}
                    className="mt-0.5 shrink-0 text-[var(--accent)]"
                  />
                  Jangan berikan OTP, PIN, atau kata sandi.
                </li>

                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={14}
                    className="mt-0.5 shrink-0 text-[var(--accent)]"
                  />
                  Jangan langsung percaya pada pengakuan penelepon.
                </li>

                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={14}
                    className="mt-0.5 shrink-0 text-[var(--accent)]"
                  />
                  Verifikasi lewat nomor resmi yang kamu cari sendiri.
                </li>
              </ul>
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
                    /{SPAM_CALL_MAX_XP}
                  </span>
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-white/60">
                  Level tinggi bernilai lebih besar. Jawaban salah mengurangi
                  XP level itu. Selesaikan Level {totalCount} untuk bonus{" "}
                  {SPAM_CALL_MASTER_BONUS} XP dan lencana Call Guardian.
                </p>
              </div>
            </div>
          </aside>
        </div>

        <p className="mt-8 text-center text-xs leading-6 text-[var(--muted)]">
          CEKIN Learning & Protection · Semua nomor dan percakapan merupakan
          simulasi fiktif.
        </p>
      </div>

      {/* Learning modal: hanya bisa ditutup lewat tombol */}
      {showLearningModal && selectedChoice && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={handleModalBackdropClick}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="call-learning-title"
            className={`w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-2xl ${
              modalShake ? "community-delete-dialog" : ""
            }`}
            onClick={(event) => event.stopPropagation()}
            onAnimationEnd={() => setModalShake(false)}
          >
            <div className="relative overflow-hidden bg-[var(--brand-dark)] p-6 text-white">
              <button
                type="button"
                onClick={() => setShowLearningModal(false)}
                aria-label="Tutup penjelasan"
                className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
              >
                <X size={18} />
              </button>

              <div className="flex size-12 items-center justify-center rounded-2xl bg-white/15">
                <Brain size={24} />
              </div>

              <p className="mt-5 text-[10px] font-extrabold tracking-[0.18em] text-white/60">
                PELAJARI SITUASINYA
              </p>

              <h2
                id="call-learning-title"
                className="mt-2 pr-8 text-2xl font-extrabold"
              >
                Pahami risiko dari responsmu.
              </h2>

              <p className="mt-2 text-xs leading-relaxed text-white/70">
                Level {currentIndex + 1}: {currentScenario.title}
              </p>
            </div>

            <div className="max-h-[60vh] space-y-4 overflow-y-auto overscroll-contain p-6">
              <div>
                <div className="flex items-center gap-2">
                  {selectedChoice.isSafe ? (
                    <CheckCircle2
                      size={18}
                      className="text-[var(--accent)]"
                    />
                  ) : (
                    <AlertTriangle
                      size={18}
                      className="text-[var(--warning)]"
                    />
                  )}

                  <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                    Mengapa respons ini penting?
                  </h3>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {selectedChoice.explanation}
                </p>
              </div>

              <div
                data-tutorial="learn-safer"
                className="rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent-soft)] p-4"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb size={17} className="text-[var(--accent)]" />
                  <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                    Tindakan yang lebih aman
                  </h3>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">
                  {selectedChoice.saferAction}
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] p-4">
                <div className="flex items-center gap-2">
                  <Info size={17} className="text-[var(--brand)]" />
                  <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                    Pastikan
                  </h3>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                  Jangan pernah membagikan OTP, PIN, kata sandi, atau kode
                  verifikasi kepada penelepon. Akhiri panggilan jika merasa
                  tertekan, lalu lakukan verifikasi secara mandiri lewat kanal
                  resmi yang kamu cari sendiri.
                </p>
              </div>

              <button
                type="button"
                data-tutorial="learn-close"
                onClick={() => setShowLearningModal(false)}
                className="button button-primary w-full"
              >
                Mengerti
                <Check size={16} />
              </button>
            </div>
          </section>
        </div>
      )}

      <SpamCallTutorial
        active={tutorialActive}
        view={view}
        hasSelectedChoice={!!selectedChoice}
        learnModalOpen={showLearningModal}
        onClose={closeTutorial}
      />
    </main>
  );
}