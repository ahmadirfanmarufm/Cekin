export const COMMENT_LIMITS = {
  MAX_CONTENT: 1000,

  // Sengaja lebih kecil dari postingan supaya komentar tetap ringan.
  MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2 MB (setelah dikompres otomatis di browser)
  MAX_VIDEO_SIZE: 10 * 1024 * 1024, // 10 MB
  MAX_VIDEO_DURATION: 15, // detik

  IMAGE_MAX_DIMENSION: 1280, // px sisi terpanjang
  IMAGE_QUALITY: 0.82,

  MAX_PER_MINUTE: 8,
} as const;
