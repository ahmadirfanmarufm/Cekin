
"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  Link2,
  LockKeyhole,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  UserRound,
  Wallet,
  ShieldCheck,
  ArrowLeft,
  Info,
} from "lucide-react";

import {
  analyzeInput,
  checkLabels,
  type AnalysisCategory,
  type AnalysisResult,
} from "@/lib/cekin/analysis";

const categories = [
  { id: "Pesan / Chat", icon: MessageSquare },
  { id: "URL / Link", icon: Link2 },
  { id: "Nomor Telepon", icon: Phone },
  { id: "Tawaran Kerja", icon: UserRound },
  { id: "Investasi", icon: Wallet },
  { id: "Informasi Lainnya", icon: AlertTriangle },
] as const;

const samples: Record<AnalysisCategory, string> = {
  "Pesan / Chat":
    "Tim keamanan: akun kamu akan diblokir. Kirim OTP sekarang juga untuk verifikasi.",
  "URL / Link": "https://hadiah-bank-verify.xyz/login",
  "Nomor Telepon": "+62 812-0000-991",
  "Tawaran Kerja":
    "Kerja part-time dijamin Rp500.000 per hari. Transfer deposit biaya aktivasi sekarang.",
  Investasi:
    "Profit dijamin 30% setiap minggu tanpa risiko. Deposit hanya hari ini.",
  "Informasi Lainnya":
    "Sudah banyak yang berhasil. Hubungi Telegram dan bayar langsung sekarang juga.",
};

type Stage = "form" | "checking" | "result";

export function ThreatCheck() {
  const [category, setCategory] =
    useState<AnalysisCategory>("Pesan / Chat");
  const [input, setInput] = useState("");
  const [stage, setStage] = useState<Stage>("form");
  const [check, setCheck] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (stage !== "checking") return;

    setCheck(0);

    let current = 0;

    const timer = window.setInterval(() => {
      current += 1;
      setCheck(current);

      if (current >= checkLabels.length) {
        window.clearInterval(timer);
        setResult(analyzeInput(input, category));
        setStage("result");
      }
    }, 310);

    return () => window.clearInterval(timer);
  }, [stage, input, category]);

  function submit() {
    const value = input.trim();

    if (value.length < 5) {
      setError("Masukkan informasi yang cukup untuk dianalisis.");
      return;
    }

    if (
      category === "URL / Link" &&
      !/^(https?:\/\/|www\.)/i.test(value)
    ) {
      setError("Masukkan URL lengkap, misalnya https://contoh.test");
      return;
    }

    if (
      category === "Nomor Telepon" &&
      !/^(\+62|62|0)[\d\s-]{8,15}$/.test(value)
    ) {
      setError("Gunakan format nomor Indonesia yang valid.");
      return;
    }

    setError("");
    setResult(null);
    setStage("checking");
  }

  function reset() {
    setInput("");
    setResult(null);
    setError("");
    setCheck(0);
    setStage("form");
  }

  if (stage === "checking") {
    return (
      <section className="min-h-[calc(100vh-80px)] bg-[#f7f9fc] px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-col items-center py-8 text-center">
            {/* Scanner Icon */}
            <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-[28px] border border-[#d7e5fa] bg-[#eaf1fc] text-[#2457a6] shadow-lg shadow-blue-900/5">
              <Search size={42} />
              <span className="absolute -inset-2 animate-pulse rounded-[34px] border border-[#2457a6]/20" />
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-[#e9f7ef] px-4 py-2 text-[10px] font-extrabold tracking-wider text-[#18794e]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#26a269]" />
              SEDANG MENGANALISIS
            </span>

            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-[#17233b] sm:text-4xl">
              Mencari tanda-tanda risiko...
            </h1>

            <p className="mt-3 max-w-md text-sm leading-7 text-[#667085]">
              Sistem sedang memeriksa informasi berdasarkan sejumlah
              indikator yang umum ditemukan pada modus penipuan.
            </p>

            {/* Checking Steps */}
            <div className="mt-9 w-full rounded-2xl border border-[#e6eaf0] bg-white p-4 text-left shadow-sm sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#17233b]">
                  Tahapan pemeriksaan
                </h2>
                <span className="text-xs font-semibold tabular-nums text-[#667085]">
                  {Math.min(check, checkLabels.length)} / {checkLabels.length}
                </span>
              </div>

              <div className="mb-5 h-2 overflow-hidden rounded-full bg-[#edf1f6]">
                <div
                  className="h-full rounded-full bg-[#2457a6] transition-all duration-300"
                  style={{
                    width: `${
                      (Math.min(check, checkLabels.length) /
                        checkLabels.length) *
                      100
                    }%`,
                  }}
                />
              </div>

              <div className="divide-y divide-[#edf0f5]">
                {checkLabels.map((label, index) => {
                  const isDone = index < check;
                  const isActive = index === check;

                  return (
                    <div
                      className="flex min-h-[58px] items-center gap-3 py-3"
                      key={label}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          isDone
                            ? "bg-[#e9f7ef] text-[#18794e]"
                            : isActive
                              ? "bg-[#eaf1fc] text-[#2457a6]"
                              : "bg-[#f2f4f7] text-[#98a2b3]"
                        }`}
                      >
                        {isDone ? (
                          <Check size={17} />
                        ) : isActive ? (
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#2457a6] border-t-transparent" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-current" />
                        )}
                      </span>

                      <strong className="min-w-0 flex-1 text-xs font-semibold text-[#344054]">
                        {label}
                      </strong>

                      <span className="text-[10px] font-medium text-[#667085]">
                        {isDone
                          ? "Selesai"
                          : isActive
                            ? "Memeriksa"
                            : "Menunggu"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex items-start gap-2 rounded-xl border border-[#e6eaf0] bg-white p-4 text-left">
              <LockKeyhole
                size={17}
                className="mt-0.5 shrink-0 text-[#2457a6]"
              />
              <p className="text-[11px] leading-6 text-[#667085]">
                Pemeriksaan dilakukan di browser berdasarkan aturan
                analisis prototype. Isi yang kamu masukkan tidak
                disimpan oleh komponen ini.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (stage === "result" && result) {
    return <RiskResult result={result} reset={reset} />;
  }

  return (
    <section className="min-h-[calc(100vh-80px)] bg-[#f7f9fc] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Page Introduction */}
        <div className="mb-9 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#e9f7ef] px-4 py-2 text-[10px] font-extrabold tracking-wider text-[#18794e]">
            <ShieldCheck size={14} />
            CEK ANCAMAN
          </span>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-[#17233b] sm:text-4xl lg:text-5xl">
            Cek Sebelum Percaya.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#667085] sm:text-base">
            Masukkan informasi yang mencurigakan. Kami bantu periksa
            tanda-tanda risiko yang mungkin perlu kamu waspadai.
          </p>
        </div>

        {/* Main Form */}
        <div className="rounded-2xl border border-[#e6eaf0] bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-8">
          {/* Step 1 */}
          <div className="mb-5 flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2457a6] text-sm font-extrabold text-white">
              1
            </span>

            <div>
              <h2 className="text-base font-bold text-[#17233b]">
                Pilih jenis informasi
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#667085]">
                Pilih kategori agar pemeriksaan lebih sesuai.
              </p>
            </div>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
            {categories.map(({ id, icon: Icon }) => {
              const isActive = category === id;

              return (
                <button
                  type="button"
                  key={id}
                  onClick={() => {
                    setCategory(id);
                    setInput("");
                    setError("");
                  }}
                  aria-pressed={isActive}
                  className={`relative flex min-h-[88px] flex-col items-start justify-center gap-2 rounded-xl border p-3.5 text-left transition-all duration-200 sm:min-h-[96px] sm:p-4 ${
                    isActive
                      ? "border-[#2457a6] bg-[#eaf1fc] text-[#2457a6] shadow-sm"
                      : "border-[#e6eaf0] bg-white text-[#667085] hover:border-[#b9cbe5] hover:bg-[#f7f9fc]"
                  }`}
                >
                  <Icon size={21} />

                  <span className="pr-5 text-[11px] font-bold sm:text-xs">
                    {id}
                  </span>

                  {isActive && (
                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#2457a6] text-white">
                      <Check size={12} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="my-8 h-px bg-[#e6eaf0]" />

          {/* Step 2 */}
          <div className="mb-5 flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2457a6] text-sm font-extrabold text-white">
              2
            </span>

            <div>
              <h2 className="text-base font-bold text-[#17233b]">
                Masukkan informasi
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#667085]">
                Tempel atau tuliskan informasi yang ingin diperiksa.
              </p>
            </div>
          </div>

          {/* Input */}
          {category === "URL / Link" ||
          category === "Nomor Telepon" ? (
            <input
              type="text"
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                setError("");
              }}
              placeholder={
                category === "URL / Link"
                  ? "https://alamat-link.test"
                  : "+62 812 3456 7890"
              }
              aria-label={`Masukkan ${category}`}
              className="min-h-14 w-full rounded-xl border border-[#e6eaf0] bg-white px-4 py-3 text-sm text-[#17233b] outline-none transition placeholder:text-[#a0aaba] focus:border-[#2457a6] focus:ring-4 focus:ring-[#2457a6]/10"
            />
          ) : (
            <textarea
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                setError("");
              }}
              placeholder={
                category === "Pesan / Chat"
                  ? "Tempel pesan mencurigakan di sini..."
                  : "Jelaskan tawaran atau informasi yang ingin diperiksa..."
              }
              aria-label={`Masukkan ${category}`}
              rows={6}
              className="min-h-36 w-full resize-y rounded-xl border border-[#e6eaf0] bg-white px-4 py-3 text-sm leading-7 text-[#17233b] outline-none transition placeholder:text-[#a0aaba] focus:border-[#2457a6] focus:ring-4 focus:ring-[#2457a6]/10"
            />
          )}

          {/* Sample Button */}
          <button
            type="button"
            onClick={() => {
              setInput(samples[category]);
              setError("");
            }}
            className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#eaf1fc] px-3 py-2 text-[11px] font-bold text-[#2457a6] transition hover:bg-[#dce9fb]"
          >
            <RefreshCw size={14} />
            Gunakan contoh
          </button>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3.5 text-xs leading-6 text-red-700"
            >
              <AlertTriangle size={17} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Privacy Note */}
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#e6edf6] bg-[#f5f8fc] p-4">
            <LockKeyhole
              size={18}
              className="mt-0.5 shrink-0 text-[#2457a6]"
            />
            <p className="text-[11px] leading-6 text-[#64748b]">
              Jangan masukkan password, PIN, OTP, nomor identitas,
              atau informasi pribadi yang sangat sensitif.
            </p>
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={submit}
            className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2457a6] px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-900/10 transition hover:-translate-y-0.5 hover:bg-[#183d78] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2457a6]"
          >
            <Search size={18} />
            Analisis Sekarang
          </button>

          <p className="mt-3 text-center text-[10px] leading-5 text-[#98a2b3]">
            Analisis ini merupakan pemeriksaan awal berbasis aturan,
            bukan verifikasi resmi.
          </p>
        </div>
      </div>
    </section>
  );
}

function RiskResult({
  result,
  reset,
}: {
  result: AnalysisResult;
  reset: () => void;
}) {
  const tone =
    result.level === "Rendah"
      ? "safe"
      : result.level === "Sedang"
        ? "warning"
        : result.level === "Tinggi"
          ? "high"
          : "critical";

  const toneStyles = {
    safe: {
      wrapper: "border-[#d3ecdd] bg-[#f0faf4]",
      badge: "bg-[#e1f5e9] text-[#18794e]",
      meter: "bg-[#26a269]",
      icon: "text-[#21875d]",
    },
    warning: {
      wrapper: "border-[#f3e5c7] bg-[#fff9ed]",
      badge: "bg-[#fff0d0] text-[#9a6a18]",
      meter: "bg-[#e9a23b]",
      icon: "text-[#c58a2b]",
    },
    high: {
      wrapper: "border-[#f2d8d4] bg-[#fff3f1]",
      badge: "bg-[#ffe4e0] text-[#bd4141]",
      meter: "bg-[#dc5555]",
      icon: "text-[#c34e4e]",
    },
    critical: {
      wrapper: "border-[#f2d8d4] bg-[#fff0ef]",
      badge: "bg-[#ffe0dd] text-[#a92e2e]",
      meter: "bg-[#c93636]",
      icon: "text-[#bd3030]",
    },
  } as const;

  const style = toneStyles[tone];

  return (
    <section className="min-h-[calc(100vh-80px)] bg-[#f7f9fc] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-5 sm:gap-6">
        {/* Back Button */}
        <button
          type="button"
          onClick={reset}
          className="inline-flex w-fit items-center gap-2 text-xs font-bold text-[#667085] transition hover:text-[#2457a6]"
        >
          <ArrowLeft size={16} />
          Kembali ke pemeriksaan
        </button>

        {/* Risk Summary */}
        <div
          className={`flex flex-col gap-7 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8 ${style.wrapper}`}
        >
          <div className="min-w-0 flex-1">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10px] font-extrabold tracking-wider ${style.badge}`}
            >
              <AlertTriangle size={13} />
              RISIKO {result.level.toUpperCase()}
            </span>

            <h1 className="mt-5 text-2xl font-extrabold leading-tight tracking-tight text-[#17233b] sm:text-3xl lg:text-4xl">
              {result.level === "Rendah"
                ? "Belum terlihat tanda kuat."
                : "Ada tanda yang perlu diwaspadai."}
            </h1>

            <p className="mt-3 max-w-lg text-xs leading-7 text-[#667085]">
              Skor ini adalah indikator heuristik, bukan probabilitas
              atau bukti bahwa informasi pasti penipuan. Gunakan hasil
              ini sebagai pemeriksaan awal.
            </p>
          </div>

          {/* Score */}
          <div
            className="relative mx-auto flex h-32 w-32 shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-36 sm:w-36"
            style={{
              background: `conic-gradient(${
                tone === "safe"
                  ? "#26a269"
                  : tone === "warning"
                    ? "#e9a23b"
                    : "#dc5555"
              } ${Math.min(Math.max(result.score, 0), 100)}%, #e6eaf0 0)`,
            }}
            aria-label={`Skor risiko ${result.score} dari 100`}
          >
            <div className="absolute inset-[9px] flex flex-col items-center justify-center rounded-full bg-white">
              <span className="text-3xl font-extrabold tracking-tight text-[#17233b]">
                {result.score}
              </span>
              <span className="text-[10px] font-semibold text-[#667085]">
                DARI 100
              </span>
            </div>
          </div>
        </div>

        {/* Result Facts */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[#e6eaf0] bg-white p-4">
            <span className="text-[10px] font-medium text-[#667085]">
              Kategori
            </span>
            <strong className="mt-2 block text-sm font-bold text-[#17233b]">
              {result.category}
            </strong>
          </div>

          <div className="rounded-xl border border-[#e6eaf0] bg-white p-4">
            <span className="text-[10px] font-medium text-[#667085]">
              Indikator
            </span>
            <strong className="mt-2 block text-sm font-bold text-[#17233b]">
              {result.findings.length} ditemukan
            </strong>
          </div>

          <div className="rounded-xl border border-[#e6eaf0] bg-white p-4">
            <span className="text-[10px] font-medium text-[#667085]">
              Metode
            </span>
            <strong className="mt-2 block text-sm font-bold text-[#17233b]">
              Aturan transparan
            </strong>
          </div>
        </div>

        {/* Findings */}
        {result.findings.length > 0 ? (
          <div>
            <div className="mb-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#eaf1fc] px-3 py-1.5 text-[10px] font-extrabold tracking-wider text-[#2457a6]">
                <Search size={13} />
                HASIL ANALISIS
              </span>

              <h2 className="mt-3 text-xl font-extrabold tracking-tight text-[#17233b] sm:text-2xl">
                Tanda yang kami temukan
              </h2>

              <p className="mt-2 text-xs leading-6 text-[#667085]">
                Berikut beberapa indikator yang terdeteksi dari
                informasi yang kamu masukkan.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {result.findings.map((finding, index) => (
                <article
                  className="rounded-2xl border border-[#e6eaf0] bg-white p-5 shadow-sm sm:p-6"
                  key={finding.id}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eaf1fc] text-xs font-extrabold text-[#2457a6]">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-extrabold leading-snug text-[#17233b]">
                        {finding.label}
                      </h3>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div>
                          <span className="text-[9px] font-extrabold tracking-wider text-[#2457a6]">
                            MENGAPA MENCURIGAKAN
                          </span>
                          <p className="mt-2 text-xs leading-7 text-[#667085]">
                            {finding.why}
                          </p>
                        </div>

                        <div>
                          <span className="text-[9px] font-extrabold tracking-wider text-[#2457a6]">
                            CARA PELAKU MEMANFAATKAN
                          </span>
                          <p className="mt-2 text-xs leading-7 text-[#667085]">
                            {finding.tactic}
                          </p>
                        </div>

                        <div className="rounded-xl border border-[#d9eee2] bg-[#effaf4] p-4 sm:col-span-2">
                          <span className="inline-flex items-center gap-2 text-[9px] font-extrabold tracking-wider text-[#18794e]">
                            <ShieldCheck size={14} />
                            LANGKAH AMAN
                          </span>
                          <p className="mt-2 text-xs leading-7 text-[#426b54]">
                            {finding.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-4 rounded-2xl border border-[#e6eaf0] bg-white p-5 sm:p-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf1fc] text-[#2457a6]">
              <Info size={23} />
            </span>

            <div>
              <h3 className="text-base font-extrabold text-[#17233b]">
                Tidak ada indikator kuat dari aturan prototype
              </h3>
              <p className="mt-2 text-xs leading-7 text-[#667085]">
                Tetap periksa identitas, konteks, dan kanal pengirim
                sebelum bertindak. Tidak ditemukannya indikator bukan
                berarti informasi pasti aman.
              </p>
            </div>
          </div>
        )}

        {/* Result Disclaimer */}
        <div className="flex items-start gap-3 rounded-xl border border-[#e6eaf0] bg-white p-4">
          <AlertTriangle
            size={17}
            className="mt-0.5 shrink-0 text-[#c58a2b]"
          />
          <p className="text-[11px] leading-6 text-[#667085]">
            Hasil pemeriksaan ini merupakan alat bantu edukasi dan
            tidak menggantikan verifikasi dari pihak berwenang atau
            penyedia layanan terkait.
          </p>
        </div>

        {/* Reset */}
        <button
          type="button"
          onClick={reset}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2457a6] px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-900/10 transition hover:-translate-y-0.5 hover:bg-[#183d78] hover:shadow-lg sm:w-fit sm:self-start"
        >
          <RefreshCw size={17} />
          Periksa Informasi Lain
        </button>
      </div>
    </section>
  );
}
