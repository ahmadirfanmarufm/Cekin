
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  Eye,
  FileWarning,
  Gamepad2,
  Lightbulb,
  LockKeyhole,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Star,
  Store,
  Trophy,
  X,
} from "lucide-react";

import type {
  AppScenarioData,
  SimulationConfig,
} from "@/types/learning-protection/index";

type Props = {
  simulation: SimulationConfig;
};

type AppScenario = AppScenarioData & {
  id: string;
};

type UserAction = "install" | "verify" | "cancel";

type SimulationView = "store" | "detail" | "permissions" | "result";

const riskStyles = {
  Rendah: "border-[var(--accent)]/25 bg-[var(--accent-soft)] text-[var(--accent)]",
  Sedang: "border-[var(--warning)]/30 bg-[var(--warning)]/10 text-[#9a6700]",
  Tinggi: "border-orange-300 bg-orange-50 text-orange-800",
  Kritis: "border-[var(--danger)]/25 bg-[var(--danger)]/10 text-[var(--danger)]",
} as const;

const steps = [
  { id: "store", label: "Temukan aplikasi", icon: Store },
  { id: "detail", label: "Periksa detail", icon: Eye },
  { id: "permissions", label: "Periksa izin", icon: LockKeyhole },
] as const;

export function AppsScam({ simulation }: Props) {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [attemptsCompleted, setAttemptsCompleted] = useState(0);
  const [attemptedAppIds, setAttemptedAppIds] = useState<string[]>([]);
  const [view, setView] = useState<SimulationView>("store");
  const [action, setAction] = useState<UserAction | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [finished, setFinished] = useState(false);
  const [rewardMessage, setRewardMessage] = useState("");
  const [isSavingReward, setIsSavingReward] = useState(false);
  const [isEducationOpen, setIsEducationOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const mainContentRef = useRef<HTMLElement | null>(null);
  const phoneContentRef = useRef<HTMLDivElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const appScenarios: AppScenario[] = simulation.scenarios.flatMap(
    (scenario) =>
      scenario.appDetails
        ? [
            {
              id: scenario.id,
              ...scenario.appDetails,
            },
          ]
        : [],
  );

  const totalScenarios = appScenarios.length;

  const availableApps = appScenarios.filter(
    (app) => !attemptedAppIds.includes(app.id),
  );

  const currentApp =
    appScenarios.find((app) => app.id === selectedAppId) ??
    availableApps[0] ??
    appScenarios[0];

  const progress =
    totalScenarios > 0
      ? (attemptsCompleted / totalScenarios) * 100
      : 0;

  const isSafeDecision =
    currentApp?.risk === "Rendah"
      ? action === "install" || action === "verify"
      : action === "verify" || action === "cancel";

  const activeStep =
    view === "store" ? 0 : view === "detail" ? 1 : 2;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

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
  }, [view, selectedAppId]);

  useEffect(() => {
    if (!finished) return;

    const frame = window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      resultRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
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

  if (!currentApp || totalScenarios === 0) {
    return (
      <main className="container py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]">
          <Store size={26} />
        </div>

        <h1 className="heading heading-2 mt-5">
          Skenario belum tersedia
        </h1>

        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--muted)]">
          Konten simulasi aplikasi sedang disiapkan. Silakan kembali lagi
          nanti.
        </p>

        <Link
          href="/learning-protection"
          className="button button-primary mt-6"
        >
          <ArrowLeft size={16} />
          Kembali ke Learning & Protection
        </Link>
      </main>
    );
  }

  const saveSimulationCompletion = async () => {
    try {
      const response = await fetch("/api/learning-protection/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          simulationId: "apps-scam",
        }),
      });

      if (response.status === 401) {
        setRewardMessage(
          "Kamu sudah menyelesaikan simulasi. Login untuk menyimpan progres dan mendapatkan XP.",
        );
        return;
      }

      let result: {
        message?: string;
        alreadyCompleted?: boolean;
        xpEarned?: number;
      } = {};

      try {
        result = await response.json();
      } catch {
        // Respons kosong tetap ditangani melalui status HTTP.
      }

      if (!response.ok) {
        setRewardMessage(
          result.message ?? "Gagal menyimpan progres simulasi.",
        );
        return;
      }

      if (result.alreadyCompleted) {
        setRewardMessage(
          "Simulasi ini sudah pernah kamu selesaikan. XP tidak diberikan dua kali.",
        );
        return;
      }

      setRewardMessage(
        result.xpEarned
          ? `Selamat! Kamu mendapatkan +${result.xpEarned} XP dari Game & Apps Scam.`
          : "Progres simulasi berhasil disimpan.",
      );

      window.dispatchEvent(new Event("cekin-auth-change"));
    } catch {
      setRewardMessage(
        "Simulasi selesai, tetapi koneksi gagal menyimpan progres. Silakan coba lagi nanti.",
      );
    }
  };

  const openApp = (appId: string) => {
    setSelectedAppId(appId);
    setAction(null);
    setView("detail");
    setIsEducationOpen(false);
  };

  const openPermissionCheck = () => {
    setView("permissions");
    setIsEducationOpen(true);
  };

  const handleDecision = (value: UserAction) => {
    if (action || !currentApp) return;

    const isSafe =
      currentApp.risk === "Rendah"
        ? value === "install" || value === "verify"
        : value === "verify" || value === "cancel";

    setAction(value);
    setAttemptsCompleted((previous) => previous + 1);
    setAttemptedAppIds((previous) =>
      previous.includes(currentApp.id)
        ? previous
        : [...previous, currentApp.id],
    );

    if (isSafe) {
      setCorrectAnswers((previous) => previous + 1);
    }

    setView("result");
  };

  const handleNext = async () => {
    if (!action || isSavingReward) return;

    if (attemptsCompleted >= totalScenarios) {
      setIsSavingReward(true);

      try {
        await saveSimulationCompletion();
        setFinished(true);
      } finally {
        setIsSavingReward(false);
      }

      return;
    }

    setSelectedAppId(null);
    setAction(null);
    setIsEducationOpen(false);
    setView("store");
  };

  const handleRestart = () => {
    setSelectedAppId(null);
    setAttemptsCompleted(0);
    setAttemptedAppIds([]);
    setView("store");
    setAction(null);
    setCorrectAnswers(0);
    setFinished(false);
    setRewardMessage("");
    setIsSavingReward(false);
    setIsEducationOpen(false);
    setShowGuide(false);
  };

  const getStepStatus = (index: number) => {
    if (view === "result") return "completed";
    if (index < activeStep) return "completed";
    if (index === activeStep) return "active";
    return "upcoming";
  };

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
        aria-describedby="permission-guide-description"
        onClick={(event) => event.stopPropagation()}
        className="my-auto w-full max-w-md overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--card)] shadow-2xl"
      >
        <div className="relative overflow-hidden bg-[var(--brand-dark)] px-6 py-7 text-white">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

          <button
            type="button"
            aria-label="Tutup panduan"
            onClick={() => setIsEducationOpen(false)}
            className="absolute right-4 top-4 rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>

          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <LockKeyhole size={24} />
          </div>

          <p className="relative mt-5 text-[10px] font-extrabold tracking-[0.18em] text-white/60">
            SEBELUM MELANJUTKAN
          </p>

          <h2
            id="permission-guide-title"
            className="relative mt-2 text-2xl font-extrabold tracking-tight"
          >
            Cek izin sebelum install.
          </h2>

          <p
            id="permission-guide-description"
            className="relative mt-2 max-w-sm text-sm leading-relaxed text-white/75"
          >
            Izin aplikasi menentukan data dan fitur perangkat yang bisa
            diakses oleh aplikasi tersebut.
          </p>
        </div>

        <div className="space-y-3 p-5 sm:p-6">
          <div className="flex items-start gap-3 rounded-2xl border border-[var(--border)] p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--foreground)]">
                Cocokkan dengan fungsi
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                Aplikasi kamera mungkin membutuhkan kamera. Namun, game
                sederhana belum tentu membutuhkan akses SMS atau kontak.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-[var(--border)] p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--warning)]/10 text-[var(--warning)]">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--foreground)]">
                Waspadai izin sensitif
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                SMS, kontak, mikrofon, lokasi, dan aksesibilitas dapat
                membuka akses ke informasi pribadi.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-[var(--brand-soft)] p-4">
            <ShieldCheck
              size={19}
              className="mt-0.5 shrink-0 text-[var(--brand)]"
            />
            <p className="text-xs leading-relaxed text-[var(--brand-dark)]">
              <strong>Ingat:</strong> Jangan langsung menyetujui semua
              permintaan izin. Tolak izin yang tidak relevan dan cari tahu
              alasannya terlebih dahulu.
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
            <h2
              id="app-guide-title"
              className="mt-4 text-xl font-extrabold text-[var(--foreground)]"
            >
              Panduan cek aplikasi
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
              Ingat lima hal ini sebelum memasang aplikasi.
            </p>
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
          {[
            {
              title: "Sumber unduhan",
              description:
                "Utamakan toko aplikasi resmi. Hindari tautan APK dari pesan atau situs yang tidak dikenal.",
            },
            {
              title: "Identitas developer",
              description:
                "Periksa nama pengembang dan pastikan identitasnya masuk akal.",
            },
            {
              title: "Rating dan ulasan",
              description:
                "Baca ulasan terbaru. Waspadai ulasan yang terlihat seragam atau tidak relevan.",
            },
            {
              title: "Izin aplikasi",
              description:
                "Cocokkan setiap izin dengan fungsi aplikasi. Jangan berikan akses berlebihan.",
            },
            {
              title: "Klaim yang terlalu bagus",
              description:
                "Waspadai janji hadiah, fitur premium gratis, atau keuntungan yang tidak masuk akal.",
            },
          ].map((item, index) => (
            <div
              key={item.title}
              className="flex items-start gap-3 rounded-xl bg-[var(--surface)] p-3"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-xs font-extrabold text-[var(--brand)]">
                {index + 1}
              </span>
              <div>
                <p className="text-xs font-bold text-[var(--foreground)]">
                  {item.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                  {item.description}
                </p>
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

  if (finished) {
    const percentage = Math.round(
      (correctAnswers / totalScenarios) * 100,
    );

    return (
      <main
        ref={resultRef}
        className="container py-10 md:py-16"
      >
        <div className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--card)] shadow-sm">
            <div className="relative overflow-hidden bg-[var(--brand-dark)] px-6 py-10 text-center text-white md:px-10">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

              <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15">
                <Trophy size={38} />
              </div>

              <p className="text-xs font-bold tracking-[0.2em] text-white/70">
                APP SECURITY LAB COMPLETED
              </p>

              <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                Kamu lebih siap memilih aplikasi!
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/75">
                Kamu sudah berlatih memeriksa aplikasi, developer, ulasan,
                sumber unduhan, dan izin sebelum memasangnya.
              </p>
            </div>

            <div className="p-6 md:p-9">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[var(--surface)] p-5 text-center">
                  <p className="text-3xl font-extrabold text-[var(--brand)]">
                    {correctAnswers}/{totalScenarios}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                    Keputusan lebih aman
                  </p>
                </div>

                <div className="rounded-2xl bg-[var(--surface)] p-5 text-center">
                  <p className="text-3xl font-extrabold text-[var(--accent)]">
                    {percentage}%
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                    Hasil simulasi
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent-soft)] p-4 text-center">
                  <CheckCircle2 className="mx-auto text-[var(--accent)]" />
                  <p className="mt-2 text-xl font-extrabold text-[var(--accent)]">
                    {correctAnswers}
                  </p>
                  <p className="text-xs font-semibold text-[var(--muted)]">
                    Pilihan lebih aman
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--warning)]/25 bg-[var(--warning)]/10 p-4 text-center">
                  <AlertTriangle className="mx-auto text-[var(--warning)]" />
                  <p className="mt-2 text-xl font-extrabold text-[var(--foreground)]">
                    {totalScenarios - correctAnswers}
                  </p>
                  <p className="text-xs font-semibold text-[var(--muted)]">
                    Perlu dipelajari
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-[var(--border)] p-5">
                <div className="flex items-start gap-3">
                  <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]" />
                  <div>
                    <h2 className="text-sm font-bold text-[var(--foreground)]">
                      Satu hal yang perlu diingat
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                      Toko aplikasi resmi bukan jaminan mutlak keamanan.
                      Tetap periksa developer, ulasan, sumber unduhan, dan
                      izin aplikasi sebelum memasangnya.
                    </p>
                  </div>
                </div>
              </div>

              {rewardMessage && (
                <div
                  role="status"
                  className="mt-4 flex items-start gap-3 rounded-xl bg-[var(--brand-soft)] p-4 text-sm leading-relaxed text-[var(--brand-dark)]"
                >
                  <Trophy size={19} className="mt-0.5 shrink-0" />
                  <p>{rewardMessage}</p>
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

            <h1 className="heading heading-2 mt-4">
              Jangan asal install aplikasi.
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
              Coba periksa aplikasi seperti di toko aplikasi sungguhan.
              Kenali tanda mencurigakan sebelum memberikan akses ke
              perangkatmu.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
              <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 font-bold text-[var(--brand)]">
                {simulation.difficulty}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock3 size={13} />
                {simulation.duration}
              </span>
              <span className="rounded-full border border-[var(--border)] px-3 py-1">
                Simulasi fiktif
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <ShieldCheck size={21} />
            </div>
            <div>
              <p className="text-2xl font-extrabold leading-none text-[var(--foreground)]">
                {correctAnswers}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Pilihan aman
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-7 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[var(--foreground)]">
                Perjalananmu
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {attemptsCompleted} dari {totalScenarios} aplikasi diperiksa
              </p>
            </div>

            <span className="text-xs font-bold tabular-nums text-[var(--brand)]">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-[var(--surface)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="mb-7 grid grid-cols-3 gap-2 sm:gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const status = getStepStatus(index);

            return (
              <div
                key={step.id}
                className={`flex min-w-0 items-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition sm:gap-3 sm:p-3 ${
                  status === "active"
                    ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                    : status === "completed"
                      ? "border-[var(--accent)]/25 bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "border-[var(--border)] bg-[var(--card)] text-[var(--muted)]"
                }`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/70">
                  {status === "completed" ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <Icon size={16} />
                  )}
                </span>
                <span className="min-w-0 leading-tight">
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Main layout */}
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          {/* Phone simulation */}
          <section
            ref={mainContentRef}
            className="min-w-0 scroll-mt-24"
          >
            <div className="mx-auto w-full max-w-[480px]">
              <div className="rounded-[2.5rem] border-[7px] border-[#26364d] bg-[#26364d] p-2 shadow-xl">
                <div
                  ref={phoneContentRef}
                  className="relative max-h-[850px] min-h-[620px] overflow-y-auto rounded-[2rem] bg-[var(--card)]"
                >
                  {/* Phone status */}
                  <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-6 pb-3 pt-4 text-[10px] font-semibold text-[var(--muted)]">
                    <span>09:41</span>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-5 rounded-sm border border-current">
                        <span className="block h-full w-3/4 rounded-sm bg-current" />
                      </span>
                    </div>
                  </div>

                  {/* Store */}
                  {view === "store" && (
                    <div className="min-h-[600px]">
                      <div className="border-b border-[var(--border)] px-5 pb-5 pt-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-extrabold tracking-wider text-[var(--brand)]">
                              APP STORE SIMULATOR
                            </p>
                            <h2 className="mt-1 text-xl font-extrabold text-[var(--foreground)]">
                              Temukan aplikasi
                            </h2>
                          </div>

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                            <Store size={20} />
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2 rounded-xl bg-[var(--surface)] px-3 py-3 text-xs text-[var(--muted)]">
                          <Eye size={15} />
                          Cari game atau aplikasi...
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="mb-4 flex items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-[var(--foreground)]">
                            Rekomendasi untukmu
                          </h3>
                          <span className="text-[10px] text-[var(--muted)]">
                            {availableApps.length} tersisa
                          </span>
                        </div>

                        {availableApps.length > 0 ? (
                          <div className="space-y-3">
                            {availableApps.map((app, index) => (
                              <button
                                key={app.id}
                                type="button"
                                onClick={() => openApp(app.id)}
                                className="group flex w-full items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 text-left transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
                              >
                                <span
                                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                                    index % 3 === 0
                                      ? "bg-violet-100 text-violet-700"
                                      : index % 3 === 1
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-amber-100 text-amber-700"
                                  }`}
                                >
                                  {index % 3 === 0 ? (
                                    <Gamepad2 size={23} />
                                  ) : index % 3 === 1 ? (
                                    <Smartphone size={23} />
                                  ) : (
                                    <Download size={23} />
                                  )}
                                </span>

                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-xs font-bold text-[var(--foreground)]">
                                    {app.name}
                                  </span>
                                  <span className="mt-1 block truncate text-[10px] text-[var(--muted)]">
                                    {app.developer}
                                  </span>
                                  <span className="mt-1 flex items-center gap-1 text-[10px] text-[var(--muted)]">
                                    <Star
                                      size={10}
                                      className="fill-amber-400 text-amber-400"
                                    />
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
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-[var(--border)] p-6 text-center">
                            <CheckCircle2
                              size={28}
                              className="mx-auto text-[var(--accent)]"
                            />
                            <p className="mt-3 text-sm font-bold text-[var(--foreground)]">
                              Semua aplikasi sudah diperiksa
                            </p>
                            <p className="mt-1 text-xs text-[var(--muted)]">
                              Lanjutkan untuk melihat hasil simulasi.
                            </p>
                          </div>
                        )}

                        <div className="mt-5 rounded-xl border border-[var(--brand)]/15 bg-[var(--brand-soft)] p-3">
                          <div className="flex items-start gap-2">
                            <ShieldCheck
                              size={17}
                              className="mt-0.5 shrink-0 text-[var(--brand)]"
                            />
                            <p className="text-[10px] leading-5 text-[var(--brand-dark)]">
                              Semua aplikasi di halaman ini adalah fiksi.
                              Kamu sedang berlatih mengenali tanda aplikasi
                              berisiko.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* App detail */}
                  {view === "detail" && (
                    <div className="min-h-[600px] p-5">
                      <button
                        type="button"
                        onClick={() => setView("store")}
                        className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted)] transition hover:text-[var(--brand)]"
                      >
                        <ArrowLeft size={15} />
                        Kembali ke daftar
                      </button>

                      <div className="flex flex-col items-center text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--brand-soft)] text-[var(--brand)]">
                          <Gamepad2 size={38} />
                        </div>

                        <h2 className="mt-4 text-xl font-extrabold text-[var(--foreground)]">
                          {currentApp.name}
                        </h2>

                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {currentApp.developer}
                        </p>

                        <span
                          className={`mt-3 rounded-full border px-3 py-1 text-[10px] font-bold ${
                            riskStyles[currentApp.risk]
                          }`}
                        >
                          RISIKO {currentApp.risk.toUpperCase()}
                        </span>
                      </div>

                      <div className="my-6 grid grid-cols-3 divide-x divide-[var(--border)] rounded-xl border border-[var(--border)] py-3 text-center">
                        <div>
                          <div className="flex items-center justify-center gap-1 text-xs font-bold text-[var(--foreground)]">
                            <Star
                              size={12}
                              className="fill-amber-400 text-amber-400"
                            />
                            {currentApp.rating}
                          </div>
                          <p className="mt-1 text-[9px] text-[var(--muted)]">
                            Rating
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-[var(--foreground)]">
                            {currentApp.downloads}
                          </p>
                          <p className="mt-1 text-[9px] text-[var(--muted)]">
                            Unduhan
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-[var(--foreground)]">
                            {currentApp.category}
                          </p>
                          <p className="mt-1 text-[9px] text-[var(--muted)]">
                            Kategori
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-extrabold tracking-wider text-[var(--muted)]">
                            SUMBER UNDUHAN
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            {currentApp.sourceType === "official" ? (
                              <Store
                                size={16}
                                className="text-[var(--accent)]"
                              />
                            ) : (
                              <ExternalLink
                                size={16}
                                className="text-[var(--danger)]"
                              />
                            )}
                            <p className="text-xs font-semibold text-[var(--foreground)]">
                              {currentApp.source}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-extrabold tracking-wider text-[var(--muted)]">
                            DESKRIPSI APLIKASI
                          </p>
                          <p className="mt-2 text-xs leading-6 text-[var(--muted)]">
                            {currentApp.description}
                          </p>
                        </div>

                        <div className="rounded-xl border border-[var(--warning)]/30 bg-[var(--warning)]/10 p-3">
                          <div className="flex items-center gap-2 text-[var(--foreground)]">
                            <AlertTriangle
                              size={15}
                              className="text-[var(--warning)]"
                            />
                            <p className="text-[10px] font-extrabold">
                              KLAIM PROMOSI
                            </p>
                          </div>
                          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                            {currentApp.claim}
                          </p>
                        </div>

                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                          <p className="text-[10px] font-extrabold text-[var(--foreground)]">
                            INFORMASI ULASAN
                          </p>
                          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                            {currentApp.reviews}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={openPermissionCheck}
                        className="button button-primary mt-6 w-full"
                      >
                        Periksa Izin Aplikasi
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  )}

                  {/* Permissions */}
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
                          Apakah setiap izin ini memang diperlukan untuk
                          menjalankan fungsi aplikasi?
                        </p>
                      </div>

                      <div className="space-y-2">
                        {currentApp.permissions.map((permission) => (
                          <div
                            key={permission.name}
                            className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] p-3"
                          >
                            <div className="flex min-w-0 items-center gap-2.5">
                              {permission.suspicious ? (
                                <AlertTriangle
                                  size={17}
                                  className="shrink-0 text-[var(--warning)]"
                                />
                              ) : (
                                <CheckCircle2
                                  size={17}
                                  className="shrink-0 text-[var(--accent)]"
                                />
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
                        <Lightbulb
                          size={17}
                          className="shrink-0 text-[var(--brand)]"
                        />
                        <span className="flex-1 text-[10px] font-semibold leading-relaxed text-[var(--brand-dark)]">
                          Belum yakin izin mana yang berbahaya?
                          Buka panduan singkat.
                        </span>
                        <ArrowRight
                          size={15}
                          className="shrink-0 text-[var(--brand)]"
                        />
                      </button>

                      <div className="mt-5 border-t border-[var(--border)] pt-5">
                        <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                          Apa keputusanmu?
                        </h3>
                        <p className="mb-3 mt-1 text-[11px] text-[var(--muted)]">
                          Pilih tindakan yang paling tepat berdasarkan
                          informasi aplikasi.
                        </p>

                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => handleDecision("install")}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--danger)]/25 bg-[var(--danger)]/5 px-4 py-3 text-xs font-bold text-[var(--danger)] transition hover:bg-[var(--danger)]/10"
                          >
                            <Download size={15} />
                            Tetap Install
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDecision("verify")}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--brand)]/25 bg-[var(--brand-soft)] px-4 py-3 text-xs font-bold text-[var(--brand)] transition hover:border-[var(--brand)]"
                          >
                            <Eye size={15} />
                            Verifikasi Lebih Lanjut
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDecision("cancel")}
                            className="button button-primary w-full"
                          >
                            <ShieldCheck size={15} />
                            Batalkan Instalasi
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Result for each app */}
                  {view === "result" && action && (
                    <div className="flex min-h-[600px] flex-col p-5">
                      <div className="flex flex-1 flex-col items-center pt-7 text-center">
                        <div
                          className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${
                            isSafeDecision
                              ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                              : "bg-[var(--danger)]/10 text-[var(--danger)]"
                          }`}
                        >
                          {isSafeDecision ? (
                            <ShieldCheck size={32} />
                          ) : (
                            <ShieldAlert size={32} />
                          )}
                        </div>

                        <p className="text-[10px] font-extrabold tracking-wider text-[var(--muted)]">
                          HASIL KEPUTUSAN
                        </p>

                        <h2 className="mt-2 text-xl font-extrabold text-[var(--foreground)]">
                          {action === "install"
                            ? "Keputusan berisiko!"
                            : action === "verify"
                              ? "Langkah yang bijak!"
                              : "Instalasi dibatalkan!"}
                        </h2>

                        <p className="mt-2 text-xs leading-6 text-[var(--muted)]">
                          {action === "install"
                            ? "Kamu memilih memasang aplikasi tanpa memastikan seluruh tanda risikonya."
                            : action === "verify"
                              ? "Kamu memilih untuk mencari kepastian sebelum memberikan akses ke perangkat."
                              : "Kamu memilih menghindari aplikasi yang belum terbukti aman."}
                        </p>

                        <div className="mt-5 w-full rounded-xl border border-[var(--warning)]/30 bg-[var(--warning)]/10 p-4 text-left">
                          <div className="flex items-center gap-2 text-xs font-extrabold text-[var(--foreground)]">
                            <AlertTriangle
                              size={16}
                              className="text-[var(--warning)]"
                            />
                            Tanda yang perlu diperhatikan
                          </div>

                          <ul className="mt-3 space-y-2">
                            {currentApp.redFlags.slice(0, 3).map((flag) => (
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
                            Tindakan yang disarankan
                          </div>

                          <p className="mt-2 text-xs leading-5 text-[var(--foreground)]">
                            {action === "install"
                              ? "Hentikan penggunaan aplikasi, cabut izinnya jika memungkinkan, uninstall aplikasi, lalu lakukan pemindaian keamanan."
                              : action === "verify"
                                ? "Periksa kembali identitas developer, sumber unduhan, ulasan terbaru, dan relevansi izin sebelum mengambil keputusan."
                                : currentApp.saferAction}
                          </p>
                        </div>

                        {action === "install" && (
                          <div className="mt-3 w-full rounded-xl border border-[var(--danger)]/20 bg-[var(--danger)]/5 p-4 text-left">
                            <div className="flex items-center gap-2 text-xs font-extrabold text-[var(--danger)]">
                              <FileWarning size={16} />
                              Jika sudah terlanjur install
                            </div>

                            <ul className="mt-3 space-y-2">
                              {currentApp.postInstall.slice(0, 3).map(
                                (step, index) => (
                                  <li
                                    key={step}
                                    className="flex gap-2 text-[10px] leading-5 text-[var(--muted)]"
                                  >
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--danger)]/10 text-[10px] font-bold text-[var(--danger)]">
                                      {index + 1}
                                    </span>
                                    {step}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 border-t border-[var(--border)] pt-5">
                        <button
                          type="button"
                          onClick={handleNext}
                          disabled={isSavingReward}
                          className="button button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isSavingReward
                            ? "Menyimpan progres..."
                            : attemptsCompleted >= totalScenarios
                              ? "Lihat hasil simulasi"
                              : "Lanjut ke aplikasi berikutnya"}

                          {!isSavingReward && <ArrowRight size={17} />}
                        </button>

                        <p className="mt-3 text-center text-[10px] text-[var(--muted)]">
                          CEKIN · App Security Lab
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <p className="mt-3 text-center text-[10px] leading-relaxed text-[var(--muted)]">
                Tampilan toko aplikasi ini merupakan simulasi fiktif,
                bukan toko aplikasi sungguhan.
              </p>
            </div>
          </section>

          {/* Learning side panel */}
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
                  ? "Pilih aplikasi dan cari petunjuk yang bisa menunjukkan risiko."
                  : view === "detail"
                    ? "Periksa sumber, developer, klaim, rating, dan ulasan."
                    : view === "permissions"
                      ? "Cocokkan izin yang diminta dengan fungsi aplikasi."
                      : "Pahami alasan keputusanmu dan pelajari tindakan yang lebih aman."}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={17}
                  className="text-[var(--accent)]"
                />
                <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                  Checklist keamanan
                </h3>
              </div>

              <ul className="mt-4 space-y-3">
                {[
                  "Gunakan sumber unduhan resmi.",
                  "Periksa identitas developer.",
                  "Baca ulasan terbaru.",
                  "Cek izin aplikasi.",
                  "Hindari APK MOD mencurigakan.",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-xs leading-relaxed text-[var(--muted)]"
                  >
                    <CheckCircle2
                      size={14}
                      className="mt-0.5 shrink-0 text-[var(--accent)]"
                    />
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
                {attemptsCompleted} dari {totalScenarios} aplikasi diperiksa.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--warning)]/25 bg-[var(--warning)]/10 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)]">
                <AlertTriangle
                  size={17}
                  className="text-[var(--warning)]"
                />
                Sudah download?
              </div>

              <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                Download belum berarti aplikasi sudah terinstal. Jangan
                membuka APK dari sumber tidak dikenal. Jika sudah terpasang
                dan mencurigakan, cabut izin, uninstall, lalu lakukan
                pemeriksaan keamanan.
              </p>
            </div>
          </aside>
        </div>

        <p className="mt-8 text-center text-xs leading-6 text-[var(--muted)]">
          CEKIN Learning & Protection · Semua aplikasi, developer, rating,
          dan ulasan merupakan simulasi fiktif.
        </p>
      </div>

      {isEducationOpen && educationModal}
      {showGuide && guideModal}
    </main>
  );
}
