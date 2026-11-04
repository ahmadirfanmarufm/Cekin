
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  Info,
  Lightbulb,
  RotateCcw,
  ShieldCheck,
  Sparkles,
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

export function GamblingAwareness({ simulation }: Props) {
    const scenarios = simulation.scenarios;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedChoice, setSelectedChoice] = useState<SimulationChoice | null>(null);
    const [completedIds, setCompletedIds] = useState<string[]>([]);
    const [safeIds, setSafeIds] = useState<string[]>([]);
    const [finished, setFinished] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [rewardMessage, setRewardMessage] = useState("");

    const scenarioRef = useRef<HTMLElement>(null);

    const currentScenario = scenarios[currentIndex];
    const totalScenarios = scenarios.length;

    const progress = totalScenarios > 0 ? (completedIds.length / totalScenarios) * 100 : 0;

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
        previous.includes(currentScenario.id) ? previous : [...previous, currentScenario.id],
        );

        setSafeIds((previous) => {
        const withoutCurrent = previous.filter((id) => id !== currentScenario.id,);

        return choice.isSafe ? [...withoutCurrent, currentScenario.id] : withoutCurrent;
        });
    };

    const handleScenarioChange = (index: number) => {
        if (index < 0 || index >= totalScenarios || index === currentIndex) {
            return;
        }

        setCurrentIndex(index);
        setSelectedChoice(null);
        scrollToScenario();
    };

    const saveSimulationCompletion = async () => {
        try {
        setIsSaving(true);

        const response = await fetch("/api/learning-protection/complete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
                body: JSON.stringify({
                simulationId: "online-gambling",
            }),
        });

        const data = await response.json().catch(() => null);

        if (response.status === 401) {
            setRewardMessage("Simulasi selesai! Login untuk menyimpan progres dan XP-mu.",);
            return;
        }

        if (!response.ok) {
            setRewardMessage(data?.message || "Simulasi selesai, tetapi progres belum berhasil disimpan.",);
            return;
        }

        if (data?.alreadyCompleted) {
            setRewardMessage("Kamu sudah pernah menyelesaikan simulasi ini.");
        } else {
            setRewardMessage(data?.message || "Progres simulasi berhasil disimpan!");
        }

        window.dispatchEvent(new Event("cekin-auth-change"));
        } catch {
            setRewardMessage("Simulasi selesai, tetapi terjadi kendala saat menyimpan progres.",);
        } finally {
            setIsSaving(false);
        }
    };

  const handleNext = async () => {
    if (!selectedChoice || isSaving) return;

    if (currentIndex < totalScenarios - 1) {
      setCurrentIndex((previous) => previous + 1);
      setSelectedChoice(null);
      scrollToScenario();
      return;
    }

    setFinished(true);
    scrollToScenario();
    await saveSimulationCompletion();
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedChoice(null);
    setCompletedIds([]);
    setSafeIds([]);
    setFinished(false);
    setRewardMessage("");
    setIsSaving(false);
    scrollToScenario();
  };

  if (totalScenarios === 0 || !currentScenario) {
    return (
      <main className="container py-16 text-center">
        <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-[var(--warning)]" />
        <h1 className="heading heading-2">Skenario belum tersedia</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Belum ada skenario untuk simulasi ini.
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

  if (finished) {
    const percentage = Math.round(
      (safeIds.length / totalScenarios) * 100,
    );

    return (
      <main className="container py-10 md:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--card)] shadow-sm">
            <div className="relative overflow-hidden bg-[var(--brand-dark)] px-6 py-10 text-center text-white md:px-10">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

              <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15">
                <ShieldCheck size={40} />
              </div>

              <p className="text-xs font-bold tracking-[0.2em] text-white/70">
                GAMBLING AWARENESS COMPLETED
              </p>

              <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                Kamu lebih mengenali jebakannya!
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/75">
                Kamu sudah mempelajari berbagai pola manipulasi dalam promosi
                judi online. Gunakan pengetahuan ini untuk melindungi dirimu.
              </p>
            </div>

            <div className="p-6 md:p-9">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[var(--surface)] p-5 text-center">
                  <p className="text-3xl font-extrabold text-[var(--brand)]">
                    {completedIds.length}/{totalScenarios}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                    Skenario selesai
                  </p>
                </div>

                <div className="rounded-2xl bg-[var(--surface)] p-5 text-center">
                  <p className="text-3xl font-extrabold text-[var(--accent)]">
                    {percentage}%
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                    Pilihan aman
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-[var(--border)] p-5">
                <div className="flex items-start gap-3">
                  <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]" />
                  <div>
                    <h2 className="text-sm font-bold">
                      Ingat sebelum mengambil keputusan
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                      Tidak ada bonus atau janji kemenangan yang menjamin
                      keuntungan. Jangan biarkan promosi memengaruhi keputusan
                      finansialmu.
                    </p>
                  </div>
                </div>
              </div>

              {rewardMessage && (
                <p className="mt-4 text-center text-xs text-[var(--muted)]">
                  {rewardMessage}
                </p>
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
                  Simulasi lainnya
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
        {/* Back navigation */}
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

            <h1 className="heading heading-2 mt-4">
              Kenali jebakan di balik judi online.
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
              Pelajari bagaimana promosi dan manipulasi dirancang untuk
              memengaruhi keputusanmu.
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
                Pilihan aman
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <section className="mb-7 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="mb-3 flex items-center justify-between">
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
        </section>

        {/* Scenario selector */}
        <section  className="mb-6">
          <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">
            Jelajahi pola manipulasi
          </p>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {scenarios.map((scenario, index) => {
              const isCurrent = currentIndex === index;
              const isCompleted = completedIds.includes(scenario.id);

              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => handleScenarioChange(index)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                    isCurrent
                      ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                      : "border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:border-[var(--brand)]"
                  }`}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-black/5 text-[10px]">
                    {isCompleted ? (
                      <Check size={13} />
                    ) : (
                      `0${index + 1}`
                    )}
                  </span>

                  {scenario.title}
                </button>
              );
            })}
          </div>
        </section>

        {/* Main scenario */}
        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
          <section ref={scenarioRef}  className="min-w-0 overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--card)] shadow-sm">
            {/* Scenario heading */}
            <div className="border-b border-[var(--border)] bg-[var(--surface)] px-5 py-4 md:px-7">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-extrabold tracking-[0.16em] text-[var(--brand)]">
                  SKENARIO {currentIndex + 1} DARI {totalScenarios}
                </span>

                <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-[10px] font-bold text-[var(--brand)]">
                  Kenali polanya
                </span>
              </div>

              <h2 className="mt-3 text-xl font-extrabold leading-snug text-[var(--foreground)] md:text-2xl">
                {currentScenario.title}
              </h2>
            </div>

            <div className="p-5 md:p-7">
              {/* Context */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="mb-3 flex items-center gap-2 text-[var(--muted)]">
                  <Info size={16} />
                  <span className="text-[10px] font-extrabold tracking-wider">
                    BAYANGKAN SITUASI INI
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-[var(--foreground)]">
                  {currentScenario.context ||
                    currentScenario.description}
                </p>
              </div>

              {/* Promotional mockup */}
              <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--border)]">
                <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                  <div>
                    <p className="text-xs font-extrabold text-[var(--foreground)]">
                      Contoh promosi
                    </p>
                    <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                      Tampilan fiktif untuk edukasi
                    </p>
                  </div>

                  <span className="rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-extrabold text-red-700">
                    FIKSI
                  </span>
                </div>

                <div className="relative overflow-hidden bg-slate-950 p-5 text-center text-white sm:p-7">
                  <div className="pointer-events-none absolute -left-10 -top-10 h-36 w-36 rounded-full bg-red-500/20 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-amber-400/20 blur-3xl" />

                  <div className="relative">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-[10px] font-extrabold tracking-wider text-amber-300">
                      <Sparkles size={12} />
                      PROMOSI SIMULASI
                    </span>

                    <div className="my-5 flex items-center justify-center gap-3 text-4xl font-black text-amber-300 sm:text-5xl">
                      <span>7</span>
                      <span className="text-white">★</span>
                      <span>7</span>
                    </div>

                    <h3 className="text-lg font-extrabold sm:text-xl">
                      {currentScenario.title}
                    </h3>

                    <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-white/65">
                      {currentScenario.description}
                    </p>

                    <div className="mx-auto mt-5 flex max-w-xs items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-200">
                      <Clock3 size={15} />
                      Jangan terburu-buru mengambil keputusan
                    </div>

                    <p className="mt-4 text-[10px] leading-5 text-white/40">
                      Tidak ada permainan, deposit, atau transaksi sungguhan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Decision */}
              <div className="mb-4 mt-7">
                <p className="text-sm font-extrabold text-[var(--foreground)]">
                  Apa yang akan kamu lakukan?
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Pilih respons yang menurutmu paling tepat.
                </p>
              </div>

              <div className="space-y-3">
                {currentScenario.choices.map((choice, index) => {
                  const isSelected = selectedChoice?.id === choice.id;

                  return (
                    <button
                      key={choice.id}
                      type="button"
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

              {/* Feedback */}
              {selectedChoice && (
                <div className="mt-6 animate-[fadeIn_300ms_ease-out]">
                  <div
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
                          className="text-[var(--accent)]"
                        />
                      ) : (
                        <AlertTriangle
                          size={20}
                          className="text-[var(--warning)]"
                        />
                      )}

                      <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                        {selectedChoice.isSafe
                          ? "Respons yang lebih aman!"
                          : "Ada risiko yang perlu kamu sadari."}
                      </h3>
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">
                      {selectedChoice.feedback}
                    </p>
                  </div>

                  <div className="mt-4 rounded-2xl border border-[var(--border)] p-5">
                    <div className="flex items-center gap-2">
                      <Info
                        size={18}
                        className="text-[var(--brand)]"
                      />
                      <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                        Mengapa ini berisiko?
                      </h3>
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                      {selectedChoice.explanation}
                    </p>

                    <div className="mt-4 rounded-xl bg-[var(--brand-soft)] p-4">
                      <div className="flex items-center gap-2 text-[var(--brand)]">
                        <Lightbulb size={16} />
                        <span className="text-xs font-extrabold">
                          Langkah yang lebih aman
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-relaxed text-[var(--brand-dark)]">
                        {selectedChoice.saferAction}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={isSaving}
                    className="button button-primary mt-5 w-full disabled:cursor-wait disabled:opacity-60"
                  >
                    {isSaving
                      ? "Menyimpan progres..."
                      : currentIndex === totalScenarios - 1
                        ? "Lihat hasilku"
                        : "Lanjut ke skenario berikutnya"}
                    {!isSaving && <ArrowRight size={16} />}
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
                Kenali bagaimana bonus, janji keuntungan, dan tekanan waktu
                digunakan untuk memengaruhi keputusan.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={17}
                  className="text-[var(--accent)]"
                />
                <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                  Ingat ini
                </h3>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
                Tidak ada strategi yang menjamin kemenangan judi online.
                Jangan pernah mengirim uang karena tergoda bonus atau promosi.
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
                Satu langkah lebih waspada.
              </p>
            </div>
          </aside>
        </div>

        {/* Support reminder */}
        <section className="mt-7 flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <HeartHandshake size={23} />
          </span>

          <div>
            <h3 className="text-sm font-extrabold text-[var(--foreground)]">
              Sulit berhenti bukan berarti kamu lemah.
            </h3>

            <p className="mt-1 text-xs leading-6 text-[var(--muted)]">
              Jika judi online mulai mengganggu kehidupanmu, hentikan
              transaksi, kurangi paparan promosi, dan bicarakan situasimu
              dengan orang tepercaya atau tenaga profesional.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
