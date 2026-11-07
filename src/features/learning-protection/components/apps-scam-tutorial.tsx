
"use client";

import { useCallback, useRef } from "react";
import {
  GuidedTutorial,
  type TutorialStep,
} from "./guided-tutorial";

export const APPS_SCAM_TUTORIAL_KEY = "apps-scam-tutorial-v1";

export type TutorialView =
  | "store"
  | "detail"
  | "permissions"
  | "result";

type Wait =
  | "view-detail"
  | "view-permissions"
  | "choice"
  | "choice-reset";

const STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Latihan 1 menit",
    body: "Ada 10 level, makin tinggi makin sulit dibedakan. Jawaban selama latihan tidak dihitung ke XP.",
    cta: "Mulai",
  },
  {
    id: "levels",
    title: "Peta level",
    body: "Selesaikan berurutan. Level tinggi bahkan bisa berisi aplikasi yang sebenarnya aman.",
    target: "levels",
  },
  {
    id: "found",
    title: "Dari mana aplikasinya?",
    body: "Selalu perhatikan bagaimana aplikasi sampai ke kamu: iklan, chat, telepon, atau cari sendiri.",
    target: "found",
  },
  {
    id: "open-app",
    title: "Buka aplikasinya",
    body: "Lihat detailnya sebelum memutuskan apa pun.",
    target: "app-card",
    wait: "view-detail",
    prompt: "Klik aplikasi ini",
  },
  {
    id: "source",
    title: "Sumber dan klaim",
    body: "Apakah dari toko resmi? Apakah janjinya masuk akal? Periksa juga informasi tambahan di bawahnya.",
    target: "source,claim",
  },
  {
    id: "reviews",
    title: "Ulasan",
    body: "Ulasan seragam atau keluhan yang berulang adalah petunjuk penting.",
    target: "reviews",
  },
  {
    id: "to-permissions",
    title: "Lanjut ke izin",
    body: "Izin menentukan data apa yang bisa diakses aplikasi.",
    target: "check-permissions",
    wait: "view-permissions",
    prompt: "Klik tombol ini",
  },
  {
    id: "permissions",
    title: "Cocokkan dengan fungsi",
    body: "Tanda Periksa berarti izin sensitif. Tanyakan: apakah aplikasi ini benar-benar butuh itu?",
    target: "permissions",
  },
  {
    id: "decide",
    title: "Tentukan keputusanmu",
    body: "Pertimbangkan semua petunjuk tadi. Di level asli, keputusan salah mengurangi XP.",
    target: "choices",
    wait: "choice",
    prompt: "Pilih salah satu",
    delay: 700,
  },
  {
    id: "feedback",
    title: "Ini hasilnya",
    body: "Hijau berarti level selesai. Kuning berarti kurang tepat dan XP level itu berkurang.",
    target: "feedback",
  },
  {
    id: "red-flags",
    title: "Kenali tandanya",
    body: "Daftar tanda ini menjelaskan alasan di balik jawaban yang benar.",
    target: "red-flags",
  },
  {
    id: "next",
    title: "Lanjut atau ulangi",
    body: "Keputusan aman: naik level. Kurang aman: ulangi level ini.",
    target: "next",
    wait: "choice-reset",
    prompt: "Klik tombol ini",
  },
  {
    id: "progress",
    title: "Level dan XP",
    body: "Level tinggi bernilai lebih besar. Selesaikan Level 10 untuk bonus XP dan lencana App Guardian.",
    target: "progress",
  },
  {
    id: "finish",
    title: "Kamu siap!",
    body: "Mulai sekarang XP dihitung dari keputusanmu. Ingat: aplikasi di toko resmi pun tetap perlu diperiksa.",
    cta: "Mulai berlatih",
  },
];

type Props = {
  active: boolean;
  view: TutorialView;
  hasSelectedChoice: boolean;
  onClose: (completed: boolean) => void;
};

export function AppsScamTutorial({
  active,
  view,
  hasSelectedChoice,
  onClose,
}: Props) {
  const signals = useRef({
    view,
    hasSelectedChoice,
  });

  signals.current = {
    view,
    hasSelectedChoice,
  };

  const isDone = useCallback((wait: string) => {
    const {
      view: currentView,
      hasSelectedChoice: chosen,
    } = signals.current;

    switch (wait as Wait) {
      case "view-detail":
        return currentView === "detail";

      case "view-permissions":
        return currentView === "permissions";

      case "choice":
        return chosen;

      case "choice-reset":
        return !chosen;

      default:
        return false;
    }
  }, []);

  const doneMap = {
    "view-detail": isDone("view-detail"),
    "view-permissions": isDone("view-permissions"),
    choice: isDone("choice"),
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
