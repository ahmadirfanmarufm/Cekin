"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell,
  CheckCheck,
  Flag,
  Heart,
  LoaderCircle,
  MessageCircle,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";

import { usePolling } from "@/features/community/hooks/use-polling";
import { apiRequest, formatRelativeTime } from "@/features/community/lib/comment-client";
import { getReportReasonLabel } from "@/features/community/lib/rules";
import { getVerificationConfig } from "@/features/community/lib/utils";
import type { CommunityNotification } from "@/features/community/types";

type Props = {
  enabled: boolean;
  onOpenPost: (postId: string) => void;
};

const who = (item: CommunityNotification) => {
  const name = item.actorName ?? "Seseorang";
  return item.count > 1 ? `${name} dan ${item.count - 1} lainnya` : name;
};

const describe = (item: CommunityNotification) => {
  switch (item.type) {
    case "post_like":
      return `${who(item)} menyukai laporanmu`;
    case "post_comment":
      return `${who(item)} mengomentari laporanmu`;
    case "comment_reply":
      return `${who(item)} membalas komentarmu`;
    case "comment_like":
      return `${who(item)} menyukai komentarmu`;
    case "post_review":
      return `Laporanmu sekarang berstatus “${getVerificationConfig(item.meta ?? "").label}”`;
    case "post_report":
      return item.count > 1
        ? `${item.count} laporan baru pada postingan ini`
        : `Postingan dilaporkan: ${getReportReasonLabel(item.meta ?? "")}`;
    case "post_resubmitted":
      return "Pelapor memperbarui laporan yang diminta informasinya";
    default:
      return "Notifikasi baru";
  }
};

const iconOf = (type: CommunityNotification["type"]) => {
  if (type === "post_like" || type === "comment_like") return <Heart size={15} className="text-rose-500" />;
  if (type === "post_comment" || type === "comment_reply") return <MessageCircle size={15} className="text-[var(--brand)]" />;
  if (type === "post_report") return <Flag size={15} className="text-red-500" />;
  if (type === "post_resubmitted") return <RefreshCcw size={15} className="text-orange-500" />;
  return <ShieldCheck size={15} className="text-green-600" />;
};

export function NotificationBell({ enabled, onOpenPost }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CommunityNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);
  openRef.current = open;

  const load = useCallback(async (full: boolean) => {
    if (full) setLoading(true);

    try {
      const data = await apiRequest<{ unreadCount: number; items?: CommunityNotification[] }>(
        `/api/community/notifications${full ? "" : "?countOnly=1"}`,
        { cache: "no-store" },
      );

      setUnread(data.unreadCount);
      if (data.items) setItems(data.items);
    } catch {
      // Notifikasi bersifat pelengkap: gagal memuat tidak perlu mengganggu pengguna.
    } finally {
      if (full) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setUnread(0);
      setOpen(false);
      return;
    }

    void load(false);

    const handler = () => void load(openRef.current);
    window.addEventListener("cekin-auth-change", handler);

    return () => window.removeEventListener("cekin-auth-change", handler);
  }, [enabled, load]);

  usePolling(() => load(openRef.current), 30_000, enabled);

  useEffect(() => {
    if (!open) return;

    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const markRead = async (payload: { all: true } | { ids: string[] }) => {
    setItems((current) =>
      current.map((item) =>
        "all" in payload || payload.ids.includes(item.id) ? { ...item, isRead: true } : item,
      ),
    );
    setUnread((current) => ("all" in payload ? 0 : Math.max(0, current - payload.ids.length)));

    try {
      await apiRequest("/api/community/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      void load(true);
    }
  };

  const handleItem = (item: CommunityNotification) => {
    if (!item.isRead) void markRead({ ids: [item.id] });
    setOpen(false);
    if (item.postId) onOpenPost(item.postId);
  };

  if (!enabled) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) void load(true);
        }}
        aria-label={unread > 0 ? `Notifikasi, ${unread} belum dibaca` : "Notifikasi"}
        aria-expanded={open}
        className="relative flex size-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
      >
        <Bell size={19} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-5 text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-bold text-gray-900">Notifikasi</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => void markRead({ all: true })}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--brand)] hover:text-[var(--brand-dark)]"
              >
                <CheckCheck size={13} />
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && items.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-10 text-xs text-gray-500">
                <LoaderCircle size={14} className="animate-spin" />
                Memuat...
              </div>
            ) : items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell size={20} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-semibold text-gray-700">Belum ada notifikasi</p>
                <p className="mt-0.5 text-xs text-gray-500">Aktivitas di laporanmu akan muncul di sini.</p>
              </div>
            ) : (
              <ul>
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleItem(item)}
                      className={`flex w-full items-start gap-3 border-b border-gray-50 px-4 py-3 text-left transition hover:bg-gray-50 ${
                        item.isRead ? "" : "bg-[var(--brand-soft)]/40"
                      }`}
                    >
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                        {iconOf(item.type)}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className={`block text-xs leading-relaxed text-gray-800 ${item.isRead ? "" : "font-semibold"}`}>
                          {describe(item)}
                        </span>
                        {item.postTitle && (
                          <span className="mt-0.5 line-clamp-1 block text-[11px] text-gray-500">
                            {item.postTitle}
                          </span>
                        )}
                        <span className="mt-1 block text-[10px] text-gray-400">
                          {formatRelativeTime(item.updatedAt)}
                        </span>
                      </span>

                      {!item.isRead && <span className="mt-2 size-2 shrink-0 rounded-full bg-[var(--brand)]" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}