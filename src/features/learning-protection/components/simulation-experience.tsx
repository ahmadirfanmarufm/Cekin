"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Lightbulb,
  RotateCcw,
  Trophy,
  AlertTriangle,
  Clock3,
} from "lucide-react";

import type { SimulationConfig } from "@/types/learning-protection/index";

type Props = {
  simulation: SimulationConfig;
};


const simulationRouteIds = {
  trust: "trust-lab",
  apps: "apps-scam",
  phishing: "phishing-attack",
  calls: "spam-call",
  gambling: "online-gambling",
  mind: "mind-trap",
} as const;

export function SimulationExperience({ simulation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [finished, setFinished] = useState(false);
  const [rewardMessage, setRewardMessage] = useState("");
  const [isSavingReward, setIsSavingReward] = useState(false);
  const feedbackRef = useRef<HTMLDivElement>(null);

  const currentScenario = simulation.scenarios[currentIndex];

  const selectedAnswer = currentScenario?.choices.find(
    (choice) => choice.id === selectedChoice,
  );

  const totalScenarios = simulation.scenarios.length;

  const progress = finished ? 100 : ((currentIndex + (selectedChoice ? 1 : 0)) / totalScenarios) * 100;

  const saveSimulationCompletion = async () => {
    try {
      const response = await fetch(
        "/api/learning-protection/complete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({
            simulationId: simulationRouteIds[simulation.id],
          }),
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        setRewardMessage(
          "Login untuk menyimpan progres dan mendapatkan XP."
        );
        return;
      }

      if (!response.ok) {
        setRewardMessage(
          result.message ?? "Gagal menyimpan progres."
        );
        return;
      }

      if (result.alreadyCompleted) {
        setRewardMessage("Simulasi ini sudah pernah diselesaikan.");
        return;
      }

      setRewardMessage(`Selamat! Kamu mendapatkan +${result.xpEarned} XP.`);
      window.dispatchEvent(new Event("cekin-auth-change"));
    } catch {
      setRewardMessage("Tidak dapat menyimpan progres. Coba lagi.");
    }
  };

  const handleChoice = (choiceId: string) => {
    if (selectedChoice) return;

    const choice = currentScenario.choices.find(
      (item) => item.id === choiceId,
    );

    if (!choice) return;

    setSelectedChoice(choiceId);

    if (choice.isSafe) {
      setCorrectAnswers((previous) => previous + 1);
    }

    requestAnimationFrame(() => {
      feedbackRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  };

  async function handleNext() {
    if (!selectedChoice || isSavingReward) return;

    if (currentIndex === totalScenarios - 1) {
      setIsSavingReward(true);

      await saveSimulationCompletion();

      setFinished(true);
      setIsSavingReward(false);

      return;
    }

    setCurrentIndex((previous) => previous + 1);
    setSelectedChoice(null);
  }

  function handleRestart() {
    setCurrentIndex(0);
    setSelectedChoice(null);
    setCorrectAnswers(0);
    setFinished(false);
    setRewardMessage("");
    setIsSavingReward(false);
  }

  const percentage = Math.round(
    (correctAnswers / totalScenarios) * 100,
  );

  if (finished) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Trophy size={38} />
            </div>

            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
              Simulation Completed
            </p>

            <h1 className="mt-3 text-3xl font-bold text-slate-900">
              Simulasi Selesai!
            </h1>

            <p className="mx-auto mt-3 max-w-md leading-7 text-slate-600">
              Kamu telah menyelesaikan simulasi {simulation.title}.
              Berikut hasil latihanmu.
            </p>

            <div className="my-8 rounded-2xl bg-slate-50 p-6">
              <p className="text-sm font-medium text-slate-500">
                Jawaban Aman
              </p>

              <p className="mt-2 text-5xl font-extrabold text-emerald-700">
                {percentage}%
              </p>

              <p className="mt-3 text-sm text-slate-500">
                {correctAnswers} dari {totalScenarios} skenario
                dijawab dengan pilihan yang lebih aman.
              </p>
            </div>

            {rewardMessage && (
              <div
                role="status"
                className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-700"
              >
                <div className="flex items-start gap-2">
                  <Trophy size={19} className="mt-0.5 shrink-0" />
                  <p>{rewardMessage}</p>
                </div>
              </div>
            )}

            <div className="mb-8 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <CheckCircle2 className="mx-auto text-emerald-700" />
                <p className="mt-2 text-xl font-bold text-emerald-800">
                  {correctAnswers}
                </p>
                <p className="text-xs text-emerald-700">
                  Pilihan Aman
                </p>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                <AlertTriangle className="mx-auto text-amber-700" />
                <p className="mt-2 text-xl font-bold text-amber-800">
                  {totalScenarios - correctAnswers}
                </p>
                <p className="text-xs text-amber-700">
                  Perlu Dipelajari
                </p>
              </div>
            </div>

            <p className="mb-6 text-sm leading-6 text-slate-500">
              Ingat, tujuan simulasi ini bukan sekadar mendapatkan nilai
              tinggi, tetapi memahami risiko dan membangun kebiasaan
              digital yang lebih aman.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleRestart}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800"
              >
                <RotateCcw size={17} />
                Ulangi Simulasi
              </button>

              <Link
                href="/learning-protection"
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Kembali ke Learning
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!currentScenario) return null;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
        {/* Back Navigation */}
        <Link
          href="/learning-protection"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-700"
        >
          <ArrowLeft size={17} />
          Kembali ke Learning & Protection
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              {simulation.difficulty}
            </span>

            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock3 size={13} />
              {simulation.duration}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {simulation.title}
          </h1>

          <p className="mt-2 font-medium text-emerald-700">
            {simulation.subtitle}
          </p>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            {simulation.description}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">
              Progress Simulasi
            </span>

            <span className="text-sm font-bold text-emerald-700">
              {currentIndex + 1} / {totalScenarios}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Scenario */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6 sm:p-8">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Scenario {currentIndex + 1}
            </span>

            <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
              {currentScenario.title}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {currentScenario.description}
            </p>
          </div>

          {/* Scenario Context */}
          <div className="p-6 sm:p-8">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <ShieldCheck size={19} />
                </div>

                <span className="text-sm font-bold text-slate-700">
                  Situasi yang Kamu Hadapi
                </span>
              </div>

              <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
                {currentScenario.context}
              </p>
            </div>

            {/* Choices */}
            <div className="mt-7">
              <h3 className="mb-4 font-bold text-slate-900">
                Apa yang akan kamu lakukan?
              </h3>

              <div className="space-y-3">
                {currentScenario.choices.map((choice, index) => {
                  const isSelected = selectedChoice === choice.id;

                  let choiceStyle =
                    "border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50";

                  if (selectedChoice && isSelected) {
                    choiceStyle = choice.isSafe
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-red-400 bg-red-50";
                  }

                  return (
                    <button
                      key={choice.id}
                      type="button"
                      disabled={!!selectedChoice}
                      onClick={() => handleChoice(choice.id)}
                      className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all ${choiceStyle} ${
                        selectedChoice && !isSelected
                          ? "opacity-50"
                          : ""
                      }`}
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-600 shadow-sm">
                        {String.fromCharCode(65 + index)}
                      </span>

                      <span className="flex-1 pt-1 text-sm font-medium leading-6 text-slate-700">
                        {choice.label}
                      </span>

                      {selectedChoice && isSelected && (
                        choice.isSafe ? (
                          <CheckCircle2
                            className="mt-1 shrink-0 text-emerald-600"
                            size={20}
                          />
                        ) : (
                          <XCircle
                            className="mt-1 shrink-0 text-red-500"
                            size={20}
                          />
                        )
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback */}
            {selectedAnswer && (
              <div
                ref={feedbackRef}
                className="mt-7 scroll-mt-24 space-y-4"
              >
                <div
                  className={`rounded-xl border p-5 ${
                    selectedAnswer.isSafe
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {selectedAnswer.isSafe ? (
                      <CheckCircle2
                        className="mt-0.5 shrink-0 text-emerald-700"
                        size={22}
                      />
                    ) : (
                      <AlertTriangle
                        className="mt-0.5 shrink-0 text-red-600"
                        size={22}
                      />
                    )}

                    <div>
                      <h4
                        className={`font-bold ${
                          selectedAnswer.isSafe
                            ? "text-emerald-900"
                            : "text-red-900"
                        }`}
                      >
                        {selectedAnswer.isSafe
                          ? "Pilihan Lebih Aman!"
                          : "Perlu Lebih Berhati-hati!"}
                      </h4>

                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {selectedAnswer.feedback}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                  <div className="flex items-center gap-2 font-bold text-blue-900">
                    <Lightbulb size={19} />
                    Mengapa Ini Berisiko?
                  </div>

                  <p className="mt-3 text-sm leading-7 text-blue-900/80">
                    {selectedAnswer.explanation}
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-100 bg-white p-5">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <ShieldCheck size={19} />
                    Tindakan yang Lebih Aman
                  </div>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {selectedAnswer.saferAction}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isSavingReward}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-4 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingReward
                    ? "Menyimpan Progres..."
                    : currentIndex === totalScenarios - 1
                      ? "Lihat Hasil Simulasi"
                      : "Lanjutkan Skenario"}

                  {!isSavingReward && <ArrowRight size={18} />}
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="mt-5 text-center text-xs leading-6 text-slate-400">
          CEKIN Learning & Protection · Simulasi edukasi fiktif
        </p>
      </div>
    </main>
  );
}