
"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  GuidedTutorial,
  type TutorialStep,
} from "./guided-tutorial";

export const TRUST_LAB_TUTORIAL_KEY = "trust-lab-tutorial-v2";

type Wait =
  | "choice"
  | "modal-open"
  | "modal-closed"
  | "choice-reset";

const STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Latihan 1 menit",
    body: "Ada 10 level, makin tinggi makin sulit. Jawaban selama latihan tidak dihitung ke XP.",
    cta: "Mulai",
  },
  {
    id: "scenarios",
    title: "Peta level",
    body: "Selesaikan berurutan. Makin tinggi levelnya, makin sulit penipunya.",
    target: "scenarios",
  },
  {
    id: "read",
    title: "Baca pesan ini",
    body: "Siapa pengirimnya? Apa yang dia minta?",
    target: "message",
  },
  {
    id: "choose",
    title: "Pilih balasanmu",
    body: "Baca pesannya lagi, pikirkan baik-baik. Di simulasi asli, jawaban kurang aman mengurangi XP.",
    target: "message,choices",
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
    id: "lesson",
    title: "Ini pelajarannya",
    body: "Ringkasan alasan di balik responsmu.",
    target: "lesson",
  },
  {
    id: "learn-more",
    title: "Mau tahu lebih dalam?",
    body: "Buka penjelasan lengkapnya.",
    target: "learn-more",
    wait: "modal-open",
    prompt: "Klik tombol ini",
  },
  {
    id: "learn-safer",
    title: "Langkah yang lebih aman",
    body: "Ini yang sebaiknya kamu lakukan.",
    target: "learn-safer",
  },
  {
    id: "learn-close",
    title: "Sudah paham?",
    body: "Tutup penjelasan untuk lanjut.",
    target: "learn-close",
    wait: "modal-closed",
    prompt: "Klik Aku paham",
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
    body: "Ciri-ciri penipuan selalu ada di panel ini.",
    target: "red-flags",
  },
  {
    id: "finish",
    title: "Kamu siap!",
    body: "Mulai sekarang XP dihitung dari jawabanmu. Capai Level 10 untuk lencana Trust Master.",
    cta: "Mulai berlatih",
  },
];

type Props = {
  active: boolean;
  hasSelectedChoice: boolean;
  learnModalOpen: boolean;
  onClose: (completed: boolean) => void;
};

export function TrustLabTutorial({
  active,
  hasSelectedChoice,
  learnModalOpen,
  onClose,
}: Props) {
  const signals = useRef({
    hasSelectedChoice,
    learnModalOpen,
  });

  signals.current = {
    hasSelectedChoice,
    learnModalOpen,
  };

  const isDone = useCallback((wait: string) => {
    const {
      hasSelectedChoice: chosen,
      learnModalOpen: open,
    } = signals.current;

    switch (wait as Wait) {
      case "choice":
        return chosen;

      case "modal-open":
        return open;

      case "modal-closed":
        return !open;

      case "choice-reset":
        return !chosen;

      default:
        return false;
    }
  }, []);

  // Sinkronkan status interaksi dengan GuidedTutorial.
  const [done, setDone] = useRef<Record<string, boolean>>({}).current
    ? [null, () => {}] as const
    : [null, () => {}] as const;

  const doneMap = {
    choice: isDone("choice"),
    "modal-open": isDone("modal-open"),
    "modal-closed": isDone("modal-closed"),
    "choice-reset": isDone("choice-reset"),
  };

  return (
    <GuidedTutorial
      steps={STEPS}
      active={active}
      done={doneMap}
      onClose={onClose}
    />
  );
}
