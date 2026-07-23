import { useState, type FormEvent } from 'react';
import { Check, Lock, Plus, X } from 'lucide-react';
import {
  createApexAudienceInsight,
  type ApexAudienceInsight,
} from '../apexDeal';

type ApexAudienceInsightsStepProps = {
  locked: boolean;
  insights: ApexAudienceInsight[];
  onAddInsight: (insight: ApexAudienceInsight) => void;
  onRemoveInsight: (insightId: string) => void;
};

export function ApexAudienceInsightsStep({
  locked,
  insights,
  onAddInsight,
  onRemoveInsight,
}: ApexAudienceInsightsStepProps) {
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');

  const handleAdd = (event?: FormEvent) => {
    event?.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) {
      setError('Describe the audience insight you want to layer in.');
      return;
    }
    onAddInsight(createApexAudienceInsight(trimmed));
    setDraft('');
    setError('');
    setComposerOpen(false);
  };

  if (locked) {
    return (
      <section
        id="apex-audience-insights"
        className="rounded-2xl border border-[var(--apex-line)] bg-[var(--apex-locked)] p-5 opacity-55 sm:p-7"
        aria-disabled
      >
        <div className="flex items-center gap-2 text-[var(--apex-text-muted)]">
          <Lock className="h-4 w-4" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
            Audience insights · locked
          </p>
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--apex-text-muted)] sm:text-3xl">
          Add any additional audience insights
        </h2>
        <p className="mt-2 text-sm text-[var(--apex-text-muted)]">
          Unlock after you select a sport.
        </p>
      </section>
    );
  }

  return (
    <section
      id="apex-audience-insights"
      className="apex-reveal rounded-2xl border border-[var(--apex-line)] bg-[var(--apex-panel)] p-5 shadow-[0_12px_40px_rgba(12,18,32,0.08)] backdrop-blur-sm sm:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--apex-accent)]">
            Optional
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Add any additional audience insights
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--apex-text-muted)]">
            Layer in custom targeting ideas that aren’t in our vertical list, for example
            “people who have eaten at Jersey Mike’s in the last 12 months.”
          </p>
        </div>
        {insights.length > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--apex-accent)]/40 bg-[var(--apex-glow)] px-3 py-1.5 text-xs font-semibold text-[var(--apex-accent)]">
            <Check className="h-3.5 w-3.5" />
            {insights.length} insight{insights.length === 1 ? '' : 's'}
          </span>
        ) : null}
      </div>

      {insights.length > 0 ? (
        <ul className="mt-5 space-y-2">
          {insights.map(insight => (
            <li
              key={insight.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-[var(--apex-accent)]/40 bg-[var(--apex-glow)] px-3 py-2.5"
            >
              <p className="text-sm font-medium text-[var(--apex-accent)]">{insight.text}</p>
              <button
                type="button"
                onClick={() => onRemoveInsight(insight.id)}
                className="rounded p-0.5 text-[var(--apex-text-muted)] hover:bg-red-500/10 hover:text-red-600"
                aria-label={`Remove insight: ${insight.text}`}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {composerOpen ? (
        <form onSubmit={handleAdd} className="mt-5 space-y-3">
          <label htmlFor="apex-audience-insight-input" className="sr-only">
            Additional audience insight
          </label>
          <textarea
            id="apex-audience-insight-input"
            value={draft}
            onChange={e => {
              setDraft(e.target.value);
              if (error) setError('');
            }}
            autoFocus
            rows={3}
            className="w-full rounded-lg border border-[var(--apex-line-strong)] bg-[var(--apex-panel-lift)] px-3 py-2.5 text-sm outline-none focus:border-[var(--apex-accent)] focus:ring-2 focus:ring-[var(--apex-glow)]"
            placeholder="e.g. People who have eaten at Jersey Mike’s in the last 12 months"
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--apex-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--apex-accent-deep)]"
            >
              <Plus className="h-4 w-4" />
              Add insight
            </button>
            <button
              type="button"
              onClick={() => {
                setComposerOpen(false);
                setDraft('');
                setError('');
              }}
              className="rounded-lg border border-[var(--apex-line-strong)] px-4 py-2.5 text-sm font-semibold text-[var(--apex-text)] hover:border-[var(--apex-accent)]"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setComposerOpen(true)}
          className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[var(--apex-accent)] bg-[var(--apex-glow)] px-4 py-2.5 text-sm font-semibold text-[var(--apex-accent)] transition hover:bg-[var(--apex-accent)] hover:text-white"
        >
          <Plus className="h-4 w-4" />
          Add any additional audience insights
        </button>
      )}
    </section>
  );
}
