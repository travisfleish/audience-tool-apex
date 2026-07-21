import { Copy, Plus, Check } from 'lucide-react';
import { useState } from 'react';
import { Audience } from '../../../core/types';
import {
  hasSeenDealBuilderIntro,
  markDealBuilderIntroSeen,
  scrollToMomentsSection,
} from '../../../core/dealBuilder';
import { NOTEBOOK_ENABLED } from '../../../core/featureFlags';
import { BuildDealIntroModal } from '../../../components/BuildDealIntroModal';
import { ActivateModal } from './ActivateModal';

interface PmgAudienceCardProps {
  audience: Audience;
  displayName: string;
  onAddToNotebook: (audience: Audience) => void;
  isInNotebook: boolean;
  audienceDealSlotTaken?: boolean;
}

export function PmgAudienceCard({
  audience,
  displayName,
  onAddToNotebook,
  isInNotebook,
  audienceDealSlotTaken = false,
}: PmgAudienceCardProps) {
  const [copied, setCopied] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showBuildDealIntro, setShowBuildDealIntro] = useState(false);
  const buildDealDisabled = isInNotebook || (audienceDealSlotTaken && !isInNotebook);

  const handleBuildDeal = () => {
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

  const handleCopy = async () => {
    await navigator.clipboard.writeText(audience.name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group bg-pmg-surface border border-pmg-border rounded-xl p-5 flex flex-col h-full hover:border-pmg-accent/40 hover:shadow-md hover:shadow-pmg-accent/5 transition-all duration-200">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-base font-semibold text-pmg-text leading-snug flex-1">
          {displayName}
        </h3>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 p-1.5 rounded-md text-pmg-muted hover:text-pmg-accent hover:bg-pmg-bg-muted transition-colors"
          title="Copy segment ID"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      <p className="text-[16px] font-body !leading-[1.45] !tracking-[-0.01125em] text-pmg-muted mb-3 flex-1">
        {audience.name}
      </p>

      {audience.sports_league && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="px-2 py-0.5 bg-pmg-accent/10 text-pmg-accent text-xs font-medium rounded">
            {audience.sports_league}
          </span>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setShowActivateModal(true)}
          className={`${NOTEBOOK_ENABLED ? 'flex-1' : 'w-full'} flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-[13px] font-semibold bg-pmg-accent text-white hover:bg-pmg-accent/90 transition-all`}
        >
          Activate
        </button>
        {NOTEBOOK_ENABLED && (
          <button
            onClick={handleBuildDeal}
            disabled={buildDealDisabled}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${
              buildDealDisabled
                ? 'bg-pmg-bg-muted text-pmg-muted cursor-not-allowed'
                : 'bg-pmg-accent/10 text-pmg-accent hover:bg-pmg-accent hover:text-white border border-pmg-accent/30 hover:border-transparent'
            }`}
          >
            {isInNotebook ? (
              <>
                <Check className="w-3.5 h-3.5" />
                In Deal Builder
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Build a Deal
              </>
            )}
          </button>
        )}
      </div>

      {showActivateModal && (
        <ActivateModal
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
