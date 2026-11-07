import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <section className="bg-[linear-gradient(180deg,#fbfdff_0%,#ffffff_100%)]">
      <div className="mx-auto flex min-h-[calc(100vh-212px)] w-full max-w-[1160px] items-center justify-center px-4 py-16 sm:px-6 lg:px-0 lg:py-20">
        <div className="max-w-[560px] text-center">

          <p className="mt-7 text-[clamp(72px,13vw,132px)] font-extrabold leading-[0.85] tracking-[-8px] text-[#dfeafb]">
            404
          </p>

          <h1 className="mt-5 text-3xl font-extrabold tracking-[-1.5px] text-[#17233b] sm:text-4xl">
            Halamannya belum ketemu.
          </h1>

          <p className="mx-auto mt-4 max-w-[480px] text-sm leading-7 text-[#667085]">
            Sepertinya halaman yang kamu cari tersesat di internet. Tenang,
            CEKIN siap mengarahkanmu kembali.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#2457a6] px-5 py-3 text-[13px] font-bold !text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#183d78] hover:shadow-lg hover:shadow-[#2457a6]/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2457a6]"
            >
              <Home size={17} />
              Kembali ke Beranda
            </Link>

            <Link
              href="/cek-ancaman"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#cdd9eb] bg-white px-5 py-3 text-[13px] font-bold text-[#2457a6] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b9cbe5] hover:bg-[#eaf1fc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2457a6]"
            >
              <Search size={17} />
              Cek Ancaman
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
