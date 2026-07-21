import { HERO_CTA_KLARHEIT_TYPO_CLASS } from './ui/HeroCtaPill';

interface AudienceGridExpansionControlsProps {
  canSeeMore: boolean;
  seeMoreIncrement: number;
  hiddenCount: number;
  showLess: boolean;
  onSeeMore: () => void;
  onShowAll: () => void;
  onShowLess: () => void;
}

export function AudienceGridExpansionControls({
  canSeeMore,
  seeMoreIncrement,
  hiddenCount,
  showLess,
  onSeeMore,
  onShowAll,
  onShowLess,
}: AudienceGridExpansionControlsProps) {
  if (!canSeeMore && !showLess) return null;

  return (
    <div className="mt-8 text-center space-y-4">
      {canSeeMore && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onSeeMore}
            className={`px-6 py-3 bg-gs-accent-500 text-white rounded-md hover:bg-gs-accent-600 transition-colors shadow-sm hover:shadow-md ${HERO_CTA_KLARHEIT_TYPO_CLASS}`}
          >
            See More ({seeMoreIncrement} more)
          </button>
          <button
            type="button"
            onClick={onShowAll}
            className={`px-6 py-3 text-gs-primary-900 border border-gs-border rounded-md hover:bg-gs-surface transition-colors ${HERO_CTA_KLARHEIT_TYPO_CLASS}`}
          >
            Show all ({hiddenCount} more)
          </button>
        </div>
      )}
      {showLess && (
        <button
          type="button"
          onClick={onShowLess}
          className="text-gs-accent-600 hover:text-gs-accent-700 font-medium underline-offset-2 hover:underline"
        >
          Show less
        </button>
      )}
    </div>
  );
}
