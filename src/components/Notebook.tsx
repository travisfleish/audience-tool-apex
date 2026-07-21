import { BookOpen, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Deal } from '../core/dealBuilder';
import { formatMomentLabel, isDealComplete } from '../core/dealBuilder';
import { getDisplayName } from '../utils/audienceDisplay';
import { ActivationModal } from '../core/ActivationModal';
import { useMediaQuery } from '../core/hooks/useMediaQuery';

interface NotebookProps {
  deal: Deal;
  onDealSubmitted: () => void;
  onRemoveAudience: () => void;
  onRemoveMoment: () => void;
  isMinimized: boolean;
  onMinimizedChange: (minimized: boolean) => void;
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function Notebook({
  deal,
  onDealSubmitted,
  onRemoveAudience,
  onRemoveMoment,
  isMinimized,
  onMinimizedChange,
  isCollapsed,
  onCollapsedChange,
}: NotebookProps) {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const navigate = useNavigate();
  const isCompactViewport = useMediaQuery('(max-width: 1279px)');
  const dealItemCount = (deal.audience ? 1 : 0) + (deal.moment ? 1 : 0);
  const dealIsComplete = isDealComplete(deal);

  if (dealItemCount === 0) {
    return null;
  }

  const audienceDisplayName = deal.audience
    ? getDisplayName(deal.audience, deal.audience ? [deal.audience] : [])
    : '';
  const momentLabel = deal.moment ? formatMomentLabel(deal.moment) : null;

  const handleSubmitted = () => {
    onDealSubmitted();
    setShowSubmitModal(false);
  };

  if (isCollapsed) {
    return (
      <button
        onClick={() => onCollapsedChange(false)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[55] px-2 py-6 bg-gradient-to-b from-gs-accent-500 to-gs-accent-600 text-white rounded-l-lg shadow-2xl hover:shadow-xl transition-all flex flex-col items-center gap-2"
      >
        <ChevronLeft className="w-5 h-5" />
        <div className="writing-mode-vertical text-sm font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
          Custom Deal Builder ({dealItemCount})
        </div>
        <BookOpen className="w-5 h-5" />
      </button>
    );
  }

  const dealSummary = dealIsComplete
    ? 'Ready to submit'
    : !deal.audience && deal.moment
      ? 'Add an audience to complete your deal'
      : deal.audience && !deal.moment
        ? 'Add a moment to complete your deal'
        : 'Add an audience to start';

  const renderDealItems = () => (
    <div className="space-y-2">
      <div className="bg-white/95 backdrop-blur-sm rounded-md p-3 shadow-sm group">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gs-muted mb-1">Audience</p>
          {deal.audience && (
            <button
              type="button"
              onClick={onRemoveAudience}
              className="rounded p-0.5 text-gs-muted transition-colors hover:bg-red-50 hover:text-gs-error"
              title="Remove audience"
              aria-label="Remove audience"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {deal.audience ? (
          <>
            <h4 className="font-semibold text-gs-primary-900 text-sm leading-tight mb-1">
              {audienceDisplayName}
            </h4>
            <p className="text-xs text-gs-muted line-clamp-2">{deal.audience.name}</p>
          </>
        ) : (
          <p className="text-xs text-gs-muted">No audience selected</p>
        )}
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-md p-3 shadow-sm group">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gs-muted mb-1">Moment</p>
          {deal.moment && (
            <button
              type="button"
              onClick={onRemoveMoment}
              className="rounded p-0.5 text-gs-muted transition-colors hover:bg-red-50 hover:text-gs-error"
              title="Remove moment"
              aria-label="Remove moment"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {deal.moment ? (
          <h4 className="font-semibold text-gs-primary-900 text-sm leading-tight">{momentLabel}</h4>
        ) : (
          <p className="text-xs text-gs-muted">Choose a moment from the Genius Moments section</p>
        )}
      </div>
    </div>
  );

  if (isMinimized) {
    return (
      <>
        <div className="fixed bottom-0 left-0 right-0 z-40 shadow-2xl">
          <div className="bg-gradient-to-r from-gs-accent-500 to-gs-accent-600 px-4 py-3">
            <div className="flex items-center justify-between max-w-7xl mx-auto gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 bg-white/20 rounded-md backdrop-blur-sm">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white">Custom Deal Builder</h3>
                  <p className="text-white/80 text-xs truncate">{dealSummary}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {dealIsComplete && (
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white text-gs-accent-600 rounded-md hover:bg-gs-bg transition-all text-xs sm:text-sm font-semibold whitespace-nowrap"
                  >
                    Submit Deal
                  </button>
                )}
                <button
                  onClick={() => navigate('/notebook')}
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm text-white rounded-md hover:bg-white/30 transition-all text-xs sm:text-sm font-medium border border-white/30 whitespace-nowrap"
                >
                  Full Page
                </button>
                <button
                  type="button"
                  onClick={() => onMinimizedChange(false)}
                  className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm text-white rounded-md hover:bg-white/30 transition-all border border-white/30"
                  title="Expand"
                  aria-label="Expand deal builder"
                >
                  <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {showSubmitModal && deal.audience && (
          <ActivationModal
            audience={deal.audience}
            displayName={audienceDisplayName}
            moment={deal.moment}
            onSubmitted={handleSubmitted}
            onClose={() => setShowSubmitModal(false)}
          />
        )}
      </>
    );
  }

  if (isCompactViewport) {
    return (
      <>
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => onMinimizedChange(true)}
          aria-label="Close deal builder"
        />
        <div className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[min(85vh,640px)] flex-col overflow-hidden rounded-t-2xl shadow-2xl">
          <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-gs-accent-500 to-gs-accent-600">
            <div className="flex-shrink-0 border-b border-white/20 px-4 py-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="rounded-md bg-white/20 p-1.5 backdrop-blur-sm">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-white">Custom Deal Builder</h3>
                    <p className="text-xs text-white/80">{dealSummary}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onMinimizedChange(true)}
                  className="rounded-md border border-white/30 bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/30"
                  title="Minimize"
                  aria-label="Minimize deal builder"
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigate('/notebook')}
                className="flex w-full items-center justify-center gap-1.5 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                Full Page
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">{renderDealItems()}</div>

            {dealIsComplete ? (
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="mx-4 mb-4 flex-shrink-0 rounded-md bg-white px-4 py-3 font-semibold text-gs-accent-600 shadow-sm transition-all hover:bg-gs-bg"
              >
                Submit Deal
              </button>
            ) : (
              <div className="mx-4 mb-4 flex-shrink-0 rounded-md border border-white/20 bg-white/10 px-4 py-3 text-xs leading-relaxed text-white/90">
                {!deal.audience && deal.moment
                  ? 'Choose a new audience to complete your deal.'
                  : deal.audience && !deal.moment
                    ? 'Add one moment from the Genius Moments section to complete your deal.'
                    : 'Add an audience, then add a moment to build your deal.'}
              </div>
            )}
          </div>
        </div>

        {showSubmitModal && deal.audience && (
          <ActivationModal
            audience={deal.audience}
            displayName={audienceDisplayName}
            moment={deal.moment}
            onSubmitted={handleSubmitted}
            onClose={() => setShowSubmitModal(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="fixed right-0 top-0 bottom-0 w-80 lg:w-96 z-[55] flex flex-col shadow-2xl">
        <div className="h-full bg-gradient-to-b from-gs-accent-500 to-gs-accent-600 flex flex-col">
          <div className="px-4 py-4 flex-shrink-0 border-b border-white/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-md backdrop-blur-sm">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Custom Deal Builder</h3>
                  <p className="text-white/80 text-xs">{dealSummary}</p>
                </div>
              </div>
              <button
                onClick={() => onCollapsedChange(true)}
                className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-md hover:bg-white/30 transition-all border border-white/30"
                title="Hide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => navigate('/notebook')}
              className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm text-white rounded-md hover:bg-white/20 transition-all text-sm font-medium flex items-center justify-center gap-1.5 border border-white/20"
            >
              Full Page
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3">{renderDealItems()}</div>

          {dealIsComplete ? (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="mx-4 mb-3 flex-shrink-0 px-4 py-3 bg-white text-gs-accent-600 rounded-md hover:bg-gs-bg transition-all font-semibold flex items-center justify-center gap-2 shadow-sm"
            >
              Submit Deal
            </button>
          ) : (
            <div className="mx-4 mb-3 flex-shrink-0 rounded-md border border-white/20 bg-white/10 px-4 py-3 text-xs leading-relaxed text-white/90">
              {!deal.audience && deal.moment
                ? 'Choose a new audience to complete your deal.'
                : deal.audience && !deal.moment
                  ? 'Add one moment from the Genius Moments section to complete your deal.'
                  : 'Add an audience, then add a moment to build your deal.'}
            </div>
          )}

          <button
            onClick={() => onMinimizedChange(true)}
            className="flex-shrink-0 px-4 py-3 bg-white/10 hover:bg-white/20 transition-all border-t border-white/20 flex items-center justify-center gap-2 text-white"
          >
            <ChevronUp className="w-5 h-5" />
            <span className="text-sm font-medium">Minimize</span>
          </button>
        </div>
      </div>

      {showSubmitModal && deal.audience && (
        <ActivationModal
          audience={deal.audience}
          displayName={audienceDisplayName}
          moment={deal.moment}
          onSubmitted={handleSubmitted}
          onClose={() => setShowSubmitModal(false)}
        />
      )}
    </>
  );
}
