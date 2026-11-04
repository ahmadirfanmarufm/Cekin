"use client";

import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, MessageCircle } from "lucide-react";

import { apiRequest } from "@/features/community/lib/comment-client";
import { usePolling } from "@/features/community/hooks/use-polling";
import type {
  CommunityComment,
  CommunityToastType,
  CommunityViewer,
} from "@/features/community/types";
import { CommentComposer } from "./comment-composer";
import { CommentItem } from "./comment-item";

type CommentSectionProps = {
  postId: string;
  viewer: CommunityViewer;
  isModerator: boolean;
  onRequireLogin: () => void;
  onCountChange: (delta: number) => void;
  onPreviewImage: (url: string) => void;
  notify: (type: CommunityToastType, message: string) => void;
  onCountSync: (count: number) => void;
};

type ReplyTarget = {
  commentId: string;
  parentId: string;
  username: string;
  mention: boolean;
};

const byNewest = (a: CommunityComment, b: CommunityComment) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
const byOldest = (a: CommunityComment, b: CommunityComment) => -byNewest(a, b);

const RECENT_MS = 15_000;

const mergeFromServer = (current: CommunityComment[], server: CommunityComment[]) => {
  const previous = new Map(current.map((c) => [c.id, c]));
  const serverIds = new Set(server.map((c) => c.id));

  const merged = server.map((c) => {
    const old = previous.get(c.id);
    return old?.media && c.media ? { ...c, media: old.media } : c;
  });

  const justPosted = current.filter((c) => !serverIds.has(c.id) && Date.now() - new Date(c.createdAt).getTime() < RECENT_MS,
  );

  return [...merged, ...justPosted];
};

export const CommentSection = ({
  postId,
  viewer,
  isModerator,
  onRequireLogin,
  onCountChange,
  onCountSync,
  onPreviewImage,
  notify,
}: CommentSectionProps) => {
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [reply, setReply] = useState<ReplyTarget | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setStatus("loading");

    apiRequest<{ comments: CommunityComment[] }>(`/api/community/posts/${postId}/comments`, {
      cache: "no-store",
    })
      .then((data) => {
        if (ignore) return;
        setComments(data.comments);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (ignore) return;
        setError(err instanceof Error ? err.message : "Gagal memuat komentar.");
        setStatus("error");
      });

    return () => {
      ignore = true;
    };
  }, [postId, reloadKey]);

  usePolling(
    async () => {
      const data = await apiRequest<{ comments: CommunityComment[] }>(
        `/api/community/posts/${postId}/comments`,
        { cache: "no-store" },
      );

      setComments((current) => {
        const next = mergeFromServer(current, data.comments);
        return JSON.stringify(next) === JSON.stringify(current) ? current : next;
      });

      onCountSync(data.comments.filter((c) => !c.isDeleted).length);
    },
    4_000,
    status === "ready",
  );

  const threads = useMemo(() => {
    const hasLiveReply = new Set(
      comments.filter((c) => c.parentId && !c.isDeleted).map((c) => c.parentId as string),
    );

    const top = comments
      .filter((c) => !c.parentId && (!c.isDeleted || hasLiveReply.has(c.id)))
      .sort(byNewest);

    const replies = new Map<string, CommunityComment[]>();
    comments
      .filter((c) => c.parentId)
      .sort(byOldest)
      .forEach((c) => replies.set(c.parentId as string, [...(replies.get(c.parentId as string) ?? []), c]));

    return top.map((comment) => ({ comment, replies: replies.get(comment.id) ?? [] }));
  }, [comments]);

  const handlePosted = (comment: CommunityComment) => {
    setComments((current) => (current.some((c) => c.id === comment.id) ? current : [...current, comment]));
    setReply(null);
    onCountChange(1);
  };

  const handleDelete = async (target: CommunityComment) => {
    try {
      const result = await apiRequest<{ id: string; mode: "hard" | "soft" }>(
        `/api/community/comments/${target.id}`,
        { method: "DELETE" },
      );

      setComments((current) =>
        result.mode === "hard"
          ? current.filter((c) => c.id !== target.id && c.parentId !== target.id)
          : current.map((c) =>
              c.id === target.id
                ? { ...c, isDeleted: true, content: "", media: null, likes: { total: 0, hasLiked: false } }
                : c,
            ),
      );
      onCountChange(-1);
      notify("success", "Komentar dihapus.");
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Gagal menghapus komentar.");
      throw err;
    }
  };

  const startReply = (target: CommunityComment) => {
    if (!viewer.isAuthenticated) {
      onRequireLogin();
      return;
    }
    setReply({
      commentId: target.id,
      parentId: target.parentId ?? target.id,
      username: target.author.username,
      mention: target.parentId !== null,
    });
  };

  const renderReplyComposer = (commentId: string) =>
    reply?.commentId === commentId ? (
      <div className="mt-2">
        <CommentComposer
          key={reply.commentId}
          postId={postId}
          parentId={reply.parentId}
          initialText={reply.mention ? `@${reply.username} ` : ""}
          placeholder={`Balas ${reply.username}...`}
          autoFocus
          onCancel={() => setReply(null)}
          onPosted={handlePosted}
          notify={notify}
        />
      </div>
    ) : null;

  const itemProps = {
    canModerate: isModerator,
    isAuthenticated: viewer.isAuthenticated,
    onRequireLogin,
    notify,
    onReply: startReply,
    onDelete: handleDelete,
    onPreviewImage,
  };

  return (
    <div className="space-y-4 border-t border-gray-100 pt-4">
      {viewer.isAuthenticated ? (
        <CommentComposer
          postId={postId}
          placeholder="Pernah menerima pesan serupa? Tulis pengalaman atau sarananmu..."
          onPosted={handlePosted}
          notify={notify}
        />
      ) : (
        <button
          type="button"
          onClick={onRequireLogin}
          className="flex h-11 w-full items-center justify-center rounded-xl border border-dashed border-gray-300 text-sm font-semibold text-[var(--brand)] transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
        >
          Masuk untuk ikut berdiskusi
        </button>
      )}

      {status === "loading" ? (
        <div className="flex items-center justify-center gap-2 py-6 text-xs text-gray-500" aria-busy="true">
          <LoaderCircle size={15} className="animate-spin" />
          Memuat komentar...
        </div>
      ) : status === "error" ? (
        <div className="py-4 text-center">
          <p className="text-xs text-gray-600">{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="mt-2 text-xs font-semibold text-[var(--brand)] hover:text-[var(--brand-dark)]"
          >
            Coba lagi
          </button>
        </div>
      ) : threads.length === 0 ? (
        <div className="py-5 text-center">
          <MessageCircle size={20} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm font-semibold text-gray-700">Belum ada komentar</p>
          <p className="mt-0.5 text-xs text-gray-500">Jadilah yang pertama menanggapi laporan ini.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {threads.map(({ comment, replies }) => {
            const forceOpen = reply?.parentId === comment.id;
            const isOpen = replies.length <= 2 || expanded.has(comment.id) || forceOpen;

            return (
              <li key={comment.id}>
                <CommentItem comment={comment} {...itemProps}>
                  {renderReplyComposer(comment.id)}
                </CommentItem>

                {replies.length > 0 && (
                  <div className="ml-4 mt-3 space-y-3 border-l border-gray-100 pl-3 sm:ml-10">
                    {!isOpen && (
                      <button
                        type="button"
                        onClick={() => setExpanded((current) => new Set(current).add(comment.id))}
                        className="text-xs font-semibold text-[var(--brand)] hover:text-[var(--brand-dark)]"
                      >
                        Lihat {replies.length} balasan
                      </button>
                    )}

                    {isOpen &&
                      replies.map((item) => (
                        <CommentItem key={item.id} comment={item} {...itemProps}>
                          {renderReplyComposer(item.id)}
                        </CommentItem>
                      ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
