
"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

type CommunityImageDialogProps = {
  imageUrl: string | null;
  onClose: () => void;
};

export function CommunityImageDialog({
  imageUrl,
  onClose,
}: CommunityImageDialogProps) {
  useEffect(() => {
    if (!imageUrl) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [imageUrl, onClose]);

  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup pratinjau foto"
        className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6 sm:top-6"
      >
        <X size={21} />
      </button>

      {/* Image */}
      <div
        className="flex max-h-full max-w-full items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt="Pratinjau bukti laporan"
          className="max-h-[88dvh] max-w-full rounded-lg object-contain shadow-2xl"
        />
      </div>
    </div>
  );
}
