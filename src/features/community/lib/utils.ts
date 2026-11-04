
import {
  AlertCircle,
  Clock3,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import type { CommunityCategory } from "@/features/community/types";

export const CATEGORIES: {
  value: CommunityCategory | "all";
  label: string;
}[] = [
  { value: "all", label: "Semua" },
  { value: "whatsapp-scam", label: "WhatsApp" },
  { value: "phishing", label: "Phishing" },
  { value: "marketplace-scam", label: "Marketplace" },
  { value: "investment-scam", label: "Investasi" },
  { value: "job-scam", label: "Lowongan Kerja" },
  { value: "fake-giveaway", label: "Giveaway" },
  { value: "fake-account", label: "Akun Palsu" },
  { value: "other", label: "Lainnya" },
];

export const formatDate = (date: string) => {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
};

export const getCategoryLabel = (category: string) => {
  return (
    CATEGORIES.find((item) => item.value === category)?.label ??
    "Lainnya"
  );
};

export const getVerificationConfig = (status: string) => {
  switch (status) {
    case "verified":
      return {
        label: "Terverifikasi",
        className: "border-green-200 bg-green-50 text-green-700",
        icon: ShieldCheck,
      };

    case "under_review":
      return {
        label: "Sedang Ditinjau",
        className: "border-blue-200 bg-blue-50 text-blue-700",
        icon: Clock3,
      };

    case "needs_info":
      return {
        label: "Perlu Informasi Tambahan",
        className: "border-orange-200 bg-orange-50 text-orange-700",
        icon: AlertCircle,
      };

    case "rejected":
      return {
        label: "Tidak Terverifikasi",
        className: "border-red-200 bg-red-50 text-red-700",
        icon: ShieldAlert,
      };

    case "unverified":
    default:
      return {
        label: "Belum Diverifikasi",
        className: "border-amber-200 bg-amber-50 text-amber-800",
        icon: Clock3,
      };
  }
};
