"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, Search, X } from "lucide-react";

import { apiRequest } from "@/features/community/lib/comment-client";
import type { GifItem } from "@/features/community/types";

type GifPickerProps = {
  onSelect: (gif: GifItem) => void;
  onClose: () => void;
};

type GifPage = { items: GifItem[]; hasNext: boolean };

export const GifPicker = ({ onSelect, onClose }: GifPickerProps) => {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [items, setItems] = useState<GifItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let ignore = false;
    setStatus("loading");

    apiRequest<GifPage>(`/api/community/gifs?q=${encodeURIComponent(debounced)}&page=1`)
      .then((data) => {
        if (ignore) return;
        setItems(data.items);
        setHasNext(data.hasNext);
        setPage(1);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (ignore) return;
        setError(err instanceof Error ? err.message : "Gagal memuat GIF.");
        setStatus("error");
      });

    return () => {
      ignore = true;
    };
  }, [debounced, reloadKey]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const next = page + 1;
      const data = await apiRequest<GifPage>(
        `/api/community/gifs?q=${encodeURIComponent(debounced)}&page=${next}`,
      );
      setItems((current) => {
        const known = new Set(current.map((item) => item.id));
        return [...current, ...data.items.filter((item) => !known.has(item.id))];
      });
      setHasNext(data.hasNext);
      setPage(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat GIF.");
      setStatus("error");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div
      className="rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm"
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari GIF, misalnya: kaget, waspada, ok"
            className="h-9 w-full rounded-lg border border-gray-200 pl-9 pr-3 text-xs outline-none placeholder:text-gray-400 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
          />
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup pilihan GIF"
          className="flex size-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        >
          <X size={17} />
        </button>
      </div>

      <div className="mt-2.5 max-h-60 overflow-y-auto">
        {status === "loading" ? (
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4" aria-busy="true">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="aspect-square animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : status === "error" ? (
          <div className="px-3 py-6 text-center">
            <p className="text-xs text-gray-600">{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="mt-2 text-xs font-semibold text-[var(--brand)] hover:text-[var(--brand-dark)]"
            >
              Coba lagi
            </button>
          </div>
        ) : items.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-gray-500">
            GIF tidak ditemukan. Coba kata kunci lain.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
              {items.map((gif) => (
                <button
                  key={gif.id}
                  type="button"
                  onClick={() => onSelect(gif)}
                  aria-label={`Pilih GIF: ${gif.title}`}
                  className="aspect-square overflow-hidden rounded-lg bg-gray-100 transition hover:ring-2 hover:ring-[var(--brand)] focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                >
                  <img
                    src={gif.previewUrl}
                    alt={gif.title}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </button>
              ))}
            </div>

            {hasNext && (
              <button
                type="button"
                onClick={() => void loadMore()}
                disabled={loadingMore}
                className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-lg text-xs font-semibold text-[var(--brand)] transition hover:bg-[var(--brand-soft)] disabled:opacity-60"
              >
                {loadingMore && <LoaderCircle size={14} className="animate-spin" />}
                Muat lebih banyak
              </button>
            )}
          </>
        )}
      </div>

      <p className="mt-2 text-right text-[10px] text-gray-400">Powered by KLIPY</p>
    </div>
  );
};
