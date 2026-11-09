"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, LoaderCircle, Save, X } from "lucide-react";

import { apiRequest } from "@/features/community/lib/comment-client";
import { CATEGORIES } from "@/features/community/lib/utils";
import type { CommunityCategory, CommunityPost } from "@/features/community/types";

const MAX_TITLE = 150;
const MAX_CONTENT = 10000;

type Props = {
  post: CommunityPost | null;
  onClose: () => void;
  onSaved: (message: string) => void;
};

function EditForm({ post, onClose, onSaved }: Props & { post: CommunityPost }) {
  const [category, setCategory] = useState<CommunityCategory>(post.category);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const needsInfo = post.verificationStatus === "needs_info";
  const unchanged =
    category === post.category && title.trim() === post.title && content.trim() === post.content;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    if (!title.trim() || !content.trim()) {
      setError("Judul dan deskripsi wajib diisi.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await apiRequest(`/api/community/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, title, content }),
      });

      onSaved(
        needsInfo
          ? "Laporan diperbarui dan dikirim ulang untuk ditinjau."
          : "Laporan berhasil diperbarui.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan perubahan.");
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
        className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
          <div>
            <h2 className="font-bold text-gray-900">Edit Laporan</h2>
            <p className="mt-0.5 text-xs text-gray-500">Foto dan video bukti tidak bisa diubah.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Tutup"
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {needsInfo && (
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-3.5">
              <p className="text-xs font-bold text-orange-800">Moderator meminta informasi tambahan</p>
              {post.reviewNote && (
                <p className="mt-1.5 whitespace-pre-wrap break-words text-xs leading-relaxed text-orange-900">
                  {post.reviewNote}
                </p>
              )}
              <p className="mt-2 text-[11px] text-orange-700">
                Setelah disimpan, laporanmu akan ditinjau ulang.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="edit-category" className="text-sm font-semibold text-gray-800">
              Kategori
            </label>
            <select
              id="edit-category"
              value={category}
              onChange={(event) => setCategory(event.target.value as CommunityCategory)}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
            >
              {CATEGORIES.filter((item) => item.value !== "all").map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="edit-title" className="text-sm font-semibold text-gray-800">
                Judul laporan
              </label>
              <span className="text-xs text-gray-400">
                {title.length}/{MAX_TITLE}
              </span>
            </div>
            <input
              id="edit-title"
              value={title}
              maxLength={MAX_TITLE}
              onChange={(event) => setTitle(event.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="edit-content" className="text-sm font-semibold text-gray-800">
                Kronologi
              </label>
              <span className="text-xs text-gray-400">
                {content.length.toLocaleString("id-ID")}/{MAX_CONTENT.toLocaleString("id-ID")}
              </span>
            </div>
            <textarea
              id="edit-content"
              value={content}
              maxLength={MAX_CONTENT}
              rows={8}
              onChange={(event) => setContent(event.target.value)}
              className="w-full resize-y rounded-xl border border-gray-200 p-3 text-sm leading-relaxed outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
            />
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              {error}
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
              disabled={submitting || unchanged}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export function EditPostDialog({ post, onClose, onSaved }: Props) {
  if (!post) return null;
  return <EditForm key={post.id} post={post} onClose={onClose} onSaved={onSaved} />;
}