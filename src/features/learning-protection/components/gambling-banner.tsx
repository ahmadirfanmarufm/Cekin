"use client";

import { Eye, Heart, MessageCircle, Send } from "lucide-react";
import type { GamblingScenarioData } from "@/types/learning-protection";

export type BannerVariant = "popup" | "comment" | "chat" | "stream" | "demo" | "notif";

type Props = {
  variant: BannerVariant;
  promo: GamblingScenarioData;
};

const GOLD_TEXT =
  "bg-gradient-to-b from-yellow-100 via-amber-400 to-amber-600 bg-clip-text text-transparent";

const GOLD_BUTTON =
  "bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-600 text-[#3b1a00] shadow-[0_0_18px_rgba(251,191,36,0.55)]";

const WINNERS = [
  "Ri***88 WD Rp 14.250.000",
  "Bu***21 WD Rp 8.700.000",
  "De***07 WD Rp 32.100.000",
  "Sa***99 WD Rp 5.480.000",
  "Fa***12 WD Rp 21.900.000",
  "Ay***45 WD Rp 11.300.000",
];

const REELS = [
  ["7", "🍒", "🔔"],
  ["💎", "7", "⭐"],
  ["🔔", "7", "🍒"],
];

function Ticker() {
  const items = [...WINNERS, ...WINNERS];

  return (
    <div className="relative overflow-hidden border-y border-amber-400/30 bg-black/50 py-1.5">
      <style>{`@keyframes jd-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
      <div
        className="flex w-max gap-8 whitespace-nowrap text-[10px] font-bold text-amber-200"
        style={{ animation: "jd-marquee 22s linear infinite" }}
      >
        {items.map((item, index) => (
          <span key={index}>🏆 {item}</span>
        ))}
      </div>
    </div>
  );
}

function Reel({ symbols, highlight }: { symbols: string[]; highlight?: boolean }) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-lg border-2 bg-gradient-to-b from-[#fff7d6] to-[#f3d98b] p-1 ${
        highlight ? "border-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.8)]" : "border-amber-700"
      }`}
    >
      {symbols.map((symbol, index) => (
        <div
          key={index}
          className={`flex h-10 w-11 items-center justify-center rounded text-xl font-black sm:h-12 sm:w-14 sm:text-2xl ${
            symbol === "7" ? "text-red-600" : ""
          } ${highlight && index === 1 ? "bg-amber-200/80" : ""}`}
        >
          {symbol}
        </div>
      ))}
    </div>
  );
}

/* ---------- 1. Pop-up kasino ---------- */

function PopupBanner({ promo }: { promo: GamblingScenarioData }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#2b0a55] via-[#3d0a30] to-[#12031c]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.35),transparent_55%)]" />
      <div className="pointer-events-none absolute -left-8 top-20 h-32 w-32 rounded-full bg-fuchsia-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-8 bottom-24 h-32 w-32 rounded-full bg-red-500/30 blur-3xl" />

      <div className="relative px-4 pb-4 pt-5 text-center sm:px-6">
        <p className={`text-2xl font-black italic tracking-tight sm:text-3xl ${GOLD_TEXT}`}>
          MAXWIN<span className="text-white">777</span>
        </p>
        <p className="mt-0.5 text-[9px] font-bold tracking-[0.25em] text-amber-200/80">
          SITUS SLOT GACOR TERPERCAYA
        </p>

        <h3
          className={`mt-4 text-2xl font-black uppercase leading-tight drop-shadow-[0_2px_0_rgba(0,0,0,0.6)] sm:text-3xl ${GOLD_TEXT}`}
        >
          {promo.headline}
        </h3>

        <div className="mt-4 flex items-center justify-center gap-2 sm:gap-3">
          <Reel symbols={REELS[0]} />
          <Reel symbols={REELS[1]} highlight />
          <Reel symbols={REELS[2]} />
        </div>

        <div className="mx-auto mt-3 inline-block -rotate-2 rounded-md border-2 border-red-300 bg-gradient-to-r from-red-600 to-rose-500 px-4 py-1 text-xs font-black tracking-widest text-white shadow-lg">
          JACKPOT MAXWIN
        </div>

        <div className="mt-4 space-y-1.5">
          {promo.body.map((line) => (
            <p key={line} className="text-xs font-semibold leading-5 text-white/85">
              {line}
            </p>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold text-amber-100">
          <span className="rounded-full border border-amber-300/40 bg-black/30 px-2.5 py-1">
            DEPOSIT 10RB
          </span>
          <span className="rounded-full border border-amber-300/40 bg-black/30 px-2.5 py-1">
            RTP 98,7%
          </span>
          <span className="rounded-full border border-amber-300/40 bg-black/30 px-2.5 py-1">
            WD KILAT
          </span>
        </div>

        {promo.cta && (
          <div
            className={`mx-auto mt-4 w-full max-w-xs animate-pulse rounded-full px-6 py-3 text-sm font-black tracking-wide ${GOLD_BUTTON}`}
          >
            {promo.cta}
          </div>
        )}
      </div>

      <Ticker />
    </div>
  );
}

/* ---------- 2. Komentar media sosial ---------- */

function CommentBanner({ promo }: { promo: GamblingScenarioData }) {
  return (
    <div className="bg-white p-4 text-[#111]">
      <div className="mb-3 flex items-center gap-2 text-[11px] text-gray-500">
        <MessageCircle size={14} />
        2.318 komentar
      </div>

      <div className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-orange-300 text-sm font-bold text-white">
          {promo.sender.replace("@", "").slice(0, 1).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs">
            <span className="font-bold">{promo.sender}</span>{" "}
            <span className="text-gray-500">- 3 mnt</span>
          </p>

          <p className="mt-1 text-sm leading-snug">{promo.headline}</p>

          {promo.body.map((line) => (
            <p key={line} className="mt-1 text-sm leading-snug">
              {line}
            </p>
          ))}

          {promo.cta && <p className="mt-1 text-sm font-semibold text-blue-600">{promo.cta}</p>}

          <div className="mt-2 flex items-center gap-4 text-[11px] font-semibold text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Heart size={12} className="fill-red-500 text-red-500" /> 1.204
            </span>
            <span>Balas</span>
          </div>

          <div className="mt-3 rounded-lg bg-gray-100 p-2.5 text-[10px] text-gray-500">
            Komentar serupa dari 311 akun lain: “WD 12 juta kak!”, “Link di bio ya 🔥”
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 3. Bubble chat (DM, grup, Telegram, sahabat) ---------- */

function ChatBanner({ promo }: { promo: GamblingScenarioData }) {
  return (
    <div className="bg-[#e8e1d6]">
      <div className="flex items-center gap-3 bg-[#1f6f63] px-4 py-3 text-white">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
          {promo.sender.replace("@", "").slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-bold">{promo.sender}</p>
          <p className="text-[10px] text-white/70">online</p>
        </div>
      </div>

      <div className="space-y-2 p-4">
        {[promo.headline, ...promo.body].map((line) => (
          <div key={line} className="flex">
            <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-[13px] leading-snug text-[#222] shadow-sm">
              {line}
              <span className="ml-2 align-bottom text-[9px] text-gray-400">21.14</span>
            </div>
          </div>
        ))}

        {promo.cta && (
          <div className="flex">
            <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-[13px] font-semibold text-blue-600 shadow-sm">
              🔗 {promo.cta}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- 4. Livestream ---------- */

function StreamBanner({ promo }: { promo: GamblingScenarioData }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#1a0b3a] via-[#2d0f4a] to-[#0b0620] p-4">
      <div className="flex items-center justify-between text-[10px] font-bold">
        <span className="inline-flex items-center gap-1.5">
          <span className="rounded bg-red-600 px-1.5 py-0.5 text-white">LIVE</span>
          <span className="inline-flex items-center gap-1 text-white/80">
            <Eye size={11} /> 12,4 rb
          </span>
        </span>
        <span className="text-white/60">{promo.channel}</span>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto] gap-3">
        <div className="rounded-xl border border-amber-400/30 bg-black/40 p-3">
          <div className="grid grid-cols-3 gap-1.5">
            {["7", "7", "7", "🍒", "💎", "🔔", "⭐", "🍒", "💎"].map((symbol, index) => (
              <div
                key={index}
                className={`flex h-9 items-center justify-center rounded bg-gradient-to-b from-[#fff7d6] to-[#f3d98b] text-lg font-black ${
                  index < 3 ? "text-red-600 ring-2 ring-amber-300" : ""
                }`}
              >
                {symbol}
              </div>
            ))}
          </div>

          <p className={`mt-2 text-center text-lg font-black ${GOLD_TEXT}`}>WIN Rp 8.450.000</p>
        </div>

        <div className="w-28 space-y-1.5 text-[10px] leading-tight text-white/85">
          <p><b className="text-amber-300">kuy_88:</b> gacor parah 🔥</p>
          <p><b className="text-sky-300">nanda:</b> kode refnya mana kak</p>
          <p><b className="text-pink-300">rendi:</b> wd tadi cair 5 mnt</p>
        </div>
      </div>

      <p className="mt-3 text-sm font-extrabold text-white">{promo.headline}</p>

      {promo.body.map((line) => (
        <p key={line} className="mt-1 text-xs leading-5 text-white/70">
          {line}
        </p>
      ))}

      {promo.cta && (
        <div className="mt-3 rounded-lg border border-dashed border-amber-300/60 bg-amber-300/10 px-3 py-2 text-center text-[11px] font-bold text-amber-200">
          {promo.cta}
        </div>
      )}
    </div>
  );
}

/* ---------- 5. Slot mode demo ---------- */

function DemoBanner({ promo }: { promo: GamblingScenarioData }) {
  return (
    <div className="bg-gradient-to-b from-[#1b0a3d] to-[#0d0520] p-4 text-white">
      <div className="flex items-center justify-between">
        <span className="rounded bg-sky-500 px-2 py-0.5 text-[10px] font-black">MODE DEMO</span>
        <span className="text-[11px] font-bold text-amber-200">Saldo Rp 1.000.000 (demo)</span>
      </div>

      <div className="mx-auto mt-3 max-w-xs rounded-2xl border-4 border-amber-500 bg-gradient-to-b from-[#3b1466] to-[#1d0838] p-3 shadow-[0_0_24px_rgba(251,191,36,0.35)]">
        <div className="grid grid-cols-3 gap-1.5">
          {["7", "7", "🍒", "💎", "🔔", "⭐", "🔔", "💎", "🍒"].map((symbol, index) => (
            <div
              key={index}
              className={`flex h-11 items-center justify-center rounded bg-gradient-to-b from-[#fff7d6] to-[#f3d98b] text-xl font-black ${
                symbol === "7" ? "text-red-600" : ""
              } ${index === 2 ? "opacity-60" : ""}`}
            >
              {symbol}
            </div>
          ))}
        </div>

        <p className="mt-2 text-center text-xs font-black tracking-wider text-red-300">
          SEDIKIT LAGI! 7 - 7 - 🍒
        </p>
      </div>

      <div className="mt-3 space-y-2 text-[10px] font-bold">
        <div>
          <div className="mb-1 flex justify-between text-emerald-300">
            <span>🔥 JAM GACOR</span>
            <span>92%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-emerald-400 to-lime-300" />
          </div>
        </div>

        <div className="flex justify-between text-white/70">
          <span>RTP LIVE</span>
          <span className="text-amber-300">98,7%</span>
        </div>
      </div>

      <p className="mt-3 text-sm font-extrabold">{promo.headline}</p>

      {promo.body.map((line) => (
        <p key={line} className="mt-1 text-xs leading-5 text-white/70">
          {line}
        </p>
      ))}

      {promo.cta && (
        <div className={`mt-3 animate-pulse rounded-full px-5 py-2.5 text-center text-xs font-black ${GOLD_BUTTON}`}>
          {promo.cta}
        </div>
      )}
    </div>
  );
}

/* ---------- 6. Notifikasi push ---------- */

function NotifBanner({ promo }: { promo: GamblingScenarioData }) {
  return (
    <div className="bg-gradient-to-b from-slate-700 to-slate-900 p-4">
      <p className="mb-3 text-center text-[11px] font-semibold text-white/50">Jumat, 21.14</p>

      <div className="rounded-2xl bg-white/95 p-3.5 shadow-xl backdrop-blur">
        <div className="flex items-center gap-2 text-[10px] font-semibold text-gray-500">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-fuchsia-500 to-amber-400 text-[10px] text-white">
            ★
          </span>
          {promo.sender}
          <span className="ml-auto">sekarang</span>
        </div>

        <p className="mt-2 text-sm font-extrabold leading-snug text-[#111]">{promo.headline}</p>

        {promo.body.map((line) => (
          <p key={line} className="mt-1 text-xs leading-5 text-gray-700">
            {line}
          </p>
        ))}

        {promo.cta && (
          <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-[#111] px-3 py-2 text-xs font-bold text-white">
            <Send size={12} /> {promo.cta}
          </div>
        )}
      </div>
    </div>
  );
}

export function GamblingBanner({ variant, promo }: Props) {
  return (
    <div className="relative">
      <span className="absolute right-2 top-2 z-10 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-white">
        SIMULASI
      </span>

      {variant === "popup" && <PopupBanner promo={promo} />}
      {variant === "comment" && <CommentBanner promo={promo} />}
      {variant === "chat" && <ChatBanner promo={promo} />}
      {variant === "stream" && <StreamBanner promo={promo} />}
      {variant === "demo" && <DemoBanner promo={promo} />}
      {variant === "notif" && <NotifBanner promo={promo} />}
    </div>
  );
}