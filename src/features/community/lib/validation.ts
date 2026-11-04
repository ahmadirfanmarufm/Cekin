
export const COMMUNITY_MEDIA_LIMITS = {
  MAX_FILES: 4,
  MAX_VIDEOS: 1,

  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5 MB
  MAX_VIDEO_SIZE: 25 * 1024 * 1024, // 25 MB
  MAX_TOTAL_SIZE: 30 * 1024 * 1024, // 30 MB

  MAX_VIDEO_DURATION: 60, // detik
} as const;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

export type CommunityMediaType = "image" | "video";

export interface CommunityMediaInput {
  file: File;
  durationSeconds?: number;
}

export interface ValidatedCommunityMedia {
  file: File;
  mediaType: CommunityMediaType;
  mimeType: string;
  extension: string;
  fileSize: number;
  duration: number | null;
}

export class CommunityMediaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CommunityMediaValidationError";
  }
}

function readAscii(bytes: Uint8Array, start: number, length: number): string {
  return Array.from(bytes.slice(start, start + length)).map((byte) => String.fromCharCode(byte)).join("");
}

export async function validateFileSignature(file: File): Promise<string> {
  const buffer = await file.slice(0, 32).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // JPEG
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  ) {
    if (file.type !== "image/jpeg") {
      throw new CommunityMediaValidationError("Format file tidak sesuai dengan MIME type JPEG.",);
    }

    return "jpg";
  }

  // PNG
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    if (file.type !== "image/png") {
      throw new CommunityMediaValidationError("Format file tidak sesuai dengan MIME type PNG.",);
    }

    return "png";
  }

  // WebP
  if (bytes.length >= 12 && readAscii(bytes, 0, 4) === "RIFF" && readAscii(bytes, 8, 4) === "WEBP") {
    if (file.type !== "image/webp") {
      throw new CommunityMediaValidationError("Format file tidak sesuai dengan MIME type WebP.",);
    }

    return "webp";
  }

  // WebM (EBML signature)
  if (bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3
  ) {
    if (file.type !== "video/webm") {
      throw new CommunityMediaValidationError("Format file tidak sesuai dengan MIME type WebM.",);
    }

    return "webm";
  }

  // MP4 / MOV (ISO Base Media File Format)
  if (bytes.length >= 12 && readAscii(bytes, 4, 4) === "ftyp") {
    const brand = readAscii(bytes, 8, 4);

    // QuickTime MOV
    if (brand === "qt  ") {
      if (file.type !== "video/quicktime") {
        throw new CommunityMediaValidationError("Format file tidak sesuai dengan MIME type MOV.");
      }

      return "mov";
    }

    // MP4
    const allowedMp4Brands = [
      "isom",
      "iso2",
      "iso3",
      "iso4",
      "iso5",
      "iso6",
      "mp41",
      "mp42",
      "avc1",
      "M4V ",
      "MSNV",
    ];

    if (allowedMp4Brands.includes(brand)) {
      if (file.type !== "video/mp4") {
        throw new CommunityMediaValidationError("Format file tidak sesuai dengan MIME type MP4.");
      }

      return "mp4";
    }
  }

  throw new CommunityMediaValidationError(`File "${file.name}" memiliki format yang tidak valid atau tidak didukung.`);
}

async function validateSingleMedia(item: CommunityMediaInput): Promise<ValidatedCommunityMedia> {
  const { file, durationSeconds } = item;

  if (!file || file.size <= 0) {
    throw new CommunityMediaValidationError("File tidak boleh kosong.",);
  }

  const isImage = (ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type);

  const isVideo = (ALLOWED_VIDEO_TYPES as readonly string[]).includes(file.type);

  if (!isImage && !isVideo) {
    throw new CommunityMediaValidationError(`Format "${file.type || "tidak diketahui"}" tidak didukung.`);
  }

  const mediaType: CommunityMediaType = isImage ? "image" : "video";

  if (isImage && file.size > COMMUNITY_MEDIA_LIMITS.MAX_IMAGE_SIZE) {
    throw new CommunityMediaValidationError(`Foto "${file.name}" melebihi batas 5 MB.`);
  }

  if (isVideo && file.size > COMMUNITY_MEDIA_LIMITS.MAX_VIDEO_SIZE) {
    throw new CommunityMediaValidationError(`Video "${file.name}" melebihi batas 25 MB.`,);
  }

  if (isVideo) {
    if (typeof durationSeconds !== "number" || !Number.isFinite(durationSeconds) ||durationSeconds <= 0) {
      throw new CommunityMediaValidationError(`Durasi video "${file.name}" tidak valid.`);
    }

    if (durationSeconds > COMMUNITY_MEDIA_LIMITS.MAX_VIDEO_DURATION) {
      throw new CommunityMediaValidationError(`Video "${file.name}" melebihi durasi maksimal 60 detik.`);
    }
  }

  const extension = await validateFileSignature(file);

  return {
    file,
    mediaType,
    mimeType: file.type,
    extension,
    fileSize: file.size,
    duration: isVideo
      ? Math.ceil(durationSeconds!)
      : null,
  };
}

export async function validateCommunityMedia(items: CommunityMediaInput[]): Promise<ValidatedCommunityMedia[]> {
  if (!Array.isArray(items) || items.length === 0) {
    throw new CommunityMediaValidationError(
      "Tambahkan minimal satu foto atau video bukti.",
    );
  }

  // Maksimal 4 file
  if (items.length > COMMUNITY_MEDIA_LIMITS.MAX_FILES) {
    throw new CommunityMediaValidationError(
      "Maksimal 4 file media dalam satu postingan.",
    );
  }

  const videoCount = items.filter((item) =>
    (ALLOWED_VIDEO_TYPES as readonly string[]).includes(
      item.file?.type ?? "",
    ),
  ).length;

  if (videoCount > COMMUNITY_MEDIA_LIMITS.MAX_VIDEOS) {
    throw new CommunityMediaValidationError(
      "Maksimal 1 video dalam satu postingan.",
    );
  }

  const totalSize = items.reduce(
    (total, item) => total + (item.file?.size ?? 0),
    0,
  );

  if (totalSize > COMMUNITY_MEDIA_LIMITS.MAX_TOTAL_SIZE) {
    throw new CommunityMediaValidationError(
      "Total ukuran seluruh media tidak boleh melebihi 30 MB.",
    );
  }

  const validatedMedia = await Promise.all(
    items.map((item) => validateSingleMedia(item)),
  );

  return validatedMedia;
}

export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);

    video.preload = "metadata";

    video.onloadedmetadata = () => {
      const duration = video.duration;

      URL.revokeObjectURL(objectUrl);

      if (!Number.isFinite(duration)) {
        reject(new Error("Durasi video tidak valid."));
        return;
      }

      resolve(duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Tidak dapat membaca metadata video."));
    };

    video.src = objectUrl;
  });
}