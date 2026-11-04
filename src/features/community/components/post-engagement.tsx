"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";

import { apiRequest } from "@/features/community/lib/comment-client";
import { useOptimisticLike } from "@/features/community/hooks/use-optimistic-like";
import { usePolling } from "@/features/community/hooks/use-polling";
import type {
  CommunityPost,
  CommunityToastType,
  CommunityViewer,
  LikeState,
} from "@/features/community/types";
import { CommentSection } from "./comment-section";
import { LikeButton } from "./like-button";

type PostEngagementProps = {
  post: CommunityPost;
  viewer: CommunityViewer;
  isModerator: boolean;
  onRequireLogin: () => void;
  onPreviewImage: (url: string) => void;
  notify: (type: CommunityToastType, message: string) => void;
};

export const PostEngagement = ({
  post,
  viewer,
  isModerator,
  onRequireLogin,
  onPreviewImage,
  notify,
}: PostEngagementProps) => {
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [open, setOpen] = useState(false);
  const [remoteLikes, setRemoteLikes] = useState<LikeState>({
    total: post.reactions.total,
    hasLiked: post.reactions.hasReacted,
  });

  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setRemoteLikes({ total: post.reactions.total, hasLiked: post.reactions.hasReacted });
  }, [post.reactions.total, post.reactions.hasReacted]);

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "200px",
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  usePolling(
    async () => {
      const data = await apiRequest<LikeState>(`/api/community/posts/${post.id}/reactions`, {
        cache: "no-store",
      });
      setRemoteLikes((prev) => (prev.total === data.total && prev.hasLiked === data.hasLiked ? prev : data));
    },
    8_000,
    visible,
  );

  useEffect(() => {
    setCommentCount(post.commentCount);
  }, [post.commentCount]);

  const { likes, toggle } = useOptimisticLike({
    initial: remoteLikes,
    send: (liked) =>
      apiRequest<LikeState>(`/api/community/posts/${post.id}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liked }),
      }),
    onError: (error) =>
      notify("error", error instanceof Error ? error.message : "Gagal memperbarui reaksi."),
  });

  const handleLike = () => {
    if (!viewer.isAuthenticated) {
      onRequireLogin();
      return;
    }
    toggle();
  };

  return (
    <div ref={rootRef} className="space-y-3">
      <div className="flex flex-wrap items-center gap-1">
        <LikeButton
          liked={likes.hasLiked}
          count={likes.total}
          label="Membantu"
          onToggle={handleLike}
          ariaLabel={likes.hasLiked ? "Batalkan reaksi membantu" : "Tandai laporan ini membantu"}
        />

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition ${
            open
              ? "bg-[var(--brand-soft)] text-[var(--brand-dark)]"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          }`}
        >
          <MessageCircle size={16} />
          {commentCount > 0 ? `${commentCount.toLocaleString("id-ID")} komentar` : "Komentar"}
        </button>
      </div>

      {open && (
        <CommentSection
          postId={post.id}
          viewer={viewer}
          isModerator={isModerator}
          onRequireLogin={onRequireLogin}
          onCountChange={(delta) => setCommentCount((count) => Math.max(0, count + delta))}
          onCountSync={setCommentCount}
          onPreviewImage={onPreviewImage}
          notify={notify}
        />
      )}
    </div>
  );
};
