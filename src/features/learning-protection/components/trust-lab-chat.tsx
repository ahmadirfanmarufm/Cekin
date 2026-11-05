"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BatteryFull,
  Check,
  CheckCheck,
  CheckCircle2,
  CircleStar,
  Clock3,
  Crown,
  HelpCircle,
  Lightbulb,
  Lock,
  LockKeyhole,
  MessageCircle,
  MoreVertical,
  Phone,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Signal,
  Sparkles,
  Star,
  Trophy,
  Video,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import type {
  ScenarioDifficulty,
  SimulationChoice,
  SimulationConfig,
  SimulationScenario,
} from "@/types/learning-protection";
import { TrustLabTutorial, TRUST_LAB_TUTORIAL_KEY } from "./trust-lab-tutorial";
import {
  TRUST_LAB_MASTER_BONUS,
  TRUST_LAB_MAX_XP,
  calculateTrustLabXp,
  trustLabLevelXp,
} from "@/lib/learning-protection/xp";

type Props = {
  simulation: SimulationConfig;
};

/* ========================================
   UTIL
======================================== */

const DIFFICULTY_STYLES: Record<ScenarioDifficulty, string> = {
  Mudah: "bg-[var(--accent-soft)] text-[var(--accent)]",
  Menengah: "bg-[var(--brand-soft)] text-[var(--brand)]",
  Sulit: "bg-[var(--warning)]/15 text-[var(--warning)]",
  Ahli: "bg-[var(--danger)]/10 text-[var(--danger)]",
};

function hashSeed(input: string) {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createRandom(seed: number) {
  let state = seed;

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: T[], seed: string): T[] {
  const random = createRandom(hashSeed(seed));
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

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

/* ========================================
   KOMPONEN
======================================== */

export function TrustLabChat({ simulation }: Props) {
  const scenarios = simulation.scenarios;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] =
    useState<SimulationChoice | null>(null);
  // Riwayat pilihan per level, berisi id pilihan berurutan (termasuk percobaan gagal).
  const [attempts, setAttempts] = useState<Record<string, string[]>>({});
  // Level yang sudah selesai (dijawab aman).
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  // Level yang langsung dijawab aman pada percobaan pertama.
  const [safeIds, setSafeIds] = useState<string[]>([]);
  const [runSeed, setRunSeed] = useState(0);
  const [showLearningModal, setShowLearningModal] = useState(false);
  const [modalShake, setModalShake] = useState(false);
  const [finished, setFinished] = useState(false);
  const [isSavingReward, setIsSavingReward] = useState(false);
  const [rewardMessage, setRewardMessage] = useState("");

  const [tutorialActive, setTutorialActive] = useState(false);
  const tutorialSnapshot = useRef<{
    currentIndex: number;
    completedIds: string[];
    safeIds: string[];
    attempts: Record<string, string[]>;
  } | null>(null);
  // Kunci localStorage per akun (atau "guest") agar tutorial tidak berulang.
  const tutorialStorageKey = useRef(`${TRUST_LAB_TUTORIAL_KEY}:guest`);

  const scenarioRef = useRef<HTMLElement>(null);

  const totalCount = scenarios.length;
  const currentScenario = scenarios[currentIndex];
  const selectedAnswer = selectedChoice;

  /* ---------- Hitungan level & XP ---------- */

  const wrongCountOf = (scenario: SimulationScenario) =>
    (attempts[scenario.id] ?? []).filter(
      (choiceId) =>
        !scenario.choices.find((choice) => choice.id === choiceId)?.isSafe,
    ).length;

  // XP tiap level berdasarkan jumlah jawaban salah sejauh ini.
  const levelXpList = scenarios.map((scenario, index) =>
    trustLabLevelXp(index + 1, wrongCountOf(scenario)),
  );

  const earnedLevelXp = scenarios.reduce(
    (sum, scenario, index) =>
      completedIds.includes(scenario.id) ? sum + levelXpList[index] : sum,
    0,
  );

  const potentialXp =
    levelXpList.reduce((sum, xp) => sum + xp, 0) + TRUST_LAB_MASTER_BONUS;

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

  const incomingMessages = currentScenario?.messages?.length
    ? currentScenario.messages
    : [currentScenario?.context || currentScenario?.description || ""];

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
      Object.keys(attempts).length === 0,
  };

  /**
   * Tutorial otomatis hanya untuk:
   * - pengunjung baru / tamu yang belum pernah melihatnya,
   * - user login yang BELUM menyelesaikan Trust Lab.
   * User yang sudah menyelesaikan Trust Lab tidak diganggu
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
          "/api/learning-protection/progress?simulationId=trust-lab",
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

  if (!scenarios.length) {
    return (
      <main className="container py-16 text-center">
        <MessageCircle className="mx-auto mb-4 h-10 w-10 text-[var(--muted)]" />
        <h1 className="heading heading-2">Skenario belum tersedia</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Konten Trust Lab sedang disiapkan.
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

  const handleChoice = (choice: SimulationChoice) => {
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
  };

  // Salah menjawab: ulangi level yang sama dengan urutan pilihan baru.
  const retryLevel = () => {
    setSelectedChoice(null);
    setShowLearningModal(false);
    scrollToScenario();
  };

  // Klik di luar modal tidak menutupnya, hanya menggoyangkan modal.
  const handleModalBackdropClick = () => {
    setModalShake(true);
  };

  const saveSimulationCompletion = async () => {
    if (isSavingReward) return;

    setIsSavingReward(true);

    try {
      const response = await fetch("/api/learning-protection/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          simulationId: "trust-lab",
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
      const maxXp: number = result.maxXp ?? TRUST_LAB_MAX_XP;

      if (result.xpEarned > 0) {
        setRewardMessage(
          scoreXp >= maxXp
            ? `Sempurna! Kamu mendapatkan ${result.xpEarned} XP dari Trust Lab.`
            : `Kamu mendapatkan ${result.xpEarned} XP (skor ${scoreXp}/${maxXp}). Ulangi simulasi tanpa salah untuk meraih XP maksimal.`,
        );
      } else if ((result.bestXp ?? 0) >= maxXp) {
        setRewardMessage("Kamu sudah meraih XP maksimal di Trust Lab.");
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
    if (!selectedChoice || isSavingReward) return;

    setShowLearningModal(false);

    // Jawaban kurang aman: level belum selesai, ulangi.
    if (!selectedChoice.isSafe) {
      retryLevel();
      return;
    }

    const isLastLevel = currentIndex >= totalCount - 1;

    if (!isLastLevel) {
      setCurrentIndex(currentIndex + 1);
      setSelectedChoice(null);
      scrollToScenario();
      return;
    }

    // Saat tutorial: tidak membuka hasil dan tidak menyimpan XP.
    if (tutorialActive) {
      setSelectedChoice(null);
      return;
    }

    await saveSimulationCompletion();
    setFinished(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const restart = () => {
    setCurrentIndex(0);
    setSelectedChoice(null);
    setAttempts({});
    setCompletedIds([]);
    setSafeIds([]);
    setRunSeed((previous) => previous + 1);
    setShowLearningModal(false);
    setFinished(false);
    setRewardMessage("");

    scrollToScenario();
  };

  /* ========================================
     LAYAR REWARD: LEVEL MAKSIMAL
  ======================================== */

  if (finished) {
    const wrongCounts = scenarios.map((scenario) => wrongCountOf(scenario));
    const finalXp = calculateTrustLabXp(wrongCounts);
    const totalWrong = wrongCounts.reduce((sum, wrong) => sum + wrong, 0);
    const isPerfect = totalWrong === 0;

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
                {isPerfect ? "Perfect Trust Master!" : "Selamat, Trust Master!"}
              </h1>

              <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/80">
                Kamu menamatkan seluruh {totalCount} level, dari bujukan paling
                sederhana sampai penipuan yang tampak sangat meyakinkan. Kamu
                kini lebih siap menghadapi modus digital masa kini.
              </p>

              <div className="relative mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-yellow-300 px-4 py-2 text-xs font-extrabold text-[var(--brand-dark)]">
                <Trophy size={16} />
                Lencana Trust Master
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
                      /{TRUST_LAB_MAX_XP}
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
                      Bonus Trust Master
                    </span>
                    <span className="font-bold text-[var(--accent)]">
                      +{finalXp.bonus} XP
                    </span>
                  </li>
                </ul>

                <p className="mt-3 border-t border-[var(--border)] pt-3 text-xs leading-relaxed text-[var(--muted)]">
                  {isPerfect
                    ? "Tanpa satu pun jawaban kurang aman. Luar biasa!"
                    : `Kamu sempat ${totalWrong} kali memilih respons kurang aman. Ulangi simulasi tanpa salah untuk meraih XP maksimal (${TRUST_LAB_MAX_XP} XP).`}
                </p>
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[var(--border)] p-5">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
                <div>
                  <h2 className="text-sm font-bold text-[var(--foreground)]">
                    Prinsip utama Trust Lab
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                    Jangan mengirim uang, data pribadi, kata sandi, atau kode
                    OTP hanya karena diminta lewat chat atau telepon. Nomor,
                    suara, centang, bahkan data yang benar tidak membuktikan
                    identitas seseorang. Verifikasi lewat kanal resmi yang kamu
                    cari sendiri.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-[var(--brand-soft)] p-5">
                <div className="flex items-center gap-2 text-[var(--brand)]">
                  <Lightbulb size={17} />
                  <h3 className="text-sm font-extrabold">
                    Ingat sebelum membalas pesan
                  </h3>
                </div>

                <ul className="mt-3 space-y-2 text-xs leading-relaxed text-[var(--brand-dark)]">
                  <li className="flex gap-2">
                    <Check size={14} className="mt-0.5 shrink-0" />
                    Berhenti sejenak, jangan ikuti tekanan waktu.
                  </li>
                  <li className="flex gap-2">
                    <Check size={14} className="mt-0.5 shrink-0" />
                    Jangan pasang file atau buka tautan dari pesan yang tidak kamu minta.
                  </li>
                  <li className="flex gap-2">
                    <Check size={14} className="mt-0.5 shrink-0" />
                    Hubungi orang yang bersangkutan lewat jalur lain yang sudah kamu percaya.
                  </li>
                  <li className="flex gap-2">
                    <Check size={14} className="mt-0.5 shrink-0" />
                    Jangan pernah membayar atau membagikan kode demi &quot;mencairkan&quot; sesuatu.
                  </li>
                </ul>
              </div>

              {rewardMessage && (
                <p className="mt-4 text-center text-xs leading-relaxed text-[var(--muted)]">
                  {rewardMessage}
                </p>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={restart}
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

  const isUnsafeAnswer = !!selectedAnswer && !selectedAnswer.isSafe;
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
              <MessageCircle size={14} />
              TRUST LAB
            </div>

            <h1 className="heading heading-2 mt-4">Jangan asal install aplikasi.</h1>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
              Naiki {totalCount} level. Makin tinggi levelnya, makin sulit membedakan aplikasi aman dan berbahaya.
            </p>

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
        <div data-tutorial="progress" className="mb-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-[var(--foreground)]">Perjalananmu</span>
            <div className="flex items-center gap-3 text-xs font-semibold tabular-nums text-[var(--muted)]">
              <span>
                {completedIds.length} dari {totalCount} level selesai
              </span>
              <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 font-extrabold text-[var(--accent)]">
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
        </div>

        {/* Peta level */}
        <div data-tutorial="scenarios" className="mb-6">
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
                {/* Left Side Buttons */}
                <div className="absolute -left-[7px] top-[18%] z-0 h-5 w-[4px] rounded-l-md bg-[#64748b] shadow-sm" />
                <div className="absolute -left-[7px] top-[25%] z-0 h-8 w-[4px] rounded-l-md bg-[#64748b] shadow-sm" />
                <div className="absolute -left-[7px] top-[34%] z-0 h-8 w-[4px] rounded-l-md bg-[#64748b] shadow-sm" />

                {/* Right Power Button */}
                <div className="absolute -right-[7px] top-[27%] z-0 h-14 w-[4px] rounded-r-md bg-[#64748b] shadow-sm" />

                {/* iPhone Body */}
                <div className="relative z-10 rounded-[38px] border-[5px] border-[#26364d] bg-[#26364d] p-[4px] shadow-[0_25px_65px_rgba(36,87,166,0.18)] sm:rounded-[43px] sm:border-[6px] sm:p-[5px]">
                  {/* Screen */}
                  <div className="relative overflow-hidden rounded-[30px] bg-[#efeae2] sm:rounded-[35px]">
                    {/* Phone Status Bar */}
                    <div className="relative flex h-10 items-center justify-between bg-[#075e54] px-5 pt-1 text-white">
                      <span className="text-[10px] font-bold">9:41</span>

                      {/* Dynamic Island */}
                      <div className="absolute left-1/2 top-2 h-[19px] w-[75px] -translate-x-1/2 rounded-full bg-[#111827] sm:w-[80px]" />

                      <div className="flex items-center gap-1.5">
                        <Signal size={12} />
                        <Wifi size={12} />
                        <BatteryFull size={14} />
                      </div>
                    </div>

                    {/* WhatsApp Header */}
                    <div className="flex items-center gap-3 bg-[#075e54] px-3 py-3 text-white">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
                        <MessageCircle size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">
                          {currentScenario.sender?.name ?? "Kontak Tidak Dikenal"}
                        </p>
                        <p className="mt-0.5 truncate text-[10px] text-white/70">
                          {currentScenario.sender?.status ?? "akun bisnis"}
                        </p>
                      </div>

                      <Video size={18} className="shrink-0 text-white/90" />
                      <Phone size={17} className="shrink-0 text-white/90" />
                      <MoreVertical size={18} className="shrink-0 text-white/90" />
                    </div>

                    {/* Chat Area */}
                    <div
                      className="space-y-3 px-3 py-5 sm:px-4"
                      style={{
                        backgroundImage:
                          "radial-gradient(rgba(0,0,0,0.035) 1px, transparent 1px)",
                        backgroundSize: "14px 14px",
                      }}
                    >
                      {/* Simulation Disclaimer */}
                      <div className="mx-auto w-fit rounded-lg bg-[#fff3c4] px-3 py-1.5 text-center text-[9px] font-medium leading-relaxed text-[#766b4f] shadow-sm">
                        Pesan simulasi untuk pembelajaran.
                        <br />
                        Bukan percakapan sungguhan.
                      </div>

                      {/* Incoming Messages */}
                      <div data-tutorial="message" className="space-y-2">
                        {incomingMessages.map((text, messageIndex) => (
                          <div key={messageIndex} className="flex justify-start">
                            <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-3 shadow-sm">
                              <p className="whitespace-pre-line text-[12px] leading-[1.7] text-[#303030]">
                                {text}
                              </p>

                              {messageIndex === incomingMessages.length - 1 && (
                                <div className="mt-1 text-right text-[9px] text-[#999]">
                                  09:41
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* User Reply & Simulated Response */}
                      {selectedAnswer && (
                        <>
                          {/* User Reply */}
                          <div className="flex justify-end">
                            <div className="max-w-[88%] rounded-2xl rounded-tr-sm bg-[#d9fdd3] px-3.5 py-3 shadow-sm">
                              <p className="text-[12px] leading-relaxed text-[#303030]">
                                {selectedAnswer.label}
                              </p>

                              <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-[#6b8b7e]">
                                09:42
                                <CheckCheck size={13} />
                              </div>
                            </div>
                          </div>

                          {/* Simulated Response */}
                          <div className="flex justify-start">
                            <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-3 shadow-sm">
                              <p className="text-[12px] leading-[1.7] text-[#303030]">
                                {selectedAnswer.isSafe
                                  ? "Baik, silakan periksa dan pastikan informasinya terlebih dahulu. Tidak perlu terburu-buru."
                                  : (selectedAnswer.reply ??
                                    "Ayo, segera lakukan sekarang. Kesempatan ini bisa hilang kalau kamu terlalu lama berpikir!")}
                              </p>

                              <div className="mt-1 text-right text-[9px] text-[#999]">
                                09:42
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Chat Composer */}
                    <div className="border-t border-[#ddd7cf] bg-[#f0f0f0] p-3 sm:p-4">
                      {!selectedChoice ? (
                        <>
                          <p className="mb-3 px-1 text-[10px] font-bold leading-relaxed text-[#626262]">
                            Bagaimana kamu akan merespons pesan ini?
                          </p>

                          <div data-tutorial="choices" className="space-y-2">
                            {displayChoices.map((choice, index) => (
                              <button
                                key={choice.id}
                                onClick={() => handleChoice(choice)}
                                className="group flex w-full items-center gap-3 rounded-xl border border-[#d8e0dc] bg-white p-3 text-left transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
                              >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#e9f0ed] text-[10px] font-extrabold text-[#527366] group-hover:bg-white group-hover:text-[var(--brand)]">
                                  {String.fromCharCode(65 + index)}
                                </span>

                                <span className="flex-1 text-[11px] font-semibold leading-relaxed text-[#303030]">
                                  {choice.label}
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
                        <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3">
                          <LockKeyhole size={15} className="text-[#84918b]" />

                          <p className="flex-1 text-[10px] text-[#84918b]">
                            Respons telah dikirim
                          </p>

                          <CheckCircle2
                            size={16}
                            className="text-[var(--accent)]"
                          />
                        </div>
                      )}
                    </div>

                    {/* iPhone Home Indicator */}
                    <div className="flex justify-center bg-[#f0f0f0] pb-2.5 pt-1">
                      <div className="h-1 w-20 rounded-full bg-[#17233b]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Answer feedback */}
              {selectedAnswer && (
                <div className="mt-6">
                  <div
                    data-tutorial="feedback"
                    className={`rounded-2xl border p-5 ${
                      selectedAnswer.isSafe
                        ? "border-[var(--accent)]/30 bg-[var(--accent-soft)]"
                        : "border-[var(--warning)]/40 bg-[var(--warning)]/10"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {selectedAnswer.isSafe ? (
                        <CheckCircle2
                          size={20}
                          className="shrink-0 text-[var(--accent)]"
                        />
                      ) : (
                        <AlertTriangle
                          size={20}
                          className="shrink-0 text-[var(--warning)]"
                        />
                      )}

                      <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                        {selectedAnswer.isSafe
                          ? `Level ${currentIndex + 1} selesai!`
                          : "Ada risiko yang perlu kamu pahami."}
                      </h3>

                      <span
                        className={`ml-auto shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold text-white ${
                          selectedAnswer.isSafe
                            ? "bg-[var(--accent)]"
                            : "bg-[var(--warning)]"
                        }`}
                      >
                        {selectedAnswer.isSafe
                          ? `+${currentLevelXp} XP`
                          : `XP level ini turun ke ${currentLevelXp}`}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">
                      {selectedAnswer.feedback}
                    </p>

                    {isUnsafeAnswer && (
                      <p className="mt-3 text-xs font-bold leading-relaxed text-[var(--warning)]">
                        Level ini belum selesai. Pelajari alasannya, lalu coba
                        lagi dengan pilihan yang lebih aman.
                      </p>
                    )}
                  </div>

                  <div
                    data-tutorial="lesson"
                    className="mt-4 rounded-2xl border border-[var(--border)] p-5"
                  >
                    <div className="flex items-center gap-2">
                      <Lightbulb
                        size={18}
                        className="text-[var(--brand)]"
                      />
                      <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                        Apa yang harus kamu pelajari?
                      </h3>
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                      {selectedAnswer.explanation}
                    </p>

                    <button
                      data-tutorial="learn-more"
                      onClick={() => setShowLearningModal(true)}
                      className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold text-[var(--brand)] transition hover:text-[var(--brand-dark)]"
                    >
                      Pelajari penjelasan lebih lanjut
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  <button
                    data-tutorial="next"
                    onClick={handleNext}
                    disabled={isSavingReward}
                    className={`button mt-5 w-full ${
                      isUnsafeAnswer ? "button-secondary" : "button-primary"
                    }`}
                  >
                    {isSavingReward ? (
                      "Menyimpan progres..."
                    ) : isUnsafeAnswer ? (
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
                Capai Level {totalCount}. Penipu makin lihai di level tinggi:
                nomor bisa sama, suara bisa mirip, data bisa benar. Tetap
                verifikasi lewat jalur yang kamu pilih sendiri.
              </p>
            </div>

            <div
              data-tutorial="red-flags"
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert
                  size={17}
                  className="text-[var(--warning)]"
                />
                <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                  Tanda yang perlu diwaspadai
                </h3>
              </div>

              <ul className="mt-3 space-y-3">
                {[
                  "Meminta biaya di awal untuk pekerjaan, hadiah, atau penarikan dana.",
                  "Mendesakmu agar segera mentransfer uang atau memberi kode.",
                  "Mengirim file .apk atau tautan yang tidak kamu minta.",
                  "Memakai suara, nomor, atau data yang tampak meyakinkan sebagai 'bukti'.",
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
                <ShieldCheck
                  size={17}
                  className="text-[var(--accent)]"
                />
                <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                  Prinsip aman
                </h3>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
                Berhenti sejenak, periksa informasi, dan verifikasi identitas
                lewat kanal resmi atau jalur lain yang sudah kamu percaya.
                Kamu tidak wajib mengikuti permintaan siapa pun yang
                mendesakmu.
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
                  Level tinggi bernilai lebih besar. Jawaban salah mengurangi
                  XP level itu. Selesaikan Level {totalCount} untuk bonus{" "}
                  {TRUST_LAB_MASTER_BONUS} XP dan lencana Trust Master.
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* Learning modal: hanya bisa ditutup lewat tombol */}
        {showLearningModal && selectedAnswer && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overscroll-contain bg-black/55 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="trust-learning-title"
            onClick={handleModalBackdropClick}
          >
            <div
              className={`my-auto w-full max-w-lg overflow-hidden rounded-3xl bg-[var(--card)] shadow-2xl ${
                modalShake ? "community-delete-dialog" : ""
              }`}
              onClick={(event) => event.stopPropagation()}
              onAnimationEnd={() => setModalShake(false)}
            >
              <div className="relative overflow-hidden bg-[var(--brand-dark)] p-6 text-white">
                <button
                  onClick={() => setShowLearningModal(false)}
                  aria-label="Tutup penjelasan"
                  className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
                >
                  <X size={18} />
                </button>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <Lightbulb size={24} />
                </div>

                <p className="mt-5 text-[10px] font-extrabold tracking-[0.18em] text-white/60">
                  TRUST LAB LEARNING
                </p>

                <h2
                  id="trust-learning-title"
                  className="mt-2 pr-8 text-2xl font-extrabold"
                >
                  Pahami sebelum mempercayai.
                </h2>

                <p className="mt-2 text-xs leading-relaxed text-white/75">
                  Jangan hanya menghafal jawaban. Pahami alasan di balik
                  tindakan yang lebih aman.
                </p>
              </div>

              <div className="space-y-5 p-6">
                <div>
                  <div className="flex items-center gap-2">
                    {selectedAnswer.isSafe ? (
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
                    {selectedAnswer.explanation}
                  </p>
                </div>

                <div
                  data-tutorial="learn-safer"
                  className="rounded-2xl bg-[var(--brand-soft)] p-4"
                >
                  <div className="flex items-center gap-2 text-[var(--brand)]">
                    <ShieldCheck size={17} />
                    <h3 className="text-xs font-extrabold">
                      Langkah yang lebih aman
                    </h3>
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-[var(--brand-dark)]">
                    {selectedAnswer.saferAction}
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--border)] p-4">
                  <h3 className="text-xs font-extrabold text-[var(--foreground)]">
                    Checklist sebelum membalas pesan
                  </h3>

                  <ul className="mt-3 space-y-2.5">
                    {[
                      "Apakah saya mengenal dan dapat memverifikasi pengirimnya lewat jalur lain?",
                      "Apakah pesan meminta uang, kode, atau data rahasia?",
                      "Apakah saya sedang didesak untuk mengambil keputusan cepat?",
                      "Bisakah informasi ini diperiksa lewat kanal resmi yang saya buka sendiri?",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-xs leading-relaxed text-[var(--muted)]"
                      >
                        <Check
                          size={14}
                          className="mt-0.5 shrink-0 text-[var(--accent)]"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-[var(--surface)] p-4">
                  <LockKeyhole
                    size={18}
                    className="mt-0.5 shrink-0 text-[var(--brand)]"
                  />
                  <p className="text-xs leading-relaxed text-[var(--muted)]">
                    Jangan pernah membagikan PIN, kata sandi, atau kode OTP
                    kepada orang lain. Pihak resmi tidak seharusnya meminta
                    kode rahasia tersebut melalui percakapan.
                  </p>
                </div>

                <button
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
      </div>

      <TrustLabTutorial
        active={tutorialActive}
        hasSelectedChoice={!!selectedChoice}
        learnModalOpen={showLearningModal}
        onClose={closeTutorial}
      />
    </main>
  );
}