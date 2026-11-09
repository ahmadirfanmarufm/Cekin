
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import Image from "next/image";

const footerNavigation = [
  {
    title: "Jelajahi",
    links: [
      { label: "Cek Ancaman", href: "/cek-ancaman" },
      { label: "Simulasi Interaktif", href: "/learning-protection" },
      { label: "Pusat Bantuan", href: "/emergency" },
    ],
  },
  {
    title: "Informasi",
    links: [
      { label: "Tentang cekin", href: "/tentang-kami" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-[#14243e] pt-12 text-white sm:pt-16">
      <div className="mx-auto w-full max-w-[1160px] px-4 px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-2 gap-x-5 gap-y-9 border-b border-white/10 pb-9 sm:gap-x-10 sm:gap-y-10 lg:grid-cols-[1.5fr_0.85fr_0.95fr_1.25fr] lg:gap-12 lg:pb-12">
          {/* Brand */}
          <div className="col-span-2 flex flex-col items-start lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <Image
                src="/logo_cekin_white.webp"
                alt="CEKIN"
                width={140}
                height={40}
                priority
                className="h-13 w-auto"
              />
              

              <span className="flex flex-col gap-1">
                <strong className="text-lg font-extrabold tracking-tight text-white">
                  CEKIN
                </strong>

                <small className="text-[10px] font-medium text-[#b9c5d6]">
                  Jangan asal percaya, sebelum dicekin!
                </small>
              </span>
            </Link>

            <p className="mt-5 max-w-[300px] text-xs leading-[1.9] text-[#b9c5d6]">
              Ruang aman untuk mengenali ancaman digital, belajar dari
              simulasi, dan membangun kebiasaan berinternet dengan lebih
              bijak.
            </p>
          </div>

          {/* Navigation */}
          {footerNavigation.map((group) => (
            <div className="flex min-w-0 flex-col items-start" key={group.title}>
              <h3 className="mb-4 mt-1 text-xs font-bold tracking-wide text-white sm:mb-5 sm:text-[13px]">
                {group.title}
              </h3>

              <ul className="flex flex-col gap-3 sm:gap-3.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-block text-[11px] leading-relaxed text-[#b9c5d6] transition-all duration-200 hover:translate-x-1 hover:text-white sm:text-xs"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                </ul>
            </div>
          ))}

          {/* Security information */}
          <div className="col-span-2 flex min-w-0 flex-col items-start lg:col-span-1">
            <h3 className="mb-4 mt-1 text-xs font-bold tracking-wide text-white sm:mb-5 sm:text-[13px]">
              Sumber Keamanan
            </h3>

            <p className="max-w-[270px] text-[11px] leading-[1.8] text-[#b9c5d6] sm:text-xs">
              Gunakan kanal resmi bank, platform, dan pihak berwenang untuk
              melakukan verifikasi informasi.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex min-h-[68px] flex-col justify-center gap-2 py-4 text-[10px] text-[#b9c5d6] sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:text-[11px]">
          <p>© 2026 CEKIN. All rights reserved.</p>
          <p>Dibuat untuk internet yang lebih aman.</p>
        </div>
      </div>
    </footer>
  );
}
