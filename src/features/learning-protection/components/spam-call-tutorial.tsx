"use client";

import { GuidedTutorial, type TutorialStep } from "./guided-tutorial";
import { badgeTutorialStep } from "./badge-parts";

export const SPAM_CALL_TUTORIAL_KEY = "spam-call-tutorial-v1";

const STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Latihan 1 menit",
    body: "Kamu akan menerima telepon dari penipu. Jawaban selama latihan tidak dihitung ke XP.",
    cta: "Mulai",
  },
  {
    id: "levels",
    title: "Peta level",
    body: "Ada 10 level. Makin tinggi, makin meyakinkan penelepon.",
    target: "levels",
  },
  {
    id: "ring",
    title: "Telepon masuk",
    body: "Nomor tak dikenal menelepon. Di dunia nyata menolaknya juga aman, tapi di sini kita berlatih.",
    target: "answer",
    wait: "answered",
    prompt: "Angkat telepon",
  },
  {
    id: "caller",
    title: "Penelepon bicara",
    body: "Ucapannya muncul seperti teks. Baca baik-baik, percakapan berlanjut beberapa kali.",
    target: "chat",
  },
  {
    id: "reply-1",
    title: "Jawab dia",
    body: "Pilih apa yang kamu ucapkan. Di latihan tidak ada hukuman.",
    target: "chat,choices",
    wait: "replied",
    prompt: "Jawab salah satu",
    delay: 900,
  },
  {
    id: "reply-2",
    title: "Dia menekan lagi",
    body: "Penelepon jarang menyerah. Tetap bertahan dan jawab lagi.",
    target: "chat,choices",
    wait: "second",
    prompt: "Jawab lagi",
    delay: 900,
  },
  {
    id: "notes",
    title: "Tanda bahaya",
    body: "Cara penelepon bereaksi saat kamu memeriksa akan tercatat di sini.",
    target: "notes",
  },
  {
    id: "finish-call",
    title: "Selesaikan panggilan",
    body: "Lanjutkan sampai akhir. Kamu bisa selamat, atau kena jebakan.",
    target: "chat,choices",
    wait: "ended",
    prompt: "Jawab sampai selesai",
    delay: 900,
  },
  {
    id: "result",
    title: "Hasil panggilan",
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
  badgeTutorialStep("calls"),
  {
    id: "finish",
    title: "Kamu siap!",
    body: "Mulai sekarang XP dihitung dari jawabanmu. Capai Level 10 untuk badge King Gocek Telepon.",
    cta: "Mulai berlatih",
  },
];

type Props = {
  active: boolean;
  answered: boolean;
  answerCount: number;
  ended: boolean;
  onClose: (completed: boolean) => void;
};

export function SpamCallTutorial({
  active,
  answered,
  answerCount,
  ended,
  onClose,
}: Props) {
  return (
    <GuidedTutorial
      steps={STEPS}
      active={active}
      onClose={onClose}
      done={{
        answered,
        replied: answerCount >= 1,
        second: answerCount >= 2 || ended,
        ended,
        reset: !ended && answerCount === 0,
      }}
    />
  );
}