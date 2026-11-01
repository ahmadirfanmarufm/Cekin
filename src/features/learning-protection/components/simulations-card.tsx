import Link from "next/link";
import {
  Brain,
  Dice5,
  Gamepad2,
  Mail,
  MessageCircle,
  Phone,
  ArrowUpRight,
  Clock3,
  ShieldCheck,
} from "lucide-react";

import type { SimulationConfig } from "@/types/learning-protection/index";

const icons = {
  trust: MessageCircle,
  apps: Gamepad2,
  phishing: Mail,
  calls: Phone,
  gambling: Dice5,
  mind: Brain,
};

const styles = {
  emerald: {
    icon: "bg-emerald-100 text-emerald-700",
    badge: "bg-emerald-50 text-emerald-700",
    border: "hover:border-emerald-300",
  },
  blue: {
    icon: "bg-blue-100 text-blue-700",
    badge: "bg-blue-50 text-blue-700",
    border: "hover:border-blue-300",
  },
  violet: {
    icon: "bg-violet-100 text-violet-700",
    badge: "bg-violet-50 text-violet-700",
    border: "hover:border-violet-300",
  },
  orange: {
    icon: "bg-orange-100 text-orange-700",
    badge: "bg-orange-50 text-orange-700",
    border: "hover:border-orange-300",
  },
  red: {
    icon: "bg-red-100 text-red-700",
    badge: "bg-red-50 text-red-700",
    border: "hover:border-red-300",
  },
  amber: {
    icon: "bg-amber-100 text-amber-700",
    badge: "bg-amber-50 text-amber-700",
    border: "hover:border-amber-300",
  },
};

type Props = {
  simulation: SimulationConfig;
};

export function SimulationCard({ simulation }: Props) {
  const Icon = icons[simulation.id];
  const style = styles[simulation.color as keyof typeof styles];

  const href = `/learning-protection/${
    simulation.id === "trust"
      ? "trust-lab"
      : simulation.id === "apps"
        ? "game-apps-scam"
        : simulation.id === "phishing"
          ? "phishing-attack"
          : simulation.id === "calls"
            ? "scam-call"
            : simulation.id === "gambling"
              ? "online-gambling"
              : "mind-trap"
  }`;

  return (
    <Link
      href={href}
      className={`group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${style.border}`}
    >
      <div className="mb-5 flex items-start justify-between">
        <div className={`flex size-12 items-center justify-center rounded-xl ${style.icon}`}>
          <Icon size={24} />
        </div>

        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}>
          {simulation.difficulty}
        </span>
      </div>

      <div className="flex-1">
        <p className="mb-1 text-sm font-medium text-slate-500">
          {simulation.subtitle}
        </p>

        <h3 className="mb-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-emerald-700">
          {simulation.title}
        </h3>

        <p className="text-sm leading-6 text-slate-600">
          {simulation.description}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <Clock3 size={15} />
          <span>{simulation.duration}</span>
        </div>

        <span className="flex items-center gap-1 text-sm font-semibold text-emerald-700 transition-all group-hover:gap-2">
          Mulai Simulasi
          <ArrowUpRight size={16} />
        </span>
      </div>
    </Link>
  );
}