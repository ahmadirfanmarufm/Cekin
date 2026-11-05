
"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { ArrowRight, Check, MousePointerClick } from "lucide-react";

export type TutorialStep = {
  id: string;
  title: string;
  body: string;
  target?: string;
  wait?: string;
  prompt?: string;
  cta?: string;
  delay?: number;
};

type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type Arrow = {
  side: "top" | "bottom" | "left" | "right";
  offset: number;
};

type Props = {
  steps: TutorialStep[];
  active: boolean;
  done: Record<string, boolean>;
  onClose: (completed: boolean) => void;
};

const PADDING = 8;
const GAP = 14;
const MARGIN = 12;
const CARD_MAX_WIDTH = 300;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function unionRect(elements: HTMLElement[]): Rect {
  let top = Infinity;
  let left = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;

  for (const element of elements) {
    const box = element.getBoundingClientRect();

    top = Math.min(top, box.top);
    left = Math.min(left, box.left);
    right = Math.max(right, box.right);
    bottom = Math.max(bottom, box.bottom);
  }

  return {
    top,
    left,
    width: right - left,
    height: bottom - top,
  };
}

export function GuidedTutorial({
  steps,
  active,
  done,
  onClose,
}: Props) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [cardHeight, setCardHeight] = useState(0);
  const [lookupFailed, setLookupFailed] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const step = steps[index];
  const isLast = index === steps.length - 1;
  const stepDone = !!step?.wait && !!done[step.wait];

  useEffect(() => {
    if (active) setIndex(0);
  }, [active]);

  useEffect(() => {
    if (!active || !stepDone || !step) return;

    const timer = setTimeout(
      () =>
        setIndex((current) =>
          Math.min(current + 1, steps.length - 1),
        ),
      step.delay ?? 450,
    );

    return () => clearTimeout(timer);
  }, [active, stepDone, step, steps.length]);

  const findTargets = useCallback((): HTMLElement[] => {
    if (!step?.target) return [];

    return step.target
      .split(",")
      .map((name) =>
        document.querySelector<HTMLElement>(
          `[data-tutorial="${name.trim()}"]`,
        ),
      )
      .filter((element): element is HTMLElement => element !== null);
  }, [step?.target]);

  const measure = useCallback(() => {
    setViewport({
      w: window.innerWidth,
      h: window.innerHeight,
    });

    const elements = findTargets();

    setRect(
      elements.length ? unionRect(elements) : null,
    );
  }, [findTargets]);

  useEffect(() => {
    if (!active || !step) return;

    setLookupFailed(false);

    let scrolled = false;

    const scrollToTargets = () => {
      if (scrolled) return;

      const elements = findTargets();

      if (!elements.length) return;

      scrolled = true;

      if (
        elements[0].closest(
          '[aria-modal="true"], [data-tutorial-scroll]',
        )
      ) {
        elements[0].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        return;
      }

      const box = unionRect(elements);
      const vh = window.innerHeight;

      const holeHeight = box.height + PADDING * 2;
      const cardH = cardRef.current?.offsetHeight || 150;

      const group = holeHeight + GAP + cardH;

      let desiredTop: number;

      if (group + MARGIN * 2 <= vh) {
        desiredTop = (vh - group) / 2 + PADDING;
      } else if (holeHeight + MARGIN * 2 <= vh) {
        desiredTop = (vh - holeHeight) / 2 + PADDING;
      } else {
        desiredTop = MARGIN + PADDING;
      }

      window.scrollBy({
        top: box.top - desiredTop,
        behavior: "smooth",
      });
    };

    scrollToTargets();
    measure();

    const retries = [120, 450, 900].map((delay) =>
      setTimeout(() => {
        scrollToTargets();
        measure();
      }, delay),
    );

    const failTimer = setTimeout(() => {
      if (!findTargets().length) {
        setLookupFailed(true);
      }
    }, 1000);

    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);

    return () => {
      retries.forEach(clearTimeout);
      clearTimeout(failTimer);

      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [active, index, step, findTargets, measure]);

  useLayoutEffect(() => {
    if (cardRef.current) {
      setCardHeight(cardRef.current.offsetHeight);
    }
  }, [index, active, rect]);

  useEffect(() => {
    if (!active) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [active, onClose]);

  if (!active || !step || steps.length === 0) {
    return null;
  }

  const goNext = () => {
    if (isLast) {
      onClose(true);
      return;
    }

    setIndex((current) => current + 1);
  };

  const hole = rect
    ? {
        top: clamp(rect.top - PADDING, 0, viewport.h),
        bottom: clamp(
          rect.top + rect.height + PADDING,
          0,
          viewport.h,
        ),
        left: clamp(rect.left - PADDING, 0, viewport.w),
        right: clamp(
          rect.left + rect.width + PADDING,
          0,
          viewport.w,
        ),
      }
    : null;

  // Jika target tidak ditemukan, jangan mengunci seluruh layar.
  const showDim = !!hole || !step.target || !lookupFailed;

  const cardWidth = viewport.w
    ? Math.min(CARD_MAX_WIDTH, viewport.w - MARGIN * 2)
    : CARD_MAX_WIDTH;

  let cardStyle: CSSProperties = step.target
    ? {
        bottom: MARGIN,
        left: "50%",
        width: cardWidth,
        transform: "translateX(-50%)",
      }
    : {
        top: "50%",
        left: "50%",
        width: cardWidth,
        transform: "translate(-50%, -50%)",
      };

  let arrow: Arrow | null = null;

  if (hole) {
    const height = cardHeight || 150;

    const centerX = (hole.left + hole.right) / 2;
    const centerY = (hole.top + hole.bottom) / 2;

    const needVertical = height + GAP + MARGIN;
    const needHorizontal = cardWidth + GAP + MARGIN;

    const horizontalLeft = clamp(
      centerX - cardWidth / 2,
      MARGIN,
      viewport.w - cardWidth - MARGIN,
    );

    const verticalTop = clamp(
      centerY - height / 2,
      MARGIN,
      viewport.h - height - MARGIN,
    );

    if (viewport.h - hole.bottom >= needVertical) {
      cardStyle = {
        top: hole.bottom + GAP,
        left: horizontalLeft,
        width: cardWidth,
      };

      arrow = {
        side: "top",
        offset: clamp(
          centerX - horizontalLeft,
          24,
          cardWidth - 24,
        ),
      };
    } else if (hole.top >= needVertical) {
      cardStyle = {
        top: hole.top - GAP - height,
        left: horizontalLeft,
        width: cardWidth,
      };

      arrow = {
        side: "bottom",
        offset: clamp(
          centerX - horizontalLeft,
          24,
          cardWidth - 24,
        ),
      };
    } else if (viewport.w - hole.right >= needHorizontal) {
      cardStyle = {
        top: verticalTop,
        left: hole.right + GAP,
        width: cardWidth,
      };

      arrow = {
        side: "left",
        offset: clamp(
          centerY - verticalTop,
          24,
          height - 24,
        ),
      };
    } else if (hole.left >= needHorizontal) {
      cardStyle = {
        top: verticalTop,
        left: hole.left - GAP - cardWidth,
        width: cardWidth,
      };

      arrow = {
        side: "right",
        offset: clamp(
          centerY - verticalTop,
          24,
          height - 24,
        ),
      };
    } else {
      cardStyle = {
        bottom: MARGIN,
        left: horizontalLeft,
        width: cardWidth,
      };
    }
  }

  const arrowClass: Record<Arrow["side"], string> = {
    top: "-top-1.5 border-l border-t",
    bottom: "-bottom-1.5 border-b border-r",
    left: "-left-1.5 border-b border-l",
    right: "-right-1.5 border-r border-t",
  };

  const interactive = !!step.wait;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[200]"
      aria-live="polite"
    >
      {showDim &&
        (hole ? (
          <>
            <div
              className="pointer-events-auto fixed bg-black/65"
              style={{
                top: 0,
                left: 0,
                width: "100%",
                height: hole.top,
              }}
            />

            <div
              className="pointer-events-auto fixed bg-black/65"
              style={{
                top: hole.bottom,
                left: 0,
                width: "100%",
                height: viewport.h - hole.bottom,
              }}
            />

            <div
              className="pointer-events-auto fixed bg-black/65"
              style={{
                top: hole.top,
                left: 0,
                width: hole.left,
                height: hole.bottom - hole.top,
              }}
            />

            <div
              className="pointer-events-auto fixed bg-black/65"
              style={{
                top: hole.top,
                left: hole.right,
                width: viewport.w - hole.right,
                height: hole.bottom - hole.top,
              }}
            />

            <div
              className="pointer-events-none fixed transition-all duration-300"
              style={{
                top: hole.top,
                left: hole.left,
                width: hole.right - hole.left,
                height: hole.bottom - hole.top,
              }}
            >
              <div className="absolute inset-0 rounded-2xl border-2 border-white shadow-[0_0_0_4px_rgba(255,255,255,0.25)]" />

              {interactive && (
                <>
                  <div className="absolute inset-0 animate-ping rounded-2xl border-2 border-[var(--accent)] motion-reduce:animate-none" />

                  <MousePointerClick
                    size={26}
                    className="absolute -bottom-3 -right-2 animate-bounce fill-white text-[var(--brand-dark)] drop-shadow motion-reduce:animate-none"
                  />
                </>
              )}
            </div>

            {!interactive && (
              <div
                className="pointer-events-auto fixed"
                style={{
                  top: hole.top,
                  left: hole.left,
                  width: hole.right - hole.left,
                  height: hole.bottom - hole.top,
                }}
              />
            )}
          </>
        ) : (
          <div className="pointer-events-auto fixed inset-0 bg-black/65" />
        ))}

      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guided-tutorial-title"
        className="pointer-events-auto fixed overflow-visible rounded-sm border border-[var(--border)] bg-[var(--card)] shadow-2xl transition-[top,left] duration-300"
        style={cardStyle}
      >
        {arrow && (
          <span
            aria-hidden="true"
            className={`absolute h-3 w-3 rotate-45 border-[var(--border)] bg-[var(--card)] ${arrowClass[arrow.side]}`}
            style={
              arrow.side === "top" || arrow.side === "bottom"
                ? { left: arrow.offset - 6 }
                : { top: arrow.offset - 6 }
            }
          />
        )}

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <h2
              id="guided-tutorial-title"
              className="text-sm font-extrabold leading-snug text-[var(--foreground)]"
            >
              {step.title}
            </h2>

            <button
              onClick={() => onClose(false)}
              className="shrink-0 text-[11px] font-semibold text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              Lewati
            </button>
          </div>

          <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
            {step.body}
          </p>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-[10px] font-bold tabular-nums text-[var(--muted)]">
              {index + 1}/{steps.length}
            </span>

            {step.wait && !lookupFailed ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[var(--accent)]">
                <MousePointerClick size={14} />
                {step.prompt}
              </span>
            ) : (
              <button
                onClick={goNext}
                className="button button-primary !min-h-0 !px-4 !py-2 text-xs"
              >
                {step.cta ?? "Lanjut"}
                {isLast ? (
                  <Check size={14} />
                ) : (
                  <ArrowRight size={14} />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}