
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  Inbox,
  Lightbulb,
  Mail,
  MailOpen,
  MoreVertical,
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

import type { SimulationConfig } from "@/types/learning-protection";

type Props = {
  simulation: SimulationConfig;
};

const SIMULATION_ID = "phishing-attack";

const emailSenders = [
  {
    name: "Account Security",
    email: "security-alert@account-verify.example",
    initials: "A",
    color: "bg-red-100 text-red-700",
  },
  {
    name: "Reward Center",
    email: "winner@claim-reward.example",
    initials: "R",
    color: "bg-amber-100 text-amber-700",
  },
  {
    name: "Unknown Sender",
    email: "notification@unknown-sender.example",
    initials: "U",
    color: "bg-blue-100 text-blue-700",
  },
];

export function PhishingEmail({ simulation }: Props) {
  const scenarios = simulation.scenarios;
  const totalScenarios = scenarios.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showLearningModal, setShowLearningModal] = useState(false);
  const [rewardMessage, setRewardMessage] = useState("");
  const [isSavingReward, setIsSavingReward] = useState(false);

  const emailDetailRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const currentScenario = scenarios[currentIndex];

  const selectedAnswer = currentScenario?.choices.find(
    (choice) => choice.id === selectedChoice,
  );

  const progress = totalScenarios
    ? finished
      ? 100
      : ((currentIndex + (selectedChoice ? 1 : 0)) / totalScenarios) * 100
    : 0;

  const percentage = totalScenarios
    ? Math.round((correctAnswers / totalScenarios) * 100)
    : 0;

  const emailSubject =
    currentScenario?.context.match(/^Subject:\s*(.+)$/m)?.[1] ??
    currentScenario?.title ??
    "Pesan masuk";

  const emailBody =
    currentScenario?.context
      .replace(/^Subject:\s*.+\n*/m, "")
      .trim() ??
    currentScenario?.description ??
    "";

  const sender = emailSenders[currentIndex % emailSenders.length];

  useEffect(() => {
    if (currentIndex === 0 || finished) return;

    const frameId = window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

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
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      resultRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [finished]);

  useEffect(() => {
    if (!showLearningModal) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowLearningModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLearningModal]);

  const handleChoice = (choiceId: string) => {
    if (selectedChoice || !currentScenario) return;

    const choice = currentScenario.choices.find(
      (item) => item.id === choiceId,
    );

    if (!choice) return;

    setSelectedChoice(choiceId);

    if (choice.isSafe) {
      setCorrectAnswers((previous) => previous + 1);
    }
  };

  const saveSimulationCompletion = async () => {
    try {
      const response = await fetch("/api/learning-protection/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          simulationId: SIMULATION_ID,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        setRewardMessage(
          "Kamu berhasil menyelesaikan simulasi sebagai pengguna tamu. Login untuk menyimpan progres dan mendapatkan XP.",
        );
        return;
      }

      if (!response.ok) {
        setRewardMessage(
          result.message ?? "Simulasi selesai, tetapi progres belum berhasil disimpan.",
        );
        return;
      }

      if (result.alreadyCompleted) {
        setRewardMessage(
          "Simulasi Phishing Attack sudah pernah kamu selesaikan. XP tidak diberikan dua kali.",
        );
      } else {
        setRewardMessage(
          result.xpEarned
            ? `Selamat! Kamu mendapatkan +${result.xpEarned} XP dari Phishing Attack.`
            : "Progres simulasi berhasil disimpan.",
        );
      }

      window.dispatchEvent(new Event("cekin-auth-change"));
    } catch {
      setRewardMessage(
        "Simulasi selesai, tetapi koneksi gagal menyimpan progres. Silakan coba lagi nanti.",
      );
    }
  };

  const handleNext = async () => {
    if (!selectedChoice || isSavingReward) return;

    setShowLearningModal(false);

    if (currentIndex === totalScenarios - 1) {
      setIsSavingReward(true);

      await saveSimulationCompletion();

      setFinished(true);
      setIsSavingReward(false);
      return;
    }

    setCurrentIndex((previous) => previous + 1);
    setSelectedChoice(null);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedChoice(null);
    setCorrectAnswers(0);
    setFinished(false);
    setShowLearningModal(false);
    setRewardMessage("");
    setIsSavingReward(false);

    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  if (!totalScenarios) {
    return (
      <main className="container py-16 text-center">
        <Mail className="mx-auto mb-4 h-10 w-10 text-[var(--muted)]" />
        <h1 className="heading heading-2">Skenario belum tersedia</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Konten Phishing Attack sedang disiapkan.
        </p>
        <Link
          href="/learning-protection"
          className="button button-primary mt-6"
        >
          Kembali ke Learning &amp; Protection
        </Link>
      </main>
    );
  }

  if (finished) {
    return (
      <main
        ref={resultRef}
        className="container scroll-mt-0 py-10 md:py-16"
      >
        <div className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--card)] shadow-sm">
            <div className="relative overflow-hidden bg-[var(--brand-dark)] px-6 py-10 text-center text-white md:px-10">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15">
                <ShieldCheck size={40} />
              </div>

              <p className="text-xs font-bold tracking-[0.2em] text-white/70">
                PHISHING ATTACK COMPLETED
              </p>

              <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                Email mencurigakan bukan lagi jebakan mudah!
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/75">
                Kamu telah menyelesaikan latihan pemeriksaan email. Terus
                terapkan kebiasaan memeriksa pengirim, tautan, dan isi pesan
                sebelum mengambil tindakan.
              </p>
            </div>

            <div className="p-6 md:p-9">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[var(--surface)] p-5 text-center">
                  <p className="text-3xl font-extrabold text-[var(--brand)]">
                    {correctAnswers}/{totalScenarios}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                    Keputusan aman
                  </p>
                </div>

                <div className="rounded-2xl bg-[var(--surface)] p-5 text-center">
                  <p className="text-3xl font-extrabold text-[var(--accent)]">
                    {percentage}%
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                    Tingkat kewaspadaan
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent-soft)] p-4 text-center">
                  <CheckCircle2 className="mx-auto text-[var(--accent)]" />
                  <p className="mt-2 text-xl font-extrabold text-[var(--accent)]">
                    {correctAnswers}
                  </p>
                  <p className="text-xs font-semibold text-[var(--muted)]">
                    Keputusan aman
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--warning)]/30 bg-[var(--warning)]/10 p-4 text-center">
                  <AlertTriangle className="mx-auto text-[var(--warning)]" />
                  <p className="mt-2 text-xl font-extrabold text-[var(--warning)]">
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
                    <h2 className="text-sm font-extrabold text-[var(--foreground)]">
                      Ingat sebelum membuka email
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                      Periksa alamat pengirim secara teliti, jangan terburu-buru
                      mengikuti instruksi yang mendesak, dan jangan memasukkan
                      kata sandi atau kode OTP melalui tautan dari email yang
                      belum terverifikasi.
                    </p>
                  </div>
                </div>
              </div>

              {rewardMessage && (
                <div
                  role="status"
                  className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
                >
                  <div className="flex items-start gap-3">
                    <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]" />
                    <p className="text-sm leading-relaxed text-[var(--foreground)]">
                      {rewardMessage}
                    </p>
                  </div>
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

  if (!currentScenario) return null;

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
              PHISHING ATTACK
            </div>

            <h1 className="heading heading-2 mt-4">
              Jangan biarkan email palsu mencuri kepercayaanmu.
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
              Periksa email seperti saat menggunakan layanan email sehari-hari.
              Amati pengirim, pahami isi pesan, lalu tentukan tindakan yang
              paling aman.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-[10px] font-bold text-[var(--brand)]">
                {simulation.difficulty}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1 text-[10px] font-semibold text-[var(--muted)]">
                <Clock3 size={12} />
                {simulation.duration}
              </span>
              <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-[10px] font-semibold text-[var(--muted)]">
                Simulasi email fiktif
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <ShieldCheck size={21} />
            </div>
            <div>
              <p className="text-2xl font-extrabold leading-none text-[var(--foreground)]">
                {correctAnswers}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Keputusan aman
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-7 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[var(--foreground)]">
                Perjalanan pemeriksaan
              </p>
              <p className="mt-1 text-[11px] text-[var(--muted)]">
                Email {currentIndex + 1} dari {totalScenarios}
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

        {/* Learning steps */}
        <div className="mb-6 grid grid-cols-3 gap-2">
          {[
            { label: "Amati email", icon: Eye, step: 1 },
            { label: "Pilih tindakan", icon: ShieldCheck, step: 2 },
            { label: "Pelajari hasil", icon: Lightbulb, step: 3 },
          ].map(({ label, icon: Icon, step }) => {
            const activeStep = showLearningModal ? 3 : selectedChoice ? 2 : 1;
            const isActive = step === activeStep;
            const isDone = step < activeStep;

            return (
              <div
                key={step}
                className={`flex items-center justify-center gap-2 rounded-xl border px-2 py-3 text-center ${
                  isActive
                    ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                    : isDone
                      ? "border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "border-[var(--border)] bg-[var(--card)] text-[var(--muted)]"
                }`}
              >
                <Icon size={15} />
                <span className="text-[10px] font-bold sm:text-xs">
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Email application */}
        <div className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--card)] shadow-sm">
          {/* Email top bar */}
          <div className="flex min-h-[68px] items-center gap-3 border-b border-[var(--border)] px-4 sm:px-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
              <Mail size={21} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-bold tracking-tight text-[var(--foreground)]">
                CEKIN MAIL
              </p>
              <p className="text-[10px] font-medium text-[var(--muted)]">
                Email security simulation
              </p>
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
            {/* Email sidebar */}
            <aside className="hidden border-r border-[var(--border)] bg-[var(--card)] p-3 md:block">
              <div className="mb-5 flex items-center gap-3 rounded-2xl bg-[var(--brand-soft)] px-4 py-3 text-sm font-bold text-[var(--brand)]">
                <Mail size={17} />
                Tulis email
              </div>

              <nav className="space-y-1 text-xs">
                <div className="flex items-center gap-3 rounded-r-full bg-[var(--brand-soft)] px-4 py-2.5 font-bold text-[var(--brand)]">
                  <Inbox size={17} />
                  Kotak masuk
                  <span className="ml-auto">1</span>
                </div>

                <div className="flex items-center gap-3 rounded-r-full px-4 py-2.5 text-[var(--muted)]">
                  <Star size={17} />
                  Berbintang
                </div>

                <div className="flex items-center gap-3 rounded-r-full px-4 py-2.5 text-[var(--muted)]">
                  <Clock3 size={17} />
                  Ditunda
                </div>

                <div className="flex items-center gap-3 rounded-r-full px-4 py-2.5 text-[var(--muted)]">
                  <Send size={17} />
                  Terkirim
                </div>

                <div className="flex items-center gap-3 rounded-r-full px-4 py-2.5 text-[var(--muted)]">
                  <MailOpen size={17} />
                  Draf
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-r-full px-4 py-2.5 text-[var(--muted)]">
                  <AlertTriangle size={17} />
                  Spam
                </div>

                <div className="flex items-center gap-3 rounded-r-full px-4 py-2.5 text-[var(--muted)]">
                  <Trash2 size={17} />
                  Sampah
                </div>
              </nav>

              <div className="mt-8 rounded-2xl bg-[var(--brand-dark)] p-4 text-white">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <ShieldCheck size={15} />
                  CEKIN Security
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-white/75">
                  Jangan terburu-buru membuka tautan. Periksa keaslian email
                  terlebih dahulu.
                </p>
              </div>
            </aside>

            {/* Email content */}
            <section className="min-w-0 bg-[var(--card)]">
              {/* Toolbar */}
              <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-3 sm:px-5">
                <div className="flex items-center gap-1 text-[var(--muted)]">
                  <button
                    type="button"
                    aria-label="Kembali"
                    className="rounded-full p-2 transition hover:bg-[var(--surface)]"
                  >
                    <ArrowLeft size={17} />
                  </button>
                  <button
                    type="button"
                    aria-label="Arsipkan"
                    className="rounded-full p-2 transition hover:bg-[var(--surface)]"
                  >
                    <Archive size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Laporkan sebagai spam"
                    className="rounded-full p-2 transition hover:bg-[var(--surface)]"
                  >
                    <ShieldAlert size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Hapus email"
                    className="rounded-full p-2 transition hover:bg-[var(--surface)]"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
                  {currentIndex + 1} dari {totalScenarios}
                  <button
                    type="button"
                    aria-label="Menu lainnya"
                    className="rounded-full p-2 transition hover:bg-[var(--surface)]"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              {/* Email detail */}
              <div
                ref={emailDetailRef}
                className="scroll-mt-24 px-4 py-6 sm:px-7 sm:py-8"
              >
                <div className="mb-6 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-extrabold leading-snug text-[var(--foreground)] sm:text-2xl">
                        {emailSubject}
                      </h2>
                      <span className="rounded-full bg-[var(--surface)] px-2.5 py-1 text-[10px] font-semibold text-[var(--muted)]">
                        Kotak masuk
                      </span>
                    </div>

                    <p className="mt-2 text-[11px] text-[var(--muted)]">
                      Email {currentIndex + 1} dari {totalScenarios}
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label="Tandai email"
                    className="rounded-full p-2 text-[var(--muted)] transition hover:bg-[var(--surface)]"
                  >
                    <Star size={18} />
                  </button>
                </div>

                {/* Sender */}
                <div className="mb-7 flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${sender.color}`}
                  >
                    {sender.initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-sm font-bold text-[var(--foreground)]">
                        {sender.name}
                      </p>
                      <p className="break-all text-xs text-[var(--muted)]">
                        &lt;{sender.email}&gt;
                      </p>
                    </div>

                    <div className="mt-1 flex items-center gap-1 text-[11px] text-[var(--muted)]">
                      kepada saya
                      <ChevronDown size={13} />
                    </div>
                  </div>

                  <div className="hidden items-center gap-3 text-[11px] text-[var(--muted)] sm:flex">
                    <span>09:41</span>
                    <Star size={15} />
                  </div>
                </div>

                {/* Email body */}
                <div className="min-h-[180px] max-w-3xl text-sm leading-7 text-[var(--foreground)]">
                  <div className="whitespace-pre-line break-words">
                    {emailBody}
                  </div>

                  <div className="mt-6 rounded-2xl border border-[var(--warning)]/30 bg-[var(--warning)]/10 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle
                        size={18}
                        className="mt-0.5 shrink-0 text-[var(--warning)]"
                      />
                      <div>
                        <p className="text-xs font-extrabold text-[var(--foreground)]">
                          Tantangan pemeriksaan
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                          Jangan langsung percaya atau mengabaikan email ini.
                          Perhatikan detailnya sebelum menentukan tindakan.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email actions - decorative */}
                <div className="mt-8 flex flex-wrap gap-2 border-t border-[var(--border)] pt-5">
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

              {/* Decision section */}
              <div className="border-t border-[var(--border)] bg-[var(--surface)] p-4 sm:p-7">
                <div className="mx-auto max-w-3xl">
                  {!selectedChoice ? (
                    <>
                      <div className="mb-4">
                        <div className="flex items-center gap-2">
                          <ShieldCheck
                            size={19}
                            className="text-[var(--brand)]"
                          />
                          <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                            Apa yang akan kamu lakukan?
                          </h3>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                          Pilih tindakan yang paling tepat setelah membaca
                          email tersebut.
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {currentScenario.choices.map((choice, index) => (
                          <button
                            key={choice.id}
                            type="button"
                            onClick={() => handleChoice(choice.id)}
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
                        <Lightbulb
                          size={16}
                          className="mt-0.5 shrink-0 text-[var(--warning)]"
                        />
                        <p className="text-[11px] leading-relaxed text-[var(--muted)]">
                          Tips: perhatikan alamat email pengirim, permintaan
                          informasi pribadi, tautan, lampiran, dan pesan yang
                          membuatmu merasa harus segera bertindak.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      {/* Short feedback */}
                      <div
                        className={`rounded-2xl border p-5 ${
                          selectedAnswer?.isSafe
                            ? "border-[var(--accent)]/30 bg-[var(--accent-soft)]"
                            : "border-[var(--warning)]/40 bg-[var(--warning)]/10"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {selectedAnswer?.isSafe ? (
                            <CheckCircle2
                              size={21}
                              className="mt-0.5 shrink-0 text-[var(--accent)]"
                            />
                          ) : (
                            <XCircle
                              size={21}
                              className="mt-0.5 shrink-0 text-[var(--warning)]"
                            />
                          )}

                          <div>
                            <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                              {selectedAnswer?.isSafe
                                ? "Keputusan yang lebih aman!"
                                : "Ada risiko yang perlu kamu pahami."}
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed text-[var(--foreground)]">
                              {selectedAnswer?.feedback}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Learning modal trigger */}
                      <button
                        type="button"
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
                            Pahami tanda bahayanya dan apa yang sebaiknya
                            dilakukan dalam situasi nyata.
                          </p>
                        </div>

                        <ArrowRight
                          size={17}
                          className="shrink-0 text-[var(--brand)]"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={isSavingReward}
                        className="button button-primary w-full"
                      >
                        {isSavingReward
                          ? "Menyimpan progres..."
                          : currentIndex === totalScenarios - 1
                            ? "Lihat hasil simulasi"
                            : "Periksa email berikutnya"}
                        {!isSavingReward && <ArrowRight size={16} />}
                      </button>

                      <p className="text-center text-[10px] leading-relaxed text-[var(--muted)]">
                        Kamu bisa membuka materi pembelajaran di atas sebelum
                        melanjutkan ke email berikutnya.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Learning sidebar */}
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
              <Sparkles size={20} />
            </div>
            <h3 className="mt-4 text-sm font-extrabold text-[var(--foreground)]">
              Misi kamu
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
              Latih kemampuan membaca email secara kritis. Jangan hanya
              memperhatikan nama pengirim, tetapi periksa alamat dan isi
              pesannya.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[var(--accent)]" />
              <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                Prinsip keamanan
              </h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
              Jangan pernah memberikan kata sandi, PIN, atau kode OTP melalui
              tautan yang dikirim oleh pengirim yang belum terverifikasi.
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
              Satu email, satu kesempatan untuk lebih waspada.
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] leading-relaxed text-[var(--muted)]">
          CEKIN Learning &amp; Protection · Phishing Attack · Seluruh email
          dalam simulasi ini bersifat fiktif.
        </p>
      </div>

      {/* Learning modal */}
      {showLearningModal && selectedAnswer && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="phishing-learning-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowLearningModal(false);
            }
          }}
        >
          <div className="my-auto w-full max-w-lg overflow-hidden rounded-[26px] bg-[var(--card)] shadow-2xl">
            {/* Modal header */}
            <div className="relative overflow-hidden bg-[var(--brand-dark)] p-6 text-white">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

              <button
                type="button"
                aria-label="Tutup materi pembelajaran"
                onClick={() => setShowLearningModal(false)}
                className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
              >
                <X size={18} />
              </button>

              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <Lightbulb size={25} />
              </div>

              <p className="relative mt-5 text-[10px] font-extrabold tracking-[0.18em] text-white/60">
                PHISHING AWARENESS
              </p>

              <h2
                id="phishing-learning-title"
                className="relative mt-2 pr-8 text-2xl font-extrabold leading-tight"
              >
                Pahami sebelum membuka email berikutnya.
              </h2>

              <p className="relative mt-2 text-xs leading-relaxed text-white/75">
                Keputusanmu sudah dievaluasi. Sekarang pahami alasan dan
                langkah yang bisa kamu terapkan.
              </p>
            </div>

            <div className="max-h-[60vh] space-y-5 overflow-y-auto p-6">
              {/* Explanation */}
              <section>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]">
                    <Eye size={17} />
                  </div>
                  <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                    Mengapa keputusan ini penting?
                  </h3>
                </div>

                <p className="mt-3 text-xs leading-6 text-[var(--muted)]">
                  {selectedAnswer.explanation}
                </p>
              </section>

              <div className="h-px bg-[var(--border)]" />

              {/* Safer action */}
              <section>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                    <ShieldCheck size={17} />
                  </div>
                  <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                    Tindakan yang lebih aman
                  </h3>
                </div>

                <div className="mt-3 rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent-soft)] p-4">
                  <p className="text-xs leading-relaxed text-[var(--foreground)]">
                    {selectedAnswer.saferAction}
                  </p>
                </div>
              </section>

              <div className="h-px bg-[var(--border)]" />

              {/* Practical checklist */}
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
                    {
                      title: "Periksa alamat pengirim",
                      description:
                        "Jangan hanya melihat nama tampilannya. Perhatikan domain setelah tanda @ dan pastikan sesuai dengan layanan resmi.",
                    },
                    {
                      title: "Waspadai tekanan dan ancaman",
                      description:
                        "Pesan yang mengancam akun akan ditutup atau menawarkan hadiah dengan batas waktu singkat perlu diperiksa lebih lanjut.",
                    },
                    {
                      title: "Periksa tautan sebelum membukanya",
                      description:
                        "Jangan memasukkan data melalui tautan yang tidak jelas. Buka situs resmi dengan mengetik alamatnya sendiri.",
                    },
                    {
                      title: "Jaga informasi rahasia",
                      description:
                        "Jangan berikan kata sandi, PIN, atau kode OTP kepada siapa pun melalui email maupun halaman yang tidak terverifikasi.",
                    },
                  ].map((item, index) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--surface)] text-[10px] font-extrabold text-[var(--brand)]">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--foreground)]">
                          {item.title}
                        </p>
                        <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="rounded-2xl border border-[var(--brand)]/20 bg-[var(--brand-soft)] p-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert
                    size={18}
                    className="mt-0.5 shrink-0 text-[var(--brand)]"
                  />
                  <p className="text-[11px] leading-relaxed text-[var(--brand-dark)]">
                    <strong>Ingat:</strong> email dari alamat yang tidak dikenal
                    tidak otomatis merupakan phishing. Periksa konteks,
                    identitas pengirim, isi pesan, dan tautannya sebelum
                    mengambil keputusan.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--border)] p-5">
              <button
                type="button"
                onClick={() => setShowLearningModal(false)}
                className="button button-primary w-full"
              >
                Aku paham, lanjutkan
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
