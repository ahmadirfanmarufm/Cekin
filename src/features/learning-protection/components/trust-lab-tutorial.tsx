"use client";

import { badgeTutorialStep } from "./badge-parts";
import {
  GuidedTutorial,
  type TutorialStep,
} from "./guided-tutorial";

// Versi dinaikkan karena alur simulasi berubah menjadi dialog.
export const TRUST_LAB_TUTORIAL_KEY = "trust-lab-tutorial-v3";

const STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Latihan 1 menit",
    body: "Kamu akan ngobrol langsung dengan penipu. Jawaban selama latihan tidak dihitung ke XP.",
    cta: "Mulai",
  },
  {
    id: "levels",
    title: "Peta level",
    body: "Ada 10 level. Makin tinggi, makin lihai penipunya.",
    target: "levels",
  },
  {
    id: "chat",
    title: "Penipu mulai bicara",
    body: "Baca pesannya. Percakapan akan berlanjut beberapa kali.",
    target: "chat",
  },
  {
    id: "reply-1",
    title: "Balas dia",
    body: "Pilih balasanmu. Di latihan tidak ada hukuman.",
    target: "chat,choices",
    wait: "replied",
    prompt: "Balas salah satu",
    delay: 900,
  },
  {
    id: "reply-2",
    title: "Dia menekan lagi",
    body: "Penipu jarang menyerah. Tetap bertahan dan balas lagi.",
    target: "chat,choices",
    wait: "second",
    prompt: "Balas lagi",
    delay: 900,
  },
  {
    id: "notes",
    title: "Tanda bahaya",
    body: "Cara penipu bereaksi saat kamu memeriksa akan tercatat di sini.",
    target: "notes",
  },
  {
    id: "finish-chat",
    title: "Selesaikan percakapan",
    body: "Lanjutkan sampai akhir. Kamu bisa selamat, atau kena jebakan.",
    target: "chat,choices",
    wait: "ended",
    prompt: "Balas sampai selesai",
    delay: 900,
  },
  {
    id: "result",
    title: "Hasil percakapan",
    body: "Di sini kamu lihat alasannya dan aturan emas yang perlu diingat.",
    target: "result",
  },
  {
    id: "next",
    title: "Lanjut atau ulangi",
    body: "Selamat: naik level. Kena jebakan: ulangi dari awal dengan urutan pilihan baru.",
    target: "next",
    wait: "reset",
    prompt: "Klik tombol ini",
  },
  {
    id: "progress",
    title: "Level dan XP",
    body: "Level tinggi bernilai lebih besar. Langkah keliru mengurangi XP.",
    target: "progress",
  },
  {
    id: "red-flags",
    title: "Kenali tandanya",
    body: "Ciri-ciri penipuan selalu ada di panel ini.",
    target: "red-flags",
  },
  badgeTutorialStep("trust"),
  {
    id: "finish",
    title: "Kamu siap!",
    body: "Mulai sekarang XP dihitung dari jawabanmu. Capai Level 10 untuk badge Si Kebal Tipu.",
    cta: "Mulai berlatih",
  },
];

type Props = {
  active: boolean;
  /** Jumlah balasan yang sudah dikirim user pada percakapan ini. */
  answerCount: number;
  /** Percakapan sudah selesai (menang atau kalah). */
  ended: boolean;
  onClose: (completed: boolean) => void;
};

export function TrustLabTutorial({
  active,
  answerCount,
  ended,
  onClose,
}: Props) {
  const done: Record<string, boolean> = {
    replied: answerCount >= 1,
    second: answerCount >= 2 || ended,
    ended,
    reset: !ended && answerCount === 0,
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