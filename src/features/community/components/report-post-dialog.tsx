"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, Check, Flag, LoaderCircle, X } from "lucide-react";

import { apiRequest } from "@/features/community/lib/comment-client";
import {
  REPORT_DETAIL_MAX,
  REPORT_OTHER_MIN,
  REPORT_REASONS,
  type ReportReason,
} from "@/features/community/lib/rules";
import type { CommunityPost } from "@/features/community/types";

type Props = {
  post: CommunityPost | null;
  onClose: () => void;
  onSubmitted: (message: string) => void;
};

function ReportForm({ post, onClose, onSubmitted }: Props & { post: CommunityPost }) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [detail, setDetail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const needsDetail = reason === "other";
  const detailTooShort = needsDetail && detail.trim().length < REPORT_OTHER_MIN;
  const canSubmit = reason !== null && !detailTooShort && !submitting;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError("");

    try {
      await apiRequest(`/api/community/posts/${post.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, detail: detail.trim() }),
      });
      onSubmitted("Terima kasih, laporanmu sudah diterima moderator.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim laporan.");
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Flag size={18} className="text-red-500" />
              <h2 className="font-bold text-gray-900">Laporkan postingan</h2>
            </div>
            <p className="mt-1 line-clamp-1 text-xs text-gray-500">{post.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Tutup"
            className="shrink-0 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm font-semibold text-gray-800">Apa masalahnya?</p>

          <div className="space-y-2" role="radiogroup" aria-label="Alasan pelaporan">
            {REPORT_REASONS.map((item) => {
              const active = reason === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setReason(item.value)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                    active
                      ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
                      active ? "border-[var(--brand)] bg-[var(--brand)] text-white" : "border-gray-300"
                    }`}
                  >
                    {active && <Check size={12} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-gray-900">{item.label}</span>
                    <span className="mt-0.5 block text-[11px] leading-relaxed text-gray-500">
                      {item.hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {reason && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="report-detail" className="text-xs font-semibold text-gray-700">
                  {needsDetail ? "Jelaskan singkat" : "Tambahan (opsional)"}
                </label>
                <span className="text-[11px] text-gray-400">
                  {detail.length}/{REPORT_DETAIL_MAX}
                </span>
              </div>
              <textarea
                id="report-detail"
                value={detail}
                maxLength={REPORT_DETAIL_MAX}
                rows={3}
                onChange={(event) => setDetail(event.target.value)}
                placeholder={needsDetail ? "Contoh: postingan ini mengajak transfer ke rekening tertentu." : "Tulis jika perlu."}
                className="w-full resize-none rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
              />
              {needsDetail && detailTooShort && (
                <p className="text-[11px] text-gray-500">Minimal {REPORT_OTHER_MIN} karakter.</p>
              )}
            </div>
          )}

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? <LoaderCircle size={16} className="animate-spin" /> : <Flag size={16} />}
            {submitting ? "Mengirim..." : "Kirim laporan"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function ReportPostDialog({ post, onClose, onSubmitted }: Props) {
  if (!post) return null;
  return <ReportForm key={post.id} post={post} onClose={onClose} onSubmitted={onSubmitted} />;
}