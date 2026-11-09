export const COMMUNITY_PATH = "/community";

export const COMMUNITY_CATEGORY_VALUES = [
  "whatsapp-scam",
  "phishing",
  "marketplace-scam",
  "investment-scam",
  "job-scam",
  "fake-giveaway",
  "fake-account",
  "other",
] as const;

export const EDITABLE_STATUSES = ["unverified", "needs_info"] as const;

export const canEditPost = (verificationStatus: string) => (EDITABLE_STATUSES as readonly string[]).includes(verificationStatus);

export const MODERATOR_ROLES = ["moderator", "admin"] as const;

export const isModeratorRole = (role: string | null | undefined) => Boolean(role) && (MODERATOR_ROLES as readonly string[]).includes(role as string);

export const REPORT_REASONS = [
  {
    value: "misleading",
    label: "Informasi palsu atau menyesatkan",
    hint: "Isi laporan tidak benar atau bisa menyesatkan orang lain.",
  },
  {
    value: "personal_data",
    label: "Memuat data pribadi",
    hint: "OTP, rekening, alamat, atau data orang lain terlihat.",
  },
  {
    value: "spam",
    label: "Spam atau iklan",
    hint: "Promosi, tautan berulang, atau tidak relevan.",
  },
  {
    value: "abusive",
    label: "Kasar atau menyerang",
    hint: "Hinaan, ancaman, atau pelecehan.",
  },
  {
    value: "inappropriate",
    label: "Konten tidak pantas",
    hint: "Konten dewasa, kekerasan, atau SARA.",
  },
  {
    value: "other",
    label: "Lainnya",
    hint: "Jelaskan singkat di kolom di bawah.",
  },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["value"];

export const REPORT_DETAIL_MAX = 300;
export const REPORT_OTHER_MIN = 10;

export const getReportReasonLabel = (value: string) =>
  REPORT_REASONS.find((reason) => reason.value === value)?.label ?? "Lainnya";