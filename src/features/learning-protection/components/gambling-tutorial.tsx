"use client";

import { GuidedTutorial, type TutorialStep } from "./guided-tutorial";

export const GAMBLING_TUTORIAL_KEY = "gambling-tutorial-v1";

const STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Latihan 1 menit",
    body: "Ada 10 level, makin tinggi makin halus jebakannya. Jawaban selama latihan tidak dihitung ke XP.",
    cta: "Mulai",
  },
  {
    id: "levels",
    title: "Peta level",
    body: "Selesaikan berurutan. Level tinggi bukan lagi soal iklan, tetapi soal dorongan dan orang terdekat.",
    target: "levels",
  },
  {
    id: "situation",
    title: "Baca situasinya",
    body: "Perhatikan di mana kamu menemukan promosi atau situasi ini, dan siapa yang diuntungkan.",
    target: "situation",
  },
  {
    id: "promo",
    title: "Lihat tampilannya",
    body: "Ini contoh promosi atau pesan yang bisa kamu temui. Semuanya fiktif.",
    target: "promo",
  },
  {
    id: "inspect",
    title: "Periksa petunjuknya",
    body: "Buka petunjuk untuk melihat tanda-tanda manipulasi di balik tampilannya.",
    target: "inspect",
    wait: "details-open",
    prompt: "Klik tombol ini",
  },
  {
    id: "details",
    title: "Tanda-tandanya",
    body: "Tanda “Periksa” menandai hal yang patut dicurigai. Tanda “Wajar” berarti tidak bermasalah.",
    target: "details",
  },
  {
    id: "choose",
    title: "Pilih responsmu",
    body: "Pikirkan baik-baik. Di simulasi asli, jawaban kurang aman mengurangi XP level itu.",
    target: "choices",
    wait: "choice",
    prompt: "Pilih salah satu",
    delay: 700,
  },
  {
    id: "feedback",
    title: "Ini hasilnya",
    body: "Hijau berarti level selesai. Kuning berarti ada risiko, dan kamu bisa mengulang level itu.",
    target: "feedback",
  },
  {
    id: "next",
    title: "Lanjut atau ulangi",
    body: "Jawaban aman: naik level. Kurang aman: ulangi dengan urutan pilihan baru.",
    target: "next",
    wait: "choice-reset",
    prompt: "Klik tombol ini",
  },
  {
    id: "progress",
    title: "Level dan XP",
    body: "Level tinggi bernilai lebih besar. Selesaikan Level 10 untuk bonus XP dan lencana Gambling Guardian.",
    target: "progress",
  },
  {
    id: "support",
    title: "Kamu tidak sendirian",
    body: "Sulit berhenti bukan tanda lemah. Bila judi mulai mengganggumu, bicaralah dengan orang tepercaya atau profesional.",
    target: "support",
  },
  {
    id: "finish",
    title: "Kamu siap!",
    body: "Mulai sekarang XP dihitung dari jawabanmu. Ingat: tidak ada strategi yang menjamin menang.",
    cta: "Mulai berlatih",
  },
];

type Props = {
  active: boolean;
  detailsOpen: boolean;
  hasSelectedChoice: boolean;
  onClose: (completed: boolean) => void;
};

export function GamblingTutorial({
  active,
  detailsOpen,
  hasSelectedChoice,
  onClose,
}: Props) {
  return (
    <GuidedTutorial
      steps={STEPS}
      active={active}
      onClose={onClose}
      done={{
        "details-open": detailsOpen,
        choice: hasSelectedChoice,
        "choice-reset": !hasSelectedChoice,
      }}
    />
  );
}