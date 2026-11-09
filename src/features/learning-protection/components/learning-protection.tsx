
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Brain,
  Check,
  Dice5,
  BugPlay,
  Heart,
  Mail,
  MessageSquare,
  Phone,
  Shield,
  Clock3,
  Sparkles,
  LogOut,
  Trophy,
  Zap,
  UserRound,
  CircleStar,
} from "lucide-react";

import { getLevelInfo } from "@/features/auth/utils/level";
import { BadgeShelf } from "@/components/badges/badge-shelf";

interface AuthUser {
  id: string;
  username: string;
  email: string;
  totalXp: number;
  completedSimulations: string[];
}

const experiences = [
  {
    id: "trust-lab",
    title: "Penipuan Chat",
    kicker: "EXPERIENCE THE TRAP",
    description: "Hadapi lowongan, top-up, dan investasi palsu.",
    difficulty: "Pemula",
    duration: "4 menit",
    icon: MessageSquare,
    color: "mint",
  },
  {
    id: "apps-scam",
    title: "Aplikasi Sus",
    kicker: "IS THIS APP SAFE?",
    description: "Periksa aplikasi, sumber unduhan, dan izinnya.",
    difficulty: "Menengah",
    duration: "3 menit",
    icon: BugPlay,
    color: "blue",
  },
  {
    id: "phishing-attack",
    title: "Phishing",
    kicker: "SPOT THE FAKE",
    description: "Selidiki email palsu sebelum tautan menjebakmu.",
    difficulty: "Menengah",
    duration: "4 menit",
    icon: Mail,
    color: "violet",
  },
  {
    id: "spam-call",
    title: "Penipuan Telepon",
    kicker: "DON'T TRUST THE CALLER",
    description: "Terima telepon fiksi dan pilih responsmu.",
    difficulty: "Menengah",
    duration: "3 menit",
    icon: Phone,
    color: "orange",
  },
  {
    id: "online-gambling",
    title: "Judol",
    kicker: "DON'T GET TRAPPED",
    description: "Kenali promosi, near-miss, dan loss chasing.",
    difficulty: "Penting",
    duration: "5 menit",
    icon: Dice5,
    color: "red",
  },
  {
    id: "mind-trap",
    title: "Jebakan Logika",
    kicker: "UNDERSTAND THE PSYCHOLOGY",
    description: "Kenali pola pikir yang dimanfaatkan pelaku.",
    difficulty: "Pemula",
    duration: "4 menit",
    icon: Brain,
    color: "yellow",
  },
];

const colorStyles = {
  mint: {
    visual: "from-[#dff6e9] to-[#f0fbf4]",
    icon: "text-[#21875d]",
    hover: "hover:border-[#a9ddbf]",
    kicker: "text-[#21875d]",
  },
  blue: {
    visual: "from-[#e0ebff] to-[#f2f6ff]",
    icon: "text-[#2457a6]",
    hover: "hover:border-[#b9cbe5]",
    kicker: "text-[#2457a6]",
  },
  violet: {
    visual: "from-[#eee6ff] to-[#f8f4ff]",
    icon: "text-[#7653ae]",
    hover: "hover:border-[#d4c3f0]",
    kicker: "text-[#7653ae]",
  },
  orange: {
    visual: "from-[#fff0df] to-[#fff8ee]",
    icon: "text-[#c87827]",
    hover: "hover:border-[#efd0ac]",
    kicker: "text-[#c87827]",
  },
  red: {
    visual: "from-[#ffe7e5] to-[#fff4f2]",
    icon: "text-[#c34e4e]",
    hover: "hover:border-[#f0c1bd]",
    kicker: "text-[#c34e4e]",
  },
  yellow: {
    visual: "from-[#fff4ce] to-[#fffbed]",
    icon: "text-[#a77b20]",
    hover: "hover:border-[#eedca5]",
    kicker: "text-[#a77b20]",
  },
} as const;

export function LearningProtection() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "same-origin",
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (!active) return;

        setUser(data.user);

        if (data.user?.completedSimulations) {
          setCompleted(data.user.completedSimulations);
        }
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setAuthLoading(false);
      }
    };

    const handleAuthChange = () => {
      void fetchUser();
    };

    void fetchUser();

    window.addEventListener("cekin-auth-change", handleAuthChange);

    return () => {
      active = false;
      window.removeEventListener(
        "cekin-auth-change",
        handleAuthChange
      );
    };
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cekin-completed");

      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (
          Array.isArray(parsed) &&
          parsed.every((item) => typeof item === "string")
        ) {
          setCompleted(parsed);
        }
      }
    } catch {
      setCompleted([]);
    }
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("Logout gagal.");
      }

      setUser(null);
      setCompleted([]);

      window.dispatchEvent(new Event("cekin-auth-change"));
    } catch {
      alert("Gagal logout. Silakan coba kembali.");
    }
  };

  return (
    <section className="min-h-[calc(100vh-80px)] bg-[#f7f9fc] py-12 sm:py-16 px-5 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Page Introduction */}
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#e9f7ef] px-4 py-2 text-[11px] font-extrabold tracking-wider text-[#18794e]">
            <Sparkles size={14} />
            LEARNING & PROTECTION
          </span>

          <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-[#17233b] sm:text-4xl lg:text-5xl">
            Belajar Mengenali Penipuan dengan Cara yang Berbeda.
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#667085] sm:text-base">
            Jangan cuma membaca. Coba hadapi sendiri berbagai modus
            penipuan dalam simulasi yang aman dan interaktif.
          </p>
        </div>

        {/* User Level Card */}
        {!authLoading && user && (() => {
          const level = getLevelInfo(user.totalXp);

          return (
            <div className="mb-8 overflow-hidden rounded-2xl border border-[#dcebe3] bg-white shadow-sm">
              <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e9f7ef] text-[#21875d]">
                    <UserRound size={24} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-[#667085]">
                      Selamat belajar,
                    </p>

                    <h2 className="text-lg font-extrabold text-[#17233b]">
                      {user.username}
                    </h2>

                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#e9f7ef] px-2.5 py-1 text-[10px] font-bold text-[#18794e]">
                      <Trophy size={12} />
                      Level {level.level} - {level.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-[#f4f8ff] px-4 py-3">
                    <p className="text-[10px] font-bold text-[#667085]">
                      TOTAL XP
                    </p>

                    <p className="mt-1 flex items-center gap-1 text-xl font-extrabold text-[var(--warning)]">
                      <CircleStar size={17} />
                      {user.totalXp}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e6eaf0] text-[#667085] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    aria-label="Logout"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>

              <div className="border-t border-[#edf0f5] px-5 py-4 sm:px-6">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-[#52627a]">
                    Progress Level
                  </span>

                  <span className="text-xs font-bold text-[#2457a6]">
                    {level.progress.toFixed(0)}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[#edf1f6]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#2457a6] to-[#26a269] transition-all duration-500"
                    style={{ width: `${level.progress}%` }}
                  />
                </div>

                <p className="mt-2 text-[11px] text-[#667085]">
                  {level.nextLevel
                    ? `${level.xpToNextLevel} XP lagi menuju Level ${level.nextLevel.level} - ${level.nextLevel.name}.`
                    : "Selamat! Kamu telah mencapai level tertinggi."}
                </p>
              </div>
            </div>
          );
        })()}

        {/* Experience Summary */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#17233b] sm:text-xl">
              Pilih pengalaman belajarmu
            </h2>
            <p className="mt-1 text-xs leading-5 text-[#667085]">
              Setiap simulasi membantumu mengenali modus dari sudut
              pandang yang berbeda.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#e6eaf0] bg-white px-3.5 py-2 text-xs font-semibold text-[#667085]">
            <Shield size={15} className="text-[#26a269]" />
            {completed.length} dari {experiences.length} selesai
          </div>
        </div>

        {/* Experience Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {experiences.map((item, index) => {
            const Icon = item.icon;
            const isCompleted = completed.includes(item.id);
            const style = colorStyles[item.color as keyof typeof colorStyles];

            return (
              <Link
                href={`/learning-protection/${item.id}`}
                key={item.id}
                className={`group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e6eaf0] bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-900/5 ${style.hover}`}
              >
                {/* Visual */}
                <div
                  className={`relative flex min-h-[175px] items-center justify-center overflow-hidden bg-gradient-to-br ${style.visual}`}
                >
                  <span className="absolute right-5 top-3 text-6xl font-black tracking-tighter text-[#17233b]/10">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="absolute bottom-5 left-5 flex flex-col gap-1.5 opacity-30">
                    <span className="h-1 w-12 rounded-full bg-current" />
                    <span className="h-1 w-20 rounded-full bg-current" />
                    <span className="h-1 w-16 rounded-full bg-current" />
                  </div>

                  <div className="absolute right-5 bottom-5 h-20 w-20 rounded-full border border-current/10" />
                  <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-current/10" />

                  <span className="relative z-10 flex h-[76px] w-[76px] items-center justify-center rounded-[23px] border border-white/80 bg-white shadow-lg shadow-slate-900/10 transition-transform duration-300 group-hover:rotate-[-5deg] group-hover:scale-110">
                    <Icon size={34} className={style.icon} />
                  </span>

                  {isCompleted && (
                    <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-[#18794e] shadow-sm">
                      <Check size={12} />
                      Selesai
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="mb-5 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#edf1f6] px-2.5 py-1 text-[10px] font-bold text-[#52627a]">
                      {item.difficulty}
                    </span>

                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#667085]">
                      <Clock3 size={12} />
                      {item.duration}
                    </span>
                  </div>

                  <span
                    className={`text-[9px] font-extrabold tracking-[0.12em] ${style.kicker}`}
                  >
                    {item.kicker}
                  </span>

                  <h3 className="mt-2 text-xl font-extrabold leading-snug tracking-tight text-[#17233b]">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-[#667085]">
                    {item.description}
                  </p>

                  <div
                    className={`mt-auto flex items-center justify-between border-t border-[#edf0f5] pt-5 text-xs font-bold ${
                      isCompleted ? "text-[#18794e]" : "text-[#2457a6]"
                    }`}
                  >
                    <span>
                      {isCompleted ? "Pelajari Lagi" : "Mulai Simulasi"}
                    </span>

                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eaf1fc] transition-all group-hover:translate-x-1 group-hover:bg-[#2457a6] group-hover:text-white">
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Emergency Action Center */}
        <Link
          href="/emergency"
          className="group mt-9 grid grid-cols-[48px_minmax(0,1fr)_20px] items-center gap-4 rounded-2xl border border-[#d9eee2] bg-gradient-to-r from-[#effaf4] to-[#f7fbff] p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-900/5 sm:mt-12 sm:grid-cols-[58px_minmax(0,1fr)_24px] sm:gap-5 sm:p-7"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#dff4e7] text-[#21875d] sm:h-14 sm:w-14 sm:rounded-2xl">
            <Heart size={25} />
          </span>

          <span className="min-w-0">
            <span className="block text-[9px] font-extrabold tracking-[0.12em] text-[#21875d]">
              BUTUH TINDAKAN SEKARANG?
            </span>

            <strong className="mt-1.5 block text-base font-extrabold text-[#17233b] sm:text-lg">
              Emergency Action Center
            </strong>

            <span className="mt-1 block text-xs leading-5 text-[#667085]">
              Panduan praktis saat insiden sudah terjadi.
            </span>
          </span>

          <ArrowRight
            size={21}
            className="text-[#21875d] transition-transform group-hover:translate-x-1"
          />
        </Link>

        {/* Simulation Disclaimer */}
        <div className="mt-7 flex items-start justify-center gap-2 text-center text-[10px] leading-6 text-[#667085] sm:text-xs">
          <Shield
            size={16}
            className="mt-1 shrink-0 text-[#26a269]"
          />
          <p className="max-w-2xl">
            Semua percakapan, nomor, aplikasi, dan tautan di dalam
            simulasi adalah fiksi dan dibuat untuk tujuan edukasi.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl sm:mt-12">
        <BadgeShelf showLocked />
      </div>
    </section>
  );
}
