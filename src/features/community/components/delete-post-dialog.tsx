"use client";

import { useState, type KeyboardEvent } from "react";
import {
  AlertTriangle,
  LoaderCircle,
  Trash2,
  X,
} from "lucide-react";

type DeletePostDialogProps = {
  postTitle: string;
  submitting: boolean;
  error: string;
  onConfirm: () => void;
  onClose: () => void;
};

export function DeletePostDialog({
  postTitle,
  submitting,
  error,
  onConfirm,
  onClose,
}: DeletePostDialogProps) {
  const [shakeKey, setShakeKey] = useState(0);

  const handleBackdropClick = () => {
    if (submitting) return;

    setShakeKey((current) => current + 1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();

      if (!submitting) {
        setShakeKey((current) => current + 1);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleBackdropClick();
        }
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        key={shakeKey}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-post-title"
        className="animate-[community-modal-shake_350ms_ease-in-out] w-full max-w-md rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 size={21} />
            </div>

            <div>
              <h2
                id="delete-post-title"
                className="font-bold text-gray-900"
              >
                Hapus postingan?
              </h2>

              <p className="mt-0.5 text-xs text-gray-500">
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Tutup dialog hapus"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        {/* Confirmation content */}
        <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-3.5">
          <div className="flex gap-2.5">
            <AlertTriangle
              size={17}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div className="min-w-0">
              <p className="text-xs font-semibold text-red-800">
                Kamu yakin ingin menghapus postingan ini?
              </p>

              <p className="mt-1 break-words text-sm leading-relaxed text-red-700">
                &ldquo;{postTitle}&rdquo;
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-gray-500">
          Postingan, foto atau video bukti, komentar, dan reaksi
          yang terkait akan dihapus secara permanen.
        </p>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-relaxed text-red-700"
          >
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
                type="button"
                onClick={onConfirm}
                disabled={submitting}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {submitting ? (
                <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Menghapus...
                </>
                ) : (
                <>
                    <Trash2 size={16} />
                    Ya, hapus postingan
                </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
}