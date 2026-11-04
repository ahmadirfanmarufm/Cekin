"use client";

import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { ImagePlus, LoaderCircle, Send, X } from "lucide-react";

import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  getVideoDuration,
} from "@/features/community/lib/validation";
import { COMMENT_LIMITS } from "@/features/community/lib/comment-limits";
import { apiRequest, compressImage, formatBytes } from "@/features/community/lib/comment-client";
import type { CommunityToastType, CommunityComment, GifItem } from "@/features/community/types";
import { GifPicker } from "./gif-picker";

type Attachment =
  | { kind: "file"; file: File; previewUrl: string; mediaType: "image" | "video"; duration: number | null }
  | { kind: "gif"; gif: GifItem };

type CommentComposerProps = {
  postId: string;
  parentId?: string | null;
  initialText?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onPosted: (comment: CommunityComment) => void;
  onCancel?: () => void;
  notify: (type: CommunityToastType, message: string) => void;
};

export const CommentComposer = ({
  postId,
  parentId = null,
  initialText = "",
  placeholder = "Tulis komentar...",
  autoFocus = false,
  onPosted,
  onCancel,
  notify,
}: CommentComposerProps) => {
  const [text, setText] = useState(initialText);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [processing, setProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [gifOpen, setGifOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  const busy = processing || submitting;
  const canSend = !busy && (text.trim().length > 0 || attachment !== null);

  const replaceAttachment = (next: Attachment | null) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = next?.kind === "file" ? next.previewUrl : null;
    setAttachment(next);
  };

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (!autoFocus || !textareaRef.current) return;
    const element = textareaRef.current;
    element.focus();
    element.setSelectionRange(element.value.length, element.value.length);
  }, [autoFocus]);

  const resizeTextarea = () => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 160)}px`;
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const isImage = (ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type);
    const isVideo = (ALLOWED_VIDEO_TYPES as readonly string[]).includes(file.type);

    if (!isImage && !isVideo) {
      notify("info", "Format tidak didukung. Gunakan JPEG, PNG, WebP, MP4, WebM, atau MOV.");
      return;
    }

    setProcessing(true);
    setGifOpen(false);

    try {
      if (isImage) {
        const compressed = await compressImage(file);
        if (compressed.size > COMMENT_LIMITS.MAX_IMAGE_SIZE) {
          throw new Error(`Foto masih terlalu besar (${formatBytes(compressed.size)}). Maksimal 2 MB.`);
        }
        replaceAttachment({
          kind: "file",
          file: compressed,
          previewUrl: URL.createObjectURL(compressed),
          mediaType: "image",
          duration: null,
        });
      } else {
        if (file.size > COMMENT_LIMITS.MAX_VIDEO_SIZE) {
          throw new Error(`Video terlalu besar (${formatBytes(file.size)}). Maksimal 10 MB.`);
        }
        const duration = await getVideoDuration(file);
        if (duration > COMMENT_LIMITS.MAX_VIDEO_DURATION) {
          throw new Error("Video maksimal 15 detik. Potong dulu videonya, lalu coba lagi.");
        }
        replaceAttachment({
          kind: "file",
          file,
          previewUrl: URL.createObjectURL(file),
          mediaType: "video",
          duration,
        });
      }
    } catch (error) {
      notify("info", error instanceof Error ? error.message : "File tidak dapat diproses.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async () => {
    const content = text.trim();

    if (!content && !attachment) {
      notify("info", "Tulis komentar atau lampirkan media.");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("content", content);
      if (parentId) formData.append("parentId", parentId);

      if (attachment?.kind === "file") {
        formData.append("media", attachment.file);
        if (attachment.duration !== null) formData.append("videoDuration", String(attachment.duration));
      }
      if (attachment?.kind === "gif") formData.append("gifUrl", attachment.gif.url);

      const comment = await apiRequest<CommunityComment>(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        body: formData,
      });

      setText("");
      replaceAttachment(null);
      setGifOpen(false);
      requestAnimationFrame(resizeTextarea);
      onPosted(comment);
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Gagal mengirim komentar.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey) && canSend) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <div className="space-y-2">
      <div className="rounded-2xl border border-gray-200 bg-white transition focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--brand-soft)]">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            resizeTextarea();
          }}
          onKeyDown={handleKeyDown}
          maxLength={COMMENT_LIMITS.MAX_CONTENT}
          rows={1}
          disabled={submitting}
          placeholder={placeholder}
          aria-label="Tulis komentar"
          className="block max-h-40 w-full resize-none bg-transparent px-3.5 pb-1 pt-3 text-sm leading-relaxed outline-none placeholder:text-gray-400"
        />

        {/* Pratinjau lampiran */}
        {(attachment || processing) && (
          <div className="px-3 pb-2">
            {processing ? (
              <div className="flex h-16 items-center gap-2 text-xs text-gray-500">
                <LoaderCircle size={15} className="animate-spin" />
                Menyiapkan lampiran...
              </div>
            ) : attachment ? (
              <div className="relative inline-block">
                {attachment.kind === "gif" ? (
                  <img src={attachment.gif.previewUrl} alt={attachment.gif.title} className="h-24 rounded-lg object-cover" />
                ) : attachment.mediaType === "image" ? (
                  <img src={attachment.previewUrl} alt="Pratinjau foto" className="h-24 rounded-lg object-cover" />
                ) : (
                  <video src={attachment.previewUrl} muted playsInline className="h-24 rounded-lg bg-black object-cover" />
                )}

                {attachment.kind === "gif" && (
                  <span className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    GIF
                  </span>
                )}
                {attachment.kind === "file" && (
                  <span className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    {attachment.mediaType === "video" && attachment.duration
                      ? `${Math.ceil(attachment.duration)} dtk · `
                      : ""}
                    {formatBytes(attachment.file.size)}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => replaceAttachment(null)}
                  aria-label="Hapus lampiran"
                  className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-gray-800 text-white shadow transition hover:bg-red-600"
                >
                  <X size={13} />
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-2 py-1.5">
          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              aria-label="Lampirkan foto atau video"
              title="Foto (maks. 2 MB) atau video (maks. 15 detik, 10 MB)"
              className="flex size-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-[var(--brand)] disabled:opacity-50"
            >
              <ImagePlus size={18} />
            </button>

            <button
              type="button"
              onClick={() => setGifOpen((open) => !open)}
              disabled={busy}
              aria-label="Pilih GIF"
              aria-expanded={gifOpen}
              className={`flex h-8 items-center rounded-lg px-2 text-[11px] font-extrabold tracking-wide transition disabled:opacity-50 ${
                gifOpen
                  ? "bg-[var(--brand-soft)] text-[var(--brand)]"
                  : "text-gray-500 hover:bg-gray-100 hover:text-[var(--brand)]"
              }`}
            >
              GIF
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {text.length > COMMENT_LIMITS.MAX_CONTENT * 0.8 && (
              <span className="text-[10px] tabular-nums text-gray-400">
                {text.length}/{COMMENT_LIMITS.MAX_CONTENT}
              </span>
            )}

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={submitting}
                className="h-8 rounded-lg px-3 text-xs font-semibold text-gray-500 transition hover:bg-gray-100 disabled:opacity-50"
              >
                Batal
              </button>
            )}

            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={!canSend}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[var(--brand)] px-3.5 text-xs font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? <LoaderCircle size={14} className="animate-spin" /> : <Send size={14} />}
              {submitting ? "Mengirim..." : "Kirim"}
            </button>
          </div>
        </div>
      </div>

      {gifOpen && (
        <GifPicker
          onClose={() => setGifOpen(false)}
          onSelect={(gif) => {
            replaceAttachment({ kind: "gif", gif });
            setGifOpen(false);
          }}
        />
      )}
    </div>
  );
};
