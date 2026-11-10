
import Link from "next/link";
import {
  Mail,
  MessageSquare,
  BugPlay,
  Phone,
  Dices,
  Wallet,
  ArrowRight,
} from "lucide-react";

const modes = [
  {
    title: "Phishing",
    description: "Link palsu yang mencuri data",
    icon: Mail,
    href: "/learning-protection/phishing-attack",
  },
  {
    title: "Lowongan palsu",
    description: "Deposit untuk pekerjaan fiktif",
    icon: MessageSquare,
    href: "/learning-protection/trust-lab",
  },
  {
    title: "Aplikasi",
    description: "APK dan izin berbahaya",
    icon: BugPlay,
    href: "/learning-protection/apps-scam",
  },
  {
    title: "Telepon penipuan",
    description: "Penelepon menyamar",
    icon: Phone,
    href: "/learning-protection/spam-call",
  },
  {
    title: "Judi online",
    description: "Manipulasi dan loss chasing",
    icon: Dices,
    href: "/learning-protection/online-gambling",
  },
  {
    title: "Investasi palsu",
    description: "Untung tinggi tanpa risiko",
    icon: Wallet,
    href: "/learning-protection/mind-trap",
  },
];

export function ThreatModes() {
  return (
    <section className="bg-[#f7f9fc] py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1160px] px-5 sm:px-8 md:px-10 xl:px-0">
        <div className="mb-8 flex flex-col gap-3 sm:mb-9 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <div>
            <span className="inline-flex rounded-full bg-[#eaf1fc] px-3 py-2 text-[11px] font-extrabold tracking-wide text-[#2457a6]">
              MODUS DIGITAL
            </span>

            <h2 className="mt-4 text-[27px] font-extrabold leading-tight tracking-tight text-[#17233b] sm:text-3xl">
              Kenali modus yang sering terjadi
            </h2>
          </div>

          <p className="max-w-[360px] text-sm leading-7 text-[#667085]">
            Kenali polanya sebelum pelaku mengendalikan keputusanmu.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {modes.map((mode) => {
            const Icon = mode.icon;

            return (
              <Link
                key={mode.title}
                href={mode.href}
                className="group grid min-h-[80px] grid-cols-[44px_minmax(0,1fr)_20px] items-center gap-3 rounded-[15px] border border-[#e6eaf0] bg-white p-4 text-[#667085] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c4d6f1] hover:shadow-[0_10px_25px_rgba(20,35,60,0.05)] sm:min-h-[88px]"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-[#eaf1fc] text-[#2457a6]">
                  <Icon size={21} />
                </span>

                <span className="min-w-0">
                  <strong className="mb-1 block text-xs font-bold text-[#17233b]">
                    {mode.title}
                  </strong>

                  <small className="block text-[10px] leading-relaxed text-[#667085]">
                    {mode.description}
                  </small>
                </span>

                <ArrowRight
                  size={17}
                  className="text-[#98a5b7] transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#2457a6]"
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
