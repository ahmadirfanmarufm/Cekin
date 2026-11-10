"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  Link2,
  LockKeyhole,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Wallet,
  ShieldCheck,
  ArrowLeft,
  Info,
  Mail,
  Upload,
  X,
} from "lucide-react";

import {
  analyzeAnything,
  checkLabels,
  type AnalysisCategory,
  type AnalysisResult,
} from "@/lib/cekin/analysis";
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

const categories = [
  { id: "Pesan / Chat", icon: MessageSquare },
  { id: "URL / Link", icon: Link2 },
  { id: "Nomor Telepon", icon: Phone },
  { id: "Cek Kebocoran Email", icon: Mail },
  { id: "Investasi", icon: Wallet },
  { id: "Informasi Lainnya", icon: AlertTriangle },
] as const;

const samples: Record<AnalysisCategory, string> = {
  "Pesan / Chat":
    "Tim keamanan: akun kamu akan diblokir. Kirim OTP sekarang juga untuk verifikasi.",
  "URL / Link": "https://hadiah-bank-verify.xyz/login",
  "Nomor Telepon": "812 3456 7890",
  "Cek Kebocoran Email": "test@test.com",
  Investasi:
    "Platform X menjamin profit 10% seminggu tanpa risiko, deposit hari ini minimal 1 juta.",
  "Informasi Lainnya":
    "Selamat! Nomor kamu terpilih memenangkan hadiah mobil. Pihak bank akan segera memproses, transfer terlebih dahulu biaya admin Rp500.000. Jangan beri tahu siapa pun. Klik bit.ly/hadiah-resmi",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_TEXT_LENGTH = 4000;
const REGION_NAMES = new Intl.DisplayNames(["id"], { type: "region" });
const COUNTRY_CODES = getCountries()
  .map((country) => {
    const code = `+${getCountryCallingCode(country)}`;
    const name = REGION_NAMES.of(country) ?? country;

    return {
      country,
      code,
      name,
      label: `${code} - ${name}`,
    };
  })
  .sort((a, b) => {
    if (a.country === "ID") return -1;
    if (b.country === "ID") return 1;
    return a.name.localeCompare(b.name, "id");
  });

type Stage = "form" | "checking" | "result";

export function ThreatCheck() {
  const [category, setCategory] = useState<AnalysisCategory>("Pesan / Chat");
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("form");
  const [check, setCheck] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [activeTip, setActiveTip] = useState(0);
  const [country, setCountry] = useState<CountryCode>("ID");
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const countryMenuRef = useRef<HTMLDivElement>(null);

  const selectedCountry = COUNTRY_CODES.find(
    (item) => item.country === country,
  );
  const filteredCountries = COUNTRY_CODES.filter((item) => {
    const query = countrySearch.trim().toLowerCase();
    return (
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.country.toLowerCase().includes(query) ||
      item.code.includes(query)
    );
  });

  const tipsAndFacts = [
    {
      title: "Permintaan data rahasia",
      desc: "Lembaga resmi tidak akan pernah meminta OTP, PIN, atau password melalui chat atau telepon.",
    },
    {
      title: "Tekanan dan urgensi",
      desc: "Penipu sering menciptakan rasa panik agar Anda bertindak cepat tanpa berpikir panjang.",
    },
    {
      title: "Tautan mencurigakan",
      desc: "Selalu periksa URL. Tautan pendek (bit.ly) atau domain aneh (.xyz) patut dicurigai.",
    },
    {
      title: "Imbal hasil tidak realistis",
      desc: "Jika tawaran investasi menjamin keuntungan besar tanpa risiko, itu adalah red flag.",
    },
    {
      title: "Klaim identitas palsu",
      desc: "Verifikasi selalu dari kanal resmi. Jangan percaya jika hanya via chat.",
    },
  ];

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!isCountryMenuOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      if (
        countryMenuRef.current &&
        !countryMenuRef.current.contains(event.target as Node)
      ) {
        setIsCountryMenuOpen(false);
        setCountrySearch("");
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isCountryMenuOpen]);

  useEffect(() => {
    if (stage !== "checking") return;

    setCheck(0);

    let current = 0;
    const animationTimer = window.setInterval(() => {
      current += 1;
      setCheck(current);
      if (current >= checkLabels.length) {
        window.clearInterval(animationTimer);
      }
    }, 310);

    const fetchAnalysis = async () => {
      try {
        let apiUrl = "/api/analyze/chat";
        let requestOptions: RequestInit = {};

        if (category === "Informasi Lainnya") {
          apiUrl = "/api/analyze/other";

          const formData = new FormData();
          if (input.trim()) formData.append("text", input.trim());
          if (file) formData.append("file", file);

          requestOptions = {
            method: "POST",
            body: formData,
          };
        } else {
          const bodyData = {
            text:
              category === "Nomor Telepon"
                ? buildPhone(country, input)
                : input,
          };

          if (category === "Cek Kebocoran Email") {
            apiUrl = "/api/analyze/email";
          } else if (category === "Pesan / Chat") {
            apiUrl = "/api/analyze/chat";
          } else if (category === "Investasi") {
            apiUrl = "/api/analyze/investment";
          } else if (category === "URL / Link") {
            apiUrl = "/api/analyze/url";
          } else if (category === "Nomor Telepon") {
            apiUrl = "/api/analyze/phone";
          } else {
            setTimeout(() => {
              setResult(analyzeAnything(input, category));
              setStage("result");
            }, 2000);
            return;
          }

          requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyData),
          };
        }

        const res = await fetch(apiUrl, requestOptions);

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.error || "Gagal memproses data dari server",
          );
        }

        const data = await res.json();

        setTimeout(() => {
          setResult(data);
          setStage("result");
        }, 500);
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
        setStage("form");
      }
    };

    fetchAnalysis();

    return () => window.clearInterval(animationTimer);
  }, [stage, input, category, file]);

  useEffect(() => {
    if (stage !== "checking") return;

    const interval = setInterval(() => {
      setActiveTip((prev) => (prev + 1) % tipsAndFacts.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [stage, tipsAndFacts.length]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [stage]);

  function buildPhone(selectedCountry: CountryCode, local: string) {
    const value = local.trim();

    const phone = parsePhoneNumberFromString(value, selectedCountry);

    return phone?.number ?? value;
  }

  function submit() {
    if (category === "Informasi Lainnya") {
      if (!file) {
        setError("Pilih gambar terlebih dahulu untuk dianalisis.");
        return;
      }

      setError("");
      setResult(null);
      setStage("checking");
      return;
    }

    const value = input.trim();

    if (value.length < 5) {
      setError("Masukkan informasi yang cukup untuk dianalisis.");
      return;
    }

    if (category === "URL / Link" && !/^(https?:\/\/|www\.)/i.test(value)) {
      setError("Masukkan URL lengkap, misalnya https://contoh.test");
      return;
    }

    if (category === "Nomor Telepon") {
      const digits = value.replace(/\D/g, "");
      if (digits.length < 6 || digits.length > 15) {
        setError("Masukkan nomor telepon yang valid (tanpa kode negara).");
        return;
      }
    }

    setError("");
    setResult(null);
    setStage("checking");
  }

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
    setInput("");
    setResult(null);
    setError("");
    setCheck(0);
    setStage("form");
  }

  function handleCategoryChange(id: AnalysisCategory) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
    setCategory(id);
    setInput("");
    setError("");
  }

  function handleFileChange(file: File | undefined) {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Hanya gambar JPG, PNG, atau WEBP yang didukung.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Ukuran file maksimal 5 MB.");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
  }

  function clearFile() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
  }

  function placeholderForCategory(category: AnalysisCategory) {
    switch (category) {
      case "Pesan / Chat":
        return "Tempel pesan mencurigakan di sini...";
      case "URL / Link":
        return "https://alamat-link.test";
      case "Nomor Telepon":
        return "812 3456 7890";
      case "Cek Kebocoran Email":
        return "johndoe@example.com";
      case "Investasi":
        return "Masukkan nama platform, nama aplikasi, atau deskripsi tawaran investasi (contoh: Janji profit 10% seminggu, bot trading X, dsb.).";
      case "Informasi Lainnya":
        return "Tuliskan klaim, berita, atau konteks gambar yang ingin diperiksa...";
    }
  }

  if (stage === "checking") {
    return (
      <section className="min-h-[calc(100vh-80px)] bg-[#f7f9fc] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 overflow-hidden flex flex-col justify-center">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center py-4 text-center sm:py-8">
          <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-[28px] border border-[#d7e5fa] bg-[#eaf1fc] text-[#2457a6] shadow-lg shadow-blue-900/5">
            <Search size={42} className="animate-pulse" />
            <span className="absolute -inset-2 animate-ping rounded-[34px] border border-[#2457a6]/20" />
            <span className="absolute -inset-4 animate-pulse rounded-[44px] border border-[#2457a6]/10" />
          </div>

          <span className="inline-flex items-center gap-2 rounded-full bg-[#eaf1fc] px-4 py-2 text-[10px] font-extrabold tracking-wider text-[#2457a6]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2457a6]" />
            MEMPROSES
          </span>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-[#17233b] sm:text-4xl">
            Menganalisis informasi...
          </h1>

          <p className="mt-3 max-w-md text-sm leading-7 text-[#667085]">
            Sistem sedang memproses data berdasarkan indikator risiko yang
            tersedia. Mohon tunggu sebentar.
          </p>

          <div className="mt-8 w-full max-w-md">
            <div className="h-2 overflow-hidden rounded-full bg-[#edf1f6]">
              <div
                className="h-full rounded-full bg-linear-to-r from-[#2457a6] via-[#3b73c9] to-[#2457a6] bg-size-[200%_100%] transition-all duration-300 animate-shimmer"
                style={{
                  width: `${
                    (Math.min(check, checkLabels.length) / checkLabels.length) *
                    100
                  }%`,
                }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-[#667085]">
              <span>Memproses</span>
              <span className="tabular-nums">
                {Math.round(
                  (Math.min(check, checkLabels.length) / checkLabels.length) *
                    100,
                )}
                %
              </span>
            </div>
          </div>
        </div>

        {/* CAROUSEL SECTION */}
        <div className="relative w-full max-w-4xl mx-auto mt-8 pb-10">
          <div className="mb-6 text-center">
            <span className="text-[10px] font-extrabold tracking-wider text-[#2457a6]">
              TIPS & FAKTA PENIPUAN
            </span>
          </div>

          {/* Container Carousel dengan Efek Vignette Kiri Kanan */}
          <div
            className="relative w-full h-50 flex items-center justify-center perspective-[1000px]"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
            }}
          >
            {tipsAndFacts.map((tip, i) => {
              // Menghitung posisi relatif terhadap activeTip
              let offset = i - activeTip;
              const len = tipsAndFacts.length;
              // Logika agar carousel berputar (looping)
              if (offset < -Math.floor(len / 2)) offset += len;
              if (offset > Math.floor(len / 2)) offset -= len;

              const isCenter = offset === 0;
              const isLeft = offset === -1;
              const isRight = offset === 1;

              // Sembunyikan card yang posisinya jauh (di luar 3 card yang terlihat)
              if (Math.abs(offset) > 1) return null;

              return (
                <div
                  key={tip.title}
                  className="absolute w-70 sm:w-[320px] transition-all duration-500 ease-out"
                  style={{
                    transform: `
                      translateX(${offset * 55}%) 
                      translateZ(${isCenter ? 0 : -120}px) 
                      rotateY(${offset * 25}deg)
                    `,
                    zIndex: isCenter ? 30 : 20,
                    opacity: isCenter ? 1 : 0.6,
                  }}
                >
                  <div
                    className={`rounded-2xl border p-5 text-left shadow-xl transition-colors duration-300 ${
                      isCenter
                        ? "bg-white border-[#2457a6]"
                        : "bg-[#f7f9fc] border-[#e6eaf0]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          isCenter
                            ? "bg-[#eaf1fc] text-[#2457a6]"
                            : "bg-[#e6eaf0] text-[#98a2b3]"
                        }`}
                      >
                        <AlertTriangle size={16} />
                      </span>
                      <div>
                        <h3
                          className={`text-sm font-bold ${isCenter ? "text-[#17233b]" : "text-[#667085]"}`}
                        >
                          {tip.title}
                        </h3>
                        <p
                          className={`mt-2 text-[11px] leading-5 ${isCenter ? "text-[#667085]" : "text-[#98a2b3]"}`}
                        >
                          {tip.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  if (stage === "result" && result) {
    return (
      <RiskResult
        result={result}
        reset={reset}
        input={
          category === "Nomor Telepon"
            ? buildPhone(country, input)
            : [input, file?.name].filter(Boolean).join("\n")
        }
      />
    );
  }

  return (
    <section className="min-h-[calc(100vh-80px)] bg-[#f7f9fc] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-9 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#e9f7ef] px-4 py-2 text-[10px] font-extrabold tracking-wider text-[#18794e]">
            <ShieldCheck size={14} />
            CEK ANCAMAN
          </span>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-[#17233b] sm:text-4xl lg:text-5xl">
            Cek Sebelum Percaya.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#667085] sm:text-base">
            Masukkan informasi yang mencurigakan. Kami bantu periksa tanda-tanda
            risiko yang mungkin perlu kamu waspadai.
          </p>
        </div>

        <div className="rounded-2xl border border-[#e6eaf0] bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-8">
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

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
            {categories.map(({ id, icon: Icon }) => {
              const isActive = category === id;

              return (
                <button
                  type="button"
                  key={id}
                  onClick={() => handleCategoryChange(id)}
                  aria-pressed={isActive}
                  className={`relative flex min-h-22 flex-col items-start justify-center gap-2 rounded-xl border p-3.5 text-left transition-all duration-200 sm:min-h-24 sm:p-4 ${
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

          <div className="mb-5 flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2457a6] text-sm font-extrabold text-white">
              2
            </span>

            <div>
              <h2 className="text-base font-bold text-[#17233b]">
                {category === "Informasi Lainnya"
                  ? "Pilih gambar dan tambahkan informasi"
                  : "Masukkan informasi"}
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#667085]">
                {category === "Informasi Lainnya"
                  ? "Pilih gambar yang wajib diperiksa. Informasi tambahan bersifat opsional."
                  : "Tempel atau tuliskan informasi yang ingin diperiksa."}
              </p>
            </div>
          </div>

          <>
            {category === "Informasi Lainnya" ? (
              <>
                <div>
                  <span className="text-[11px] font-bold text-[#667085]">
                    Gambar <span className="text-red-600">(wajib)</span>
                  </span>

                  <label
                    htmlFor="file-upload"
                    className="mt-2 flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#c7d4e5] bg-[#f7f9fc] px-4 py-3 text-sm text-[#667085] transition hover:border-[#2457a6] hover:bg-[#eaf1fc] focus-within:border-[#2457a6] focus-within:ring-4 focus-within:ring-[#2457a6]/10"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2457a6] text-white">
                      <Upload size={17} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[#17233b]">
                      {file ? file.name : "Pilih gambar untuk dianalisis..."}
                    </span>
                    <span className="rounded-lg bg-[#2457a6] px-3 py-1.5 text-[11px] font-bold text-white">
                      Browse
                    </span>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(event) =>
                        handleFileChange(event.target.files?.[0])
                      }
                    />
                  </label>

                  {previewUrl && (
                    <div className="relative mt-3 overflow-hidden rounded-xl border border-[#e6eaf0] bg-white">
                      <img
                        src={previewUrl}
                        alt="Preview gambar"
                        className="max-h-72 w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={clearFile}
                        aria-label="Hapus gambar"
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white transition hover:bg-black/80"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  )}

                  <p className="mt-2 text-[10px] leading-5 text-[#98a2b3]">
                    Format: JPG, PNG, WEBP. Maksimal 5 MB.
                  </p>
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="other-info-text"
                    className="mb-2 block text-[11px] font-bold text-[#667085]"
                  >
                    Informasi tambahan (opsional)
                  </label>
                  <textarea
                    id="other-info-text"
                    value={input}
                    onChange={(event) => {
                      setInput(event.target.value);
                      setError("");
                    }}
                    placeholder="Tambahkan konteks atau informasi yang berkaitan dengan gambar..."
                    aria-label="Informasi tambahan (opsional)"
                    maxLength={MAX_TEXT_LENGTH}
                    rows={6}
                    className="min-h-36 w-full resize-y rounded-xl border border-[#e6eaf0] bg-white px-4 py-3 text-sm leading-7 text-[#17233b] outline-none transition placeholder:text-[#a0aaba] focus:border-[#2457a6] focus:ring-4 focus:ring-[#2457a6]/10"
                  />
                </div>
              </>
            ) : category === "Nomor Telepon" ? (
              <div className="flex gap-2">
                <div ref={countryMenuRef} className="relative shrink-0">
                  <button
                    type="button"
                    aria-label="Pilih kode negara"
                    aria-expanded={isCountryMenuOpen}
                    onClick={() => setIsCountryMenuOpen((open) => !open)}
                    className="flex min-h-14 min-w-24 items-center justify-center gap-1 rounded-xl border border-[#e6eaf0] bg-white px-3 text-sm font-semibold text-[#17233b] outline-none transition hover:border-[#b9cbe5] focus:border-[#2457a6] focus:ring-4 focus:ring-[#2457a6]/10"
                  >
                    {selectedCountry?.code}
                    <span
                      className={`text-xs transition-transform ${
                        isCountryMenuOpen ? "rotate-180" : ""
                      }`}
                    >
                      ▾
                    </span>
                  </button>

                  {isCountryMenuOpen && (
                    <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-76 overflow-hidden rounded-lg border border-[#2457a6] bg-white shadow-xl">
                      <div className="p-2">
                        <input
                          type="search"
                          value={countrySearch}
                          onChange={(event) =>
                            setCountrySearch(event.target.value)
                          }
                          placeholder="Ketik kode atau nama negara"
                          aria-label="Cari kode atau nama negara"
                          autoFocus
                          className="h-12 w-full rounded-md border border-[#2457a6] bg-white px-4 text-sm text-[#17233b] outline-none placeholder:text-[#98a2b3] focus:ring-2 focus:ring-[#2457a6]/10"
                        />
                      </div>
                      <div
                        role="listbox"
                        aria-label="Daftar kode negara"
                        className="max-h-64 overflow-y-auto px-2 pb-2"
                      >
                        {filteredCountries.map((item) => (
                          <button
                            type="button"
                            role="option"
                            aria-selected={item.country === country}
                            key={item.country}
                            onClick={() => {
                              setCountry(item.country);
                              setIsCountryMenuOpen(false);
                              setCountrySearch("");
                            }}
                            className={`block w-full rounded-md px-3 py-2.5 text-left text-sm transition hover:bg-[#f1f5f9] ${
                              item.country === country
                                ? "font-bold text-[#2d4f7b]"
                                : "text-[#4b5563]"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                        {filteredCountries.length === 0 && (
                          <p className="px-3 py-3 text-sm text-[#98a2b3]">
                            Negara tidak ditemukan.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <input
                  type="tel"
                  inputMode="tel"
                  value={input}
                  onChange={(event) => {
                    setInput(event.target.value);
                    setError("");
                  }}
                  placeholder={
                    country === "ID" ? "812 3456 7890" : "Nomor telepon lokal"
                  }
                  aria-label="Nomor telepon"
                  className="min-h-14 w-full rounded-xl border border-[#e6eaf0] bg-white px-4 py-3 text-sm text-[#17233b] outline-none transition placeholder:text-[#a0aaba] focus:border-[#2457a6] focus:ring-4 focus:ring-[#2457a6]/10"
                />
              </div>
            ) : category === "URL / Link" ||
              category === "Cek Kebocoran Email" ? (
              <input
                type="text"
                value={input}
                onChange={(event) => {
                  setInput(event.target.value);
                  setError("");
                }}
                placeholder={
                  placeholderForCategory(category) ||
                  "Masukkan informasi di sini..."
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
                placeholder={placeholderForCategory(category)}
                aria-label={`Masukkan ${category}`}
                rows={6}
                className="min-h-36 w-full resize-y rounded-xl border border-[#e6eaf0] bg-white px-4 py-3 text-sm leading-7 text-[#17233b] outline-none transition placeholder:text-[#a0aaba] focus:border-[#2457a6] focus:ring-4 focus:ring-[#2457a6]/10"
              />
            )}

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

          </>

          {error && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3.5 text-xs leading-6 text-red-700"
            >
              <AlertTriangle size={17} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#e6edf6] bg-[#f5f8fc] p-4">
            <LockKeyhole size={18} className="mt-0.5 shrink-0 text-[#2457a6]" />
            <p className="text-[11px] leading-6 text-[#64748b]">
              Jangan masukkan password, PIN, OTP, nomor identitas, atau
              informasi pribadi yang sangat sensitif.
            </p>
          </div>

          <button
            type="button"
            onClick={submit}
            className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2457a6] px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-900/10 transition hover:-translate-y-0.5 hover:bg-[#183d78] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2457a6]"
          >
            <Search size={18} />
            Analisis Sekarang
          </button>

          <p className="mt-3 text-center text-[10px] leading-5 text-[#98a2b3]">
            Data dianalisis secara otomatis menggunakan AI & pemindai heuristik.
            Hasil merupakan pemeriksaan awal berbasis indikator risiko.
          </p>
        </div>
      </div>
    </section>
  );
}

function RiskResult({
  result,
  reset,
  input,
}: {
  result: AnalysisResult;
  reset: () => void;
  input: string;
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
        <button
          type="button"
          onClick={reset}
          className="inline-flex w-fit items-center gap-2 text-xs font-bold text-[#667085] transition hover:text-[#2457a6]"
        >
          <ArrowLeft size={16} />
          Kembali ke pemeriksaan
        </button>

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
              Skor ini adalah indikator heuristik, bukan probabilitas atau bukti
              bahwa informasi pasti penipuan. Gunakan hasil ini sebagai
              pemeriksaan awal.
            </p>
          </div>

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
            <div className="absolute inset-2.25 flex flex-col items-center justify-center rounded-full bg-white">
              <span className="text-3xl font-extrabold tracking-tight text-[#17233b]">
                {result.score}
              </span>
              <span className="text-[10px] font-semibold text-[#667085]">
                DARI 100
              </span>
            </div>
          </div>
        </div>

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
              AI & Pindaian Heuristik
            </strong>
          </div>
        </div>

        <div className="rounded-xl border border-[#e6eaf0] bg-white p-4">
          <span className="text-[10px] font-medium text-[#667085]">
            Informasi yang diperiksa
          </span>
          <strong className="mt-2 block text-sm font-bold text-[#17233b]">
            {" "}
            {input}
          </strong>
        </div>

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
                Berikut beberapa indikator yang terdeteksi dari informasi yang
                kamu masukkan.
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
                Tidak terdeteksi indikator risiko yang signifikan
              </h3>
              <p className="mt-2 text-xs leading-7 text-[#667085]">
                Tetap periksa identitas, konteks, dan kanal pengirim sebelum
                bertindak. Tidak ditemukannya indikator bukan berarti informasi
                pasti aman.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3 rounded-xl border border-[#e6eaf0] bg-white p-4">
          <AlertTriangle size={17} className="mt-0.5 shrink-0 text-[#c58a2b]" />
          <p className="text-[11px] leading-6 text-[#667085]">
            Hasil pemeriksaan ini merupakan alat bantu edukasi dan tidak
            menggantikan verifikasi dari pihak berwenang atau penyedia layanan
            terkait.
          </p>
        </div>

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
