
import Link from "next/link";
import { ShieldCheck, Search, Gamepad2, Check } from "lucide-react";

import { HeroVisual } from "./hero-visual";

export function HeroSection() {
  return (
    <section className="relative overflow-x-clip bg-[radial-gradient(circle_at_85%_35%,#eaf2ff_0%,transparent_34%),linear-gradient(180deg,#fbfdff_0%,#ffffff_100%)] px-5 sm:px-8 lg:px-10">
      <div className="mx-auto grid min-h-[580px] w-full max-w-[1160px] grid-cols-1 items-center gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:min-h-[620px] lg:grid-cols-[1.05fr_0.95fr] lg:gap-11 lg:px-0 lg:py-[75px]">

        {/* Hero Content */}
        <div className="relative z-10 text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#eaf1fc] px-3 py-2 text-[11px] font-extrabold tracking-wide text-[#2457a6]">
            <ShieldCheck size={14} />
            Ruang aman untuk belajar
          </span>

          <h1 className="mt-6 text-[39px] font-extrabold leading-[1.13] tracking-[-1.8px] text-[#17233b] sm:text-5xl lg:text-[58px] lg:tracking-[-2.5px]">
            Jangan asal percaya.
            <br />
            sebelum di<em className="not-italic text-[#2457a6]"> Cekin</em>.
          </h1>

          <p className="mx-auto mt-5 max-w-[500px] text-sm leading-8 text-[#667085] sm:text-base lg:mx-0">
            Pesan mencurigakan? Link aneh? Telepon tidak dikenal?
            Cekin ancamannya sebelum terlambat.
          </p>

          <div className="mt-7 flex flex-col flex-wrap justify-center gap-3 sm:flex-row lg:justify-start">
            <Link
              href="/cek-ancaman"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#2457a6] px-5 py-3 text-[13px] font-bold !text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#183d78] hover:shadow-lg hover:shadow-[#2457a6]/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2457a6]"
            >
              <Search size={18} />
              Periksa Ancaman
            </Link>

            <Link
              href="/learning-protection"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#cdd9eb] bg-white px-5 py-3 text-[13px] font-bold text-[#2457a6] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b9cbe5] hover:bg-[#eaf1fc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2457a6]"
            >
              <Gamepad2 size={18} />
              Belajar Lewat Simulasi
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-3 lg:justify-start">
            {[
              "Mengetahui Keamanan Data",
              "Input tidak disimpan",
              "Gratis untuk belajar",
            ].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 text-[10px] text-[#667085] sm:text-[11px]"
              >
                <Check size={14} className="shrink-0 text-[#26a269]" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Hero Illustration */}
        <HeroVisual />
      </div>
    </section>
  );
}
