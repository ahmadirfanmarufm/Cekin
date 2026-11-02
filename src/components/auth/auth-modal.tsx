
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  X,
  LogIn,
  UserPlus,
} from "lucide-react";

type AuthMode = "login" | "register";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
}: AuthModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [mode, setMode] = useState<AuthMode>(initialMode);
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setMessage("");
            setShowPassword(false);
        }
    }, [isOpen, initialMode]);

    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
            onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    const switchMode = (nextMode: AuthMode) => {
        setMode(nextMode);
        setMessage("");
        setShowPassword(false);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isSubmitting) return;

        const formData = new FormData(event.currentTarget);

        const payload = mode === "login" 
            ? {
                identifier: String(formData.get("identifier") ?? "").trim(),
                password: String(formData.get("password") ?? ""),
                }
            : {
                username: String(formData.get("username") ?? "").trim(),
                email: String(formData.get("email") ?? "").trim(),
                password: String(formData.get("password") ?? ""),
                };

        setIsSubmitting(true);
        setMessage("");

        try {
            const response = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register",
            {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                credentials: "same-origin",
                body: JSON.stringify(payload),
            }
            );

            const result = await response.json();

            if (!response.ok) {
            setMessage(result.message ?? "Autentikasi gagal.");
            return;
            }

            setMessage(mode === "login"
                ? "Login berhasil! Selamat belajar kembali."
                : "Akun berhasil dibuat. Selamat datang di CEKIN!"
            );

            window.dispatchEvent(new Event("cekin-auth-change"));

            window.setTimeout(() => {
            onClose();
            }, 700);
        } catch {
            setMessage("Tidak dapat terhubung ke server. Coba lagi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto overscroll-contain bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
            onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
                onClose();
            }
            }}
        >
            <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
            className="relative my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[440px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/25 sm:max-h-[calc(100dvh-2.5rem)] sm:rounded-3xl"
            >
            {/* Header */}
            <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-emerald-600 px-6 pb-6 pt-7 text-white sm:px-8 sm:pb-7 sm:pt-8">
                <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full border-[30px] border-white/10" />
                <div className="pointer-events-none absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Tutup modal"
                    className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                    <X size={19} />
                </button>

                <div className="relative z-10">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/15 shadow-lg backdrop-blur-sm sm:h-14 sm:w-14 sm:rounded-2xl">
                    <ShieldCheck size={27} strokeWidth={2} />
                    </div>

                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[2px] text-blue-100 sm:text-xs">
                    {mode === "login" ? "Your Learning Journey" : "Join the Experience"}
                    </p>

                    <h2
                    id="auth-title"
                    className="text-2xl font-extrabold tracking-tight sm:text-3xl"
                    >
                    {mode === "login" ? "Selamat Datang!" : "Buat Akun CEKIN"}
                    </h2>
                </div>
            </div>

            {/* Scrollable Form Content */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 sm:px-8 sm:py-7">
                {/* Mode Switch */}
                <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                    <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition-all ${
                        mode === "login"
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                    >
                    <LogIn size={16} />
                    Login
                    </button>

                    <button
                    type="button"
                    onClick={() => switchMode("register")}
                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition-all ${
                        mode === "register"
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                    >
                    <UserPlus size={16} />
                    Register
                    </button>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-3.5 my-4">
                    <ShieldCheck
                    size={19}
                    className="mt-0.5 shrink-0 text-emerald-600"
                    />
                    <p className="text-xs leading-relaxed text-emerald-800">
                    Sebaiknya gunakan email dan password khusus CEKIN, bukan akun utamamu.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username - Register */}
                {mode === "register" && (
                    <div>
                    <label
                        htmlFor="auth-username"
                        className="mb-2 block text-sm font-bold text-slate-700"
                    >
                        Username
                    </label>

                    <div className="relative">
                        <UserRound
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                        id="auth-username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        placeholder="Masukkan username"
                        minLength={3}
                        maxLength={30}
                        pattern="[A-Za-z0-9_]+"
                        title="Username hanya boleh berisi huruf, angka, dan underscore."
                        required
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        />
                    </div>

                    <p className="mt-1.5 text-[11px] text-slate-400">
                        Gunakan minimal 3 karakter tanpa spasi.
                    </p>
                    </div>
                )}

                {/* Email / Username - Login */}
                <div>
                    <label
                    htmlFor="auth-identifier"
                    className="mb-2 block text-sm font-bold text-slate-700"
                    >
                    {mode === "login" ? "Username atau Email" : "Email"}
                    </label>

                    <div className="relative">
                    {mode === "login" ? (
                        <UserRound
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                    ) : (
                        <Mail
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                    )}

                    <input
                        id="auth-identifier"
                        name={mode === "login" ? "identifier" : "email"}
                        type={mode === "login" ? "text" : "email"}
                        autoComplete={
                        mode === "login" ? "username" : "email"
                        }
                        placeholder={
                        mode === "login"
                            ? "Masukkan username atau email"
                            : "nama@email.com"
                        }
                        required
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                    <label
                        htmlFor="auth-password"
                        className="block text-sm font-bold text-slate-700"
                    >
                        Password
                    </label>

                    {mode === "login" && (
                        <button
                        type="button"
                        onClick={() =>
                            setMessage(
                            "Fitur lupa password belum terhubung dengan sistem autentikasi."
                            )
                        }
                        className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-800"
                        >
                        Lupa password?
                        </button>
                    )}
                    </div>

                    <div className="relative">
                    <LockKeyhole
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        id="auth-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                        }
                        placeholder="Masukkan password"
                        minLength={8}
                        required
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-12 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />

                    <button
                        type="button"
                        aria-label={
                        showPassword
                            ? "Sembunyikan password"
                            : "Tampilkan password"
                        }
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                    >
                        {showPassword ? (
                        <EyeOff size={18} />
                        ) : (
                        <Eye size={18} />
                        )}
                    </button>
                    </div>

                    {mode === "register" && (
                    <p className="mt-1.5 text-[11px] text-slate-400">
                        Password minimal 8 karakter.
                    </p>
                    )}
                </div>

                {/* Message */}
                {message && (
                    <p
                    role="status"
                    className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-700"
                    >
                    {message}
                    </p>
                )}

                {/* Submit */}
                <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? (
                        <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Memproses...
                        </>
                    ) : (
                        <>
                        {mode === "login" ? (
                            <>
                            <LogIn size={18} />
                            Masuk ke Akun
                            </>
                        ) : (
                            <>
                            <UserPlus size={18} />
                            Buat Akun
                            </>
                        )}

                        <ArrowRight size={17} />
                        </>
                    )}
                </button>
                </form>
            </div>
            </section>
        </div>,
        document.body
    );
}
