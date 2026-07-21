import { useCallback, useState } from 'react';
import {
  AUDIENCE_GRID_EXPAND_COUNT,
  INITIAL_AUDIENCE_GRID_COUNT,
} from '../components/PopularAudiences';

export function useAudienceGridExpansion(totalCount: number) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_AUDIENCE_GRID_COUNT);
  const [showAll, setShowAll] = useState(false);

  const reset = useCallback(() => {
    setVisibleCount(INITIAL_AUDIENCE_GRID_COUNT);
    setShowAll(false);
  }, []);

  const displayCount = showAll ? totalCount : Math.min(visibleCount, totalCount);
  const hiddenCount = Math.max(0, totalCount - displayCount);
  const canSeeMore = !showAll && hiddenCount > 0;
  const seeMoreIncrement = Math.min(AUDIENCE_GRID_EXPAND_COUNT, hiddenCount);
  const showLess =
    totalCount > INITIAL_AUDIENCE_GRID_COUNT && displayCount >= totalCount;

  const seeMore = useCallback(() => {
    setVisibleCount((count) =>
      Math.min(count + AUDIENCE_GRID_EXPAND_COUNT, totalCount),
    );
  }, [totalCount]);

  const showAllResults = useCallback(() => {
    setShowAll(true);
  }, []);

  const collapse = useCallback(() => {
    reset();
  }, [reset]);

  return {
    displayCount,
    canSeeMore,
    seeMoreIncrement,
    hiddenCount,
    showLess,
    seeMore,
    showAllResults,
    collapse,
    reset,
    showControls: totalCount > INITIAL_AUDIENCE_GRID_COUNT,
  };
}
