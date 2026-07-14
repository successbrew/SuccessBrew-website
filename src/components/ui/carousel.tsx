"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type CarouselHandle = {
  scrollToIndex: (index: number) => void;
};

/**
 * Reusable horizontal carousel: native overflow-x scrolling (so touch swipe and
 * trackpad get free browser momentum/inertia), mouse click-and-drag on desktop,
 * hidden scrollbar, and optional arrow buttons. Renders however many children
 * it's given — add or remove items and the carousel adjusts with no code changes.
 *
 * `items-start` on the track is deliberate: without it, flexbox's default
 * cross-axis stretch makes every child match the height of the tallest one
 * (e.g. an under-filled last "page" would inherit a fuller page's height).
 */
export const Carousel = forwardRef<CarouselHandle, {
  children: ReactNode;
  className?: string;
  trackClassName?: string;
  showArrows?: boolean;
  /** Fraction of the visible width each arrow click scrolls by (1 = a full page). */
  arrowScrollRatio?: number;
  /** Called with the index of the child nearest the current scroll position. */
  onIndexChange?: (index: number) => void;
}>(function Carousel(
  { children, className, trackClassName, showArrows = true, arrowScrollRatio = 0.8, onIndexChange },
  ref
) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);
  const didDrag = useRef(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function stepWidth(el: HTMLDivElement) {
    const gap = parseFloat(getComputedStyle(el).columnGap || "0") || 0;
    const first = el.children[0] as HTMLElement | undefined;
    return (first?.getBoundingClientRect().width ?? el.clientWidth) + gap;
  }

  function updateState() {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    if (onIndexChange) {
      const width = stepWidth(el);
      onIndexChange(width ? Math.round(el.scrollLeft / width) : 0);
    }
  }

  useEffect(() => {
    updateState();
    const el = trackRef.current;
    if (!el) return;
    const resizeObserver = new ResizeObserver(updateState);
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  useImperativeHandle(ref, () => ({
    scrollToIndex(index: number) {
      const el = trackRef.current;
      if (!el) return;
      el.scrollTo({ left: index * stepWidth(el), behavior: "smooth" });
    },
  }));

  function scrollByPage(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * arrowScrollRatio * direction, behavior: "smooth" });
  }

  // Only intercept mouse drags — touch already gets native swipe/momentum scrolling.
  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const el = trackRef.current;
    if (!el) return;
    isDragging.current = true;
    didDrag.current = false;
    dragStartX.current = e.clientX;
    dragStartScroll.current = el.scrollLeft;
    el.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!isDragging.current || e.pointerType !== "mouse") return;
    const el = trackRef.current;
    if (!el) return;
    const delta = e.clientX - dragStartX.current;
    if (Math.abs(delta) > 3) didDrag.current = true;
    el.scrollLeft = dragStartScroll.current - delta;
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    isDragging.current = false;
    trackRef.current?.releasePointerCapture(e.pointerId);
  }

  // Suppress a card's link navigation if the pointer actually dragged.
  function onClickCapture(e: ReactMouseEvent<HTMLDivElement>) {
    if (didDrag.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div
        ref={trackRef}
        onScroll={updateState}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onClickCapture={onClickCapture}
        className={cn(
          "hide-scrollbar flex cursor-grab items-start gap-6 overflow-x-auto scroll-smooth active:cursor-grabbing",
          trackClassName
        )}
      >
        {children}
      </div>

      {showArrows && (
        <>
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollByPage(-1)}
            className={cn(
              "absolute left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-ink/10 bg-background/90 shadow-md backdrop-blur transition hover:bg-ink hover:text-background md:grid",
              !canScrollLeft && "pointer-events-none opacity-0"
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollByPage(1)}
            className={cn(
              "absolute right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-ink/10 bg-background/90 shadow-md backdrop-blur transition hover:bg-ink hover:text-background md:grid",
              !canScrollRight && "pointer-events-none opacity-0"
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
});
