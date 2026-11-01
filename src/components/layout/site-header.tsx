"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { AuthModal } from "@/components/auth/auth-modal";

const navigation = [
  { label: "Beranda", href: "/" },
  { label: "Cek Ancaman", href: "/cek-ancaman" },
  { label: "Learning & Protection", href: "/learning-protection" },
  { label: "Tentang Kami", href: "/tentang-kami" },
];

export function SiteHeader() {
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const openLogin = useCallback(() => {
    setIsOpen(false);
    setIsLoginOpen(true);
  }, []);

  const closeLogin = useCallback(() => {
    setIsLoginOpen(false);
  }, []);

  // Menentukan menu yang sedang aktif
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Style navbar berdasarkan active state
  const getNavigationClass = (href: string) => {
    const active = isActive(href);

    return `
      relative flex items-center text-sm font-semibold
      transition-colors duration-200
      ${
        active
          ? "text-blue-700"
          : "text-slate-600 hover:text-blue-600"
      }
    `;
  };

  const getMobileNavigationClass = (href: string) => {
    const active = isActive(href);

    return `
      rounded-lg px-4 py-3 text-sm font-semibold
      transition-all duration-200
      ${
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
      }
    `;
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3"
            onClick={() => setIsOpen(false)}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600 text-white shadow-md shadow-blue-600/20">
              <ShieldCheck size={23} strokeWidth={2.2} />
            </span>

            <span className="flex flex-col">
              <strong className="text-lg leading-tight font-extrabold tracking-wide text-slate-900">
                CEKIN
              </strong>

              <small className="mt-0.5 text-[11px] font-medium tracking-wide text-slate-500">
                Jangan asal percaya
              </small>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden items-center gap-7 lg:flex"
            aria-label="Navigasi utama"
          >
            {navigation.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`${getNavigationClass(item.href)} h-20`}
                >
                  {item.label}

                  {/* Active Indicator */}
                  <span
                    className={`
                      absolute right-0 bottom-0 left-0 h-[3px]
                      rounded-t-full bg-blue-600
                      transition-transform duration-200
                      ${
                        active
                          ? "scale-x-100"
                          : "scale-x-0"
                      }
                    `}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={openLogin}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <UserRound size={17} />
              Login
            </button>

            <Link
              href="/cek-ancaman"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold !text-white shadow-md shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Mulai Cek
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 lg:hidden"
            aria-label={isOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {isOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          id="mobile-navigation"
          className={`
            overflow-hidden border-t border-slate-100 bg-white
            transition-all duration-300 ease-in-out lg:hidden
            ${
              isOpen
                ? "visible max-h-[500px] opacity-100"
                : "invisible max-h-0 border-transparent opacity-0"
            }
          `}
        >
          <nav
            className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4 sm:px-8"
            aria-label="Navigasi mobile"
          >
            {navigation.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={getMobileNavigationClass(item.href)}
                >
                  <span className="flex items-center justify-between">
                    {item.label}

                    {active && (
                      <span className="size-2 rounded-full bg-blue-600" />
                    )}
                  </span>
                </Link>
              );
            })}

            {/* Mobile Actions */}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={openLogin}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
              >
                <UserRound size={17} />
                Login
              </button>

              <Link
                href="/cek-ancaman"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold !text-white shadow-md shadow-blue-600/20 transition-colors hover:bg-blue-700"
              >
                Mulai Cek
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isLoginOpen}
        onClose={closeLogin}
        initialMode="login"
      />
    </>
  );
}