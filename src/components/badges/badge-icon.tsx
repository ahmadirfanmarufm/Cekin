
"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Brain,
  Dices,
  MailWarning,
  PhoneOff,
  ShieldCheck,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

import type {
  BadgeDef,
  BadgeIconKey,
  BadgeShape,
} from "@/lib/learning-protection/badge";

const SHAPES: Record<BadgeShape, string> = {
  shield: "M12 1.5l9 3v7.2c0 5.2-3.7 9-9 10.8-5.3-1.8-9-5.6-9-10.8V4.5z",
  hexagon: "M12 1.5l9 5.2v10.6l-9 5.2-9-5.2V6.7z",
  diamond: "M12 1l10 11-10 11L2 12z",
  octagon: "M8 2h8l6 6v8l-6 6H8l-6-6V8z",
  circle: "M12 1.5a10.5 10.5 0 1 1 0 21 10.5 10.5 0 0 1 0-21z",
  squircle: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z",
};

const ICONS: Record<BadgeIconKey, LucideIcon> = {
  shield: ShieldCheck,
  "phone-app": Smartphone,
  mail: MailWarning,
  "phone-off": PhoneOff,
  dice: Dices,
  brain: Brain,
};

export function BadgeIcon({
  badge,
  size = 20,
  locked = false,
  className = "",
}: {
  badge: BadgeDef;
  size?: number;
  locked?: boolean;
  className?: string;
}) {
  const gradientId = useId().replace(/:/g, "");
  const Icon = ICONS[badge.icon];

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={locked ? "#9ca3af" : badge.from} />
            <stop offset="1" stopColor={locked ? "#6b7280" : badge.to} />
          </linearGradient>
        </defs>

        <path
            d={SHAPES[badge.shape]}
            fill={`url(#${gradientId})`}
            stroke={locked ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.65)"}
            strokeWidth="0.8"
            strokeLinejoin="round"
            className="transition-all duration-200"
        />
      </svg>

      <Icon
        size={Math.max(8, Math.round(size * 0.5))}
        strokeWidth={2.4}
        className={`relative ${locked ? "text-white/60" : "text-white"}`}
      />
    </span>
  );
}

export function BadgeTip({
  badge,
  size = 20,
  locked = false,
}: {
  badge: BadgeDef;
  size?: number;
  locked?: boolean;
}) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    const trigger = triggerRef.current;

    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();

    setPosition({
      top: rect.top - 10,
      left: rect.left + rect.width / 2,
    });
  };

  useEffect(() => {
    if (!visible) return;

    updatePosition();

    const handlePositionChange = () => updatePosition();

    window.addEventListener("scroll", handlePositionChange, true);
    window.addEventListener("resize", handlePositionChange);

    return () => {
      window.removeEventListener("scroll", handlePositionChange, true);
      window.removeEventListener("resize", handlePositionChange);
    };
  }, [visible]);

  const showTooltip = () => {
    updatePosition();
    setVisible(true);
  };

  const hideTooltip = () => {
    setVisible(false);
  };

  const handleTooltipPosition = () => {
    const tooltip = tooltipRef.current;
    const trigger = triggerRef.current;

    if (!tooltip || !trigger) return;

    const rect = tooltip.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();

    const padding = 12;
    const halfWidth = rect.width / 2;

    let left = triggerRect.left + triggerRect.width / 2;

    left = Math.max(
      halfWidth + padding,
      Math.min(left, window.innerWidth - halfWidth - padding),
    );

    setPosition({
      top: triggerRect.top - 10,
      left,
    });
  };

  useEffect(() => {
    if (visible) {
      requestAnimationFrame(handleTooltipPosition);
    }
  }, [visible]);

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex shrink-0 cursor-default outline-none"
        tabIndex={0}
        role="img"
        aria-label={`Badge ${badge.name}: ${badge.description}`}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        <BadgeIcon
            badge={badge}
            size={size}
            locked={locked}
            className={`transition-all duration-200 ${
                locked
                ? ""
                : "hover:scale-110 hover:drop-shadow-[0_0_4px_rgba(255,255,255,0.45)]"
            }`}
        />
      </span>

      {mounted &&
        visible &&
        createPortal(
        <div
            ref={tooltipRef}
            role="tooltip"
            className="
                pointer-events-none fixed z-[99999]
                w-max max-w-[240px]
                -translate-x-1/2 -translate-y-full
                rounded-md border border-gray-200/80
                bg-white px-3.5 py-3
                text-gray-800
                shadow-lg shadow-black/10
                ring-1 ring-black/[0.02]
                animate-in fade-in slide-in-from-bottom-1
                duration-200
            "
            style={{
                top: position.top,
                left: position.left,
            }}
        >
            <p className="text-xs font-bold leading-tight tracking-wide text-gray-900">
              {badge.name}
            </p>

            <p className="mt-1.5 whitespace-normal text-[11px] font-normal leading-relaxed text-gray-500">
              {badge.description}
            </p>

            <span
            className="
                absolute left-1/2 top-full
                -translate-x-1/2
                border-[6px] border-transparent
                border-t-white
                drop-shadow-[0_1px_1px_rgba(0,0,0,0.08)]
            "
            />
          </div>,
          document.body,
        )}
    </>
  );
}
