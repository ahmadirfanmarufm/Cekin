
"use client";

import {
  AlertCircle,
  History,
  ShieldCheck,
  X,
} from "lucide-react";

import type {
  CommunityModerationLog,
  CommunityPost,
} from "@/features/community/types";

import {
  formatDate,
  getVerificationConfig,
} from "@/features/community/lib/utils";

import { ModerationLogsSkeleton } from "./community-skeleton";

type ModerationLogsProps = {
  post: CommunityPost | null;
  logs: CommunityModerationLog[];
  loading: boolean;
  error: string;
  onClose: () => void;
  onRetry: () => void;
};

export function ModerationLogs({
  post,
  logs,
  loading,
  error,
  onClose,
  onRetry,
}: ModerationLogsProps) {
  if (!post) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <History
                size={19}
                className="shrink-0 text-[var(--brand)]"
              />

              <h2 className="font-bold text-gray-900">
                Riwayat Status
              </h2>
            </div>

            <p className="mt-1 line-clamp-1 text-xs text-gray-500">
              {post.title}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-3 shrink-0 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Tutup riwayat moderasi"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <ModerationLogsSkeleton />
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-red-700">
                <AlertCircle size={17} />
                Gagal memuat riwayat
              </div>

              <p className="mt-2 text-xs leading-relaxed text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={onRetry}
                className="mt-3 text-xs font-semibold text-red-700 underline"
              >
                Coba lagi
              </button>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <History size={23} />
              </div>

              <h3 className="text-sm font-semibold text-gray-800">
                Belum Ada Riwayat
              </h3>

              <p className="mt-1 max-w-xs text-xs leading-relaxed text-gray-500">
                Belum ada perubahan status pada laporan ini.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">
                  Aktivitas Pemeriksaan
                </p>

                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-600">
                  {logs.length} aktivitas
                </span>
              </div>

              <div className="space-y-5">
                {logs.map((log, index) => {
                  const previous = log.previousVerificationStatus
                    ? getVerificationConfig(
                        log.previousVerificationStatus,
                      )
                    : null;

                  const current = getVerificationConfig(
                    log.newVerificationStatus,
                  );

                  return (
                    <div
                      key={log.id}
                      className="relative flex gap-3"
                    >
                      <div className="flex shrink-0 flex-col items-center">
                        <div className="flex size-9 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
                          <ShieldCheck size={17} />
                        </div>

                        {index !== logs.length - 1 && (
                          <div className="mt-2 min-h-8 w-px flex-1 bg-gray-200" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 pb-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {log.eventType === "edited" ? "Laporan diperbarui" : "Status diperbarui"}
                          </p>

                          <span className="text-[10px] text-gray-400">
                            {formatDate(log.createdAt)}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-gray-500">
                          Oleh{" "}
                          <span className="font-semibold text-gray-700">{log.actorLabel}</span>
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {previous ? (
                            <>
                              <span
                                className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${previous.className}`}
                              >
                                {previous.label}
                              </span>

                              <span className="text-gray-400">
                                →
                              </span>
                            </>
                          ) : (
                            <span className="text-[10px] text-gray-400">
                              Status awal
                            </span>
                          )}

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${current.className}`}
                          >
                            {current.label}
                          </span>
                        </div>

                        {log.note && (
                          <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                              Catatan Moderator
                            </p>

                            <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-gray-600">
                              {log.note}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {logs.length === 50 && (
                <p className="text-center text-[10px] text-gray-400">
                  Menampilkan maksimal 50 riwayat terbaru.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
