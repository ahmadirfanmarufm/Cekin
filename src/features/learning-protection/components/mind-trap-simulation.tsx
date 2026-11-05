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
  CircleStar,
  Crown,
  Eye,
  HelpCircle,
  Lightbulb,
  Lock,
  MessageCircle,
  Quote,
  RotateCcw,
  ShieldAlert,
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
  SimulationScenario,
} from "@/types/learning-protection";
import {
  MindTrapTutorial,
  MIND_TRAP_TUTORIAL_KEY,
} from "./mind-trap-tutorial";
import {
  MIND_TRAP_MASTER_BONUS,
  MIND_TRAP_MAX_XP,
  calculateMindTrapXp,
  mindTrapLevelXp,
} from "@/lib/learning-protection/xp";
import { seededShuffle } from "@/lib/learning-protection/shuffle";

type Props = {
  simulation: SimulationConfig;
};

const SIMULATION_ID = "mind-trap";

const DIFFICULTY_STYLES: Record<ScenarioDifficulty, string> = {
  Mudah: "bg-[var(--accent-soft)] text-[var(--accent)]",
  Menengah: "bg-[var(--brand-soft)] text-[var(--brand)]",
  Sulit: "bg-[var(--warning)]/15 text-[var(--warning)]",
  Ahli: "bg-[var(--danger)]/10 text-[var(--danger)]",
};

const TACTICS = [
  { name: "Urgensi & kelangkaan", hint: "“Tinggal 5 slot, hari ini saja.”" },
  { name: "Otoritas", hint: "Gelar, jabatan, atau pengikut sebagai pengganti bukti." },
  { name: "Bukti sosial", hint: "“Ribuan orang sudah berhasil.”" },
  { name: "Balas budi", hint: "Hadiah kecil sebelum permintaan besar." },
  { name: "Komitmen bertahap", hint: "Permintaan kecil yang terus membesar." },
  { name: "Isolasi", hint: "“Jangan bilang siapa-siapa dulu.”" },
];

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

export function MindTrapSimulation({ simulation }: Props) {
  const scenarios = simulation.scenarios;
  const totalCount = scenarios.length;

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
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [tutorialActive, setTutorialActive] = useState(false);
  const tutorialSnapshot = useRef<{
    currentIndex: number;
    completedIds: string[];
    safeIds: string[];
    attempts: Record<string, string[]>;
  } | null>(null);
  // Kunci localStorage per akun (atau "guest") agar tutorial tidak berulang.
  const tutorialStorageKey = useRef(`${MIND_TRAP_TUTORIAL_KEY}:guest`);

  const scenarioRef = useRef<HTMLElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  const currentScenario = scenarios[currentIndex];

  /* ---------- Hitungan level & XP ---------- */

  const wrongCountOf = (scenario: SimulationScenario) =>
    (attempts[scenario.id] ?? []).filter(
      (choiceId) =>
        !scenario.choices.find((choice) => choice.id === choiceId)?.isSafe,
    ).length;

  // XP tiap level berdasarkan jumlah jawaban salah sejauh ini.
  const levelXpList = scenarios.map((scenario, index) =>
    mindTrapLevelXp(index + 1, wrongCountOf(scenario)),
  );

  const earnedLevelXp = scenarios.reduce(
    (sum, scenario, index) =>
      completedIds.includes(scenario.id) ? sum + levelXpList[index] : sum,
    0,
  );

  const potentialXp =
    levelXpList.reduce((sum, xp) => sum + xp, 0) + MIND_TRAP_MASTER_BONUS;

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

  const situationLines = currentScenario?.messages?.length
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

      tutorialStorageKey.current = `${MIND_TRAP_TUTORIAL_KEY}:${userId}`;

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

  // Tampilkan hasil jawaban (kecuali saat tutorial, yang mengatur scroll sendiri).
  useEffect(() => {
    if (!selectedChoice || tutorialActive) return;

    const frameId = window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      feedbackRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [selectedChoice, tutorialActive]);

  if (!totalCount || !currentScenario) {
    return (
      <main className="container py-16 text-center">
        <Brain className="mx-auto mb-4 h-10 w-10 text-[var(--muted)]" />
        <h1 className="heading heading-2">Skenario belum tersedia</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Konten Mind Trap sedang disiapkan.
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
    scrollToScenario();
  };

  const saveCompletion = async () => {
    if (saving) return;

    setSaving(true);

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
        setSaveMessage(
          "Level maksimal tercapai! Login untuk menyimpan progres, XP, dan lencana ke akunmu.",
        );
        return;
      }

      if (!response.ok) {
        setSaveMessage(
          "Level maksimal tercapai, tetapi progres belum berhasil disimpan. Kamu tetap bisa melihat hasilmu.",
        );
        return;
      }

      const result = await response.json();
      const scoreXp: number = result.scoreXp ?? 0;
      const maxXp: number = result.maxXp ?? MIND_TRAP_MAX_XP;

      if (result.xpEarned > 0) {
        setSaveMessage(
          scoreXp >= maxXp
            ? `Sempurna! Kamu mendapatkan ${result.xpEarned} XP dari Mind Trap.`
            : `Kamu mendapatkan ${result.xpEarned} XP (skor ${scoreXp}/${maxXp}). Ulangi simulasi tanpa salah untuk meraih XP maksimal.`,
        );
      } else if ((result.bestXp ?? 0) >= maxXp) {
        setSaveMessage("Kamu sudah meraih XP maksimal di Mind Trap.");
      } else {
        setSaveMessage(
          `Skor ${scoreXp} XP belum melebihi hasil terbaikmu (${result.bestXp} XP). Ulangi dan jawab lebih teliti untuk menambah XP.`,
        );
      }

      window.dispatchEvent(new Event("cekin-auth-change"));
    } catch {
      setSaveMessage(
        "Level maksimal tercapai, tetapi koneksi gagal menyimpan progres. Coba lagi nanti.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (!selectedChoice || saving) return;

    // Jawaban kurang aman: level belum selesai, ulangi.
    if (!selectedChoice.isSafe) {
      retryLevel();
      return;
    }

    if (currentIndex < totalCount - 1) {
      setCurrentIndex((previous) => previous + 1);
      setSelectedChoice(null);
      scrollToScenario();
      return;
    }

    // Saat tutorial: tidak membuka hasil dan tidak menyimpan XP.
    if (tutorialActive) {
      setSelectedChoice(null);
      return;
    }

    await saveCompletion();
    setFinished(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restart = () => {
    setCurrentIndex(0);
    setSelectedChoice(null);
    setAttempts({});
    setCompletedIds([]);
    setSafeIds([]);
    setRunSeed((previous) => previous + 1);
    setFinished(false);
    setSaveMessage("");

    scrollToScenario();
  };

  /* ========================================
     LAYAR REWARD: LEVEL MAKSIMAL
  ======================================== */

  if (finished) {
    const wrongCounts = scenarios.map((scenario) => wrongCountOf(scenario));
    const finalXp = calculateMindTrapXp(wrongCounts);
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
                {isPerfect ? "Perfect Mind Guardian!" : "Selamat, Mind Guardian!"}
              </h1>

              <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/80">
                Kamu menamatkan seluruh {totalCount} level, dari FOMO sampai
                rasa terlalu percaya diri. Kamu kini lebih mudah mengenali
                tekanan yang bermain di pikiranmu.
              </p>

              <div className="relative mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-yellow-300 px-4 py-2 text-xs font-extrabold text-[var(--brand-dark)]">
                <Trophy size={16} />
                Lencana Mind Guardian
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
                      /{MIND_TRAP_MAX_XP}
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
                      Bonus Mind Guardian
                    </span>
                    <span className="font-bold text-[var(--accent)]">
                      +{finalXp.bonus} XP
                    </span>
                  </li>
                </ul>

                <p className="mt-3 border-t border-[var(--border)] pt-3 text-xs leading-relaxed text-[var(--muted)]">
                  {isPerfect
                    ? "Tanpa satu pun jawaban kurang aman. Luar biasa!"
                    : `Kamu sempat ${totalWrong} kali memilih respons kurang aman. Ulangi simulasi tanpa salah untuk meraih XP maksimal (${MIND_TRAP_MAX_XP} XP).`}
                </p>
              </div>

              {/* Jebakan yang sudah dikuasai */}
              <div className="mt-4 rounded-2xl border border-[var(--border)] p-5">
                <div className="flex items-center gap-2">
                  <Brain size={17} className="text-[var(--brand)]" />
                  <h2 className="text-sm font-extrabold text-[var(--foreground)]">
                    Jebakan yang sudah kamu kenali
                  </h2>
                </div>

                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {scenarios.map((scenario, index) => {
                    const firstTry = safeIds.includes(scenario.id);

                    return (
                      <li
                        key={scenario.id}
                        className="flex items-start gap-2 rounded-xl bg-[var(--surface)] px-3 py-2.5 text-xs leading-relaxed text-[var(--foreground)]"
                      >
                        {firstTry ? (
                          <Star
                            size={13}
                            className="mt-0.5 shrink-0 fill-yellow-400 text-yellow-500"
                          />
                        ) : (
                          <Check
                            size={13}
                            className="mt-0.5 shrink-0 text-[var(--accent)]"
                          />
                        )}
                        <span>
                          <span className="font-bold text-[var(--muted)]">
                            Lv {index + 1}.{" "}
                          </span>
                          {scenario.topic}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <p className="mt-3 text-[10px] text-[var(--muted)]">
                  Bintang berarti kamu menjawab benar pada percobaan pertama.
                </p>
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[var(--border)] p-5">
                <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]" />
                <div>
                  <h2 className="text-sm font-bold">
                    Satu hal yang perlu diingat
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                    Ketika seseorang membuatmu merasa harus segera bertindak,
                    takut tertinggal, atau berutang budi, berhenti sejenak.
                    Keputusan yang baik tidak harus dibuat di bawah tekanan,
                    dan rasa yakin saja bukan bukti.
                  </p>
                </div>
              </div>

              {saveMessage && (
                <p className="mt-4 text-center text-xs leading-relaxed text-[var(--muted)]">
                  {saveMessage}
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
              <ShieldCheck size={14} />
              GAMBLING AWARENESS
            </div>

            <h1 className="heading heading-2 mt-4">Jangan asal install aplikasi.</h1>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
              Naiki {totalCount} level. Makin tinggi levelnya, makin sulit membedakan aplikasi aman dan berbahaya.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
              <div className="badge">
                <Brain size={14} />
                MIND TRAP
              </div>
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
                Potensi XP {potentialXp}/{MIND_TRAP_MAX_XP}
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
              Makin tinggi, makin halus
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

        {/* Scenario */}
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

                  {/* Nama jebakan disembunyikan sampai user menjawab */}
                  <span
                    data-tutorial="trap-name"
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold ${
                      selectedChoice
                        ? "bg-[var(--brand-soft)] text-[var(--brand)]"
                        : "bg-[var(--surface)] text-[var(--muted)] ring-1 ring-[var(--border)]"
                    }`}
                  >
                    {selectedChoice ? (
                      <>
                        <Brain size={11} />
                        Jebakan: {currentScenario.topic}
                      </>
                    ) : (
                      <>
                        <Lock size={11} />
                        Jebakan tersembunyi
                      </>
                    )}
                  </span>
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
                  <Eye size={16} />
                  <span className="text-[10px] font-extrabold tracking-wider">
                    BAYANGKAN SITUASI INI
                  </span>
                </div>

                {currentScenario.description && (
                  <p className="text-sm leading-relaxed text-[var(--foreground)]">
                    {currentScenario.description}
                  </p>
                )}

                {currentScenario.sender && (
                  <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold text-[var(--muted)]">
                    <MessageCircle size={13} />
                    {currentScenario.sender.name}
                    {currentScenario.sender.status && (
                      <span className="font-medium">
                        • {currentScenario.sender.status}
                      </span>
                    )}
                  </p>
                )}

                <div className="mt-3 space-y-2">
                  {situationLines.map((line, lineIndex) => (
                    <div
                      key={lineIndex}
                      className="flex gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3.5"
                    >
                      <Quote
                        size={14}
                        className="mt-1 shrink-0 text-[var(--brand)]"
                      />
                      <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--foreground)]">
                        {line}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4 mt-7">
                <p className="text-sm font-extrabold text-[var(--foreground)]">
                  Apa responsmu?
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Pilih respons yang paling mungkin kamu lakukan, dan jujurlah.
                </p>
              </div>

              <div data-tutorial="choices" className="space-y-3">
                {displayChoices.map((choice, index) => {
                  const isSelected = selectedChoice?.id === choice.id;

                  return (
                    <button
                      key={choice.id}
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
                          choice.isSafe ? (
                            <Check size={17} />
                          ) : (
                            <X size={17} />
                          )
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

              {/* Answer reveal */}
              {selectedChoice && (
                <div
                  ref={feedbackRef}
                  className="mt-6 scroll-mt-24 animate-[fadeIn_300ms_ease-out]"
                >
                  <div
                    data-tutorial="feedback"
                    className={`rounded-2xl border p-5 ${
                      selectedChoice.isSafe
                        ? "border-[var(--accent)]/30 bg-[var(--accent-soft)]"
                        : "border-[var(--warning)]/40 bg-[var(--warning)]/10"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {selectedChoice.isSafe ? (
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
                        {selectedChoice.isSafe
                          ? `Level ${currentIndex + 1} selesai!`
                          : "Ada jebakan yang perlu kamu sadari."}
                      </h3>

                      <span
                        className={`ml-auto shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold text-white ${
                          selectedChoice.isSafe
                            ? "bg-[var(--accent)]"
                            : "bg-[var(--warning)]"
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

                    {selectedChoice.reply && (
                      <div className="mt-3 flex gap-2 rounded-xl bg-[var(--card)]/70 p-3">
                        <MessageCircle
                          size={14}
                          className="mt-0.5 shrink-0 text-[var(--muted)]"
                        />
                        <p className="text-xs leading-relaxed text-[var(--muted)]">
                          <span className="font-bold">Reaksi mereka: </span>
                          {selectedChoice.reply}
                        </p>
                      </div>
                    )}

                    {isUnsafeAnswer && (
                      <p className="mt-3 text-xs font-bold leading-relaxed text-[var(--warning)]">
                        Level ini belum selesai. Pelajari jebakannya, lalu coba
                        lagi dengan pilihan yang lebih aman.
                      </p>
                    )}
                  </div>

                  <div
                    data-tutorial="insight"
                    className="mt-4 rounded-2xl border border-[var(--border)] p-5"
                  >
                    <div className="flex items-center gap-2">
                      <Brain size={18} className="text-[var(--brand)]" />
                      <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                        Kenali jebakan pikirannya
                      </h3>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                      {selectedChoice.explanation}
                    </p>

                    <div className="mt-4 rounded-xl bg-[var(--brand-soft)] p-4">
                      <div className="flex items-center gap-2 text-[var(--brand)]">
                        <Lightbulb size={16} />
                        <span className="text-xs font-extrabold">
                          Yang bisa kamu lakukan
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--brand-dark)]">
                        {selectedChoice.saferAction}
                      </p>
                    </div>
                  </div>

                  <button
                    data-tutorial="next"
                    onClick={handleNext}
                    disabled={saving}
                    className={`button mt-5 w-full ${
                      isUnsafeAnswer ? "button-secondary" : "button-primary"
                    }`}
                  >
                    {saving ? (
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
                Capai Level {totalCount}. Di level tinggi, jebakannya tidak
                selalu datang dari orang lain: kadang justru dari rasa yakin
                dan keinginanmu sendiri untuk dibenarkan.
              </p>
            </div>

            <div
              data-tutorial="tactics"
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert size={17} className="text-[var(--warning)]" />
                <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                  Trik yang sering dipakai
                </h3>
              </div>

              <ul className="mt-3 space-y-3">
                {TACTICS.map((tactic) => (
                  <li key={tactic.name} className="text-xs leading-relaxed">
                    <p className="font-bold text-[var(--foreground)]">
                      {tactic.name}
                    </p>
                    <p className="text-[var(--muted)]">{tactic.hint}</p>
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
              <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
                Kamu berhak mengambil waktu untuk berpikir. Tidak perlu
                mengikuti keputusan hanya karena seseorang mendesakmu, dan
                tawaran yang sah akan tetap ada setelah kamu menundanya.
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
                    /{MIND_TRAP_MAX_XP}
                  </span>
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-white/60">
                  Level tinggi bernilai lebih besar. Jawaban salah mengurangi
                  XP level itu. Selesaikan Level {totalCount} untuk bonus{" "}
                  {MIND_TRAP_MASTER_BONUS} XP dan lencana Mind Guardian.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <MindTrapTutorial
        active={tutorialActive}
        hasSelectedChoice={!!selectedChoice}
        onClose={closeTutorial}
      />
    </main>
  );
}