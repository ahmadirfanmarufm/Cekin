"use client";

import { badgeTutorialStep } from "./badge-parts";
import { GuidedTutorial, type TutorialStep } from "./guided-tutorial";

export const PHISHING_TUTORIAL_KEY = "phishing-tutorial-v1";

const STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Latihan 1 menit",
    body: "Ada 10 level, makin tinggi makin sulit. Jawaban selama latihan tidak dihitung ke XP.",
    cta: "Mulai",
  },
  {
    id: "levels",
    title: "Peta level",
    body: "Selesaikan berurutan. Di level tinggi, bahkan email asli pun bisa muncul sebagai jebakan.",
    target: "levels",
  },
  {
    id: "read",
    title: "Baca emailnya",
    body: "Apa yang diminta? Adakah tekanan waktu, ancaman, atau iming-iming?",
    target: "email",
  },
  {
    id: "sender",
    title: "Siapa pengirimnya?",
    body: "Jangan hanya lihat nama. Alamat di balik nama itulah yang menentukan.",
    target: "sender",
  },
  {
    id: "inspect",
    title: "Periksa detail teknis",
    body: "Buka detail untuk melihat alamat asli, tujuan tautan, dan hasil pemeriksaan email.",
    target: "inspect",
    wait: "details-open",
    prompt: "Klik tombol ini",
  },
  {
    id: "details",
    title: "Petunjuk tersembunyi",
    body: "Tanda “Periksa” menandai hal mencurigakan. Perhatikan domain dan tujuan tautan.",
    target: "details",
  },
  {
    id: "choose",
    title: "Pilih tindakanmu",
    body: "Pikirkan baik-baik. Di simulasi asli, jawaban kurang aman mengurangi XP level itu.",
    target: "choices",
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
    body: "Buka penjelasan lengkap alasan di balik jawabanmu.",
    target: "learn-more",
    wait: "modal-open",
    prompt: "Klik tombol ini",
  },
  {
    id: "learn-safer",
    title: "Tindakan yang lebih aman",
    body: "Ini yang sebaiknya kamu lakukan dalam situasi nyata.",
    target: "learn-safer",
  },
  {
    id: "learn-close",
    title: "Sudah paham?",
    body: "Tutup penjelasan untuk lanjut.",
    target: "learn-close",
    wait: "modal-closed",
    prompt: "Klik “Aku paham”",
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
    body: "Level tinggi bernilai lebih besar. Selesaikan Level 10 untuk bonus XP dan badge Pemburu Phishing.",
    target: "progress",
  },
  badgeTutorialStep("phishing"),
  {
    id: "finish",
    title: "Kamu siap!",
    body: "Mulai sekarang XP dihitung dari jawabanmu. Ingat: lolos pemeriksaan teknis belum tentu email yang aman.",
    cta: "Mulai berlatih",
  },
];

type Props = {
  active: boolean;
  detailsOpen: boolean;
  hasSelectedChoice: boolean;
  learnModalOpen: boolean;
  onClose: (completed: boolean) => void;
};

export function PhishingTutorial({
  active,
  detailsOpen,
  hasSelectedChoice,
  learnModalOpen,
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
        "modal-open": learnModalOpen,
        "modal-closed": !learnModalOpen,
        "choice-reset": !hasSelectedChoice,
      }}
    />
  );
}