import { useState } from 'react';
import { RequestCustomAudienceModal } from './RequestCustomAudienceModal';
import { HERO_CTA_FOCUS_CLASS, HeroCtaPillSurface } from './ui/HeroCtaPill';

const GENIUS_AUDIENCES_SUBHEAD =
  'Built from our deterministic and transaction based Genius Fan Graph, with complete coverage across more than 100+ sports, 600+ teams, and 10K+ brands';

function formatSearchTermForLabel(term: string): string {
  const trimmed = term.trim();
  if (!trimmed) return '';

  if (trimmed === trimmed.toLowerCase()) {
    return trimmed
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return trimmed;
}

export function buildAudiencesResultsLabel(
  resultCount: number,
  options: {
    searchTerm?: string;
    filterLabel?: string | null;
  }
): string {
  const parts: string[] = [];

  const formattedSearch = options.searchTerm?.trim()
    ? formatSearchTermForLabel(options.searchTerm)
    : '';
  if (formattedSearch) {
    parts.push(formattedSearch);
  }

  if (options.filterLabel) {
    parts.push(options.filterLabel);
  }

  const title = parts.length > 0 ? `${parts.join(' ')} Audiences` : 'Audiences';
  return `${title} (${resultCount})`;
}

interface GeniusAudiencesHeaderProps {
  resultCount?: number;
  searchTerm?: string;
  filterLabel?: string | null;
  showRefineSearch?: boolean;
  refineQuery?: string;
  onRefineQueryChange?: (value: string) => void;
}

export function GeniusAudiencesHeader({
  resultCount,
  searchTerm,
  filterLabel = null,
  showRefineSearch = false,
  refineQuery = '',
  onRefineQueryChange,
}: GeniusAudiencesHeaderProps) {
  const [customAudienceModalOpen, setCustomAudienceModalOpen] = useState(false);
  const showResults = resultCount !== undefined;
  const resultsLabel =
    resultCount !== undefined
      ? buildAudiencesResultsLabel(resultCount, { searchTerm, filterLabel })
      : '';

  return (
    <div id="audiences" className="page-section-header-gap scroll-mt-24 text-center">
      <h2 className="hero-display-title text-gs-primary-900">Genius Audiences</h2>
      <p className="mx-auto mt-3 max-w-4xl text-subhead font-normal text-pretty max-md:text-base max-md:leading-relaxed max-md:px-2">{GENIUS_AUDIENCES_SUBHEAD}</p>
      <div className={`mt-5 flex justify-center sm:mt-6${showResults ? ' pb-6 sm:pb-8' : ''}`}>
        <button
          type="button"
          onClick={() => setCustomAudienceModalOpen(true)}
          className={HERO_CTA_FOCUS_CLASS}
        >
          <HeroCtaPillSurface>Request a Custom Audience</HeroCtaPillSurface>
        </button>
      </div>
      {showResults && (
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <p className="text-lg sm:text-xl font-semibold text-gs-primary-900">{resultsLabel}</p>
          {showRefineSearch && onRefineQueryChange && (
            <div className="w-full sm:w-80">
              <input
                type="text"
                value={refineQuery}
                onChange={(e) => onRefineQueryChange(e.target.value)}
                placeholder="Search within these results..."
                className="w-full px-4 py-2.5 bg-gs-surface border border-gs-border rounded-lg text-gs-text placeholder-gs-muted focus:outline-none focus:ring-2 focus:ring-gs-accent-500 focus:border-transparent shadow-sm"
              />
            </div>
          )}
        </div>
      )}
      {customAudienceModalOpen && (
        <RequestCustomAudienceModal onClose={() => setCustomAudienceModalOpen(false)} />
      )}
    </div>
  );
}
