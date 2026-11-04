
"use client";

import {
  AlertCircle,
  LoaderCircle,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";

import type {
  CommunityPost,
  ModerationVerificationStatus,
} from "@/features/community/types";

import {
  formatDate,
  getCategoryLabel,
  getVerificationConfig,
} from "@/features/community/lib/utils";

type ModerationDialogProps = {
  post: CommunityPost | null;
  status: ModerationVerificationStatus;
  note: string;
  submitting: boolean;
  error: string;
  onStatusChange: (status: ModerationVerificationStatus) => void;
  onNoteChange: (note: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export function ModerationDialog({
  post,
  status,
  note,
  submitting,
  error,
  onStatusChange,
  onNoteChange,
  onSubmit,
  onClose,
}: ModerationDialogProps) {
  if (!post) return null;

  const currentVerification = getVerificationConfig(
    post.verificationStatus,
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={19}
                className="text-[var(--brand)]"
              />

              <h2 className="font-bold text-gray-900">
                Verifikasi Laporan
              </h2>
            </div>

            <p className="mt-1 text-xs text-gray-500">
              Periksa informasi dan bukti sebelum menentukan status.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 disabled:opacity-50"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 p-5">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-white px-2 py-1 text-[10px] font-medium text-gray-600">
                {getCategoryLabel(post.category)}
              </span>

              <span className="text-[10px] text-gray-400">
                {formatDate(post.createdAt)}
              </span>
            </div>

            <h3 className="text-sm font-bold text-gray-900">
              {post.title}
            </h3>

            <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-relaxed text-gray-600">
              {post.content}
            </p>

            <p className="mt-3 text-xs text-gray-500">
              Dilaporkan oleh{" "}
              <span className="font-semibold text-gray-700">
                {post.author.username}
              </span>
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">
              Status saat ini
            </label>

            <div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${currentVerification.className}`}
              >
                {currentVerification.label}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="moderation-status"
              className="text-sm font-semibold text-gray-800"
            >
              Ubah status verifikasi
            </label>

            <select
              id="moderation-status"
              value={status}
              onChange={(event) =>
                onStatusChange(
                  event.target.value as ModerationVerificationStatus,
                )
              }
              disabled={submitting}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
            >
              <option value="under_review">Sedang Ditinjau</option>
              <option value="verified">Terverifikasi</option>
              <option value="needs_info">
                Perlu Informasi Tambahan
              </option>
              <option value="rejected">Tidak Terverifikasi</option>
            </select>

            <p className="text-xs leading-relaxed text-gray-500">
              Pilih status berdasarkan hasil pemeriksaan bukti dan
              informasi yang tersedia.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="moderation-note"
                className="text-sm font-semibold text-gray-800"
              >
                Catatan moderator
              </label>

              <span className="text-[10px] text-gray-400">
                {note.length}/2000
              </span>
            </div>

            <textarea
              id="moderation-note"
              value={note}
              onChange={(event) =>
                onNoteChange(event.target.value.slice(0, 2000))
              }
              rows={4}
              maxLength={2000}
              disabled={submitting}
              placeholder="Tuliskan alasan pemeriksaan, informasi yang perlu dilengkapi, atau dasar penilaian..."
              className="w-full resize-y rounded-xl border border-gray-200 p-3 text-sm leading-relaxed outline-none transition placeholder:text-gray-400 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)] disabled:bg-gray-50"
            />

            {(status === "needs_info" || status === "rejected") && (
              <p className="text-xs text-amber-700">
                Catatan wajib diisi untuk status ini.
              </p>
            )}
          </div>

          {error && (
            <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="h-11 rounded-xl border border-gray-200 px-5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <ShieldCheck size={17} />
                  Simpan Verifikasi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
