import Link from "next/link";
import { ArrowLeft, Clock3 } from "lucide-react";

export default function AboutPage() {
  return (
    <section className="bg-[linear-gradient(180deg,#fbfdff_0%,#ffffff_100%)]">
      <div className="mx-auto flex min-h-[calc(100vh-212px)] w-full max-w-[1160px] items-center justify-center px-4 py-16 sm:px-6 lg:px-0 lg:py-20">
        <div className="max-w-[600px] text-center">

          <div className="mx-auto mt-8 grid size-20 place-items-center rounded-sm bg-[#eaf1fc] text-[#2457a6]">
            <Clock3 size={38} strokeWidth={1.7} />
          </div>

          <h1 className="mt-7 text-4xl font-extrabold tracking-[-2px] text-[#17233b] sm:text-5xl">
            Coming Soon
          </h1>

          <Link
            href="/"
            className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#2457a6] px-5 py-3 text-[13px] font-bold !text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#183d78] hover:shadow-lg hover:shadow-[#2457a6]/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2457a6]"
          >
            <ArrowLeft size={17} />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </section>
  );
}
