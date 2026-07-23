import { useState, type ReactNode } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Layers3,
  X,
} from 'lucide-react';
import { formatApexMomentLabel, isApexDealComplete, type ApexDeal } from '../apexDeal';
import { ApexSubmitModal } from './ApexSubmitModal';
import { useMediaQuery } from '../../../core/hooks/useMediaQuery';

type ApexMomentBuilderProps = {
  deal: ApexDeal;
  onClearSport: () => void;
  onClearVertical: () => void;
  onRemoveMoment: (momentId: string) => void;
  onRemoveAudienceInsight: (insightId: string) => void;
  onDealSubmitted: () => void;
  isMinimized: boolean;
  onMinimizedChange: (minimized: boolean) => void;
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
};

export function ApexMomentBuilder({
  deal,
  onClearSport,
  onClearVertical,
  onRemoveMoment,
  onRemoveAudienceInsight,
  onDealSubmitted,
  isMinimized,
  onMinimizedChange,
  isCollapsed,
  onCollapsedChange,
}: ApexMomentBuilderProps) {
  const [showSubmit, setShowSubmit] = useState(false);
  const isCompactViewport = useMediaQuery('(max-width: 1279px)');
  const count =
    (deal.sport ? 1 : 0) +
    (deal.vertical ? 1 : 0) +
    deal.subVerticals.length +
    deal.audienceInsights.length +
    deal.moments.length;
  const complete = isApexDealComplete(deal);

  if (count === 0) return null;

  if (isCollapsed) {
    return (
      <button
        type="button"
        onClick={() => onCollapsedChange(false)}
        className="fixed right-0 top-1/2 z-[55] flex -translate-y-1/2 flex-col items-center gap-2 rounded-l-lg bg-gradient-to-b from-gs-accent-500 to-gs-accent-600 px-2 py-6 text-white shadow-2xl transition-all hover:shadow-xl"
      >
        <ChevronLeft className="h-5 w-5" />
        <div
          className="whitespace-nowrap text-sm font-semibold"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          Custom Apex Moment Builder ({count})
        </div>
        <Layers3 className="h-5 w-5" />
      </button>
    );
  }

  const summary = complete
    ? 'Ready to submit for custom recommendations'
    : !deal.sport
      ? 'Select a sport to begin'
      : !deal.vertical || deal.subVerticals.length === 0
        ? 'Add a vertical subcategory'
        : 'Add at least one moment';

  const panel = (
    <div className="flex h-full flex-col bg-gradient-to-b from-gs-accent-500 to-gs-accent-600">
      <div className="flex flex-shrink-0 items-start justify-between gap-2 border-b border-white/20 px-4 py-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="rounded-md bg-white/20 p-1.5 backdrop-blur-sm">
            <Layers3 className="h-5 w-5 text-white" aria-hidden />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold !text-white">Moment Builder</h3>
            <p className="text-xs text-white/80">{summary}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {isCompactViewport ? (
            <button
              type="button"
              onClick={() => onMinimizedChange(!isMinimized)}
              className="rounded-md border border-white/30 bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/30"
              aria-label={isMinimized ? 'Expand builder' : 'Minimize builder'}
            >
              {isMinimized ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onCollapsedChange(true)}
              className="rounded-md border border-white/30 bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/30"
              aria-label="Collapse builder"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {!isMinimized ? (
        <>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4">
            <Slot
              label="Sport"
              empty="No sport selected"
              onClear={deal.sport ? onClearSport : undefined}
            >
              {deal.sport ? (
                <p className="text-sm font-semibold text-gs-primary-900">{deal.sport.label}</p>
              ) : null}
            </Slot>

            <Slot
              label="Vertical"
              empty="No vertical selected"
              onClear={deal.vertical ? onClearVertical : undefined}
            >
              {deal.vertical ? (
                <>
                  <p className="text-sm font-semibold text-gs-primary-900">{deal.vertical.label}</p>
                  {deal.subVerticals.length > 0 ? (
                    <p className="mt-1 text-xs text-gs-text-muted">
                      {deal.subVerticals.map(s => s.label).join(' · ')}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-gs-warning">Pick at least one subcategory</p>
                  )}
                </>
              ) : null}
            </Slot>

            {deal.audienceInsights.length > 0 ? (
              <div className="rounded-md bg-white/95 p-3 shadow-sm backdrop-blur-sm">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gs-text-muted">
                  Audience insights
                </p>
                <ul className="space-y-2">
                  {deal.audienceInsights.map(insight => (
                    <li key={insight.id} className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium leading-snug text-gs-primary-900">
                        {insight.text}
                      </p>
                      <button
                        type="button"
                        onClick={() => onRemoveAudienceInsight(insight.id)}
                        className="rounded p-0.5 text-gs-text-muted hover:bg-red-500/10 hover:text-red-600"
                        aria-label={`Remove insight: ${insight.text}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="rounded-md bg-white/95 p-3 shadow-sm backdrop-blur-sm">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gs-text-muted">
                Moments
              </p>
              {deal.moments.length === 0 ? (
                <p className="text-xs text-gs-text-muted">No moments selected</p>
              ) : (
                <ul className="space-y-2">
                  {deal.moments.map(moment => (
                    <li key={moment.id} className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium leading-snug text-gs-primary-900">
                        {formatApexMomentLabel(moment)}
                      </p>
                      <button
                        type="button"
                        onClick={() => onRemoveMoment(moment.id)}
                        className="rounded p-0.5 text-gs-text-muted hover:bg-red-500/10 hover:text-red-600"
                        aria-label={`Remove ${moment.name}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {complete ? (
            <button
              type="button"
              onClick={() => setShowSubmit(true)}
              className="mx-4 mb-3 flex-shrink-0 rounded-md bg-white px-4 py-3 text-sm font-semibold text-gs-accent-600 shadow-sm transition-all hover:bg-gs-bg"
            >
              Submit for recommendations
            </button>
          ) : (
            <div className="mx-4 mb-3 flex-shrink-0 rounded-md border border-white/20 bg-white/10 px-4 py-3 text-xs leading-relaxed text-white/90">
              {summary}
            </div>
          )}

          {!isCompactViewport ? (
            <button
              type="button"
              onClick={() => onMinimizedChange(true)}
              className="flex flex-shrink-0 items-center justify-center gap-2 border-t border-white/20 bg-white/10 px-4 py-3 text-white transition-all hover:bg-white/20"
            >
              <ChevronUp className="h-5 w-5" />
              <span className="text-sm font-medium">Minimize</span>
            </button>
          ) : null}
        </>
      ) : null}

      {showSubmit ? (
        <ApexSubmitModal
          deal={deal}
          onClose={() => setShowSubmit(false)}
          onSubmitted={() => {
            onDealSubmitted();
            setShowSubmit(false);
          }}
        />
      ) : null}
    </div>
  );

  if (isMinimized) {
    return (
      <>
        <div className="fixed inset-x-0 bottom-0 z-40 shadow-2xl">
          <div className="bg-gradient-to-r from-gs-accent-500 to-gs-accent-600 px-4 py-3">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <div className="rounded-md bg-white/20 p-1.5 backdrop-blur-sm">
                  <Layers3 className="h-4 w-4 text-white" aria-hidden />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold !text-white">Moment Builder</h3>
                  <p className="truncate text-xs text-white/80">{summary}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                {complete ? (
                  <button
                    type="button"
                    onClick={() => setShowSubmit(true)}
                    className="whitespace-nowrap rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-gs-accent-600 transition-all hover:bg-gs-bg sm:px-3 sm:py-2 sm:text-sm"
                  >
                    Submit
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => onMinimizedChange(false)}
                  className="rounded-md border border-white/30 bg-white/20 p-1.5 text-white backdrop-blur-sm transition-all hover:bg-white/30 sm:p-2"
                  aria-label="Expand builder"
                >
                  <ChevronUp className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        {showSubmit ? (
          <ApexSubmitModal
            deal={deal}
            onClose={() => setShowSubmit(false)}
            onSubmitted={() => {
              onDealSubmitted();
              setShowSubmit(false);
            }}
          />
        ) : null}
      </>
    );
  }

  if (isCompactViewport) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-[55] max-h-[min(85vh,640px)] overflow-hidden rounded-t-2xl shadow-2xl">
        {panel}
      </div>
    );
  }

  return (
    <aside className="fixed right-0 top-0 z-[55] flex h-screen w-80 flex-col shadow-2xl lg:w-96">
      {panel}
    </aside>
  );
}

function Slot({
  label,
  empty,
  onClear,
  children,
}: {
  label: string;
  empty: string;
  onClear?: () => void;
  children: ReactNode;
}) {
  const hasContent = Boolean(children);
  return (
    <div className="rounded-md bg-white/95 p-3 shadow-sm backdrop-blur-sm">
      <div className="mb-1 flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gs-text-muted">
          {label}
        </p>
        {onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded p-0.5 text-gs-text-muted hover:bg-red-500/10 hover:text-red-600"
            aria-label={`Clear ${label}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
      {hasContent ? children : <p className="text-xs text-gs-text-muted">{empty}</p>}
    </div>
  );
}
