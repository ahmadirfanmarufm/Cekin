
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  CheckCircle2,
  Eye,
  Lightbulb,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import type {
  SimulationChoice,
  SimulationConfig,
} from "@/types/learning-protection";

type Props = {
  simulation: SimulationConfig;
};

export function MindTrapSimulation({ simulation }: Props) {
    const scenarios = simulation.scenarios;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedChoice, setSelectedChoice] = useState<SimulationChoice | null>(null);
    const [completedIds, setCompletedIds] = useState<string[]>([]);
    const [safeIds, setSafeIds] = useState<string[]>([]);
    const [showReflection, setShowReflection] = useState(false);
    const [finished, setFinished] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");

    const scenarioRef = useRef<HTMLElement>(null);

    const currentScenario = scenarios[currentIndex];
    const progress = scenarios.length ? (completedIds.length / scenarios.length) * 100 : 0;

    if (!scenarios.length) {
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

        if (!completedIds.includes(currentScenario.id)) {
        setCompletedIds((previous) => [...previous, currentScenario.id]);
        }

        if (choice.isSafe && !safeIds.includes(currentScenario.id)) {
        setSafeIds((previous) => [...previous, currentScenario.id]);
        }
    };

    const handleScenarioChange = (index: number) => {
        if (index === currentIndex || index < 0 || index >= scenarios.length) {
        return;
        }

        setCurrentIndex(index);
        setSelectedChoice(null);
        setShowReflection(false);
    };

    const handleNext = () => {
        if (!selectedChoice) return;

        if (currentIndex < scenarios.length - 1) {
            setCurrentIndex((previous) => previous + 1);
            setSelectedChoice(null);

            scrollToScenario();

            return;
        }

        setFinished(true);
        scrollToScenario();
        saveCompletion();
    };

    const continueToNext = () => {
        setCurrentIndex((previous) => previous + 1);
        setSelectedChoice(null);
        setShowReflection(false);
    };

    const saveCompletion = async () => {
        if (saving) return;

        setSaving(true);

        try {
        const response = await fetch("/api/learning-protection/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ simulationId: "mind-trap" }),
        });

        if (response.status === 401) {
            setSaveMessage(
            "Kamu sudah menyelesaikan simulasi ini. Login untuk menyimpan progres dan XP."
            );
            return;
        }

        if (!response.ok) {
            setSaveMessage(
            "Simulasi selesai, tetapi progres belum berhasil disimpan."
            );
            return;
        }

        const result = await response.json();

        if (result.alreadyCompleted) {
            setSaveMessage("Progres simulasi ini sudah pernah tersimpan.");
        } else {
            setSaveMessage(
            result.xpEarned
                ? `Kamu mendapatkan ${result.xpEarned} XP!`
                : "Progres simulasi berhasil disimpan."
            );
        }

        window.dispatchEvent(new Event("cekin-auth-change"));
        } catch {
        setSaveMessage(
            "Simulasi selesai, tetapi koneksi gagal menyimpan progres."
        );
        } finally {
        setSaving(false);
        }
    };

    const restart = () => {
        setCurrentIndex(0);
        setSelectedChoice(null);
        setCompletedIds([]);
        setSafeIds([]);
        setFinished(false);
        setSaveMessage("");

        scrollToScenario();
    };

    if (finished) {
        const percentage = Math.round((safeIds.length / scenarios.length) * 100);

        return (
        <main className="container py-10 md:py-16">
            <div className="mx-auto max-w-2xl">
            <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--card)] shadow-sm">
                <div className="relative overflow-hidden bg-[var(--brand-dark)] px-6 py-10 text-center text-white md:px-10">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15">
                    <Brain className="h-10 w-10" />
                </div>
                <p className="text-xs font-bold tracking-[0.2em] text-white/70">
                    MIND TRAP COMPLETED
                </p>
                <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                    Pikiranmu lebih waspada!
                </h1>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/75">
                    Kamu sudah berlatih mengenali manipulasi psikologis. Terus
                    gunakan kemampuan ini saat menghadapi situasi nyata.
                </p>
                </div>

                <div className="p-6 md:p-9">
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[var(--surface)] p-5 text-center">
                    <p className="text-3xl font-extrabold text-[var(--brand)]">
                        {safeIds.length}/{scenarios.length}
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
                        <h2 className="text-sm font-bold">
                        Satu hal yang perlu diingat
                        </h2>
                        <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                        Ketika seseorang membuatmu merasa harus segera bertindak,
                        berhenti sejenak. Keputusan yang baik tidak harus dibuat
                        di bawah tekanan.
                        </p>
                    </div>
                    </div>
                </div>

                {saveMessage && (
                    <p className="mt-4 text-center text-xs text-[var(--muted)]">
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
              <Brain size={14} />
              MIND TRAP
            </div>
            <h1 className="heading heading-2 mt-4">
              Kenali trik yang bermain di pikiranmu.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
              Skenario singkat. Pilih respons, lalu lihat pola psikologinya.
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
            Pilih jebakan psikologi
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

        {/* Scenario */}
        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
          <section
            ref={scenarioRef}
            className="min-w-0 scroll-mt-24 overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--card)] shadow-sm"
            >
            <div className="border-b border-[var(--border)] bg-[var(--surface)] px-5 py-4 md:px-7">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-extrabold tracking-[0.16em] text-[var(--brand)]">
                  SKENARIO {currentIndex + 1} DARI {scenarios.length}
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
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="mb-3 flex items-center gap-2 text-[var(--muted)]">
                  <Eye size={16} />
                  <span className="text-[10px] font-extrabold tracking-wider">
                    BAYANGKAN SITUASI INI
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-[var(--foreground)]">
                  {currentScenario.context || currentScenario.description}
                </p>
              </div>

              <div className="mb-4 mt-7">
                <p className="text-sm font-extrabold text-[var(--foreground)]">
                  Seseorang mendorongmu untuk segera bertindak. Apa responsmu?
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Pilih respons yang paling mungkin kamu lakukan.
                </p>
              </div>

              <div className="space-y-3">
                {currentScenario.choices.map((choice, index) => {
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
                          : "Ada jebakan yang perlu kamu sadari."}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">
                      {selectedChoice.feedback}
                    </p>
                  </div>

                  <div className="mt-4 rounded-2xl border border-[var(--border)] p-5">
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
                    onClick={handleNext}
                    className="button button-primary mt-5 w-full"
                  >
                    {currentIndex === scenarios.length - 1
                      ? "Lihat hasilku"
                      : "Lanjut ke jebakan berikutnya"}
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
                Kenali bagaimana tekanan, rasa takut, dan pengaruh orang lain
                bisa mengubah keputusanmu.
              </p>
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
                mengikuti keputusan hanya karena seseorang mendesakmu.
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

        {/* Reflection modal */}
        {showReflection && selectedChoice && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reflection-title"
          >
            <div className="w-full max-w-md overflow-hidden rounded-3xl bg-[var(--card)] shadow-2xl">
              <div className="bg-[var(--brand-dark)] p-6 text-white">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <Brain size={24} />
                </div>
                <p className="mt-5 text-[10px] font-extrabold tracking-[0.18em] text-white/60">
                  JEDA SEJENAK
                </p>
                <h2
                  id="reflection-title"
                  className="mt-2 text-2xl font-extrabold"
                >
                  Bawa pelajaran ini ke skenario berikutnya.
                </h2>
              </div>

              <div className="p-6">
                <p className="text-sm leading-relaxed text-[var(--muted)]">
                  {selectedChoice.saferAction}
                </p>
                <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[var(--accent-soft)] p-4">
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-[var(--accent)]"
                  />
                  <p className="text-xs font-semibold leading-relaxed text-[var(--foreground)]">
                    Ingat: mengenali tekanan adalah langkah pertama untuk
                    mengambil keputusan dengan sadar.
                  </p>
                </div>
                <button
                  onClick={continueToNext}
                  className="button button-primary mt-6 w-full"
                >
                  Aku siap lanjut
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
