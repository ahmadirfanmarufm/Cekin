import type { ApiResponse } from "@/features/community/types";
import { COMMENT_LIMITS } from "./comment-limits";
import { formatDate } from "./utils";

/** Fetch ke API Community: melempar Error berisi pesan yang siap ditampilkan ke pengguna. */
export async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers: { Accept: "application/json", ...init?.headers },
    });
  } catch {
    throw new Error("Tidak dapat terhubung ke server. Periksa koneksi internetmu.");
  }

  const text = await response.text();
  let result: ApiResponse<T> | null = null;

  try {
    result = text ? (JSON.parse(text) as ApiResponse<T>) : null;
  } catch {
    result = null;
  }

  if (!response.ok || !result?.success) {
    throw new Error(result?.message ?? `Terjadi kesalahan (HTTP ${response.status}).`);
  }

  return result.data as T;
}

export function formatBytes(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return "-";

  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;

  return formatDate(iso);
}

/**
 * Mengecilkan foto di browser sebelum diunggah (maks 1280px, WebP).
 * Foto HP 4 MB biasanya jadi 150–300 KB, dan metadata EXIF (termasuk lokasi GPS) ikut terbuang.
 */
export async function compressImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, COMMENT_LIMITS.IMAGE_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return file;
    }

    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", COMMENT_LIMITS.IMAGE_QUALITY),
    );

    // Browser lama bisa diam-diam menghasilkan PNG; pakai hasil hanya bila benar-benar WebP dan lebih kecil.
    if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return file;

    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" });
  } catch {
    return file;
  }
}
