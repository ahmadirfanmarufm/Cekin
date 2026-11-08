import type { SimulationId } from "@/types/learning-protection";

export const BADGE_MISTAKE_LIMIT = 3;

export const isBadgeEarned = (mistakes: number) => mistakes < BADGE_MISTAKE_LIMIT;

export type BadgeShape = "shield" | "hexagon" | "diamond" | "octagon" | "circle" | "squircle";
export type BadgeIconKey = "shield" | "phone-app" | "mail" | "phone-off" | "dice" | "brain";

export type BadgeDef = {
  id: string;
  key: SimulationId;
  simulationId: string;
  courseName: string;
  tagline: string;
  name: string;
  description: string;
  shape: BadgeShape;
  icon: BadgeIconKey;
  from: string;
  to: string;
};

export const BADGES: BadgeDef[] = [
  {
    id: "si-kebal-tipu",
    key: "trust",
    simulationId: "trust-lab",
    courseName: "Anti Ketipu Chat",
    tagline: "Ngobrol langsung sama penipu, tapi tetap aman.",
    name: "Si Kebal Tipu",
    description: "Tamatin 10 chat penipu tanpa kena jebakan 3 kali atau lebih.",
    shape: "shield",
    icon: "shield",
    from: "#34d399",
    to: "#0f766e",
  },
  {
    id: "detektif-aplikasi",
    key: "apps",
    simulationId: "apps-scam",
    courseName: "Install Jangan Asal",
    tagline: "Cek dulu sebelum pencet install.",
    name: "Detektif Aplikasi",
    description: "Tamatin 10 aplikasi mencurigakan tanpa kena jebakan 3 kali atau lebih.",
    shape: "hexagon",
    icon: "phone-app",
    from: "#38bdf8",
    to: "#1d4ed8",
  },
  {
    id: "pemburu-phishing",
    key: "phishing",
    simulationId: "phishing-attack",
    courseName: "Link gak jelas",
    tagline: "Bedain link asli dan link jebakan.",
    name: "Pemburu Phishing",
    description: "Tamatin 10 email jebakan tanpa kena 3 kali atau lebih.",
    shape: "diamond",
    icon: "mail",
    from: "#a78bfa",
    to: "#6d28d9",
  },
  {
    id: "king-gocek-telepon",
    key: "calls",
    simulationId: "spam-call",
    courseName: "Halo, Siapa Nih?",
    tagline: "Telepon dari nomor asing? Latihan dulu di sini.",
    name: "King Gocek Telepon",
    description: "Tamatin 10 telepon penipu tanpa kena jebakan 3 kali atau lebih.",
    shape: "octagon",
    icon: "phone-off",
    from: "#fb923c",
    to: "#dc2626",
  },
  {
    id: "pejuang-anti-judol",
    key: "gambling",
    simulationId: "online-gambling",
    courseName: "Stop Judol",
    tagline: "Hitung sendiri, jangan percaya iklan.",
    name: "Pejuang Anti Judol",
    description: "Tamatin 10 level Stop Judol dengan salah kurang dari 3 kali.",
    shape: "circle",
    icon: "dice",
    from: "#fb7185",
    to: "#be123c",
  },
  {
    id: "mikir-kids",
    key: "mind",
    simulationId: "mind-trap",
    courseName: "Jebakan Otak",
    tagline: "Kenali trik yang bikin kamu gampang percaya.",
    name: "Mikir Kids",
    description: "Tamatin 10 jebakan pikiran dengan salah kurang dari 3 kali.",
    shape: "squircle",
    icon: "brain",
    from: "#fbbf24",
    to: "#d97706",
  },
];

export const getBadgeById = (id: string) => BADGES.find((badge) => badge.id === id);

export const getBadgeBySimulationId = (simulationId: string) =>
  BADGES.find((badge) => badge.simulationId === simulationId);

export const getBadgeByKey = (key: SimulationId): BadgeDef =>
  BADGES.find((badge) => badge.key === key) ?? BADGES[0];