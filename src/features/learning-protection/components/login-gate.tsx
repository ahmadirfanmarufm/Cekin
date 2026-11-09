"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, CircleStar, LogIn } from "lucide-react";
import { AuthModal } from "@/components/auth/auth-modal";
import { LOGIN_GATE_AFTER_LEVEL } from "@/lib/learning-protection/use-learning-progress";

export function LoginGate({
  open,
  earnedXp,
  onAuthenticated,
  onContinue,
}: {
  open: boolean;
  earnedXp: number;
  onAuthenticated: () => void;
  onContinue: () => void;
}) {
  const [authOpen, setAuthOpen] = useState(false);

  const authOpenRef = useRef(false);
  authOpenRef.current = authOpen;

  const callbackRef = useRef(onAuthenticated);
  callbackRef.current = onAuthenticated;

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Kunci scroll halaman selama gerbang terbuka.
  useEffect(() => {
    if (!open) return;

    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [open]);

  // AuthModal memancarkan "cekin-auth-change" saat login/daftar berhasil.
  useEffect(() => {
    if (!open) return;

    const handle = () => {
      if (!authOpenRef.current) return;

      // Beri jeda singkat agar pesan "Login berhasil" sempat terlihat.
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setAuthOpen(false);
        callbackRef.current();
      }, 600);
    };

    window.addEventListener("cekin-auth-change", handle);

    return () => window.removeEventListener("cekin-auth-change", handle);
  }, [open]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm"
        role="presentation"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-gate-title"
          className="my-auto w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-2xl"
        >
          <div className="bg-[var(--brand-dark)] p-6 text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <CircleStar size={24} className="text-yellow-300" />
            </div>

            <p className="mt-5 text-[10px] font-extrabold tracking-[0.18em] text-white/60">
              {LOGIN_GATE_AFTER_LEVEL} LEVEL SELESAI
            </p>

            <h2 id="login-gate-title" className="mt-2 text-2xl font-extrabold tracking-tight">
              Simpan progres dan XP-mu.
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-white/75">
              Login agar XP tersimpan dan terus bertambah sampai level terakhir.
            </p>
          </div>

          <div className="space-y-4 p-6">
            <div className="flex items-center justify-between rounded-2xl bg-[var(--surface)] px-4 py-3">
              <span className="text-xs font-bold text-[var(--muted)]">XP yang sudah kamu kumpulkan</span>
              <span className="text-lg font-extrabold text-[var(--foreground)]">{earnedXp} XP</span>
            </div>

            <ul className="space-y-2 text-xs leading-relaxed text-[var(--muted)]">
              <li className="flex gap-2">
                <Check size={14} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                XP dan lencana tersimpan di akunmu.
              </li>
              <li className="flex gap-2">
                <Check size={14} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                Progresmu ikut terbawa, tidak mulai dari awal.
              </li>
            </ul>

            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="button button-primary w-full"
            >
              <LogIn size={16} />
              Login dan lanjutkan
            </button>

            <button type="button" onClick={onContinue} className="button button-secondary w-full">
              Lanjut tanpa XP
              <ArrowRight size={16} />
            </button>

            <p className="text-center text-[11px] leading-relaxed text-[var(--muted)]">
              Tanpa login, kamu tetap bisa belajar sampai selesai, tetapi XP tidak dihitung.
            </p>
          </div>
        </div>
      </div>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} initialMode="login" />
    </>
  );
}