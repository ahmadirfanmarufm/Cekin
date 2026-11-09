
"use client";

import { useCallback, useState } from "react";

import type {
  ApiResponse,
  CommunityModerationLog,
  CommunityPost,
  ModerationVerificationStatus,
} from "@/features/community/types";

type UseCommunityModerationOptions = {
  onSuccess: (message: string) => void;
  onRefresh: () => Promise<void>;
};

export function useCommunityModeration({
  onSuccess,
  onRefresh,
}: UseCommunityModerationOptions) {
  const [moderationTarget, setModerationTarget] =
    useState<CommunityPost | null>(null);

  const [moderationStatus, setModerationStatus] =
    useState<ModerationVerificationStatus>("under_review");

  const [moderationNote, setModerationNote] = useState("");
  const [moderationSubmitting, setModerationSubmitting] =
    useState(false);

  const [moderationError, setModerationError] = useState("");

  const [moderationLogTarget, setModerationLogTarget] =
    useState<CommunityPost | null>(null);

  const [moderationLogs, setModerationLogs] =
    useState<CommunityModerationLog[]>([]);

  const [moderationLogsLoading, setModerationLogsLoading] =
    useState(false);

  const [moderationLogsError, setModerationLogsError] =
    useState("");

  const handleOpenModeration = useCallback((post: CommunityPost) => {
    setModerationTarget(post);

    setModerationStatus(
      post.verificationStatus === "under_review" ||
        post.verificationStatus === "verified" ||
        post.verificationStatus === "needs_info" ||
        post.verificationStatus === "rejected"
        ? post.verificationStatus
        : "under_review",
    );

    setModerationNote("");
    setModerationError("");
  }, []);

  const handleCloseModeration = useCallback(() => {
    if (moderationSubmitting) return;

    setModerationTarget(null);
    setModerationNote("");
    setModerationStatus("under_review");
    setModerationError("");
  }, [moderationSubmitting]);

  const handleUpdateVerification = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!moderationTarget) return;

      const note = moderationNote.trim();

      if (
        (moderationStatus === "needs_info" ||
          moderationStatus === "rejected") &&
        !note
      ) {
        setModerationError(
          "Catatan wajib diisi untuk status ini.",
        );
        return;
      }

      try {
        setModerationSubmitting(true);
        setModerationError("");

        const response = await fetch(
          `/api/community/moderation/posts/${moderationTarget.id}/verification`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              verificationStatus: moderationStatus,
              note,
            }),
          },
        );

        const result: ApiResponse<unknown> =
          await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ??
              "Gagal memperbarui status verifikasi.",
          );
        }

        setModerationTarget(null);
        setModerationNote("");
        setModerationStatus("under_review");

        onSuccess(
          "Status verifikasi laporan berhasil diperbarui.",
        );

        await onRefresh();
      } catch (error) {
        console.error("Update verification error:", error);

        setModerationError(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memperbarui verifikasi.",
        );
      } finally {
        setModerationSubmitting(false);
      }
    },
    [
      moderationTarget,
      moderationNote,
      moderationStatus,
      onSuccess,
      onRefresh,
    ],
  );

  const handleOpenModerationLogs = useCallback(
    async (post: CommunityPost) => {
      setModerationLogTarget(post);
      setModerationLogs([]);
      setModerationLogsError("");
      setModerationLogsLoading(true);

      try {
        const response = await fetch(
          `/api/community/posts/${post.id}/history`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          },
        );

        const result: ApiResponse<CommunityModerationLog[]> =
          await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ??
              "Gagal mengambil riwayat moderasi.",
          );
        }

        setModerationLogs(result.data ?? []);
      } catch (error) {
        console.error("Fetch moderation logs error:", error);

        setModerationLogsError(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat mengambil riwayat moderasi.",
        );
      } finally {
        setModerationLogsLoading(false);
      }
    },
    [],
  );

  const handleCloseModerationLogs = useCallback(() => {
    setModerationLogTarget(null);
    setModerationLogs([]);
    setModerationLogsError("");
  }, []);

  return {
    moderationTarget,
    moderationStatus,
    moderationNote,
    moderationSubmitting,
    moderationError,

    moderationLogTarget,
    moderationLogs,
    moderationLogsLoading,
    moderationLogsError,

    setModerationStatus,
    setModerationNote,

    handleOpenModeration,
    handleCloseModeration,
    handleUpdateVerification,

    handleOpenModerationLogs,
    handleCloseModerationLogs,
  };
}
