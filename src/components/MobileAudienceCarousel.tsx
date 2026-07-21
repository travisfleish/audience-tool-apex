import { useEffect, useRef, useState, type ReactNode, type TouchEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MobileAudienceCarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  /** Accessible name when multiple carousels are stacked on the page. */
  ariaLabel?: string;
}

export function MobileAudienceCarousel<T>({
  items,
  renderItem,
  ariaLabel,
}: MobileAudienceCarouselProps<T>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const minimumSwipeDistance = 50;

  useEffect(() => {
    setActiveIndex(0);
  }, [items]);

  if (items.length === 0) return null;

  const currentIndex = Math.min(activeIndex, items.length - 1);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < items.length - 1;

  const goPrev = () => {
    if (!canGoPrev) return;
    setActiveIndex((prev) => prev - 1);
  };

  const goNext = () => {
    if (!canGoNext) return;
    setActiveIndex((prev) => prev + 1);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;

    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const swipeDistance = endX - touchStartX.current;

    if (Math.abs(swipeDistance) >= minimumSwipeDistance) {
      if (swipeDistance < 0) {
        goNext();
      } else {
        goPrev();
      }
    }

    touchStartX.current = null;
  };

  return (
    <div className="md:hidden" aria-label={ariaLabel}>
      <div
        className="max-w-sm max-md:max-w-none mx-auto"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {renderItem(items[currentIndex], currentIndex)}
      </div>

      {items.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={goPrev}
            disabled={!canGoPrev}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gs-border bg-gs-surface text-gs-primary-900 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Previous audience"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <p className="text-sm text-gs-muted min-w-[64px] text-center">
            {currentIndex + 1} / {items.length}
          </p>
          <button
            type="button"
            onClick={goNext}
            disabled={!canGoNext}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gs-border bg-gs-surface text-gs-primary-900 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Next audience"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export function chunkItems<T>(items: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) return [items];

  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
}
