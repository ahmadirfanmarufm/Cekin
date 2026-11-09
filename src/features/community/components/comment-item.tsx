"use client";

import { useState, type ReactNode } from "react";
import { AlertCircle, LoaderCircle, Trash2 } from "lucide-react";

import { apiRequest, formatRelativeTime } from "@/features/community/lib/comment-client";
import { useOptimisticLike } from "@/features/community/hooks/use-optimistic-like";
import type {
  CommunityComment,
  CommunityCommentMedia,
  CommunityToastType,
  LikeState,
} from "@/features/community/types";
import { LikeButton } from "./like-button";
import { BadgeChips } from "@/components/badges/badge-chips";

type CommentItemProps = {
  comment: CommunityComment;
  canModerate: boolean;
  isAuthenticated: boolean;
  onRequireLogin: () => void;
  notify: (type: CommunityToastType, message: string) => void;
  onReply: (comment: CommunityComment) => void;
  onDelete: (comment: CommunityComment) => Promise<void>;
  onPreviewImage: (url: string) => void;
  children?: ReactNode;
};

const CommentMedia = ({
  media,
  onPreviewImage,
}: {
  media: CommunityCommentMedia;
  onPreviewImage: (url: string) => void;
}) => {
  if (!media.url) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <AlertCircle size={14} />
        Lampiran tidak dapat dimuat
      </div>
    );
  }

  if (media.mediaType === "video") {
    return (
      <video
        src={media.url}
        controls
        playsInline
        preload="metadata"
        className="max-h-64 w-full max-w-xs rounded-xl bg-black object-contain"
      />
    );
  }

  if (media.mediaType === "gif") {
    return (
      <div className="relative inline-block max-w-full">
        <img src={media.url} alt="GIF" loading="lazy" className="max-h-48 max-w-full rounded-xl" />
        <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
          GIF
        </span>
      </div>
    );
  }

  const url = media.url;
  return (
    <button
      type="button"
      onClick={() => onPreviewImage(url)}
      aria-label="Perbesar foto"
      className="block cursor-zoom-in overflow-hidden rounded-xl"
    >
      <img src={url} alt="Lampiran foto" loading="lazy" className="max-h-60 max-w-full rounded-xl object-cover" />
    </button>
  );
};

export const CommentItem = ({
  comment,
  canModerate,
  isAuthenticated,
  onRequireLogin,
  notify,
  onReply,
  onDelete,
  onPreviewImage,
  children,
}: CommentItemProps) => {
  const { likes, toggle } = useOptimisticLike({
    initial: comment.likes,
    send: (liked) =>
      apiRequest<LikeState>(`/api/community/comments/${comment.id}/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liked }),
      }),
    onError: (error) =>
      notify("error", error instanceof Error ? error.message : "Gagal memperbarui like."),
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      onRequireLogin();
      return;
    }
    toggle();
  };

  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (comment.isDeleted) {
    return (
      <div>
        <p className="py-1 text-xs italic text-gray-400">Komentar ini telah dihapus.</p>
        {children}
      </div>
    );
  }

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(comment);
    } catch {
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <div className="flex gap-2.5">
      <div
        aria-hidden="true"
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-xs font-bold uppercase text-[var(--brand-dark)]"
      >
        {comment.author.username.slice(0, 1)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="relative flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-xs font-semibold text-gray-900">{comment.author.username}</span>
          <BadgeChips badgeIds={comment.author.badges} max={2} />

          {comment.isPostAuthor && (
            <span className="rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--brand-dark)]">
              Pelapor
            </span>
          )}
          {comment.isMine && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
              Kamu
            </span>
          )}

          <span className="text-[11px] text-gray-400">{formatRelativeTime(comment.createdAt)}</span>
        </div>

        {comment.content && (
          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">
            {comment.content}
          </p>
        )}

        {comment.media && (
          <div className="mt-2">
            <CommentMedia media={comment.media} onPreviewImage={onPreviewImage} />
          </div>
        )}

        <div className="-ml-2 mt-1 flex flex-wrap items-center gap-1">
          <LikeButton
            size="sm"
            liked={likes.hasLiked}
            count={likes.total}
            onToggle={handleLike}
            ariaLabel={likes.hasLiked ? "Batalkan suka komentar" : "Sukai komentar"}
          />

          <button
            type="button"
            onClick={() => onReply(comment)}
            className="rounded-full px-2 py-1 text-[11px] font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            Balas
          </button>

          {(comment.isMine || canModerate) &&
            (confirming ? (
              <span className="inline-flex items-center gap-1 pl-1 text-[11px]">
                <span className="text-gray-500">Hapus komentar ini?</span>
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  disabled={deleting}
                  className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                >
                  {deleting && <LoaderCircle size={12} className="animate-spin" />}
                  Ya, hapus
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={deleting}
                  className="rounded-full px-2 py-1 font-semibold text-gray-500 transition hover:bg-gray-100"
                >
                  Batal
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                aria-label="Hapus komentar"
                className="rounded-full p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={13} />
              </button>
            ))}
        </div>

        {children}
      </div>
    </div>
  );
};
