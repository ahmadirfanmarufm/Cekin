
import Link from "next/link";
import { Search, Brain, ArrowRight } from "lucide-react";

export function PrimaryFeatures() {
  return (
    <section className="mx-auto w-full max-w-[1160px] py-16 sm:py-20 px-5 sm:px-8 md:px-10 xl:px-0">
      <div className="mx-auto mb-9 max-w-[650px] text-center">
        <span className="inline-flex items-center rounded-full bg-[#eaf1fc] px-3 py-2 text-[11px] font-extrabold tracking-wide text-[#2457a6]">
          Apa yang kamu butuhkan?
        </span>

        <h2 className="mt-4 text-[27px] font-extrabold leading-tight tracking-tight text-[#17233b] sm:text-3xl">
          Apa yang ingin kamu lakukan hari ini?
        </h2>

        <p className="mx-auto mt-3 max-w-[550px] text-sm leading-7 text-[#667085]">
          Dua cara sederhana untuk membuat keputusan digital yang lebih aman.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        <Link
          href="/threat-check"
          className="group relative flex min-h-[260px] flex-col items-start overflow-hidden rounded-[20px] border border-[#e6eaf0] bg-gradient-to-br from-[#f3f7ff] to-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#c4d6f1] hover:shadow-[0_18px_45px_rgba(20,35,60,0.08)] sm:min-h-[290px] sm:p-7"
        >
          <span className="mb-6 grid size-[58px] place-items-center rounded-[17px] bg-[#eaf1fc] text-[#2457a6]">
            <Search size={34} />
          </span>

          <div className="relative z-10">
            <small className="text-[10px] font-extrabold tracking-[1px] text-[#2457a6]">
              PERIKSA INFORMASI
            </small>

            <h2 className="mt-2 text-[22px] font-extrabold leading-snug text-[#17233b] sm:text-[25px]">
              Cek Ancaman
            </h2>

            <p className="mt-2 max-w-[420px] text-[13px] leading-7 text-[#667085]">
              Periksa pesan, link, nomor telepon, dan tawaran mencurigakan.
            </p>

            <span className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-[#2457a6]">
              Mulai Periksa
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </span>
          </div>

          <span className="pointer-events-none absolute bottom-2 right-6 text-[65px] font-extrabold leading-none tracking-[-4px] text-[#2457a6]/[0.08]">
            01
          </span>
        </Link>

        <Link
          href="/learning-protection"
          className="group relative flex min-h-[260px] flex-col items-start overflow-hidden rounded-[20px] border border-[#e6eaf0] bg-gradient-to-br from-[#effaf4] to-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#bde6ce] hover:shadow-[0_18px_45px_rgba(20,35,60,0.08)] sm:min-h-[290px] sm:p-7"
        >
          <span className="mb-6 grid size-[58px] place-items-center rounded-[17px] bg-[#e9f7ef] text-[#26a269]">
            <Brain size={34} />
          </span>

          <div className="relative z-10">
            <small className="text-[10px] font-extrabold tracking-[1px] text-[#26a269]">
              COBA LANGSUNG
            </small>

            <h2 className="mt-2 text-[22px] font-extrabold leading-snug text-[#17233b] sm:text-[25px]">
              Belajar Lewat Simulasi
            </h2>

            <p className="mt-2 max-w-[420px] text-[13px] leading-7 text-[#667085]">
              Rasakan bagaimana modus penipuan bekerja dan pilih tindakan
              yang aman.
            </p>

            <span className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-[#26a269]">
              Coba Simulasi
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </span>
          </div>

          <span className="pointer-events-none absolute bottom-2 right-6 text-[65px] font-extrabold leading-none tracking-[-4px] text-[#26a269]/[0.09]">
            02
          </span>
        </Link>
      </div>
    </section>
  );
}
