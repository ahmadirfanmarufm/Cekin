"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BatteryFull,
  Check,
  CheckCheck,
  CheckCircle2,
  Eye,
  Lightbulb,
  LockKeyhole,
  MessageCircle,
  MoreVertical,
  Phone,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Signal,
  Sparkles,
  Video,
  Wifi,
  X,
} from "lucide-react";
import type {
  SimulationChoice,
  SimulationConfig,
} from "@/types/learning-protection";

type Props = {
  simulation: SimulationConfig;
};

export function TrustLabChat({ simulation }: Props) {
  const scenarios = simulation.scenarios;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] =
    useState<SimulationChoice | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [safeIds, setSafeIds] = useState<string[]>([]);
  const [showLearningModal, setShowLearningModal] = useState(false);
  const [finished, setFinished] = useState(false);
  const [isSavingReward, setIsSavingReward] = useState(false);
  const [rewardMessage, setRewardMessage] = useState("");

  const scenarioRef = useRef<HTMLElement>(null);

  const currentScenario = scenarios[currentIndex];
  const progress = scenarios.length
    ? (completedIds.length / scenarios.length) * 100
    : 0;

  const selectedAnswer = selectedChoice;

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

    setSelectedChoice(choice);

    setCompletedIds((previous) =>
      previous.includes(currentScenario.id)
        ? previous
        : [...previous, currentScenario.id],
    );

    // Pastikan jawaban terbaru menggantikan status jawaban sebelumnya.
    setSafeIds((previous) => {
      const withoutCurrent = previous.filter(
        (id) => id !== currentScenario.id,
      );

      return choice.isSafe
        ? [...withoutCurrent, currentScenario.id]
        : withoutCurrent;
    });
  };

  const handleScenarioChange = (index: number) => {
    if (
      index === currentIndex ||
      index < 0 ||
      index >= scenarios.length
    ) {
      return;
    }

    setCurrentIndex(index);
    setSelectedChoice(null);
    setShowLearningModal(false);
    scrollToScenario();
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
        }),
      });

      if (response.status === 401) {
        setRewardMessage(
          "Simulasi selesai! Login untuk menyimpan progres dan XP ke akunmu.",
        );
        return;
      }

      if (!response.ok) {
        setRewardMessage(
          "Simulasi selesai, tetapi progres belum berhasil disimpan. Kamu tetap bisa melihat hasil belajarmu.",
        );
        return;
      }

      const result = await response.json();

      if (result.alreadyCompleted) {
        setRewardMessage(
          "Progres Trust Lab sudah pernah tersimpan di akunmu.",
        );
      } else if (result.xpEarned) {
        setRewardMessage(
          `Keren! Kamu mendapatkan ${result.xpEarned} XP dari Trust Lab.`,
        );
      } else {
        setRewardMessage("Progres Trust Lab berhasil disimpan.");
      }

      window.dispatchEvent(new Event("cekin-auth-change"));
    } catch {
      setRewardMessage(
        "Simulasi selesai, tetapi koneksi gagal menyimpan progres. Coba lagi nanti.",
      );
    } finally {
      setIsSavingReward(false);
    }
  };

  const handleNext = async () => {
    if (!selectedChoice || isSavingReward) return;

    setShowLearningModal(false);

    // Cari skenario yang belum dikerjakan agar tidak ada materi terlewat.
    const nextIncompleteIndex = scenarios.findIndex(
      (scenario, index) =>
        index > currentIndex && !completedIds.includes(scenario.id),
    );

    const firstIncompleteIndex = scenarios.findIndex(
      (scenario) => !completedIds.includes(scenario.id),
    );

    const nextIndex =
      nextIncompleteIndex !== -1
        ? nextIncompleteIndex
        : firstIncompleteIndex;

    if (nextIndex !== -1) {
      setCurrentIndex(nextIndex);
      setSelectedChoice(null);
      scrollToScenario();
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
    setCompletedIds([]);
    setSafeIds([]);
    setShowLearningModal(false);
    setFinished(false);
    setRewardMessage("");

    scrollToScenario();
  };

  if (finished) {
    const percentage = Math.round(
      (safeIds.length / scenarios.length) * 100,
    );

    return (
      <main className="container py-10 md:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--card)] shadow-sm">
            <div className="relative overflow-hidden bg-[var(--brand-dark)] px-6 py-10 text-center text-white md:px-10">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

              <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15">
                <MessageCircle className="h-10 w-10" />
              </div>

              <p className="text-xs font-bold tracking-[0.2em] text-white/70">
                TRUST LAB COMPLETED
              </p>

              <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                Lebih cermat sebelum percaya!
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/75">
                Kamu sudah berlatih menghadapi percakapan yang berpotensi
                menipu. Ingat, jangan mudah percaya hanya karena seseorang
                terdengar meyakinkan.
              </p>
            </div>

            <div className="p-6 md:p-9">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[var(--surface)] p-5 text-center">
                  <p className="text-3xl font-extrabold text-[var(--brand)]">
                    {safeIds.length}/{scenarios.length}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                    Respons lebih aman
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
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
                  <div>
                    <h2 className="text-sm font-bold text-[var(--foreground)]">
                      Prinsip utama Trust Lab
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                      Jangan mengirim uang, data pribadi, kata sandi, atau
                      kode OTP hanya karena diminta melalui chat. Verifikasi
                      identitas dan informasi melalui saluran resmi yang
                      kamu cari sendiri.
                    </p>
                  </div>
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
                    Periksa siapa yang menghubungimu.
                  </li>
                  <li className="flex gap-2">
                    <Check size={14} className="mt-0.5 shrink-0" />
                    Waspadai permintaan uang dan data rahasia.
                  </li>
                  <li className="flex gap-2">
                    <Check size={14} className="mt-0.5 shrink-0" />
                    Jangan terburu-buru mengambil keputusan.
                  </li>
                  <li className="flex gap-2">
                    <Check size={14} className="mt-0.5 shrink-0" />
                    Verifikasi melalui kanal resmi secara mandiri.
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

            <h1 className="heading heading-2 mt-4">
              Jangan mudah percaya sebelum memeriksa.
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
              Hadapi percakapan mencurigakan, kenali tanda manipulasi, dan
              pelajari cara merespons dengan lebih aman.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <ShieldCheck size={21} />
            </div>

            <div>
              <p className="text-2xl font-extrabold leading-none text-[var(--foreground)]">
                {safeIds.length}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Respons aman
              </p>
            </div>
          </div>
        </div>

        {/* Learning flow */}
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
              <Eye size={17} />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[var(--foreground)]">
                01. Amati chat
              </p>
              <p className="mt-1 text-[10px] leading-relaxed text-[var(--muted)]">
                Perhatikan isi dan pengirim pesan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
              <MessageCircle size={17} />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[var(--foreground)]">
                02. Pilih respons
              </p>
              <p className="mt-1 text-[10px] leading-relaxed text-[var(--muted)]">
                Tentukan tindakan yang tepat.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <Lightbulb size={17} />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[var(--foreground)]">
                03. Pelajari hasil
              </p>
              <p className="mt-1 text-[10px] leading-relaxed text-[var(--muted)]">
                Pahami risiko dan langkah aman.
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-7 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--foreground)]">
              Perjalananmu
            </span>
            <span className="text-xs font-semibold tabular-nums text-[var(--muted)]">
              {completedIds.length} dari {scenarios.length} selesai
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-[var(--surface)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Scenario selector */}
        <div className="mb-6">
          <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">
            Skenario percakapan
          </p>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {scenarios.map((scenario, index) => {
              const isCurrent = index === currentIndex;
              const isCompleted = completedIds.includes(scenario.id);

              return (
                <button
                  key={scenario.id}
                  onClick={() => handleScenarioChange(index)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                    isCurrent
                      ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                      : "border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:border-[var(--brand)]"
                  }`}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-black/5 text-[10px]">
                    {isCompleted ? <Check size={13} /> : `0${index + 1}`}
                  </span>
                  {scenario.title}
                </button>
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
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-extrabold tracking-[0.16em] text-[var(--brand)]">
                  SKENARIO {currentIndex + 1} DARI {scenarios.length}
                </span>

                <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-[10px] font-bold text-[var(--brand)]">
                  Simulasi percakapan
                </span>
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
                          Kontak Tidak Dikenal
                        </p>
                        <p className="mt-0.5 text-[10px] text-white/70">
                          akun bisnis
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

                      {/* Incoming Message */}
                      <div className="flex justify-start">
                        <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-3 shadow-sm">
                          <p className="whitespace-pre-line text-[12px] leading-[1.7] text-[#303030]">
                            {currentScenario.context || currentScenario.description}
                          </p>

                          <div className="mt-1 text-right text-[9px] text-[#999]">
                            09:41
                          </div>
                        </div>
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
                                  : "Ayo, segera lakukan sekarang. Kesempatan ini bisa hilang kalau kamu terlalu lama berpikir!"}
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

                          <div className="space-y-2">
                            {currentScenario.choices.map((choice, index) => (
                              <button
                                key={choice.id}
                                onClick={() => handleChoice(choice)}
                                disabled={!!selectedChoice}
                                className="group flex w-full items-center gap-3 rounded-xl border border-[#d8e0dc] bg-white p-3 text-left transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] disabled:cursor-not-allowed"
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
                          className="text-[var(--accent)]"
                        />
                      ) : (
                        <AlertTriangle
                          size={20}
                          className="text-[var(--warning)]"
                        />
                      )}

                      <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                        {selectedAnswer.isSafe
                          ? "Respons yang lebih aman!"
                          : "Ada risiko yang perlu kamu pahami."}
                      </h3>
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">
                      {selectedAnswer.feedback}
                    </p>
                  </div>

                  <div className="mt-4 rounded-2xl border border-[var(--border)] p-5">
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
                      onClick={() => setShowLearningModal(true)}
                      className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold text-[var(--brand)] transition hover:text-[var(--brand-dark)]"
                    >
                      Pelajari penjelasan lebih lanjut
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={isSavingReward}
                    className="button button-primary mt-5 w-full"
                  >
                    {isSavingReward
                      ? "Menyimpan progres..."
                      : completedIds.length === scenarios.length
                        ? "Lihat hasil pembelajaran"
                        : "Lanjut ke percakapan berikutnya"}
                    <ArrowRight size={16} />
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
                Jadilah pengguna yang kritis. Jangan langsung percaya pada
                orang yang menghubungimu, meskipun pesan mereka terlihat
                profesional atau menjanjikan keuntungan.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
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
                  "Meminta biaya di awal untuk mendapatkan pekerjaan atau hadiah.",
                  "Mendesakmu agar segera mentransfer uang.",
                  "Menjanjikan keuntungan yang tidak masuk akal.",
                  "Meminta kata sandi, PIN, atau kode OTP.",
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
                Berhenti sejenak, periksa informasi, dan verifikasi
                identitas melalui kanal resmi. Kamu tidak wajib mengikuti
                permintaan seseorang hanya karena mereka mendesakmu.
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
                {completedIds.length} dari {scenarios.length} percakapan
                telah kamu pelajari.
              </p>
            </div>
          </aside>
        </div>

        {/* Learning modal */}
        {showLearningModal && selectedAnswer && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="trust-learning-title"
            onClick={() => setShowLearningModal(false)}
          >
            <div
              className="my-auto w-full max-w-lg overflow-hidden rounded-3xl bg-[var(--card)] shadow-2xl"
              onClick={(event) => event.stopPropagation()}
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

                <div className="rounded-2xl bg-[var(--brand-soft)] p-4">
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
                      "Apakah saya mengenal dan dapat memverifikasi pengirimnya?",
                      "Apakah pesan meminta uang atau informasi rahasia?",
                      "Apakah saya sedang didesak untuk mengambil keputusan?",
                      "Bisakah informasi ini diperiksa melalui kanal resmi?",
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
    </main>
  );
}