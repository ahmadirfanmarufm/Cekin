"use client";

import { useCallback, useState } from "react";

import type {
  ApiResponse,
  CommunityPost,
} from "@/features/community/types";

type UseCommunityDeleteOptions = {
  onSuccess: (message: string) => void;
  onRefresh: () => Promise<void>;
};

export function useCommunityDelete({
  onSuccess,
  onRefresh,
}: UseCommunityDeleteOptions) {
  const [deleteTarget, setDeleteTarget] =
    useState<CommunityPost | null>(null);

  const [deleteSubmitting, setDeleteSubmitting] =
    useState(false);

  const [deleteError, setDeleteError] = useState("");

  const handleOpenDelete = useCallback((post: CommunityPost) => {
    setDeleteTarget(post);
    setDeleteError("");
  }, []);

  const handleCloseDelete = useCallback(() => {
    if (deleteSubmitting) return;

    setDeleteTarget(null);
    setDeleteError("");
  }, [deleteSubmitting]);

  const handleDeletePost = useCallback(async () => {
    if (!deleteTarget || deleteSubmitting) return;

    try {
      setDeleteSubmitting(true);
      setDeleteError("");

      const response = await fetch(
        `/api/community/posts/${deleteTarget.id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const result: ApiResponse<{
        id: string;
        deletedMediaCount: number;
      }> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ?? "Gagal menghapus postingan.",
        );
      }

      setDeleteTarget(null);

      onSuccess(
        "Postingan dan media buktinya berhasil dihapus.",
      );

      await onRefresh();
    } catch (error) {
      console.error("Delete community post error:", error);

      setDeleteError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menghapus postingan.",
      );
    } finally {
      setDeleteSubmitting(false);
    }
  }, [
    deleteTarget,
    deleteSubmitting,
    onSuccess,
    onRefresh,
  ]);

  return {
    deleteTarget,
    deleteSubmitting,
    deleteError,

    handleOpenDelete,
    handleCloseDelete,
    handleDeletePost,
  };
}