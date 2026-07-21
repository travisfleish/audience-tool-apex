import { Check, Star } from 'lucide-react';
import { useState } from 'react';
import { Audience } from '../lib/supabase';
import { ActivationModal } from '../core/ActivationModal';
import { normalizeShoutedDisplayName } from '../core/audienceDisplay';
import {
  hasSeenDealBuilderIntro,
  markDealBuilderIntroSeen,
  scrollToMomentsSection,
} from '../core/dealBuilder';
import { NOTEBOOK_ENABLED } from '../core/featureFlags';
import { BuildDealIntroModal } from './BuildDealIntroModal';
import { AUDIENCE_CARD_CTA_KLARHEIT_CLASS } from './ui/HeroCtaPill';

interface AudienceCardProps {
  audience: Audience;
  onAddToNotebook: (audience: Audience) => void;
  isInNotebook: boolean;
  audienceDealSlotTaken?: boolean;
  isTopPerformer?: boolean;
  displayName: string;
}

function formatTaxonomySegment(segment: string): string {
  return segment
    .replace(/Betting,\s*Gaming\s*&\s*Wagering/gi, 'Betting & Gaming')
    .replace(/Fans Of Women's Sports\s*\((?:FOWS|Fows)\)/gi, "Fans Of Women's Sports")
    .replace(/\s*\((?:FOWS|Fows)\)\s*$/gi, '')
    .trim();
}

export function AudienceCard({
  audience,
  onAddToNotebook,
  isInNotebook,
  audienceDealSlotTaken = false,
  isTopPerformer = false,
  displayName,
}: AudienceCardProps) {
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showBuildDealIntro, setShowBuildDealIntro] = useState(false);
  const buildDealDisabled = isInNotebook || (audienceDealSlotTaken && !isInNotebook);

  const handleBuildDeal = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (buildDealDisabled) return;

    onAddToNotebook(audience);

    if (!hasSeenDealBuilderIntro()) {
      setShowBuildDealIntro(true);
    }
  };

  const handleIntroContinue = () => {
    markDealBuilderIntroSeen();
    setShowBuildDealIntro(false);
    scrollToMomentsSection();
  };

  const handleIntroClose = () => {
    markDealBuilderIntroSeen();
    setShowBuildDealIntro(false);
  };
  const taxonomySegments = audience.name
    .split('>')
    .map((segment) => normalizeShoutedDisplayName(formatTaxonomySegment(segment.trim())))
    .filter(Boolean);
  const topLineCategories = taxonomySegments.slice(0, 2);
  const bottomLineCategories = taxonomySegments.slice(2, 4);

  return (
    <div className="bg-gs-surface rounded-lg border border-gs-border hover:border-gs-accent-500 transition-all duration-200 p-6 max-md:p-4 flex flex-col h-full relative overflow-visible hover:shadow-md">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg" aria-hidden="true">
        <img
          src="/Green lines (1).png"
          alt=""
          className="absolute -bottom-10 -right-8 h-36 w-auto opacity-35"
        />
      </div>
      {isTopPerformer && (
        <div className="absolute -top-3 -right-3 bg-[#18c971] text-gs-primary-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg z-20">
          <Star className="w-3 h-3 fill-current" />
          TOP PICK
        </div>
      )}
      <div className="relative z-10 mb-3">
        <h3 className="text-lg font-semibold text-gs-primary-900 leading-tight break-words">
          {displayName}
        </h3>
      </div>

      <div className="relative z-10 mb-4 flex-1">
        {topLineCategories.length > 0 && (
          <p className="text-[14px] font-body !leading-[1.45] !tracking-[-0.01125em] text-gs-muted max-md:whitespace-normal max-md:line-clamp-2 md:truncate md:whitespace-nowrap">
            {topLineCategories.join(' > ')}
          </p>
        )}
        {bottomLineCategories.length > 0 && (
          <p className="text-[14px] font-body !leading-[1.45] !tracking-[-0.01125em] text-gs-muted max-md:whitespace-normal max-md:line-clamp-2 md:truncate md:whitespace-nowrap">
            {bottomLineCategories.join(' > ')}
          </p>
        )}
      </div>

      <div className={`relative z-10 flex flex-col sm:flex-row gap-2${NOTEBOOK_ENABLED ? '' : ' sm:justify-stretch'}`}>
        <button
          onClick={(event) => {
            event.stopPropagation();
            setShowActivateModal(true);
          }}
          className={`w-full${NOTEBOOK_ENABLED ? ' sm:flex-1' : ''} min-w-0 flex items-center justify-center px-2.5 py-2.5 rounded-md bg-gs-accent-500 text-white hover:bg-gs-accent-600 transition-all shadow-sm hover:shadow-md whitespace-nowrap ${AUDIENCE_CARD_CTA_KLARHEIT_CLASS}`}
        >
          Activate
        </button>
        {NOTEBOOK_ENABLED && (
          <button
            onClick={handleBuildDeal}
            disabled={buildDealDisabled}
            className={`w-full sm:flex-1 min-w-0 flex items-center justify-center px-2.5 py-2.5 rounded-md transition-all shadow-sm whitespace-nowrap ${AUDIENCE_CARD_CTA_KLARHEIT_CLASS} ${isInNotebook ? 'gap-2' : ''} ${
              buildDealDisabled
                ? 'bg-gs-bg-muted text-gs-muted cursor-not-allowed'
                : 'bg-gs-accent-500 text-white hover:bg-gs-accent-600 hover:shadow-md'
            }`}
          >
            {isInNotebook ? (
              <>
                <Check className="h-4 w-4 shrink-0" />
                In Deal Builder
              </>
            ) : (
              'Build a Deal'
            )}
          </button>
        )}
      </div>

      {showActivateModal && (
        <ActivationModal
          audience={audience}
          displayName={displayName}
          onClose={() => setShowActivateModal(false)}
        />
      )}

      {showBuildDealIntro && (
        <BuildDealIntroModal
          variant="audience-added"
          onClose={handleIntroClose}
          onContinue={handleIntroContinue}
        />
      )}
    </div>
  );
}
