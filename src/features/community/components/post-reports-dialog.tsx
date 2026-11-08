"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, EyeOff, Flag, LoaderCircle, X } from "lucide-react";

import { apiRequest } from "@/features/community/lib/comment-client";
import { formatDate } from "@/features/community/lib/utils";
import { getReportReasonLabel } from "@/features/community/lib/rules";
import type { CommunityPost, CommunityReportItem } from "@/features/community/types";

type Props = {
  post: CommunityPost | null;
  onClose: () => void;
  onDone: (message: string) => void;
};

function ReportsPanel({ post, onClose, onDone }: Props & { post: CommunityPost }) {
  const [items, setItems] = useState<CommunityReportItem[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let ignore = false;

    apiRequest<CommunityReportItem[]>(`/api/community/posts/${post.id}/reports`, { cache: "no-store" })
      .then((data) => !ignore && setItems(data))
      .catch((err: unknown) => !ignore && setError(err instanceof Error ? err.message : "Gagal memuat laporan."));

    return () => {
      ignore = true;
    };
  }, [post.id]);

  const pending = items?.filter((item) => item.status === "pending") ?? [];

  const summary = pending.reduce<Record<string, number>>((acc, item) => {
    acc[item.reason] = (acc[item.reason] ?? 0) + 1;
    return acc;
  }, {});

  const resolve = async (status: "resolved" | "dismissed") => {
    setBusy(true);
    try {
      await apiRequest(`/api/community/posts/${post.id}/reports`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      onDone(status === "resolved" ? "Laporan ditandai sudah ditangani." : "Laporan diabaikan.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui laporan.");
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div className="max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-gray-100 bg-white px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Flag size={18} className="text-red-500" />
              <h2 className="font-bold text-gray-900">Laporan pengguna</h2>
            </div>
            <p className="mt-1 line-clamp-1 text-xs text-gray-500">{post.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="shrink-0 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {error ? (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              {error}
            </div>
          ) : items === null ? (
            <div className="flex items-center justify-center gap-2 py-8 text-xs text-gray-500">
              <LoaderCircle size={15} className="animate-spin" />
              Memuat laporan...
            </div>
          ) : (
            <>
              {Object.keys(summary).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(summary).map(([reason, total]) => (
                    <span key={reason} className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">
                      {getReportReasonLabel(reason)} · {total}
                    </span>
                  ))}
                </div>
              )}

              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-gray-900">
                        {getReportReasonLabel(item.reason)}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          item.status === "pending" ? "bg-amber-100 text-amber-800" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {item.status === "pending" ? "Menunggu" : item.status === "resolved" ? "Ditangani" : "Diabaikan"}
                      </span>
                    </div>
                    {item.detail && (
                      <p className="mt-1.5 whitespace-pre-wrap break-words text-xs leading-relaxed text-gray-600">
                        {item.detail}
                      </p>
                    )}
                    <p className="mt-1.5 text-[10px] text-gray-400">
                      {item.reporterUsername} · {formatDate(item.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>

              {pending.length > 0 && (
                <div className="flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void resolve("dismissed")}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    <EyeOff size={14} />
                    Abaikan laporan
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void resolve("resolved")}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] text-xs font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:opacity-50"
                  >
                    <Check size={14} />
                    Tandai sudah ditangani
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function PostReportsDialog({ post, onClose, onDone }: Props) {
  if (!post) return null;
  return <ReportsPanel key={post.id} post={post} onClose={onClose} onDone={onDone} />;
}