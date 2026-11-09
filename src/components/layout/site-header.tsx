
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  ShieldCheck,
  UserRound,
  ChevronDown,
  LogOut,
  GraduationCap,
  Loader2,
} from "lucide-react";

import { AuthModal } from "@/components/auth/auth-modal";
import { NotificationBell } from "@/features/community/components/notification-bell";
import Image from "next/image";

type AuthUser = {
  id: string;
  username: string;
  email: string;
  totalXp: number;
};

const navigation = [
  { label: "Beranda", href: "/" },
  { label: "Cek Ancaman", href: "/threat-check" },
  { label: "Learning & Protection", href: "/learning-protection" },
  { label: "Komunitas", href: "/community" },
  { label: "Tentang Kami", href: "/about-us" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const handleOpenNotificationPost = (postId: string) => {
    router.push(`/community?postId=${encodeURIComponent(postId)}`);

    window.dispatchEvent(
        new CustomEvent("community:open-post", {
            detail: { postId },
        }),
    );
};

  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const result = await response.json();
      setUser(result.user ?? null);
    } catch (error) {
      console.error("AUTH_STATUS_ERROR:", error);
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();

    const handleAuthChange = () => {
      fetchCurrentUser();
    };

    window.addEventListener("cekin-auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("cekin-auth-change", handleAuthChange);
    };
  }, [fetchCurrentUser]);

  const openLogin = useCallback(() => {
    setIsOpen(false);
    setIsUserMenuOpen(false);
    setIsLoginOpen(true);
  }, []);

  const closeLogin = useCallback(() => {
    setIsLoginOpen(false);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "Logout gagal.");
      }

      setUser(null);
      setIsUserMenuOpen(false);
      setIsOpen(false);

      window.dispatchEvent(new Event("cekin-auth-change"));
    } catch (error) {
      console.error("LOGOUT_ERROR:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Tidak dapat melakukan logout. Silakan coba lagi."
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

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
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl px-5 sm:px-8 md:px-10 xl:px-0">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1"
            onClick={() => {
              setIsOpen(false);
              setIsUserMenuOpen(false);
            }}
          >
            <Image
              src="/logo_cekin.webp"
              alt="CEKIN"
              width={140}
              height={40}
              priority
              className="h-13 w-auto"
            />

            <span className="flex flex-col">
              <strong className="text-lg leading-tight font-extrabold tracking-wide text-[var(--brand)]">
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

                  <span
                    className={`
                      absolute right-0 bottom-0 left-0 h-[3px]
                      rounded-t-full bg-blue-600
                      transition-transform duration-200
                      ${active ? "scale-x-100" : "scale-x-0"}
                    `}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 lg:flex">
            <NotificationBell
              enabled={Boolean(user)}
              onOpenPost={handleOpenNotificationPost}
            />

            {!authLoading && !user && (
              <button
                type="button"
                onClick={openLogin}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <UserRound size={17} />
                Login
              </button>
            )}

            {authLoading && (
              <span className="flex h-10 w-28 items-center justify-center">
                <Loader2 size={18} className="animate-spin text-slate-400" />
              </span>
            )}

            {user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 transition-all hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <UserRound size={19} />
                  </span>

                  <span className="flex max-w-28 flex-col items-start">
                    <strong className="max-w-full truncate text-sm font-bold text-slate-800">
                      {user.username}
                    </strong>
                    <small className="text-[11px] text-slate-500">
                      Akun CEKIN
                    </small>
                  </span>

                  <ChevronDown
                    size={16}
                    className={`text-slate-500 transition-transform ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Tutup menu akun"
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setIsUserMenuOpen(false)}
                    />

                    <div
                      role="menu"
                      className="absolute top-full right-0 z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10"
                    >
                      <div className="border-b border-slate-100 px-3 py-3">
                        <p className="truncate text-sm font-bold text-slate-800">
                          {user.username}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {user.email}
                        </p>
                        <p className="mt-2 text-xs font-semibold text-blue-700">
                          {user.totalXp} XP
                        </p>
                      </div>

                      <Link
                        href="/learning-protection"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                      >
                        <GraduationCap size={18} />
                        Learning & Protection
                      </Link>

                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isLoggingOut ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <LogOut size={18} />
                        )}

                        {isLoggingOut ? "Sedang logout..." : "Logout"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <Link
              href="/threat-check"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold !text-white shadow-md shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Mulai Cek
            </Link>
          </div>

          {/* Mobile Menu Button */}
          {/* Mobile Actions */}
          <div className="flex items-center gap-2 lg:hidden">
            <NotificationBell
              enabled={Boolean(user)}
              onOpenPost={handleOpenNotificationPost}
            />

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              aria-label={isOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              onClick={() => {
                setIsOpen((prev) => !prev);
                setIsUserMenuOpen(false);
              }}
            >
              {isOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          id="mobile-navigation"
          className={`
            overflow-hidden border-t border-slate-100 bg-white
            transition-all duration-300 ease-in-out lg:hidden
            ${
              isOpen
                ? "visible max-h-[650px] opacity-100"
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

            {/* Mobile Account */}
            {!authLoading && user && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <UserRound size={21} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">
                      {user.username}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user.email}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-blue-700">
                      {user.totalXp} XP
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link
                    href="/learning-protection"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    <GraduationCap size={16} />
                    Belajar
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60"
                  >
                    {isLoggingOut ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <LogOut size={15} />
                    )}
                    Logout
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Actions: Guest */}
            {!authLoading && !user && (
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
                  href="/threat-check"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold !text-white shadow-md shadow-blue-600/20 transition-colors hover:bg-blue-700"
                >
                  Mulai Cek
                </Link>
              </div>
            )}

            {/* Mobile Actions: Loading */}
            {authLoading && (
              <div className="mt-3 flex justify-center border-t border-slate-100 pt-4">
                <Loader2 size={20} className="animate-spin text-blue-600" />
              </div>
            )}
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
