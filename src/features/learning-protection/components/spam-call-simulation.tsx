"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  CheckCircle2,
  Clock3,
  Eye,
  Info,
  Lightbulb,
  Phone,
  PhoneCall,
  PhoneOff,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UserRound,
  Volume2,
  X,
  XCircle,
} from "lucide-react";

import type {
  SimulationChoice,
  SimulationConfig,
} from "@/types/learning-protection";

type Props = {
  simulation: SimulationConfig;
};

const SIMULATION_ID = "spam-call";
const DECLINED = "__declined__";

export function SpamCallSimulation({ simulation }: Props) {
  const scenarios = simulation.scenarios;
  const totalScenarios = scenarios.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [callState, setCallState] = useState<"ringing" | "talking">(
    "ringing",
  );
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [showLearningModal, setShowLearningModal] = useState(false);
  const [rewardMessage, setRewardMessage] = useState("");
  const [isSavingReward, setIsSavingReward] = useState(false);

  const scenarioRef = useRef<HTMLElement>(null);
  const phoneScreenRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLElement>(null);

  const currentScenario = scenarios[currentIndex];

  const selectedAnswer = currentScenario?.choices.find(
    (choice) => choice.id === selectedChoice,
  );

  const isDeclined = selectedChoice === DECLINED;
  const isSafeAnswer = isDeclined || Boolean(selectedAnswer?.isSafe);

  const progress = totalScenarios
    ? (completedIds.length / totalScenarios) * 100
    : 0;

  const percentage = totalScenarios
    ? Math.round((correctAnswers / totalScenarios) * 100)
    : 0;

  const callerNumber = `+62 800-0000-${String(
    currentIndex + 1,
  ).padStart(4, "0")}`;

  // Scroll ke bagian simulasi ketika jawaban atau skenario berubah.
  useEffect(() => {
    if (!selectedChoice) return;

    const frameId = window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      scenarioRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });

      phoneScreenRef.current?.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [selectedChoice]);

  useEffect(() => {
    if (currentIndex === 0 || finished) return;

    const frameId = window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      scenarioRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });

      phoneScreenRef.current?.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth",
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

  // Tutup modal dengan tombol Escape.
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
        }),
      });

      const result = await response.json();

      if (response.status === 401) {
        setRewardMessage(
          "Login untuk menyimpan progres dan mendapatkan XP.",
        );
        return;
      }

      if (!response.ok) {
        setRewardMessage(
          result.message ?? "Simulasi selesai, tetapi progres gagal disimpan.",
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
          ? `Selamat! Kamu mendapatkan +${result.xpEarned} XP.`
          : "Progres simulasi berhasil disimpan.",
      );

      window.dispatchEvent(new Event("cekin-auth-change"));
    } catch {
      setRewardMessage(
        "Tidak dapat menyimpan progres. Silakan coba lagi.",
      );
    }
  }

  function handleAnswerCall() {
    setCallState("talking");
  }

  function handleDeclineCall() {
    if (selectedChoice) return;

    setSelectedChoice(DECLINED);
    setCorrectAnswers((previous) => previous + 1);
    setCompletedIds((previous) =>
      previous.includes(currentScenario.id)
        ? previous
        : [...previous, currentScenario.id],
    );
  }

  function handleChoice(choiceId: string) {
    if (selectedChoice) return;

    const choice = currentScenario.choices.find(
      (item) => item.id === choiceId,
    );

    if (!choice) return;

    setSelectedChoice(choiceId);

    setCompletedIds((previous) =>
      previous.includes(currentScenario.id)
        ? previous
        : [...previous, currentScenario.id],
    );

    if (choice.isSafe) {
      setCorrectAnswers((previous) => previous + 1);
    }
  }

  async function handleNext() {
    if (!selectedChoice || isSavingReward) return;

    setShowLearningModal(false);

    if (currentIndex < totalScenarios - 1) {
      setCurrentIndex((previous) => previous + 1);
      setSelectedChoice(null);
      setCallState("talking");
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
    setSelectedChoice(null);
    setCorrectAnswers(0);
    setCompletedIds([]);
    setFinished(false);
    setShowLearningModal(false);
    setRewardMessage("");
    setIsSavingReward(false);
  }

  if (!totalScenarios || !currentScenario) {
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

  // Halaman hasil.
  if (finished) {
    return (
      <main
        ref={resultRef}
        className="container scroll-mt-24 py-10 md:py-16"
      >
        <div className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--card)] shadow-sm">
            <div className="relative overflow-hidden bg-[var(--brand-dark)] px-6 py-10 text-center text-white md:px-10">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

              <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15">
                <PhoneCall className="h-10 w-10" />
              </div>

              <p className="text-xs font-bold tracking-[0.2em] text-white/70">
                SCAM CALL COMPLETED
              </p>

              <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                Kamu lebih siap menghadapi panggilan mencurigakan!
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/75">
                Kamu telah berlatih mengenali manipulasi melalui telepon dan
                menentukan respons yang lebih aman.
              </p>
            </div>

            <div className="p-6 md:p-9">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[var(--surface)] p-5 text-center">
                  <p className="text-3xl font-extrabold text-[var(--brand)]">
                    {correctAnswers}/{totalScenarios}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                    Pilihan aman
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

              <div className="mt-5 rounded-2xl border border-[var(--border)] p-5">
                <div className="flex items-start gap-3">
                  <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]" />
                  <div>
                    <h2 className="text-sm font-bold text-[var(--foreground)]">
                      Hal penting yang perlu diingat
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                      Jangan pernah memberikan OTP, PIN, password, atau data
                      pribadi melalui telepon. Jika penelepon mengaku dari
                      institusi resmi, tutup panggilan dan hubungi institusi
                      melalui nomor resmi yang kamu cari sendiri.
                    </p>
                  </div>
                </div>
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
              Hadapi panggilan simulasi, kenali tanda bahayanya, dan pilih
              respons yang lebih aman.
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

          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
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
        <div className="mb-7 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-[var(--foreground)]">
              Perjalananmu
            </span>

            <span className="text-xs font-semibold tabular-nums text-[var(--muted)]">
              {completedIds.length} dari {totalScenarios} selesai
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-[var(--surface)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Simulation layout */}
        <div className="grid items-start gap-5 lg:grid-cols-[1fr_280px]">
          {/* Phone simulation */}
          <section
            ref={scenarioRef}
            className="min-w-0 scroll-mt-24"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">
                Simulasi panggilan
              </p>

              <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-[10px] font-bold text-[var(--brand)]">
                Skenario {currentIndex + 1} / {totalScenarios}
              </span>
            </div>

            <div className="mx-auto w-full max-w-[390px] rounded-[2.8rem] border-[7px] border-[#263247] bg-[#263247] p-2 shadow-xl">
              {/* Phone notch */}
              <div className="relative z-20 mx-auto -mb-3 h-6 w-28 rounded-b-2xl bg-[#263247]" />

              {/* Phone screen */}
              <div
                ref={phoneScreenRef}
                className="relative max-h-[760px] min-h-[650px] overflow-y-auto rounded-[2.2rem] bg-[var(--card)] text-[var(--foreground)]"
              >
                {/* Status bar */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)]/95 px-6 pb-3 pt-4 text-[10px] font-semibold text-[var(--muted)] backdrop-blur">
                  <span>09:41</span>

                  <div className="flex items-center gap-1.5">
                    <Volume2 size={12} />
                    <span className="h-2 w-5 rounded-sm border border-[var(--muted)]">
                      <span className="block h-full w-3/4 rounded-sm bg-[var(--muted)]" />
                    </span>
                  </div>
                </div>

                {/* Incoming call */}
                {callState === "ringing" && !selectedChoice && (
                  <div className="flex min-h-[610px] flex-col items-center px-5 pb-8 pt-12 text-center">
                    <span className="mb-3 text-[10px] font-bold tracking-[0.2em] text-[var(--warning)]">
                      PANGGILAN MASUK
                    </span>

                    <span className="mb-10 inline-flex items-center gap-1.5 rounded-full border border-[var(--warning)]/30 bg-[var(--warning)]/10 px-3 py-1.5 text-[10px] font-semibold text-[var(--warning)]">
                      <span className="size-1.5 animate-pulse rounded-full bg-[var(--warning)]" />
                      SIMULASI PANGGILAN MENCURIGAKAN
                    </span>

                    <div className="relative mb-7">
                      <div className="absolute inset-0 animate-ping rounded-full bg-[var(--brand-soft)]" />

                      <div className="relative flex size-28 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                        <UserRound size={48} className="text-[var(--muted)]" />
                      </div>

                      <span className="absolute bottom-1 right-1 flex size-7 items-center justify-center rounded-full border-4 border-[var(--card)] bg-[var(--warning)] text-white">
                        <Phone size={12} />
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold text-[var(--foreground)]">
                      Nomor Tidak Dikenal
                    </h2>

                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {callerNumber}
                    </p>

                    <div className="mt-7 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                      <p className="text-xs leading-5 text-[var(--muted)]">
                        Seseorang sedang mencoba menghubungimu. Apakah kamu
                        akan menjawab panggilan ini?
                      </p>
                    </div>

                    <div className="mt-auto grid w-full grid-cols-2 gap-8 pt-8">
                        <button
                            type="button"
                            onClick={handleDeclineCall}
                            className="group flex flex-col items-center gap-2.5"
                        >
                            <span className="flex size-14 items-center justify-center rounded-full bg-[var(--danger)] text-white shadow-lg transition group-hover:scale-105">
                            <PhoneOff size={23} />
                            </span>

                            <span className="text-xs font-semibold text-[#17233b]">
                            Tolak
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={handleAnswerCall}
                            className="group flex flex-col items-center gap-2.5"
                        >
                            <span className="flex size-14 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-lg transition group-hover:scale-105">
                            <Phone size={23} />
                            </span>

                            <span className="text-xs font-semibold text-[#17233b]">
                            Jawab
                            </span>
                        </button>
                    </div>

                    <p className="mt-8 text-[10px] text-[var(--muted)]">
                      Tidak ada panggilan sungguhan yang dilakukan.
                    </p>
                  </div>
                )}

                {/* Active call */}
                {callState === "talking" && !selectedChoice && (
                  <div className="flex min-h-[490px] flex-col px-4 pb-4 pt-5">
                    <div className="flex flex-col items-center border-b border-[#e6eaf0] pb-3 text-center">
                        <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-[#eaf1fc]">
                            <UserRound size={23} className="text-[var(--brand)]" />
                        </div>

                        <h2 className="text-sm font-bold text-[#17233b]">
                            Nomor Tidak Dikenal
                        </h2>

                        <p className="mt-0.5 text-[11px] text-[#667085]">
                            {callerNumber}
                        </p>

                        <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#e9f7ef] px-3 py-1 text-[9px] font-semibold text-[#26a269]">
                            <span className="size-1.5 rounded-full bg-[#26a269]" />
                            PANGGILAN SIMULASI
                        </span>
                    </div>

                    {/* Caller dialogue */}
                    <div className="py-4">
                        <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#667085]">
                            <Volume2 size={12} />
                            Suara penelepon
                        </div>

                        <div className="rounded-2xl rounded-tl-sm border border-[#e6eaf0] bg-white p-3.5">
                            <div className="max-h-[105px] overflow-y-auto overscroll-contain">
                            <p className="whitespace-pre-line text-xs leading-6 text-[#17233b]">
                                {currentScenario.context}
                            </p>
                            </div>

                            <p className="mt-2 text-right text-[9px] text-[#98a2b3]">
                            Penelepon · Simulasi
                            </p>
                        </div>

                        <div className="mt-2 flex items-start gap-2 rounded-xl bg-[#fff7e8] px-3 py-2.5">
                            <AlertTriangle
                            size={13}
                            className="mt-0.5 shrink-0 text-[#e9a23b]"
                            />

                            <p className="text-[10px] leading-4 text-[#667085]">
                            Jangan terburu-buru mengikuti instruksi. Kamu berhak
                            menghentikan panggilan kapan saja.
                            </p>
                        </div>
                    </div>

                    {/* User decisions */}
                    <div className="mt-auto border-t border-[#e6eaf0] pt-3">
                        <h3 className="text-xs font-extrabold text-[#17233b]">
                            Bagaimana kamu merespons?
                        </h3>

                        <p className="mb-2 mt-1 text-[10px] text-[#667085]">
                            Pilih tindakan yang akan kamu lakukan.
                        </p>

                        <div className="space-y-2">
                            {currentScenario.choices.map((choice, index) => (
                            <button
                                key={choice.id}
                                type="button"
                                onClick={() => handleChoice(choice.id)}
                                disabled={!!selectedChoice}
                                className="group flex w-full items-center gap-2.5 rounded-xl border border-[#e6eaf0] bg-white p-2.5 text-left transition hover:border-[#2457a6] hover:bg-[#eaf1fc]"
                            >
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#f5f8fc] text-[10px] font-bold text-[#667085] group-hover:bg-white group-hover:text-[#2457a6]">
                                {String.fromCharCode(65 + index)}
                                </span>

                                <span className="min-w-0 flex-1 text-[11px] font-medium leading-5 text-[#17233b]">
                                {choice.label}
                                </span>

                                <ArrowRight
                                size={13}
                                className="shrink-0 text-[#98a2b3] group-hover:text-[#2457a6]"
                                />
                            </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={handleDeclineCall}
                            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#dc5555]/10 py-2.5 text-[11px] font-bold text-[#dc5555] transition hover:bg-[#dc5555]/15"
                        >
                            <PhoneOff size={13} />
                            Akhiri Panggilan
                        </button>
                    </div>
                  </div>
                )}

                {/* Answer feedback */}
                {selectedChoice && (
                  <div className="flex min-h-[490px] flex-col px-4 py-5">
                    <div className="flex flex-1 flex-col items-center justify-center text-center">
                        <div
                            className={`mb-3 flex size-16 items-center justify-center rounded-2xl ${
                            isSafeAnswer
                                ? "bg-[#e9f7ef] text-[#26a269]"
                                : "bg-[#dc5555]/10 text-[#dc5555]"
                            }`}
                        >
                            {isSafeAnswer ? (
                            <ShieldCheck size={30} />
                            ) : (
                            <AlertTriangle size={30} />
                            )}
                        </div>

                            <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#98a2b3]">
                                PANGGILAN BERAKHIR
                            </p>

                            <h2 className="mt-2 text-lg font-extrabold text-[#17233b]">
                                {isDeclined
                                ? "Panggilan berhasil ditolak."
                                : selectedAnswer?.isSafe
                                    ? "Respons yang lebih aman!"
                                    : "Kamu perlu lebih berhati-hati."}
                            </h2>

                            <p className="mt-2 max-w-[270px] text-[11px] leading-5 text-[#667085]">
                                {isDeclined
                                ? "Kamu memilih untuk tidak meladeni nomor yang tidak dikenal."
                                : selectedAnswer?.feedback}
                            </p>

                            <div
                                className={`mt-4 w-full rounded-xl border p-3 text-left ${
                                isSafeAnswer
                                    ? "border-[#26a269]/25 bg-[#e9f7ef]"
                                    : "border-[#e9a23b]/30 bg-[#e9a23b]/10"
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                {isSafeAnswer ? (
                                    <CheckCircle2 size={14} className="text-[#26a269]" />
                                ) : (
                                    <Info size={14} className="text-[#e9a23b]" />
                                )}

                                <p className="text-[11px] font-bold text-[#17233b]">
                                    {isSafeAnswer
                                    ? "Keputusan yang lebih aman"
                                    : "Hal yang perlu diperhatikan"}
                                </p>
                                </div>

                                <p className="mt-1.5 text-[10px] leading-4 text-[#667085]">
                                {isDeclined
                                    ? "Kamu tidak memberikan informasi apa pun kepada penelepon."
                                    : selectedAnswer?.isSafe
                                    ? "Kamu berhasil mengambil keputusan yang lebih aman."
                                    : "Pelajari kembali tanda manipulasi yang digunakan penelepon."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowLearningModal(true)}
                                className="button button-secondary mt-3 w-full text-xs"
                            >
                                <Lightbulb size={14} />
                                Pelajari alasan & tindakan aman
                            </button>
                            </div>

                            <div className="mt-4 border-t border-[#e6eaf0] pt-3">
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={isSavingReward}
                                className="button button-primary w-full text-xs disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSavingReward
                                ? "Menyimpan progres..."
                                : currentIndex === totalScenarios - 1
                                    ? "Lihat hasil simulasi"
                                    : "Lanjut ke skenario berikutnya"}

                                {!isSavingReward && <ArrowRight size={15} />}
                            </button>

                            <p className="mt-2 text-center text-[9px] text-[#98a2b3]">
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
                Latih kemampuan mengenali penyamaran identitas, tekanan,
                dan permintaan informasi pribadi melalui telepon.
              </p>
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
                  Jangan berikan OTP, PIN, atau password.
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
                  Verifikasi melalui nomor resmi yang kamu cari sendiri.
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
                Satu langkah lebih waspada.
              </p>
            </div>
          </aside>
        </div>

        <p className="mt-8 text-center text-xs leading-6 text-[var(--muted)]">
          CEKIN Learning & Protection · Semua nomor dan percakapan merupakan
          simulasi fiktif.
        </p>
      </div>

      {/* Learning modal */}
      {showLearningModal && selectedChoice && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowLearningModal(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="call-learning-title"
            className="w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-2xl"
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
                {isDeclined
                  ? "Mengapa menolak panggilan bisa menjadi pilihan aman?"
                  : "Pahami risiko dari responsmu."}
              </h2>

              <p className="mt-2 text-xs leading-relaxed text-white/70">
                {currentScenario.title}
              </p>
            </div>

            <div className="max-h-[60vh] space-y-4 overflow-y-auto p-6">
              {!isDeclined && selectedAnswer && (
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
              )}

              {isDeclined && (
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      size={18}
                      className="text-[var(--accent)]"
                    />
                    <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                      Mengapa menolak bisa membantu?
                    </h3>
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                    Menolak panggilan dari nomor yang tidak dikenal dapat
                    mengurangi kesempatan pelaku untuk menekan atau
                    memanipulasimu. Namun, nomor tidak dikenal tidak selalu
                    berarti penipuan. Jika panggilan tersebut penting, kamu
                    dapat memeriksa identitas penelepon melalui kanal resmi.
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent-soft)] p-4">
                <div className="flex items-center gap-2">
                  <Lightbulb
                    size={17}
                    className="text-[var(--accent)]"
                  />
                  <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                    Tindakan yang lebih aman
                  </h3>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">
                  {isDeclined
                    ? "Jika penelepon mengaku dari bank, instansi, atau layanan tertentu, cari sendiri nomor kontak resminya. Hubungi mereka untuk memastikan kebenaran informasi."
                    : selectedAnswer?.saferAction}
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
                  Jangan pernah membagikan OTP, PIN, password, atau kode
                  verifikasi kepada penelepon. Akhiri panggilan jika merasa
                  tertekan, lalu lakukan verifikasi secara mandiri.
                </p>
              </div>

              <button
                type="button"
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
    </main>
  );
}