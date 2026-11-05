"use client";

import {
  GuidedTutorial,
  type TutorialStep,
} from "./guided-tutorial";

export const SPAM_CALL_TUTORIAL_KEY = "spam-call-tutorial-v1";

/**
 * Tampilan di dalam layar ponsel simulasi:
 * - ringing  : panggilan masuk (Tolak / Jawab)
 * - declined : setelah menolak panggilan
 * - talking  : mendengar penelepon dan memilih respons
 * - result   : hasil dan umpan balik
 */
export type CallTutorialView =
  | "ringing"
  | "declined"
  | "talking"
  | "result";

const STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Latihan 1 menit",
    body: "Ada 10 level panggilan, makin tinggi makin meyakinkan. Jawaban selama latihan tidak dihitung ke XP.",
    cta: "Mulai",
  },
  {
    id: "levels",
    title: "Peta level",
    body: "Selesaikan berurutan. Makin tinggi levelnya, makin lihai penelepon yang kamu hadapi.",
    target: "levels",
  },
  {
    id: "caller",
    title: "Panggilan masuk",
    body: "Nama dan nomor yang tampil bisa dipalsukan. Jangan jadikan itu bukti.",
    target: "caller",
  },
  {
    id: "decline-info",
    title: "Menolak itu aman",
    body: "Tidak menjawab nomor asing adalah pilihan sah. Di sini kita tetap mendengar isinya untuk berlatih.",
    target: "decline-button",
  },
  {
    id: "answer",
    title: "Jawab panggilannya",
    body: "Dengarkan apa yang diminta penelepon.",
    target: "answer-button",
    wait: "answered",
    prompt: "Klik Jawab",
  },
  {
    id: "listen",
    title: "Dengarkan isinya",
    body: "Siapa yang mengaku? Apa yang diminta? Ada desakan atau ancaman?",
    target: "dialogue",
  },
  {
    id: "choose",
    title: "Pilih responsmu",
    body: "Baca ucapan penelepon lagi sambil memilih. Di simulasi asli, jawaban kurang aman mengurangi XP.",
    target: "dialogue,choices",
    wait: "choice",
    prompt: "Pilih salah satu",
    delay: 700,
  },
  {
    id: "feedback",
    title: "Ini hasilnya",
    body: "Hijau berarti level selesai. Kuning berarti ada risiko dan XP level itu berkurang.",
    target: "feedback",
  },
  {
    id: "learn-more",
    title: "Mau tahu lebih dalam?",
    body: "Buka alasan dan tindakan yang lebih aman.",
    target: "learn-more",
    wait: "modal-open",
    prompt: "Klik tombol ini",
  },
  {
    id: "learn-safer",
    title: "Tindakan yang lebih aman",
    body: "Ini yang sebaiknya kamu lakukan saat menghadapi panggilan serupa.",
    target: "learn-safer",
  },
  {
    id: "learn-close",
    title: "Sudah paham?",
    body: "Tutup penjelasan untuk lanjut.",
    target: "learn-close",
    wait: "modal-closed",
    prompt: "Klik “Mengerti”",
  },
  {
    id: "next",
    title: "Lanjut atau ulangi",
    body: "Jawaban aman: naik level. Kurang aman: ulangi level ini.",
    target: "next",
    wait: "choice-reset",
    prompt: "Klik tombol ini",
  },
  {
    id: "progress",
    title: "Level dan XP",
    body: "Level tinggi bernilai lebih besar. Jawaban salah mengurangi XP.",
    target: "progress",
  },
  {
    id: "red-flags",
    title: "Kenali tandanya",
    body: "Ciri-ciri penelepon penipu selalu ada di panel ini.",
    target: "red-flags",
  },
  {
    id: "finish",
    title: "Kamu siap!",
    body: "Mulai sekarang XP dihitung dari jawabanmu. Capai Level 10 untuk lencana Call Guardian.",
    cta: "Mulai berlatih",
  },
];

type Props = {
  active: boolean;
  view: CallTutorialView;
  hasSelectedChoice: boolean;
  learnModalOpen: boolean;
  onClose: (completed: boolean) => void;
};

export function SpamCallTutorial({
  active,
  view,
  hasSelectedChoice,
  learnModalOpen,
  onClose,
}: Props) {
  const done: Record<string, boolean> = {
    answered: view === "talking" || view === "result",
    choice: hasSelectedChoice,
    "modal-open": learnModalOpen,
    "modal-closed": !learnModalOpen,
    "choice-reset": !hasSelectedChoice,
  };

  return (
    <GuidedTutorial
      steps={STEPS}
      active={active}
      done={done}
      onClose={onClose}
    />
  );
}