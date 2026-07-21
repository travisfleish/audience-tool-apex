import { type ReactNode } from 'react';
import { INITIAL_AUDIENCE_GRID_COUNT } from './PopularAudiences';
import { chunkItems, MobileAudienceCarousel } from './MobileAudienceCarousel';

interface FilteredAudienceResultsProps<T> {
  items: T[];
  displayCount: number;
  renderItem: (item: T, index: number) => ReactNode;
  chunkSize?: number;
}

export function FilteredAudienceResults<T>({
  items,
  displayCount,
  renderItem,
  chunkSize = INITIAL_AUDIENCE_GRID_COUNT,
}: FilteredAudienceResultsProps<T>) {
  const visibleItems = items.slice(0, displayCount);
  const carouselChunks = chunkItems(visibleItems, chunkSize);

  return (
    <>
      <div className="space-y-10 md:hidden">
        {carouselChunks.map((chunk, chunkIndex) => (
          <MobileAudienceCarousel
            key={chunkIndex}
            items={chunk}
            renderItem={(item, indexInChunk) =>
              renderItem(item, chunkIndex * chunkSize + indexInChunk)
            }
            ariaLabel={
              carouselChunks.length > 1
                ? `Audience results, group ${chunkIndex + 1} of ${carouselChunks.length}`
                : 'Audience results'
            }
          />
        ))}
      </div>

      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleItems.map((item, index) => renderItem(item, index))}
      </div>
    </>
  );
}
