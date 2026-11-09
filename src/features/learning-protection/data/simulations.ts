import type {
  SimulationConfig,
  SimulationId,
} from "@/types/learning-protection/index";
import { trustLabScenarios } from "./trust-lab-level";
import { appsScamScenarios } from "./apps-scam-level";
import { phishingScenarios } from "./phishing-level";
import { gamblingScenarios } from "./gambling-level";
import { spamCallScenarios } from "./spam-call-level";
import { mindTrapScenarios } from "./mind-trap-level";

export const simulations: SimulationConfig[] = [
  {
    id: "trust",
    title: "Anti Ketipu Chat",
    subtitle: "Ngobrol Sama Penipu",
    description: "Ngobrol langsung sama penipu di 10 level, dari yang gampang ketahuan sampai yang bikin ragu.",
    difficulty: "Pemula",
    duration: "10 menit",
    icon: "message-circle",
    color: "emerald",
    scenarios: trustLabScenarios,
  },

  {
    id: "apps",
    title: "Jangan Asal Install",
    subtitle: "Aman Gak Nih Aplikasinya?",
    description: "10 level aplikasi mencurigakan, dari APK MOD sampai update berbahaya yang menyamar jadi aplikasi tepercaya.",
    difficulty: "Menengah",
    duration: "10 menit",
    icon: "gamepad-2",
    color: "blue",
    scenarios: appsScamScenarios,
  },

  {
    id: "phishing",
    title: "Email Abal-abal",
    subtitle: "Asli atau Jebakan?",
    description: "10 level email jebakan, dari ancaman blokir akun sampai izin aplikasi yang kelihatan sah.",
    difficulty: "Menengah",
    duration: "10 menit",
    icon: "mail",
    color: "violet",
    scenarios: phishingScenarios,
  },

  {
    id: "calls",
    title: "Penipuan Telepon",
    subtitle: "Jangan Langsung Percaya",
    description: "10 telepon penipu, dari rekaman otomatis sampai video call deepfake dan penipuan pemulihan dana.",
    difficulty: "Menengah",
    duration: "10 menit",
    icon: "phone",
    color: "orange",
    scenarios: spamCallScenarios,
  },

  {
    id: "gambling",
    title: "Stop Judol",
    subtitle: "Hitung Sendiri",
    description: "Praktik langsung: hitung uang yang hilang, bongkar mitos “jam gacor”, dan susun rencana berhenti.",
    difficulty: "Penting",
    duration: "10 menit",
    icon: "dice-5",
    color: "red",
    scenarios: gamblingScenarios,
  },

  {
    id: "mind",
    title: "Jebakan Otak",
    subtitle: "Kenapa Kita Gampang Percaya?",
    description: "10 level trik psikologi, dari FOMO sampai bias yang ada di pikiranmu sendiri.",
    difficulty: "Pemula",
    duration: "10 menit",
    icon: "brain",
    color: "amber",
    scenarios: mindTrapScenarios,
  },
];

export function getSimulation(id: SimulationId) {
  return simulations.find((simulation) => simulation.id === id);
}