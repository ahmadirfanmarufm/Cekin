
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";

export function EmergencyBanner() {
  return (
    <section className="mx-auto w-full max-w-[1160px] px-4 py-12 sm:px-6 sm:py-16 lg:px-0 lg:py-20">
      <div className="grid grid-cols-1 items-center gap-5 rounded-[20px] border border-[#d9eee2] bg-gradient-to-r from-[#effaf4] to-[#f7fbff] p-5 sm:p-7 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-6 lg:p-8">
        <div className="grid size-12 shrink-0 place-items-center rounded-[15px] bg-[#e9f7ef] text-[#26a269] sm:size-[58px] sm:rounded-[17px]">
          <Heart size={28} className="sm:hidden" />
        </div>

        <div className="min-w-0">
          <small className="text-[10px] font-extrabold tracking-[1px] text-[#21875d]">
            SUDAH TERLANJUR?
          </small>

          <h2 className="mt-2 text-xl font-extrabold leading-snug tracking-tight text-[#17233b] sm:text-2xl lg:text-[27px]">
            Jangan panik. Ambil langkah aman.
          </h2>

          <p className="mt-2 text-xs leading-relaxed text-[#667085] sm:text-sm">
            Dapatkan panduan singkat sesuai kejadian yang kamu alami.
          </p>
        </div>

        <Link
          href="/emergency"
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#cdd9eb] bg-white px-5 py-3 text-center text-[13px] font-bold text-[#2457a6] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b9cbe5] hover:bg-[#eaf1fc] hover:text-[#183d78] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2457a6] sm:w-fit lg:whitespace-nowrap"
        >
          Buka Pusat Bantuan
          <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  );
}
