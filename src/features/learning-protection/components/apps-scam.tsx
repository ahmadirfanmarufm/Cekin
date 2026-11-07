"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BatteryFull,
  Check,
  CheckCircle2,
  CircleStar,
  Clock3,
  Crown,
  Download,
  ExternalLink,
  Eye,
  FileWarning,
  Gamepad2,
  HelpCircle,
  Lightbulb,
  Lock,
  LockKeyhole,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Signal,
  Smartphone,
  Star,
  Store,
  Trophy,
  Wifi,
  X,
  Zap,
} from "lucide-react";

import type {
  ScenarioDifficulty,
  SimulationChoice,
  SimulationConfig,
} from "@/types/learning-protection/index";
import { seededShuffle } from "@/lib/learning-protection/shuffle";
import {
  APPS_SCAM_MASTER_BONUS,
  APPS_SCAM_MAX_XP,
  appsScamLevelXp,
  calculateAppsScamXp,
} from "@/lib/learning-protection/xp";
import { AppsScamTutorial, APPS_SCAM_TUTORIAL_KEY } from "./apps-scam-tutorial";
import {
  LOGIN_GATE_AFTER_LEVEL,
  buildLoginHref,
  useLearningProgress,
} from "@/lib/learning-protection/use-learning-progress";
import { useLoginGate } from "@/lib/learning-protection/use-login-gate";
import { LoginGate } from "./login-gate";

type Props = {
  simulation: SimulationConfig;
};

type SimulationView = "store" | "detail" | "permissions" | "result";

const riskStyles = {
  Rendah: "border-[var(--accent)]/25 bg-[var(--accent-soft)] text-[var(--accent)]",
  Sedang: "border-[var(--warning)]/30 bg-[var(--warning)]/10 text-[#9a6700]",
  Tinggi: "border-orange-300 bg-orange-50 text-orange-800",
  Kritis: "border-[var(--danger)]/25 bg-[var(--danger)]/10 text-[var(--danger)]",
} as const;

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

export function AppsScam({ simulation }: Props) {
  const scenarios = useMemo(
    () => simulation.scenarios.filter((scenario) => scenario.appDetails),
    [simulation.scenarios],
  );
  const totalCount = scenarios.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [view, setView] = useState<SimulationView>("store");
  const [selectedChoice, setSelectedChoice] = useState<SimulationChoice | null>(null);
  const [attempts, setAttempts] = useState<Record<string, string[]>>({});
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [safeIds, setSafeIds] = useState<string[]>([]);
  const [runSeed, setRunSeed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [rewardMessage, setRewardMessage] = useState("");
  const [isSavingReward, setIsSavingReward] = useState(false);
  const [isEducationOpen, setIsEducationOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [declinedLogin, setDeclinedLogin] = useState(false);

  const mainContentRef = useRef<HTMLElement | null>(null);
  const phoneContentRef = useRef<HTMLDivElement | null>(null);
  const resultRef = useRef<HTMLElement | null>(null);

  const currentScenario = scenarios[currentIndex];
  const app = currentScenario?.appDetails;

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
    appsScamLevelXp(index + 1, wrongCountOf(scenario.id)),
  );

  const earnedLevelXp = scenarios.reduce(
    (sum, scenario, index) =>
      completedIds.includes(scenario.id) ? sum + levelXpList[index] : sum,
    0,
  );

  const potentialXp = levelXpList.reduce((sum, xp) => sum + xp, 0) + APPS_SCAM_MASTER_BONUS;
  const currentLevelXp = levelXpList[currentIndex] ?? 0;
  const progress = totalCount ? (completedIds.length / totalCount) * 100 : 0;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      mainContentRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });

      phoneContentRef.current?.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [view, currentIndex]);

  useEffect(() => {
    if (!finished) return;

    const frame = window.requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [finished]);

  useEffect(() => {
    if (!isEducationOpen && !showGuide) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsEducationOpen(false);
        setShowGuide(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [isEducationOpen, showGuide]);

  const [tutorialActive, setTutorialActive] = useState(false);
  const tutorialSnapshot = useRef<{
    currentIndex: number;
    view: SimulationView;
    completedIds: string[];
    safeIds: string[];
    attempts: Record<string, string[]>;
  } | null>(null);
  const tutorialStorageKey = useRef(`${APPS_SCAM_TUTORIAL_KEY}:guest`);

  const startTutorial = () => {
    tutorialSnapshot.current = { currentIndex, view, completedIds, safeIds, attempts };
    setCurrentIndex(0);
    setView("store");
    setCompletedIds([]);
    setSafeIds([]);
    setAttempts({});
    setSelectedChoice(null);
    setIsEducationOpen(false);
    setShowGuide(false);
    setTutorialActive(true);
  };

  const closeTutorial = (completed: boolean) => {
    const snapshot = tutorialSnapshot.current;
    if (snapshot) {
      setCurrentIndex(snapshot.currentIndex);
      setView(snapshot.view);
      setCompletedIds(snapshot.completedIds);
      setSafeIds(snapshot.safeIds);
      setAttempts(snapshot.attempts);
    }
    setSelectedChoice(null);
    setIsEducationOpen(false);
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

  const learning = useLearningProgress({
    simulationId: "apps-scam",
    scenarioIds: scenarios.map((scenario) => scenario.id),
    attemptsShape: "choices",
    paused: tutorialActive,
    snapshot: {
      currentIndex, completedIds, safeIds, attempts,
      runSeed, finished, rewardMessage, declinedLogin,
    },
    onRestore: (saved) => {
      setCurrentIndex(saved.currentIndex);
      setView("store");
      setCompletedIds(saved.completedIds);
      setSafeIds(saved.safeIds ?? []);
      setAttempts(saved.attempts as Record<string, string[]>);
      setRunSeed(saved.runSeed);
      setFinished(Boolean(saved.finished));
      setRewardMessage(saved.rewardMessage ?? "");
      setDeclinedLogin(Boolean(saved.declinedLogin));
    },
  });
  const session = learning.session;

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const decide = async () => {
      let userId = "guest";
      let completed = false;

      try {
        const response = await fetch(
          "/api/learning-protection/progress?simulationId=apps-scam",
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

      tutorialStorageKey.current = `${APPS_SCAM_TUTORIAL_KEY}:${userId}`;

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

  if (!currentScenario || !app || totalCount === 0) {
    return (
      <main className="container py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]">
          <Store size={26} />
        </div>

        <h1 className="heading heading-2 mt-5">Skenario belum tersedia</h1>

        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--muted)]">
          Konten simulasi aplikasi sedang disiapkan. Silakan kembali lagi nanti.
        </p>

        <Link href="/learning-protection" className="button button-primary mt-6">
          <ArrowLeft size={16} />
          Kembali ke Learning & Protection
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
        body: JSON.stringify({ simulationId: "apps-scam", answers: attempts }),
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
      const maxXp: number = result.maxXp ?? APPS_SCAM_MAX_XP;

      if (result.xpEarned > 0) {
        setRewardMessage(
          scoreXp >= maxXp
            ? `Sempurna! Kamu mendapatkan ${result.xpEarned} XP dari Apps Scam.`
            : `Kamu mendapatkan ${result.xpEarned} XP (skor ${scoreXp}/${maxXp}). Ulangi tanpa salah untuk XP maksimal.`,
        );
      } else if ((result.bestXp ?? 0) >= maxXp) {
        setRewardMessage("Kamu sudah meraih XP maksimal di Apps Scam.");
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

    setIsEducationOpen(false);
    setView("result");
  };

  function goNextLevel() {
    setCurrentIndex((previous) => previous + 1);
    setSelectedChoice(null);
    setView("store");
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
    if (!selectedChoice || isSavingReward) return;

    if (!selectedChoice.isSafe) {
      setSelectedChoice(null);
      setView("detail");
      return;
    }

    if (currentIndex < totalCount - 1) {
      if (!isLastLevel) {
        if (gate.request()) return;
        goNextLevel();
        return;
      }

      const needsLogin = session.ready && !session.authenticated && !declinedLogin && !tutorialActive && currentIndex === LOGIN_GATE_AFTER_LEVEL - 1;

      if (needsLogin) {
        setGateOpen(true);
        return;
      }

      goNextLevel();
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

  const handleRestart = () => {
    setCurrentIndex(0);
    setView("store");
    setSelectedChoice(null);
    setAttempts({});
    setCompletedIds([]);
    setSafeIds([]);
    setRunSeed((previous) => previous + 1);
    setFinished(false);
    setRewardMessage("");
    setIsSavingReward(false);
    setIsEducationOpen(false);
    setShowGuide(false);
    setDeclinedLogin(false);
  };
  
  /* ---------- Modal ---------- */

  const educationModal = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={() => setIsEducationOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="permission-guide-title"
        onClick={(event) => event.stopPropagation()}
        className="my-auto w-full max-w-md overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--card)] shadow-2xl"
      >
        <div className="relative overflow-hidden bg-[var(--brand-dark)] px-6 py-7 text-white">
          <button
            type="button"
            aria-label="Tutup panduan"
            onClick={() => setIsEducationOpen(false)}
            className="absolute right-4 top-4 rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <LockKeyhole size={24} />
          </div>

          <p className="mt-5 text-[10px] font-extrabold tracking-[0.18em] text-white/60">
            SEBELUM MELANJUTKAN
          </p>

          <h2 id="permission-guide-title" className="mt-2 text-2xl font-extrabold tracking-tight">
            Cek izin sebelum install.
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-white/75">
            Izin menentukan data dan fitur perangkat yang bisa diakses aplikasi.
          </p>
        </div>

        <div className="space-y-3 p-5 sm:p-6">
          <div className="flex items-start gap-3 rounded-2xl border border-[var(--border)] p-4">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[var(--accent)]" />
            <div>
              <p className="text-sm font-bold text-[var(--foreground)]">Cocokkan dengan fungsi</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                Aplikasi ojek butuh lokasi. Aplikasi senter tidak butuh SMS atau kontak.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-[var(--border)] p-4">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[var(--warning)]" />
            <div>
              <p className="text-sm font-bold text-[var(--foreground)]">Waspadai izin sensitif</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                SMS, aksesibilitas, tampil di atas aplikasi lain, kontak, dan rekam layar bisa membuka akses ke data pribadi dan OTP.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-[var(--brand-soft)] p-4">
            <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[var(--brand)]" />
            <p className="text-xs leading-relaxed text-[var(--brand-dark)]">
              <strong>Ingat:</strong> bedakan izin yang sesuai fungsi dan izin yang berlebihan. Tidak semua izin sensitif berarti bahaya, tetapi periksa alasannya.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsEducationOpen(false)}
            className="button button-primary mt-2 w-full"
          >
            Saya Mengerti, Lanjutkan
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  const guideItems = [
    ["Sumber unduhan", "Utamakan toko resmi. Hindari APK dari chat, iklan, atau situs tak dikenal."],
    ["Identitas developer", "Cocokkan nama developer dengan penerbit resmi, dan periksa umur serta riwayat rilisnya."],
    ["Ulasan", "Baca ulasan terbaru. Waspadai ulasan seragam atau akun yang baru dibuat."],
    ["Izin aplikasi", "Cocokkan setiap izin dengan fungsi. Tolak yang opsional."],
    ["Siapa yang menyuruh", "Waspadai aplikasi yang dipasang atas permintaan penelepon, grup, atau iklan."],
  ];

  const guideModal = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={() => setShowGuide(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-guide-title"
        onClick={(event) => event.stopPropagation()}
        className="my-auto w-full max-w-md overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--card)] shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] p-5">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
              <ShieldCheck size={21} />
            </div>
            <h2 id="app-guide-title" className="mt-4 text-xl font-extrabold text-[var(--foreground)]">
              Panduan cek aplikasi
            </h2>
            <p className="mt-1 text-xs text-[var(--muted)]">Ingat lima hal ini sebelum memasang aplikasi.</p>
          </div>

          <button
            type="button"
            aria-label="Tutup panduan"
            onClick={() => setShowGuide(false)}
            className="rounded-full p-2 text-[var(--muted)] transition hover:bg-[var(--surface)]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 p-5">
          {guideItems.map(([title, description], index) => (
            <div key={title} className="flex items-start gap-3 rounded-xl bg-[var(--surface)] p-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-xs font-extrabold text-[var(--brand)]">
                {index + 1}
              </span>
              <div>
                <p className="text-xs font-bold text-[var(--foreground)]">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{description}</p>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setShowGuide(false)}
            className="button button-primary mt-2 w-full"
          >
            Mengerti
            <Check size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  /* ========================================
     LAYAR REWARD: LEVEL MAKSIMAL
  ======================================== */

  if (finished) {
    const wrongCounts = scenarios.map((scenario) => wrongCountOf(scenario.id));
    const finalXp = calculateAppsScamXp(wrongCounts);
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
                {isPerfect ? "Perfect App Guardian!" : "Selamat, App Guardian!"}
              </h1>

              <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/80">
                Kamu menamatkan seluruh {totalCount} level, dari APK MOD sampai pembaruan berbahaya yang menyamar jadi aplikasi tepercaya.
              </p>

              <div className="relative mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-yellow-300 px-4 py-2 text-xs font-extrabold text-[var(--brand-dark)]">
                <Trophy size={16} />
                Lencana App Guardian
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
                    <span className="text-base font-bold text-[var(--muted)]">/{APPS_SCAM_MAX_XP}</span>
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
                      Bonus App Guardian
                    </span>
                    <span className="font-bold text-[var(--accent)]">+{finalXp.bonus} XP</span>
                  </li>
                </ul>

                <p className="mt-3 border-t border-[var(--border)] pt-3 text-xs leading-relaxed text-[var(--muted)]">
                  {isPerfect
                    ? "Tanpa satu pun keputusan kurang aman. Luar biasa!"
                    : `Kamu sempat ${totalWrong} kali memilih keputusan kurang aman. Ulangi tanpa salah untuk XP maksimal (${APPS_SCAM_MAX_XP} XP).`}
                </p>
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[var(--border)] p-5">
                <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]" />
                <div>
                  <h2 className="text-sm font-bold text-[var(--foreground)]">Prinsip utama Apps Scam</h2>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                    Toko resmi, rating tinggi, dan nama yang familier bukan jaminan mutlak. Periksa sumber, developer, izin, dan siapa yang menyuruhmu memasang. Jangan pernah memasang aplikasi atas permintaan penelepon atau pesan yang tidak kamu minta.
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

  const redFlagTitle =
    app.risk === "Rendah" ? "Sinyal yang menenangkan" : "Tanda yang perlu diperhatikan";

  return (
    <main className="container py-8 pb-16 md:py-12">
      <div className="mx-auto max-w-6xl">
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
              <Smartphone size={14} />
              GAME & APPS SCAM
            </div>

            <h1 className="heading heading-2 mt-4">Jangan asal install aplikasi.</h1>
            
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
              <span className="rounded-md bg-[var(--accent-soft)] px-2.5 py-1 font-extrabold text-[var(--accent)]">
                Potensi XP {potentialXp}/{APPS_SCAM_MAX_XP}
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

        {/* Peta level */}
        <div className="mb-6" data-tutorial="levels">
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

        {/* Main layout */}
        
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
            {/* Main Content */}
            <section
              ref={mainContentRef}
              className="min-w-0 scroll-mt-24 overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--card)] shadow-sm"
            >
              {/* Scenario Header */}
              <div className="border-b border-[var(--border)] bg-[var(--surface)] px-5 py-4 md:px-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[10px] font-extrabold tracking-[0.16em] text-[var(--brand)]">
                    LEVEL {currentIndex + 1} DARI {totalCount}
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    {currentScenario.difficulty && (
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${
                          DIFFICULTY_STYLES[currentScenario.difficulty]
                        }`}
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

              {/* Phone Simulation */}
              <div className="p-4 md:p-6">
                {/* iPhone Mockup */}
                <div
                  className="relative mx-auto w-full max-w-[390px]"
                  aria-label="Simulasi toko aplikasi pada perangkat iPhone"
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
                    <div
                      ref={phoneContentRef}
                      data-tutorial-scroll
                      className="relative max-h-[850px] min-h-[620px] overflow-y-auto rounded-[30px] bg-[var(--card)] sm:rounded-[35px]"
                    >
                      {/* Phone Status Bar */}
                      <div className="relative flex h-10 items-center justify-between bg-[var(--surface)] px-5 pt-1 text-[var(--foreground)]">
                        <span className="text-[10px] font-bold">09:41</span>

                        {/* Dynamic Island */}
                        <div className="absolute left-1/2 top-2 h-[19px] w-[75px] -translate-x-1/2 rounded-full bg-[#111827] sm:w-[80px]" />

                        {/* Status Icons */}
                        <div className="flex items-center gap-1.5">
                          <Signal size={12} />
                          <Wifi size={12} />
                          <BatteryFull size={14} />
                        </div>
                      </div>

                      {/* Store */}
                      {view === "store" && (
                        <div className="min-h-[600px] space-y-4 p-4">
                          <div
                            data-tutorial="found"
                            className="rounded-xl border border-[var(--brand)]/15 bg-[var(--brand-soft)] p-3"
                          >
                            <p className="text-[10px] font-extrabold tracking-wider text-[var(--brand)]">
                              BAGAIMANA KAMU MENEMUKANNYA
                            </p>
                            <p className="mt-2 text-xs leading-5 text-[var(--brand-dark)]">
                              {app.foundVia}
                            </p>
                          </div>

                          <button
                            data-tutorial="app-card"
                            type="button"
                            onClick={() => setView("detail")}
                            className="group flex w-full items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 text-left transition transition-300 hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
                          >
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                              <Download size={23} />
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-xs font-bold text-[var(--foreground)]">
                                {app.name}
                              </span>
                              <span className="mt-1 block truncate text-[10px] text-[var(--muted)]">
                                {app.developer}
                              </span>
                              <span className="mt-1 flex items-center gap-1 text-[10px] text-[var(--muted)]">
                                <Star size={10} className="fill-amber-400 text-amber-400" />
                                {app.rating}
                                <span>·</span>
                                {app.downloads}
                              </span>
                            </span>

                            <ArrowRight
                              size={16}
                              className="shrink-0 text-[var(--muted)] transition group-hover:translate-x-1 group-hover:text-[var(--brand)]"
                            />
                          </button>

                          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                            <p className="text-[10px] leading-5 text-[var(--muted)]">
                              Semua aplikasi di halaman ini adalah fiksi. Kamu sedang berlatih mengenali tanda aplikasi berisiko, juga mengenali aplikasi yang aman.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* App Detail */}
                      {view === "detail" && (
                        <div className="min-h-[600px] p-5">
                          <button
                            type="button"
                            onClick={() => setView("store")}
                            className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted)] transition hover:text-[var(--brand)]"
                          >
                            <ArrowLeft size={15} />
                            Kembali
                          </button>

                          <div className="flex flex-col items-center text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--brand-soft)] text-[var(--brand)]">
                              <Gamepad2 size={38} />
                            </div>

                            <h2 className="mt-4 text-xl font-extrabold text-[var(--foreground)]">
                              {app.name}
                            </h2>

                            <p className="mt-1 text-xs text-[var(--muted)]">
                              {app.developer}
                            </p>
                          </div>

                          <div className="my-6 grid grid-cols-3 divide-x divide-[var(--border)] rounded-xl border border-[var(--border)] py-3 text-center">
                            <div>
                              <div className="flex items-center justify-center gap-1 text-xs font-bold text-[var(--foreground)]">
                                <Star size={12} className="fill-amber-400 text-amber-400" />
                                {app.rating}
                              </div>
                              <p className="mt-1 text-[9px] text-[var(--muted)]">Rating</p>
                            </div>

                            <div>
                              <p className="text-xs font-bold text-[var(--foreground)]">
                                {app.downloads}
                              </p>
                              <p className="mt-1 text-[9px] text-[var(--muted)]">Unduhan</p>
                            </div>

                            <div>
                              <p className="text-xs font-bold text-[var(--foreground)]">
                                {app.category}
                              </p>
                              <p className="mt-1 text-[9px] text-[var(--muted)]">Kategori</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div data-tutorial="soruce">
                              <p className="text-[10px] font-extrabold tracking-wider text-[var(--muted)]">
                                SUMBER UNDUHAN
                              </p>
                              <div className="mt-2 flex items-center gap-2">
                                {app.sourceType === "official" ? (
                                  <Store size={16} className="text-[var(--accent)]" />
                                ) : (
                                  <ExternalLink size={16} className="text-[var(--danger)]" />
                                )}
                                <p className="text-xs font-semibold text-[var(--foreground)]">
                                  {app.source}
                                </p>
                              </div>
                            </div>

                            <div>
                              <p className="text-[10px] font-extrabold tracking-wider text-[var(--muted)]">
                                DESKRIPSI
                              </p>
                              <p className="mt-2 text-xs leading-6 text-[var(--muted)]">
                                {app.description}
                              </p>
                            </div>

                            <div
                              data-tutorial="claim"
                              className="rounded-xl border border-[var(--warning)]/30 bg-[var(--warning)]/10 p-3"
                            >
                              <div className="flex items-center gap-2 text-[var(--foreground)]">
                                <AlertTriangle size={15} className="text-[var(--warning)]" />
                                <p className="text-[10px] font-extrabold">KLAIM PROMOSI</p>
                              </div>
                              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                                {app.claim}
                              </p>
                            </div>

                            {app.details && app.details.length > 0 && (
                              <div className="rounded-xl border border-[var(--border)] p-3">
                                <p className="text-[10px] font-extrabold text-[var(--foreground)]">
                                  INFORMASI TAMBAHAN
                                </p>
                                <ul className="mt-2 space-y-2">
                                  {app.details.map((item) => (
                                    <li key={item.label} className="text-xs leading-5">
                                      <span className="font-bold text-[var(--foreground)]">
                                        {item.label}:{" "}
                                      </span>
                                      <span className="text-[var(--muted)]">
                                        {item.value}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div
                              data-tutorial="reviews"
                              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"
                            >
                              <p className="text-[10px] font-extrabold text-[var(--foreground)]">
                                INFORMASI ULASAN
                              </p>
                              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                                {app.reviews}
                              </p>
                            </div>
                          </div>

                          <button
                            data-tutorial="check-permissions"
                            type="button"
                            onClick={() => {
                              setView("permissions");
                              setIsEducationOpen(!tutorialActive && currentIndex === 0 && attemptNumber === 0);
                            }}
                            className="button button-primary mt-6 w-full"
                          >
                            Periksa Izin Aplikasi
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      )}

                      {/* Permissions + Keputusan */}
                      {view === "permissions" && (
                        <div className="min-h-[600px] p-5">
                          <button
                            type="button"
                            onClick={() => {
                              setView("detail");
                              setIsEducationOpen(false);
                            }}
                            className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted)] transition hover:text-[var(--brand)]"
                          >
                            <ArrowLeft size={15} />
                            Kembali ke detail
                          </button>

                          <div className="mb-5">
                            <p className="text-[10px] font-extrabold tracking-wider text-[var(--brand)]">
                              APP PERMISSION CHECK
                            </p>
                            <h2 className="mt-2 text-xl font-extrabold text-[var(--foreground)]">
                              Izin yang diminta
                            </h2>
                            <p className="mt-2 text-xs leading-6 text-[var(--muted)]">
                              Apakah setiap izin ini memang diperlukan untuk fungsi aplikasi?
                            </p>
                          </div>

                          <div data-tutorial="permissions" className="space-y-2">
                            {app.permissions.map((permission) => (
                              <div
                                key={permission.name}
                                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] p-3"
                              >
                                <div className="flex min-w-0 items-center gap-2.5">
                                  {permission.suspicious ? (
                                    <AlertTriangle size={17} className="shrink-0 text-[var(--warning)]" />
                                  ) : (
                                    <CheckCircle2 size={17} className="shrink-0 text-[var(--accent)]" />
                                  )}

                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-[var(--foreground)]">
                                      {permission.name}
                                    </p>
                                    <p className="mt-0.5 text-[10px] leading-4 text-[var(--muted)]">
                                      {permission.reason}
                                    </p>
                                  </div>
                                </div>

                                <span
                                  className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold ${
                                    permission.suspicious
                                      ? "bg-[var(--warning)]/10 text-[#9a6700]"
                                      : "bg-[var(--accent-soft)] text-[var(--accent)]"
                                  }`}
                                >
                                  {permission.suspicious ? "Periksa" : "Wajar"}
                                </span>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsEducationOpen(true)}
                            className="mt-4 flex w-full items-center gap-2 rounded-xl border border-[var(--brand)]/20 bg-[var(--brand-soft)] p-3 text-left transition hover:border-[var(--brand)]"
                          >
                            <Lightbulb size={17} className="shrink-0 text-[var(--brand)]" />
                            <span className="flex-1 text-[10px] font-semibold leading-relaxed text-[var(--brand-dark)]">
                              Belum yakin izin mana yang berbahaya? Buka panduan singkat.
                            </span>
                            <ArrowRight size={15} className="shrink-0 text-[var(--brand)]" />
                          </button>

                          <div className="mt-5 border-t border-[var(--border)] pt-5">
                            <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                              Apa keputusanmu?
                            </h3>
                            <p className="mb-3 mt-1 text-[11px] text-[var(--muted)]">
                              Pilih tindakan yang paling tepat berdasarkan semua informasi tadi.
                            </p>

                            <div data-tutorial="choices" className="space-y-2">
                              {displayChoices.map((choice, index) => (
                                <button
                                  key={choice.id}
                                  type="button"
                                  onClick={() => handleChoice(choice)}
                                  className="group flex w-full items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-left transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
                                >
                                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--surface)] text-[10px] font-extrabold text-[var(--muted)] group-hover:bg-white group-hover:text-[var(--brand)]">
                                    {String.fromCharCode(65 + index)}
                                  </span>

                                  <span className="flex-1 text-[11px] font-semibold leading-relaxed text-[var(--foreground)]">
                                    {choice.label}
                                  </span>

                                  <ArrowRight
                                    size={14}
                                    className="shrink-0 text-[var(--muted)] transition group-hover:translate-x-1 group-hover:text-[var(--brand)]"
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Hasil Keputusan */}
                      {view === "result" && selectedChoice && (
                        <div className="flex min-h-[600px] flex-col p-5">
                          <div className="flex flex-1 flex-col items-center pt-7 text-center">
                            <div
                              className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${
                                selectedChoice.isSafe
                                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                                  : "bg-[var(--danger)]/10 text-[var(--danger)]"
                              }`}
                            >
                              {selectedChoice.isSafe ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
                            </div>

                            <p className="text-[10px] font-extrabold tracking-wider text-[var(--muted)]">
                              HASIL KEPUTUSAN
                            </p>

                            <h2 className="mt-2 text-xl font-extrabold text-[var(--foreground)]">
                              {selectedChoice.isSafe
                                ? `Level ${currentIndex + 1} selesai!`
                                : "Keputusan kurang tepat."}
                            </h2>

                            <span
                              className={`mt-3 rounded-full px-3 py-1 text-[10px] font-extrabold text-white ${
                                selectedChoice.isSafe ? "bg-[var(--accent)]" : "bg-[var(--warning)]"
                              }`}
                            >
                              {selectedChoice.isSafe
                                ? `+${currentLevelXp} XP`
                                : `XP level ini turun ke ${currentLevelXp}`}
                            </span>

                            <div data-tutorial="feedback" className="w-full">
                              <div className="mt-4 w-full rounded-xl bg-[var(--surface)] p-3 text-left">
                                <p className="text-[10px] font-extrabold tracking-wider text-[var(--muted)]">
                                  KEPUTUSANMU
                                </p>
                                <p className="mt-1 text-xs leading-5 text-[var(--foreground)]">
                                  {selectedChoice.label}
                                </p>
                              </div>

                              <p className="mt-4 text-xs leading-6 text-[var(--foreground)]">
                                {selectedChoice.feedback}
                              </p>

                              <p className="mt-2 text-xs leading-6 text-[var(--muted)]">
                                {selectedChoice.explanation}
                              </p>
                            </div>

                            <div
                              data-tutorial="red-flags"
                              className="mt-5 w-full rounded-xl border border-[var(--warning)]/30 bg-[var(--warning)]/10 p-4 text-left"
                            >
                              <div className="flex items-center gap-2 text-xs font-extrabold text-[var(--foreground)]">
                                <AlertTriangle size={16} className="text-[var(--warning)]" />
                                {redFlagTitle}
                              </div>

                              <ul className="mt-3 space-y-2">
                                {app.redFlags.map((flag) => (
                                  <li
                                    key={flag}
                                    className="flex gap-2 text-[10px] leading-5 text-[var(--muted)]"
                                  >
                                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--warning)]" />
                                    {flag}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="mt-3 w-full rounded-xl border border-[var(--accent)]/20 bg-[var(--accent-soft)] p-4 text-left">
                              <div className="flex items-center gap-2 text-xs font-extrabold text-[var(--accent)]">
                                <ShieldCheck size={16} />
                                Langkah yang lebih aman
                              </div>

                              <p className="mt-2 text-xs leading-5 text-[var(--foreground)]">
                                {selectedChoice.saferAction}
                              </p>
                            </div>

                            {isUnsafe && (
                              <div className="mt-3 w-full rounded-xl border border-[var(--danger)]/20 bg-[var(--danger)]/5 p-4 text-left">
                                <div className="flex items-center gap-2 text-xs font-extrabold text-[var(--danger)]">
                                  <FileWarning size={16} />
                                  Jika sudah terlanjur
                                </div>

                                <ul className="mt-3 space-y-2">
                                  {app.postInstall.slice(0, 4).map((step, index) => (
                                    <li
                                      key={step}
                                      className="flex gap-2 text-[10px] leading-5 text-[var(--muted)]"
                                    >
                                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--danger)]/10 text-[10px] font-bold text-[var(--danger)]">
                                        {index + 1}
                                      </span>
                                      {step}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          <div className="mt-6 border-t border-[var(--border)] pt-5">
                            <button
                              data-tutorial="next"
                              type="button"
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

                            <p className="mt-3 text-center text-[10px] text-[var(--muted)]">
                              CEKIN · App Security Lab
                            </p>
                          </div>
                        </div>
                      )}

                      {/* iPhone Home Indicator */}
                      <div className="sticky bottom-0 flex justify-center border-t border-[var(--border)] bg-[var(--card)] pb-2.5 pt-2">
                        <div className="h-1 w-20 rounded-full bg-[#17233b]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulation Disclaimer */}
                <p className="mt-4 text-center text-[10px] leading-relaxed text-[var(--muted)]">
                  Tampilan toko aplikasi ini merupakan simulasi fiktif, bukan toko aplikasi sungguhan.
                </p>
              </div>
            </section>

            {/* Side Panel */}
            <aside className="space-y-4">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                  <Lightbulb size={20} />
                </div>

                <h2 className="mt-4 text-sm font-extrabold text-[var(--foreground)]">
                  Misi kamu
                </h2>

                <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                  {view === "store"
                    ? "Perhatikan bagaimana aplikasi ini sampai ke tanganmu. Itu petunjuk pertama."
                    : view === "detail"
                      ? "Periksa sumber, developer, klaim, ulasan, dan informasi tambahan."
                      : view === "permissions"
                        ? "Cocokkan izin dengan fungsi, lalu putuskan tindakan yang paling tepat."
                        : "Pahami alasan keputusanmu. Level baru terbuka jika keputusanmu aman."}
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={17} className="text-[var(--accent)]" />
                  <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                    Checklist keamanan
                  </h3>
                </div>

                <ul className="mt-4 space-y-3">
                  {[
                    "Gunakan sumber unduhan resmi.",
                    "Cocokkan developer dengan penerbit resmi.",
                    "Baca ulasan terbaru.",
                    "Cek izin sesuai fungsi.",
                    "Jangan pasang karena disuruh orang lain.",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs leading-relaxed text-[var(--muted)]"
                    >
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                      {item}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => setShowGuide(true)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--brand)]/20 bg-[var(--brand-soft)] px-3 py-3 text-xs font-bold text-[var(--brand)] transition hover:border-[var(--brand)]"
                >
                  <Eye size={15} />
                  Buka panduan singkat
                </button>
              </div>

              <div className="rounded-2xl bg-[var(--brand-dark)] p-5 text-white">
                <p className="text-[10px] font-extrabold tracking-[0.15em] text-white/60">
                  PROGRESS
                </p>

                <p className="mt-2 text-3xl font-extrabold tabular-nums">
                  {Math.round(progress)}%
                </p>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="mt-3 text-xs text-white/70">
                  {completedIds.length} dari {totalCount} level telah kamu selesaikan.
                </p>

                <div className="mt-4 border-t border-white/15 pt-3">
                  <p className="text-[10px] font-extrabold tracking-[0.15em] text-white/60">
                    POTENSI XP
                  </p>
                  <p className="mt-1 text-lg font-extrabold">
                    {potentialXp}
                    <span className="text-xs font-bold text-white/60">
                      /{APPS_SCAM_MAX_XP}
                    </span>
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-white/60">
                    Level tinggi bernilai lebih besar. Keputusan salah mengurangi XP level itu. Selesaikan Level {totalCount} untuk bonus {APPS_SCAM_MASTER_BONUS} XP dan lencana App Guardian.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--warning)]/25 bg-[var(--warning)]/10 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)]">
                  <AlertTriangle size={17} className="text-[var(--warning)]" />
                  Sudah terlanjur memasang?
                </div>

                <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                  Jangan buka aplikasinya, cabut izin, uninstall, lalu jalankan pemindaian keamanan. Jika terkait akun keuangan, hubungi bank lewat kanal resmi.
                </p>
              </div>
            </aside>
          </div>

        <p className="mt-8 text-center text-xs leading-6 text-[var(--muted)]">
          CEKIN Learning & Protection - Semua aplikasi, developer, rating, dan ulasan merupakan simulasi fiktif.
        </p>
      </div>

      {isEducationOpen && educationModal}
      {showGuide && guideModal}

      <LoginGate
        open={gate.open}
        earnedXp={earnedLevelXp}
        onAuthenticated={gate.onAuthenticated}
        onContinue={gate.onContinue}
      />

      <AppsScamTutorial
        active={tutorialActive}
        view={view}
        hasSelectedChoice={!!selectedChoice}
        onClose={closeTutorial}
      />
    </main>
  );
}