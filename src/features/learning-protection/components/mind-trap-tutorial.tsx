"use client";

import {
  GuidedTutorial,
  type TutorialStep,
} from "./guided-tutorial";

export const MIND_TRAP_TUTORIAL_KEY = "mind-trap-tutorial-v1";

const STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Latihan 1 menit",
    body: "Ada 10 level. Tiap level menguji satu trik psikologi. Jawaban selama latihan tidak dihitung ke XP.",
    cta: "Mulai",
  },
  {
    id: "levels",
    title: "Peta level",
    body: "Selesaikan berurutan. Makin tinggi levelnya, makin halus tipuannya, sampai yang ada di dalam pikiranmu sendiri.",
    target: "levels",
  },
  {
    id: "trap-hidden",
    title: "Jebakan tersembunyi",
    body: "Nama jebakannya sengaja disembunyikan. Kamu baru melihatnya setelah menjawab.",
    target: "trap-name",
  },
  {
    id: "situation",
    title: "Baca situasinya",
    body: "Siapa yang bicara? Apa yang membuatmu merasa harus cepat, takut, atau berutang budi?",
    target: "situation",
  },
  {
    id: "choose",
    title: "Pilih responsmu",
    body: "Pilih yang paling mungkin kamu lakukan, dan jujurlah. Di simulasi asli, jawaban kurang aman mengurangi XP.",
    target: "situation,choices",
    wait: "choice",
    prompt: "Pilih salah satu",
    delay: 700,
  },
  {
    id: "feedback",
    title: "Ini hasilnya",
    body: "Hijau berarti level selesai. Kuning berarti ada jebakan yang belum kamu sadari dan XP level itu berkurang.",
    target: "feedback",
  },
  {
    id: "trap-revealed",
    title: "Nama jebakannya",
    body: "Sekarang kamu tahu trik apa yang dipakai. Mengenali namanya membantumu mengenalinya lagi di dunia nyata.",
    target: "trap-name",
  },
  {
    id: "insight",
    title: "Kenali jebakan pikirannya",
    body: "Di sini dijelaskan cara kerja triknya dan apa yang bisa kamu lakukan.",
    target: "insight",
  },
  {
    id: "next",
    title: "Lanjut atau ulangi",
    body: "Jawaban aman: naik level. Kurang aman: ulangi level ini dengan urutan pilihan baru.",
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
    id: "tactics",
    title: "Trik yang sering dipakai",
    body: "Daftar ini merangkum pemicu yang paling sering menunggangi pikiranmu.",
    target: "tactics",
  },
  {
    id: "finish",
    title: "Kamu siap!",
    body: "Mulai sekarang XP dihitung dari jawabanmu. Capai Level 10 untuk lencana Mind Guardian.",
    cta: "Mulai berlatih",
  },
];

type Props = {
  active: boolean;
  hasSelectedChoice: boolean;
  onClose: (completed: boolean) => void;
};

export function MindTrapTutorial({
  active,
  hasSelectedChoice,
  onClose,
}: Props) {
  const done: Record<string, boolean> = {
    choice: hasSelectedChoice,
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