import { BookOpen, ArrowLeft, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Deal } from '../core/dealBuilder';
import { formatMomentLabel, isDealComplete } from '../core/dealBuilder';
import { getDisplayName } from '../utils/audienceDisplay';
import { HERO_CTA_KLARHEIT_TYPO_CLASS } from '../components/ui/HeroCtaPill';
import { ActivationModal } from '../core/ActivationModal';

interface NotebookPageProps {
  deal: Deal;
  onDealSubmitted: () => void;
  onRemoveAudience: () => void;
  onRemoveMoment: () => void;
}

export function NotebookPage({
  deal,
  onDealSubmitted,
  onRemoveAudience,
  onRemoveMoment,
}: NotebookPageProps) {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const navigate = useNavigate();
  const dealItemCount = (deal.audience ? 1 : 0) + (deal.moment ? 1 : 0);
  const dealIsComplete = isDealComplete(deal);
  const audienceDisplayName = deal.audience
    ? getDisplayName(deal.audience, deal.audience ? [deal.audience] : [])
    : '';

  const handleSubmitted = () => {
    onDealSubmitted();
    setShowSubmitModal(false);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 layout-gutter:px-10 xl:px-12 py-8">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gs-muted hover:text-gs-text mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Audiences
      </button>

      <div className="bg-gradient-to-r from-gs-accent-500 to-gs-accent-600 rounded-lg p-4 sm:p-8 mb-8 shadow-md">
        <div className="flex flex-col gap-4 sm:gap-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-white/20 rounded-md backdrop-blur-sm">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Custom Deal Builder</h1>
              <p className="text-white/80 text-sm sm:text-lg mt-1">
                {dealIsComplete
                  ? 'Your deal is ready to submit'
                  : !deal.audience && deal.moment
                    ? 'Add an audience to complete your deal'
                    : deal.audience && !deal.moment
                      ? 'Add a moment to complete your deal'
                      : 'Start by adding an audience'}
              </p>
            </div>
          </div>

          {dealIsComplete && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full sm:w-auto px-5 py-3 bg-white text-gs-accent-600 rounded-md hover:bg-gs-bg transition-all font-semibold shadow-sm"
            >
              Submit Deal
            </button>
          )}
        </div>
      </div>

      {dealItemCount === 0 ? (
        <div className="text-center py-20">
          <div className="inline-block p-6 bg-gs-bg-muted rounded-full mb-4">
            <BookOpen className="w-12 h-12 text-gs-muted" />
          </div>
          <h2 className="text-2xl font-bold text-gs-primary-900 mb-2">Your deal builder is empty</h2>
          <p className="text-gs-muted mb-6">
            Add an audience, then add a moment from the Genius Moments section to build your deal.
          </p>
          <button
            onClick={() => navigate('/')}
            className={`px-6 py-3 bg-gs-accent-500 text-white rounded-md hover:bg-gs-accent-600 transition-colors shadow-sm ${HERO_CTA_KLARHEIT_TYPO_CLASS}`}
          >
            Browse Audiences
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gs-surface rounded-lg border border-gs-border shadow-sm p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-gs-muted mb-3">Audience</p>
                {deal.audience ? (
                  <>
                    <h3 className="text-lg sm:text-xl font-bold text-gs-primary-900 mb-2">{audienceDisplayName}</h3>
                    <p className="text-sm sm:text-base text-gs-muted">{deal.audience.name}</p>
                  </>
                ) : (
                  <p className="text-sm text-gs-muted">No audience selected yet.</p>
                )}
              </div>
              {deal.audience && (
                <button
                  type="button"
                  onClick={onRemoveAudience}
                  className="flex-shrink-0 p-2.5 bg-red-50 text-gs-error rounded-md hover:bg-red-100 transition-colors"
                  title="Remove audience"
                  aria-label="Remove audience"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="bg-gs-surface rounded-lg border border-gs-border shadow-sm p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-gs-muted mb-3">Moment</p>
                {deal.moment ? (
                  <h3 className="text-lg sm:text-xl font-bold text-gs-primary-900">{formatMomentLabel(deal.moment)}</h3>
                ) : (
                  <p className="text-sm text-gs-muted">
                    Choose one moment from the Genius Moments section to complete your deal.
                  </p>
                )}
              </div>
              {deal.moment && (
                <button
                  type="button"
                  onClick={onRemoveMoment}
                  className="flex-shrink-0 p-2.5 bg-red-50 text-gs-error rounded-md hover:bg-red-100 transition-colors"
                  title="Remove moment"
                  aria-label="Remove moment"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
          </div>

          {!dealIsComplete && (
            <div className="rounded-lg border border-gs-border bg-gs-bg-muted px-4 py-3 text-sm text-gs-muted">
              Only one deal can be in progress at a time. Remove an item to swap your audience or moment selection.
            </div>
          )}
        </div>
      )}

      {showSubmitModal && deal.audience && (
        <ActivationModal
          audience={deal.audience}
          displayName={audienceDisplayName}
          moment={deal.moment}
          onSubmitted={handleSubmitted}
          onClose={() => setShowSubmitModal(false)}
        />
      )}
    </main>
  );
}
