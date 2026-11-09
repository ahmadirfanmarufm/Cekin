"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import type { GamblingActivityKind } from "@/types/learning-protection";

const rp = (n: number) => {
  const sign = n < 0 ? "-" : "";
  return `${sign}Rp${Math.abs(Math.round(n))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
};

const BOX = "rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4";
const BTN = "inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[var(--brand-dark)]";

function spinMultiplier() {
  const r = Math.random();
  if (r < 0.72) return 0;
  if (r < 0.92) return 1.5;
  if (r < 0.99) return 5;
  return 20;
}

function runSession(spins: number, start: number, bet: number) {
  let balance = start;
  const path = [balance];

  for (let i = 0; i < spins; i += 1) {
    if (balance < bet) break;
    balance += bet * spinMultiplier() - bet;
    path.push(balance);
  }

  return { path, final: balance, peak: Math.max(...path) };
}

function Spark({ path, base }: { path: number[]; base: number }) {
  const w = 300;
  const h = 80;
  const max = Math.max(...path, base);
  const min = Math.min(...path, 0);
  const x = (i: number) => (path.length < 2 ? 0 : (i / (path.length - 1)) * w);
  const y = (v: number) => h - ((v - min) / (max - min || 1)) * h;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-20 w-full" role="img" aria-label="Grafik saldo">
      <line
        x1="0"
        x2={w}
        y1={y(base)}
        y2={y(base)}
        stroke="currentColor"
        strokeOpacity=".3"
        strokeDasharray="4 4"
      />
      <polyline
        fill="none"
        stroke="var(--danger)"
        strokeWidth="2"
        points={path.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
      />
    </svg>
  );
}

/* ---------- 1. Simulasi 100 putaran ---------- */

function SlotSim({ onDone }: { onDone: () => void }) {
  const START = 1_000_000;
  const [runs, setRuns] = useState<ReturnType<typeof runSession>[]>([]);
  const last = runs[runs.length - 1];
  const wins = runs.filter((r) => r.final > START).length;
  const net = runs.reduce((sum, r) => sum + (r.final - START), 0);

  return (
    <div className={BOX}>
      <p className="text-xs text-[var(--muted)]">
        Modal {rp(START)} - taruhan {rp(10_000)} - 100 putaran - RTP contoh 85%
      </p>

      <button
        type="button"
        className={`${BTN} mt-3`}
        onClick={() => {
          setRuns((previous) => [...previous, runSession(100, START, 10_000)]);
          onDone();
        }}
      >
        🎰 Putar 100x
      </button>

      {last && (
        <div className="mt-4">
          <Spark path={last.path} base={START} />
          <div className="mt-2 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-[var(--card)] p-3">
              <p className="text-[10px] font-bold text-[var(--muted)]">Pernah naik sampai</p>
              <p className="text-sm font-extrabold text-[var(--accent)]">{rp(last.peak)}</p>
            </div>
            <div className="rounded-xl bg-[var(--card)] p-3">
              <p className="text-[10px] font-bold text-[var(--muted)]">Akhirnya</p>
              <p className="text-sm font-extrabold text-[var(--danger)]">{rp(last.final)}</p>
            </div>
          </div>

          <p className="mt-3 text-xs font-semibold text-[var(--foreground)]">
            {wins} dari {runs.length} sesi berakhir untung. Total hasil: {rp(net)}
          </p>
          <p className="mt-1 text-[11px] text-[var(--muted)]">
            Ulangi beberapa kali. Naik di tengah jalan itu umpan, bukan hasil akhir.
          </p>
        </div>
      )}
    </div>
  );
}

/* ---------- 2. Uang dapur vs judi ---------- */

function Budget({ onDone }: { onDone: () => void }) {
  const INCOME = 2_500_000;
  const NEEDS = [
    ["Makan", 1_200_000],
    ["Kos dan listrik", 700_000],
    ["Transport", 300_000],
    ["Pulsa dan lain-lain", 150_000],
  ] as const;

  const [weekly, setWeekly] = useState(0);
  const monthly = weekly * 4;
  const needsTotal = NEEDS.reduce((sum, [, value]) => sum + value, 0);
  const left = INCOME - needsTotal - monthly;
  const mealDays = Math.round(monthly / 40_000);

  return (
    <div className={BOX}>
      <p className="text-xs text-[var(--muted)]">
        Gaji {rp(INCOME)} per bulan. Geser uang yang “disisihkan” untuk judi tiap minggu.
      </p>

      <input
        type="range"
        min={0}
        max={500_000}
        step={25_000}
        value={weekly}
        aria-label="Uang judi per minggu"
        onChange={(event) => {
          setWeekly(Number(event.target.value));
          onDone();
        }}
        className="mt-4 w-full accent-[var(--brand)]"
      />
      <p className="mt-1 text-sm font-extrabold text-[var(--foreground)]">
        {rp(weekly)} / minggu = {rp(monthly)} / bulan
      </p>

      <ul className="mt-3 space-y-1 text-xs text-[var(--muted)]">
        {NEEDS.map(([label, value]) => (
          <li key={label} className="flex justify-between">
            <span>{label}</span>
            <span>{rp(value)}</span>
          </li>
        ))}
        <li className="flex justify-between font-bold text-[var(--foreground)]">
          <span>Judi</span>
          <span>{rp(monthly)}</span>
        </li>
      </ul>

      <div
        className={`mt-3 rounded-xl p-3 text-center text-sm font-extrabold ${
          left < 0
            ? "bg-[var(--danger)]/10 text-[var(--danger)]"
            : "bg-[var(--accent-soft)] text-[var(--accent)]"
        }`}
      >
        Sisa akhir bulan: {rp(left)}
      </div>

      {monthly > 0 && (
        <p className="mt-2 text-[11px] text-[var(--muted)]">
          Uang judi sebulan = sekitar {mealDays} hari makan (Rp40.000/hari).
          {left < 0 && " Kekurangannya ditutup dari mana?"}
        </p>
      )}
    </div>
  );
}

/* ---------- 3. Jam gacor ---------- */

function Gacor({ onDone }: { onDone: () => void }) {
  const [result, setResult] = useState<{ gacor?: number; sepi?: number }>({});

  const test = (key: "gacor" | "sepi") => {
    let back = 0;
    for (let i = 0; i < 200; i += 1) back += spinMultiplier();
    const rtp = Math.round((back / 200) * 100);

    const next = { ...result, [key]: rtp };
    setResult(next);

    if (next.gacor !== undefined && next.sepi !== undefined) onDone();
  };

  const both = result.gacor !== undefined && result.sepi !== undefined;

  return (
    <div className={BOX}>
      <p className="text-xs text-[var(--muted)]">
        200 putaran di tiap jam. Angka di bawah: uang kembali dari tiap Rp100 yang dipertaruhkan.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {(
          [
            ["gacor", "🔥 Jam gacor 21.00"],
            ["sepi", "😴 Jam sepi 04.00"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="rounded-xl bg-[var(--card)] p-3 text-center">
            <p className="text-[11px] font-bold text-[var(--foreground)]">{label}</p>
            <p className="my-2 text-2xl font-extrabold text-[var(--foreground)]">
              {result[key] === undefined ? "?" : `Rp${result[key]}`}
            </p>
            <button type="button" className={BTN} onClick={() => test(key)}>
              {result[key] === undefined ? "Tes" : "Ulangi"}
            </button>
          </div>
        ))}
      </div>

      {both && (
        <p className="mt-3 text-xs font-semibold text-[var(--foreground)]">
          Selisihnya cuma kebetulan. Ulangi: yang “gacor” bisa berganti, dan dua-duanya tetap di bawah Rp100.
        </p>
      )}
    </div>
  );
}

/* ---------- 4. Kenangan menang ---------- */

const LEDGER = [1_200_000, -150_000, -300_000, -200_000, 850_000, -400_000, -250_000, -500_000, -300_000, -600_000];

function Ledger({ onDone }: { onDone: () => void }) {
  const [tab, setTab] = useState<"ingat" | "semua">("ingat");
  const [seen, setSeen] = useState<string[]>(["ingat"]);

  const total = LEDGER.reduce((sum, value) => sum + value, 0);
  const shown = tab === "ingat" ? LEDGER.filter((value) => value > 0) : LEDGER;

  const open = (next: "ingat" | "semua") => {
    setTab(next);

    const updated = seen.includes(next) ? seen : [...seen, next];
    setSeen(updated);

    if (updated.length === 2) onDone();
  };

  return (
    <div className={BOX}>
      <p className="text-xs text-[var(--muted)]">Catatan 10 sesi Dani. Bandingkan dua tampilan ini.</p>

      <div className="mt-3 flex gap-2">
        {(
          [
            ["ingat", "Yang Dani ingat"],
            ["semua", "Catatan lengkap"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => open(key)}
            className={`rounded-xl border px-3 py-2 text-xs font-bold ${
              tab === key
                ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                : "border-[var(--border)] text-[var(--muted)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="mt-3 grid grid-cols-2 gap-1.5 text-xs">
        {shown.map((value, index) => (
          <li
            key={`${value}-${index}`}
            className={`rounded-lg px-3 py-1.5 font-bold ${
              value > 0 ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "bg-[var(--danger)]/10 text-[var(--danger)]"
            }`}
          >
            {value > 0 ? "+" : ""}
            {rp(value)}
          </li>
        ))}
      </ul>

      <p className="mt-3 text-sm font-extrabold text-[var(--foreground)]">
        {tab === "ingat" ? "“Aku sering menang!” 🎉" : `Total 10 sesi: ${rp(total)}`}
      </p>
    </div>
  );
}

/* ---------- 5. Gandakan taruhan ---------- */

function martingale() {
  const start = 500_000;
  let bank = start;
  let bet = 10_000;

  for (let round = 0; round < 150; round += 1) {
    if (bet > bank || bet > 200_000) return { bust: true, bank, nextBet: bet, net: bank - start };

    bank -= bet;

    if (Math.random() < 0.47) {
      bank += bet * 2;
      bet = 10_000;
    } else {
      bet *= 2;
    }
  }

  return { bust: false, bank, nextBet: bet, net: bank - start };
}

function Martingale({ onDone }: { onDone: () => void }) {
  const [runs, setRuns] = useState<ReturnType<typeof martingale>[]>([]);
  const last = runs[runs.length - 1];
  const net = runs.reduce((sum, r) => sum + r.net, 0);

  const runSession = () => {
    const next = [...runs, martingale()];
    setRuns(next);

    if (next.length >= 3) onDone();
  };

  return (
    <div className={BOX}>
      <p className="text-xs text-[var(--muted)]">
        Modal {rp(500_000)}, taruhan awal {rp(10_000)}, digandakan tiap kalah. Batas meja {rp(200_000)}. Coba 3 sesi.
      </p>

      <button
        type="button"
        className={`${BTN} mt-3`}
        onClick={runSession}
      >
        ▶ Jalankan 1 sesi ({runs.length}/3)
      </button>

      {last && (
        <div className="mt-3 rounded-xl bg-[var(--card)] p-3 text-xs">
          <p className="font-bold text-[var(--foreground)]">
            {last.bust
              ? `Berhenti: taruhan berikutnya ${rp(last.nextBet)} melewati saldo atau batas meja.`
              : "Sesi selesai tanpa kena batas."}
          </p>
          <p className={`mt-1 font-extrabold ${last.net < 0 ? "text-[var(--danger)]" : "text-[var(--accent)]"}`}>
            Hasil sesi: {rp(last.net)}
          </p>
        </div>
      )}

      {runs.length > 0 && (
        <p className="mt-2 text-[11px] text-[var(--muted)]">
          Total {runs.length} sesi: {rp(net)}. Tiap kemenangan cuma {rp(10_000)}, sekali gagal bisa hilang ratusan ribu.
        </p>
      )}
    </div>
  );
}

/* ---------- 6. Kalkulator utang ---------- */

function Debt({ onDone }: { onDone: () => void }) {
  const [loan, setLoan] = useState(1_000_000);
  const [late, setLate] = useState(10);

  const received = loan * 0.7;
  const fee = loan * 0.03 * late;
  const total = loan + fee;

  return (
    <div className={BOX}>
      <p className="text-xs text-[var(--muted)]">Contoh pinjol ilegal: cair 70%, denda 3% per hari telat.</p>

      <label className="mt-3 block text-[11px] font-bold text-[var(--foreground)]">
        Pinjaman: {rp(loan)}
        <input
          type="range"
          min={500_000}
          max={3_000_000}
          step={100_000}
          value={loan}
          onChange={(event) => {
            setLoan(Number(event.target.value));
            onDone();
          }}
          className="mt-1 w-full accent-[var(--brand)]"
        />
      </label>

      <label className="mt-2 block text-[11px] font-bold text-[var(--foreground)]">
        Telat bayar: {late} hari
        <input
          type="range"
          min={0}
          max={30}
          value={late}
          onChange={(event) => {
            setLate(Number(event.target.value));
            onDone();
          }}
          className="mt-1 w-full accent-[var(--brand)]"
        />
      </label>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl bg-[var(--card)] p-3">
          <p className="text-[10px] font-bold text-[var(--muted)]">Uang yang kamu terima</p>
          <p className="text-sm font-extrabold text-[var(--accent)]">{rp(received)}</p>
        </div>
        <div className="rounded-xl bg-[var(--card)] p-3">
          <p className="text-[10px] font-bold text-[var(--muted)]">Yang harus dibayar</p>
          <p className="text-sm font-extrabold text-[var(--danger)]">{rp(total)}</p>
        </div>
      </div>

      <p className="mt-2 text-[11px] text-[var(--muted)]">
        Kamu bayar {(total / received).toFixed(1)}x dari uang yang kamu pegang.
      </p>
    </div>
  );
}

/* ---------- 7. Peta pemicu ---------- */

const TRIGGERS: [string, string, string][] = [
  ["💸", "Hari gajian", "Transfer kebutuhan dan tabungan dulu, sebelum sempat dipegang."],
  ["🌙", "Malam sepi", "Taruh HP di luar kamar. Matikan notifikasi."],
  ["😣", "Lagi stres", "Telepon satu orang atau jalan 10 menit."],
  ["🔔", "Notifikasi bonus", "Blokir, keluar dari grup, hapus aplikasinya."],
  ["👥", "Ajakan teman", "Tolak, dan pindah tempat kumpul."],
  ["📉", "Habis kalah", "Berhenti hari itu juga. Ceritakan ke orang tepercaya."],
];

function Triggers({ onDone }: { onDone: () => void }) {
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (label: string) => {
    const next = picked.includes(label)
      ? picked.filter((item) => item !== label)
      : [...picked, label];

    setPicked(next);

    if (next.length >= 2) onDone();
  };
  
  return (
    <div className={BOX}>
      <p className="text-xs text-[var(--muted)]">Ketuk minimal 2 pemicu yang kamu kenali.</p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {TRIGGERS.map(([icon, label, plan]) => {
          const on = picked.includes(label);

          return (
            <button
              key={label}
              type="button"
              onClick={() => toggle(label)}
              aria-pressed={on}
              className={`rounded-xl border p-3 text-left transition ${
                on
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] bg-[var(--card)]"
              }`}
            >
              <p className="text-xs font-extrabold text-[var(--foreground)]">
                {icon} {label}
              </p>
              {on && <p className="mt-1 text-[11px] leading-relaxed text-[var(--foreground)]">{plan}</p>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Pintu masuk ---------- */

export function GamblingActivity({
  kind,
  onDone,
}: {
  kind: GamblingActivityKind;
  onDone: () => void;
}) {
  switch (kind) {
    case "slot":
      return <SlotSim onDone={onDone} />;
    case "budget":
      return <Budget onDone={onDone} />;
    case "gacor":
      return <Gacor onDone={onDone} />;
    case "ledger":
      return <Ledger onDone={onDone} />;
    case "martingale":
      return <Martingale onDone={onDone} />;
    case "debt":
      return <Debt onDone={onDone} />;
    case "triggers":
      return <Triggers onDone={onDone} />;
    default:
      return null;
  }
}

export function Reset({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-xs font-bold text-[var(--brand)]">
      <RotateCcw size={12} className="mr-1 inline" />
      Ulangi
    </button>
  );
}