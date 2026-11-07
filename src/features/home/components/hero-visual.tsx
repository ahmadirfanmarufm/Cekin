
import {
  AlertTriangle,
  Link2,
  ShieldCheck,
  Home,
  Check,
  Search,
  Wifi,
  BatteryFull,
  Signal,
  LockKeyhole,
  BookOpen,
  Brain,
} from "lucide-react";
import Image from "next/image";

export function HeroVisual() {
  return (
    <div
      className="relative mx-auto grid min-h-[450px] w-full max-w-[440px] place-items-center overflow-visible sm:min-h-[490px] lg:min-h-[520px]"
      aria-label="Ilustrasi iPhone yang menampilkan analisis pesan mencurigakan oleh CEKIN"
    >
      {/* Background Decoration */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#c9d8ee] sm:size-[350px]" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#eaf2ff]/70 blur-2xl sm:size-[280px]" />

      {/* iPhone Container */}
      <div className="relative z-10 w-[min(64vw,245px)] rotate-[-5deg] transition-transform duration-500 hover:rotate-[-2deg] sm:w-[250px]">

        {/* Left Side Buttons */}
        <div className="absolute -left-[7px] top-[23%] z-0 h-5 w-[4px] rounded-l-md bg-[#64748b] shadow-sm" />

        <div className="absolute -left-[7px] top-[30%] z-0 h-7 w-[4px] rounded-l-md bg-[#64748b] shadow-sm" />

        <div className="absolute -left-[7px] top-[38%] z-0 h-7 w-[4px] rounded-l-md bg-[#64748b] shadow-sm" />

        {/* Right Power Button */}
        <div className="absolute -right-[7px] top-[32%] z-0 h-14 w-[4px] rounded-r-md bg-[#64748b] shadow-sm" />

        {/* iPhone Body */}
        <div className="relative z-10 rounded-[38px] border-[5px] border-[#26364d] bg-[#26364d] p-[4px] shadow-[0_30px_80px_rgba(36,87,166,0.25)] sm:rounded-[43px] sm:border-[6px] sm:p-[5px]">

          {/* Screen */}
          <div className="relative min-h-[440px] overflow-hidden rounded-[30px] bg-[#f8faff] sm:min-h-[465px] sm:rounded-[35px]">

            {/* Screen Content */}
            <div className="px-3 pb-[82px] sm:px-3.5">

              {/* Status Bar */}
              <div className="relative flex h-10 items-center justify-between px-2 pt-1 text-[#17233b]">
                <span className="text-[10px] font-bold">9:41</span>

                {/* Dynamic Island */}
                <div className="absolute left-1/2 top-2 h-[19px] w-[75px] -translate-x-1/2 rounded-full bg-[#111827] sm:w-[80px]" />

                <div className="flex items-center gap-1">
                  <Signal size={11} />
                  <Wifi size={11} />
                  <BatteryFull size={14} />
                </div>
              </div>

              {/* App Header */}
              <div className="flex items-center justify-between px-1 pb-3 pt-2">
                <div className="flex items-center gap-2">
                  <Image
                    src="/logo_cekin.webp"
                    alt="CEKIN"
                    width={140}
                    height={40}
                    priority
                    className="h-7 w-auto"
                  />

                  <div>
                    <p className="text-[11px] font-extrabold tracking-tight text-[#17233b]">
                      CEKIN
                    </p>
                    <p className="text-[8px] text-[#8490a3]">
                      Jangan asal percaya
                    </p>
                  </div>
                </div>

                <div className="grid size-7 place-items-center rounded-full bg-white text-[#667085] shadow-sm">
                  <LockKeyhole size={12} />
                </div>
              </div>

              {/* Notification */}
              <div className="mb-3 rounded-2xl border border-[#f4d9d6] bg-white p-3 shadow-[0_5px_15px_rgba(30,50,80,0.05)]">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-[#98a2b3]">
                    Pesan masuk
                  </span>
                  <span className="text-[8px] text-[#98a2b3]">
                    Sekarang
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#fff0ee] text-[#dc5555]">
                    <AlertTriangle size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold text-[#17233b]">
                      Selamat! Kamu menang hadiah!
                    </p>
                    <p className="mt-0.5 truncate text-[9px] text-[#8490a3]">
                      Klik link berikut untuk klaim...
                    </p>
                  </div>
                </div>
              </div>

              {/* Analysis Card */}
              <div className="rounded-2xl border border-[#e6ebf3] bg-white p-3 shadow-[0_5px_15px_rgba(30,50,80,0.04)]">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold text-[#17233b]">
                      Hasil Analisis
                    </p>
                    <p className="mt-0.5 text-[8px] text-[#98a2b3]">
                      Pemeriksaan pesan
                    </p>
                  </div>

                  <div className="grid size-8 place-items-center rounded-xl bg-[#eaf2ff] text-[#2457a6]">
                    <ShieldCheck size={17} />
                  </div>
                </div>

                {/* Risk Status */}
                <div className="mb-3 flex items-center gap-2 rounded-xl bg-[#fff2ef] p-2.5">
                  <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#dc5555] text-white">
                    <AlertTriangle size={15} />
                  </div>

                  <div>
                    <p className="text-[10px] font-extrabold text-[#b84a4a]">
                      Risiko Terdeteksi
                    </p>
                    <p className="text-[8px] text-[#a56b68]">
                      Waspada terhadap pesan ini
                    </p>
                  </div>
                </div>

                {/* Analysis Details */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Link2 size={13} className="shrink-0 text-[#dc5555]" />
                    <span className="flex-1 text-[9px] text-[#667085]">
                      Tujuan link mencurigakan
                    </span>
                    <AlertTriangle size={12} className="text-[#dc5555]" />
                  </div>

                  <div className="flex items-center gap-2">
                    <ShieldCheck size={13} className="shrink-0 text-[#26a269]" />
                    <span className="flex-1 text-[9px] text-[#667085]">
                      Pemeriksaan berhasil
                    </span>
                    <Check size={12} className="text-[#26a269]" />
                  </div>
                </div>

                {/* Fake Link */}
                <div className="mt-3 rounded-lg bg-[#f5f8fc] px-2.5 py-2">
                  <p className="text-[8px] text-[#98a2b3]">
                    Alamat link
                  </p>
                  <p className="mt-0.5 truncate text-[9px] font-semibold text-[#b84a4a]">
                    klik-sekarang.example
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-[#edf0f5] bg-white px-2 pb-5 pt-2.5">
              <div className="flex items-center justify-around">
                <div className="flex flex-col items-center gap-1 text-[#2457a6]">
                  <Home size={15} />
                  <span className="text-[7px] font-bold">
                    Beranda
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1 text-[#a0aaba]">
                  <Search size={15} />
                  <span className="text-[7px]">
                    Cek Ancaman
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1 text-[#a0aaba]">
                  <Brain size={15} />
                  <span className="text-[7px]">
                    Learning & Protection
                  </span>
                </div>
              </div>
            </div>

            {/* iPhone Home Indicator */}
            <div className="absolute bottom-[5px] left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-[#17233b]" />
          </div>
        </div>
      </div>

      {/* Floating Shield */}
      <div className="cekin-float absolute bottom-[13%] right-[7%] z-20 grid size-[65px] rotate-[9deg] place-items-center rounded-[21px] border-[5px] border-white bg-gradient-to-br from-blue-600 to-emerald-500 transition-transform duration-300 hover:scale-105 text-white shadow-[0_15px_35px_rgba(36,87,166,0.25)] sm:bottom-[12%] sm:right-[8%] sm:size-[85px] sm:rounded-[27px] sm:border-[7px]">
        <ShieldCheck size={34} className="sm:hidden" />
      </div>

      {/* Suspicious Message Badge */}
      <div className="cekin-float absolute right-0 top-[14%] z-30">
        <div className="inline-flex items-center gap-1.5 rounded-xl border border-[#e6eaf0] bg-white px-2.5 py-2 text-[8px] font-bold text-[#dc5555] shadow-lg shadow-slate-900/5 transition-transform duration-300 hover:scale-105 sm:right-1 sm:px-3.5 sm:py-2.5 sm:text-[10px]">
          <AlertTriangle size={13} />
          Pesan mencurigakan
        </div>
      </div>

      {/* Protected Badge */}
      <div className="cekin-float-delay absolute bottom-[8%] left-0 z-30">
        <div className="inline-flex items-center gap-1.5 rounded-xl border border-[#e6eaf0] bg-white px-2.5 py-2 text-[8px] font-bold text-[#26a269] shadow-lg shadow-slate-900/5 transition-transform duration-300 hover:scale-105 sm:bottom-[7%] sm:left-1 sm:px-3.5 sm:py-2.5 sm:text-[10px]">
          <BookOpen size={13} />
          Cara untuk tidak mudah ketipu
        </div>
      </div>
    </div>
  );
}
