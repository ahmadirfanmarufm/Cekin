import type { GifItem } from "@/features/community/types";

/**
 * Penyedia GIF: KLIPY. (Tenor API sudah dihentikan Google pada 30 Juni 2026.)
 * Semua pemanggilan lewat server agar API key tidak bocor ke browser.
 * Untuk pindah ke penyedia lain (mis. GIPHY), cukup ganti isi searchGifs() dan GIF_HOST_SUFFIXES.
 */
const API_ROOT = "https://api.klipy.com/api/v1";
const PER_PAGE = 24;

// Hanya URL dari domain ini yang boleh disimpan di komentar.
const GIF_HOST_SUFFIXES = [".klipy.com", ".klipy.co"];

// Ukuran kecil dulu supaya ringan; ubah urutannya bila ingin lebih tajam.
const SEND_SIZES = ["sm", "md", "hd", "xs"] as const;
const PREVIEW_SIZES = ["xs", "sm", "md"] as const;

export class GifProviderError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "GifProviderError";
  }
}

type Variant = Partial<Record<"gif" | "webp" | "mp4" | "jpg" | "png", { url?: string }>>;
type KlipyItem = {
  id?: string | number;
  slug?: string;
  title?: string;
  file?: Partial<Record<"hd" | "md" | "sm" | "xs", Variant>>;
};

function pick(item: KlipyItem, sizes: readonly ("hd" | "md" | "sm" | "xs")[], formats: readonly (keyof Variant)[]) {
  for (const size of sizes) {
    for (const format of formats) {
      const url = item.file?.[size]?.[format]?.url;
      if (url) return url;
    }
  }
  return null;
}

export function isAllowedGifUrl(value: string) {
  try {
    const url = new URL(value);
    const hostOk = GIF_HOST_SUFFIXES.some((suffix) => url.hostname.endsWith(suffix));
    return url.protocol === "https:" && hostOk && value.length <= 600 && /\.(gif|webp)$/i.test(url.pathname);
  } catch {
    return false;
  }
}

export function gifMimeType(value: string) {
  return /\.webp$/i.test(new URL(value).pathname) ? "image/webp" : "image/gif";
}

export async function searchGifs(params: { q: string; page: number }): Promise<{ items: GifItem[]; hasNext: boolean }> {
  const key = process.env.KLIPY_API_KEY;
  if (!key) throw new GifProviderError(503, "Fitur GIF belum dikonfigurasi.");

  const query = new URLSearchParams({ page: String(params.page), per_page: String(PER_PAGE), content_filter: "medium" });
  if (params.q) query.set("q", params.q);

  const endpoint = params.q ? "search" : "trending";
  const url = `${API_ROOT}/${encodeURIComponent(key)}/gifs/${endpoint}?${query.toString()}`;

  let response: Response;
  try {
    response = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(6000), cache: "no-store" });
  } catch {
    throw new GifProviderError(502, "Layanan GIF tidak merespons. Coba lagi sebentar lagi.");
  }

  if (!response.ok) {
    console.error("GIF provider HTTP error:", response.status); // jangan log URL: berisi API key
    throw new GifProviderError(502, "Layanan GIF sedang bermasalah.");
  }

  const json = (await response.json().catch(() => null)) as {
    result?: boolean;
    data?: { data?: KlipyItem[]; has_next?: boolean } | KlipyItem[];
  } | null;

  const list = Array.isArray(json?.data) ? json.data : json?.data?.data;
  if (!json || json.result === false || !Array.isArray(list)) {
    throw new GifProviderError(502, "Respons layanan GIF tidak dikenali.");
  }

  const items: GifItem[] = [];
  for (const item of list) {
    const sendUrl = pick(item, SEND_SIZES, ["webp", "gif"]);
    const previewUrl = pick(item, PREVIEW_SIZES, ["webp", "gif", "jpg"]);
    // Item tanpa file (mis. slot iklan) dilewati.
    if (!sendUrl || !previewUrl || !isAllowedGifUrl(sendUrl)) continue;

    items.push({
      id: String(item.id ?? item.slug ?? sendUrl),
      title: item.title?.trim() || "GIF",
      previewUrl,
      url: sendUrl,
    });
  }

  const hasNext = !Array.isArray(json.data) && Boolean(json.data?.has_next);
  return { items, hasNext };
}
