"use client";

import { Heart } from "lucide-react";

type LikeButtonProps = {
  liked: boolean;
  count: number;
  onToggle: () => void;
  label?: string;
  ariaLabel: string;
  size?: "sm" | "md";
};

export const LikeButton = ({
  liked,
  count,
  onToggle,
  label,
  ariaLabel,
  size = "md",
}: LikeButtonProps) => {
  const small = size === "sm";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={liked}
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold transition duration-200 active:scale-95 ${
        small ? "px-2 py-1 text-[11px]" : "px-3 py-2 text-xs"
      } ${
        liked
          ? "bg-rose-50 text-rose-600"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      }`}
    >
      <Heart size={small ? 14 : 16} className={liked ? "fill-current" : ""} />
      {label && <span>{label}</span>}
      {count > 0 && <span className="tabular-nums">{count.toLocaleString("id-ID")}</span>}
    </button>
  );
};
