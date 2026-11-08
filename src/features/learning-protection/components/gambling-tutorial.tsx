"use client";

import { badgeTutorialStep } from "./badge-parts";
import { GuidedTutorial, type TutorialStep } from "./guided-tutorial";

export const GAMBLING_TUTORIAL_KEY = "gambling-tutorial-v2";

const STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Latihan 1 menit",
    body: "Di sini kamu langsung mencoba, bukan membaca. Hasil latihan tidak dihitung ke XP.",
    cta: "Mulai",
  },
  {
    id: "levels",
    title: "Peta level",
    body: "Ada 10 level, dari rasa penasaran sampai rencana berhenti.",
    target: "levels",
  },
  {
    id: "activity",
    title: "Coba sendiri",
    body: "Tiap level punya simulasi. Mainkan dulu, hasilnya akan bicara.",
    target: "activity",
    wait: "used",
    prompt: "Coba mainkan",
    delay: 700,
  },
  {
    id: "choose",
    title: "Lalu simpulkan",
    body: "Pilih kesimpulan yang sesuai dengan yang kamu lihat.",
    target: "choices",
    wait: "choice",
    prompt: "Pilih salah satu",
    delay: 700,
  },
  {
    id: "feedback",
    title: "Ini hasilnya",
    body: "Hijau berarti level selesai. Kuning berarti kamu bisa mengulang.",
    target: "feedback",
  },
  {
    id: "next",
    title: "Lanjut atau ulangi",
    body: "Jawaban tepat naik level. Kurang tepat, ulangi dengan urutan baru.",
    target: "next",
    wait: "choice-reset",
    prompt: "Klik tombol ini",
  },
  {
    id: "progress",
    title: "Level dan XP",
    body: "Selesaikan Level 10 untuk bonus XP dan badge Pejuang Anti Judol.",
    target: "progress",
  },
  {
    id: "support",
    title: "Kamu tidak sendirian",
    body: "Sulit berhenti bukan tanda lemah. Bantuan selalu ada.",
    target: "support",
  },
  badgeTutorialStep("gambling"),
  {
    id: "finish",
    title: "Kamu siap!",
    body: "Ingat: tidak ada strategi yang menjamin menang.",
    cta: "Mulai berlatih",
  },
];

type Props = {
  active: boolean;
  activityDone: boolean;
  hasSelectedChoice: boolean;
  onClose: (completed: boolean) => void;
};

export function GamblingTutorial({
  active,
  activityDone,
  hasSelectedChoice,
  onClose,
}: Props) {
  return (
    <GuidedTutorial
      steps={STEPS}
      active={active}
      onClose={onClose}
      done={{
        used: activityDone,
        choice: hasSelectedChoice,
        "choice-reset": !hasSelectedChoice,
      }}
    />
  );
}