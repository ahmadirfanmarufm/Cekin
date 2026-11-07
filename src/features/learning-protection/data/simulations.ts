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
    title: "Trust Lab",
    subtitle: "Experience the Trap",
    description: "Naiki 10 level penipuan digital, dari yang mudah dikenali sampai yang sangat meyakinkan.",
    difficulty: "Pemula",
    duration: "10 menit",
    icon: "message-circle",
    color: "emerald",
    scenarios: trustLabScenarios,
  },

  {
    id: "apps",
    title: "Apps Scam",
    subtitle: "Is This App Safe?",
    description:
      "Naiki 10 level penipuan aplikasi, dari APK MOD sampai update berbahaya yang menyamar jadi aplikasi tepercaya.",
    difficulty: "Menengah",
    duration: "10 menit",
    icon: "gamepad-2",
    color: "blue",
    scenarios: appsScamScenarios,
  },

  {
    id: "phishing",
    title: "Phishing Attack",
    subtitle: "Spot the Fake",
    description:
      "Naiki 10 level email phishing, dari ancaman blokir sampai persetujuan izin aplikasi yang tampak sah.",
    difficulty: "Menengah",
    duration: "10 menit",
    icon: "mail",
    color: "violet",
    scenarios: phishingScenarios,
  },

  {
    id: "calls",
    title: "Scam Call",
    subtitle: "Don't Trust the Caller",
    description:
      "Naiki 10 level penipuan lewat telepon, dari rekaman otomatis sampai video call deepfake dan penipuan pemulihan dana.",
    difficulty: "Menengah",
    duration: "10 menit",
    icon: "phone",
    color: "orange",
    scenarios: spamCallScenarios,
  },

  {
    id: "gambling",
    title: "Online Gambling Awareness",
    subtitle: "Don't Get Trapped",
    description:
      "Praktik langsung: hitung uang yang hilang, bongkar mitos “jam gacor”, dan susun rencana berhenti.",
    difficulty: "Penting",
    duration: "10 menit",
    icon: "dice-5",
    color: "red",
    scenarios: gamblingScenarios,
  },

  {
    id: "mind",
    title: "Mind Trap",
    subtitle: "Understand the Psychology",
    description: "Naiki 10 level trik psikologi, dari FOMO sampai bias yang ada di dalam pikiranmu sendiri.",
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