
"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ExternalLink,
  Heart,
  KeyRound,
  Link2,
  Phone,
  Smartphone,
  UserRound,
  Wallet,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import { emergencies } from "@/lib/cekin/data";

const iconMap = {
  link: Link2,
  key: KeyRound,
  user: UserRound,
  wallet: Wallet,
  phone: Smartphone,
  call: Phone,
  heart: Heart,
} as const;

export function EmergencyCenter() {
  const [selected, setSelected] = useState(0);
  const current = emergencies[selected];

  const Icon =
    iconMap[current.icon as keyof typeof iconMap] ?? AlertTriangle;

  return (
    <section className="min-h-[calc(100vh-80px)] bg-[#f7f9fc] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Page Introduction */}
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-[11px] font-extrabold tracking-wider text-red-600">
            <AlertTriangle size={15} />
            EMERGENCY ACTION CENTER
          </span>

          <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-[#17233b] sm:text-4xl lg:text-5xl">
            Terlanjur Terjadi?
            <span className="block text-[#2457a6]">
              Jangan Panik. Ambil Langkah Aman.
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#667085] sm:text-base">
            Pilih kejadian yang paling sesuai. Ikuti panduan berikut
            untuk mengambil langkah penting secara berurutan.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid items-start gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-8">
          {/* Incident Selection */}
          <div className="rounded-2xl border border-[#e6eaf0] bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-5">
              <h2 className="text-base font-bold text-[#17233b]">
                Apa yang sedang terjadi?
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#667085]">
                Pilih salah satu kondisi yang sedang kamu alami.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {emergencies.map((item, index) => {
                const ItemIcon =
                  iconMap[item.icon as keyof typeof iconMap] ??
                  AlertTriangle;

                const isActive = selected === index;

                return (
                  <button
                    type="button"
                    key={item.title}
                    onClick={() => setSelected(index)}
                    aria-pressed={isActive}
                    className={`group flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-200 sm:p-4 ${
                      isActive
                        ? "border-[#2457a6] bg-[#eaf1fc] shadow-sm"
                        : "border-transparent bg-[#f7f9fc] hover:border-[#d4dfef] hover:bg-[#f1f5fb]"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        isActive
                          ? "bg-[#2457a6] text-white"
                          : "bg-white text-[#667085] group-hover:text-[#2457a6]"
                      }`}
                    >
                      <ItemIcon size={20} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <strong
                        className={`block text-sm font-bold ${
                          isActive ? "text-[#2457a6]" : "text-[#344054]"
                        }`}
                      >
                        {item.title}
                      </strong>
                      <span className="mt-1 block text-[11px] text-[#667085]">
                        Lihat panduan penanganan
                      </span>
                    </span>

                    <ArrowRight
                      size={17}
                      className={`shrink-0 transition-transform ${
                        isActive
                          ? "translate-x-0 text-[#2457a6]"
                          : "-translate-x-1 text-[#98a2b3] group-hover:translate-x-0"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Guide */}
          <div
            className="overflow-hidden rounded-2xl border border-[#e6eaf0] bg-white shadow-sm"
            aria-live="polite"
          >
            <div className="border-b border-[#e6eaf0] bg-gradient-to-r from-[#eff5ff] to-white p-5 sm:p-7">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2457a6] text-white shadow-md shadow-blue-900/10 sm:h-14 sm:w-14">
                  <Icon size={25} />
                </span>

                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-extrabold tracking-[0.12em] text-[#2457a6]">
                    PANDUAN LANGKAH AMAN
                  </span>
                  <h2 className="mt-2 text-xl font-extrabold leading-snug tracking-tight text-[#17233b] sm:text-2xl">
                    {current.title}
                  </h2>
                  <p className="mt-2 text-xs leading-6 text-[#667085]">
                    Ikuti setiap langkah berikut dan prioritaskan
                    keamanan akun serta data pribadimu.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <h3 className="mb-5 flex items-center gap-2 text-sm font-bold text-[#17233b]">
                <ShieldCheck size={18} className="text-[#26a269]" />
                Langkah yang perlu dilakukan
              </h3>

              <ol className="space-y-5">
                {current.steps.map((step, index) => (
                  <li key={`${index}-${step}`} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eaf1fc] text-xs font-extrabold text-[#2457a6]">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <p className="pt-1 text-sm leading-7 text-[#475467]">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>

              {/* Resource */}
              <div className="mt-8 rounded-xl border border-[#d9eee2] bg-[#effaf4] p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#21875d]">
                    <ExternalLink size={18} />
                  </span>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[#18794e]">
                      Sumber bantuan
                    </h3>
                    <p className="mt-1 text-xs leading-6 text-[#426b54]">
                      {current.resource}
                    </p>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-[#fff9ed] p-4">
                <AlertTriangle
                  size={17}
                  className="mt-0.5 shrink-0 text-[#c58a2b]"
                />
                <p className="text-[11px] leading-6 text-[#8a682e]">
                  Panduan ini tidak menjamin dana atau akun selalu dapat
                  dipulihkan. Segera bertindak melalui kanal resmi dan
                  hindari pihak yang menjanjikan pemulihan dengan biaya
                  di muka.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-8 flex items-center justify-center gap-2 text-center text-[11px] leading-5 text-[#667085]">
          <ShieldCheck size={16} className="shrink-0 text-[#26a269]" />
          <span>
            Gunakan informasi kontak dan layanan resmi untuk mendapatkan
            bantuan lebih lanjut.
          </span>
        </div>
      </div>
    </section>
  );
}
