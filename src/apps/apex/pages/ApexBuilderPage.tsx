import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { formatApexMomentLabel, isApexDealComplete, type ApexDeal } from '../apexDeal';
import { ApexSubmitModal } from '../components/ApexSubmitModal';

type ApexBuilderPageProps = {
  deal: ApexDeal;
  onClearSport: () => void;
  onClearVertical: () => void;
  onRemoveMoment: (momentId: string) => void;
  onDealSubmitted: () => void;
};

export function ApexBuilderPage({
  deal,
  onClearSport,
  onClearVertical,
  onRemoveMoment,
  onDealSubmitted,
}: ApexBuilderPageProps) {
  const [showSubmit, setShowSubmit] = useState(false);
  const complete = isApexDealComplete(deal);

  return (
    <main className="relative z-10 mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--apex-accent)]">
        Custom Apex Moment Builder
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Your package</h1>
      <p className="mt-2 text-sm text-[var(--apex-text-muted)]">
        Review what you’ve assembled, then submit for custom recommendations.
      </p>

      <div className="mt-8 space-y-4">
        <Panel title="Sport" onClear={deal.sport ? onClearSport : undefined}>
          {deal.sport ? deal.sport.label : 'Nothing selected yet'}
        </Panel>
        <Panel title="Vertical" onClear={deal.vertical ? onClearVertical : undefined}>
          {deal.vertical ? (
            <>
              <p>{deal.vertical.label}</p>
              {deal.subVerticals.length > 0 ? (
                <p className="mt-1 text-sm text-[var(--apex-text-muted)]">
                  {deal.subVerticals.map(s => s.label).join(' · ')}
                </p>
              ) : null}
            </>
          ) : (
            'Nothing selected yet'
          )}
        </Panel>
        <div className="rounded-2xl border border-[var(--apex-line)] bg-[var(--apex-panel)] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--apex-text-muted)]">
            Moments
          </p>
          {deal.moments.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--apex-text-muted)]">Nothing selected yet</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {deal.moments.map(moment => (
                <li
                  key={moment.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-[var(--apex-line)] bg-[var(--apex-ink-soft)] px-3 py-2"
                >
                  <span className="text-sm">{formatApexMomentLabel(moment)}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveMoment(moment.id)}
                    className="text-xs text-[var(--apex-text-muted)] hover:text-red-600"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!complete}
          onClick={() => setShowSubmit(true)}
          className={[
            'rounded-lg px-5 py-3 text-sm font-semibold transition',
            complete
              ? 'bg-[var(--apex-accent)] text-white hover:bg-[var(--apex-accent-deep)]'
              : 'cursor-not-allowed bg-[var(--apex-ink-soft)] text-[var(--apex-text-muted)]',
          ].join(' ')}
        >
          Submit for recommendations
        </button>
        <Link
          to="/"
          className="rounded-lg border border-[var(--apex-line-strong)] px-5 py-3 text-sm font-semibold text-[var(--apex-text)] hover:border-[var(--apex-accent)]"
        >
          Continue building
        </Link>
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
    </main>
  );
}

function Panel({
  title,
  onClear,
  children,
}: {
  title: string;
  onClear?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--apex-line)] bg-[var(--apex-panel)] p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--apex-text-muted)]">
          {title}
        </p>
        {onClear ? (
          <button type="button" onClick={onClear} className="text-xs text-[var(--apex-text-muted)] hover:text-red-600">
            Clear
          </button>
        ) : null}
      </div>
      <div className="mt-2 text-sm font-medium text-[var(--apex-text)]">{children}</div>
    </div>
  );
}
