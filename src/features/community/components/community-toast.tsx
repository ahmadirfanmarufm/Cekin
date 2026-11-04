
"use client";

import { useEffect } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";

import type { CommunityToastData } from "@/features/community/types";

type CommunityToastProps = {
  toast: CommunityToastData | null;
  onClose: () => void;
};

export function CommunityToast({
  toast,
  onClose,
}: CommunityToastProps) {
  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(onClose, 4000);

    return () => window.clearTimeout(timeout);
  }, [toast, onClose]);

  if (!toast) return null;

  const config = {
    success: {
      icon: CheckCircle2,
      className: "border-green-200 bg-white text-green-700",
      iconClass: "text-green-600",
    },
    error: {
      icon: AlertCircle,
      className: "border-red-200 bg-white text-red-700",
      iconClass: "text-red-600",
    },
    info: {
      icon: Info,
      className: "border-blue-200 bg-white text-blue-700",
      iconClass: "text-blue-600",
    },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-3 top-4 z-[100] flex justify-center sm:inset-x-auto sm:right-5 sm:top-5 sm:justify-end"
    >
      <div
        className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 ${config.className}`}
      >
        <Icon
          size={20}
          className={`mt-0.5 shrink-0 ${config.iconClass}`}
        />

        <p className="min-w-0 flex-1 text-sm font-medium leading-relaxed">
          {toast.message}
        </p>

        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup notifikasi"
          className="shrink-0 rounded-md p-1 opacity-60 transition hover:bg-gray-100 hover:opacity-100"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
