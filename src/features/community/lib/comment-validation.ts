import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  CommunityMediaValidationError,
  validateFileSignature, // <- tambahkan `export` pada fungsi ini di validation.ts
  type CommunityMediaType,
} from "./validation";
import { COMMENT_LIMITS } from "./comment-limits";

export async function validateCommentMedia(file: File, durationSeconds?: number) {
  if (!file || file.size <= 0) {
    throw new CommunityMediaValidationError("File lampiran tidak boleh kosong.");
  }

  const isImage = (ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type);
  const isVideo = (ALLOWED_VIDEO_TYPES as readonly string[]).includes(file.type);

  if (!isImage && !isVideo) {
    throw new CommunityMediaValidationError(`Format "${file.type || "tidak diketahui"}" tidak didukung.`);
  }

  if (isImage && file.size > COMMENT_LIMITS.MAX_IMAGE_SIZE) {
    throw new CommunityMediaValidationError("Foto komentar maksimal 2 MB.");
  }

  if (isVideo) {
    if (file.size > COMMENT_LIMITS.MAX_VIDEO_SIZE) {
      throw new CommunityMediaValidationError("Video komentar maksimal 10 MB.");
    }

    if (typeof durationSeconds !== "number" || !Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      throw new CommunityMediaValidationError("Durasi video tidak valid.");
    }

    if (durationSeconds > COMMENT_LIMITS.MAX_VIDEO_DURATION) {
      throw new CommunityMediaValidationError("Video komentar maksimal 15 detik.");
    }
  }

  const extension = await validateFileSignature(file); // cek isi file, bukan hanya MIME dari klien
  const mediaType: CommunityMediaType = isImage ? "image" : "video";

  return {
    mediaType,
    mimeType: file.type,
    extension,
    fileSize: file.size,
    duration: isVideo ? Math.ceil(durationSeconds as number) : null,
  };
}
