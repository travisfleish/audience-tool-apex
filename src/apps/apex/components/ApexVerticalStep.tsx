import { useMemo, useState } from 'react';
import { Check, Lock, Search } from 'lucide-react';
import {
  APEX_FEATURED_VERTICALS,
  findVertical,
  searchVerticals,
  type ApexSubVertical,
  type ApexVertical,
} from '../verticalsCatalog';

type ApexVerticalStepProps = {
  locked: boolean;
  selectedVertical: ApexVertical | null;
  selectedSubs: ApexSubVertical[];
  onSelectVertical: (vertical: ApexVertical) => void;
  onToggleSub: (sub: ApexSubVertical) => void;
  isActive: boolean;
};

export function ApexVerticalStep({
  locked,
  selectedVertical,
  selectedSubs,
  onSelectVertical,
  onToggleSub,
  isActive,
}: ApexVerticalStepProps) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchVerticals(query), [query]);

  if (locked) {
    return (
      <section
        id="apex-vertical"
        className="rounded-2xl border border-[var(--apex-line)] bg-[var(--apex-locked)] p-5 opacity-55 sm:p-7"
        aria-disabled
      >
        <div className="flex items-center gap-2 text-[var(--apex-text-muted)]">
          <Lock className="h-4 w-4" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">Step 2 · locked</p>
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--apex-text-muted)] sm:text-3xl">
          Select a vertical
        </h2>
        <p className="mt-2 text-sm text-[var(--apex-text-muted)]">
          Choose a sport first to unlock brand verticals.
        </p>
      </section>
    );
  }

  return (
    <section
      id="apex-vertical"
      className={[
        'apex-reveal rounded-2xl border border-[var(--apex-line)] bg-[var(--apex-panel)] p-5 shadow-[0_12px_40px_rgba(12,18,32,0.08)] backdrop-blur-sm sm:p-7',
        isActive ? 'apex-step-active ring-1 ring-[var(--apex-accent)]/40' : '',
      ]
        .join(' ')
        .trim()}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--apex-accent)]">
            Step 2
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Select a vertical</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--apex-text-muted)]">
            Pick one brand vertical, then choose one or more subcategories. Apex sellers typically
            attribute a brief to a single vertical.
          </p>
        </div>
        {selectedVertical && selectedSubs.length > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--apex-accent)]/40 bg-[var(--apex-glow)] px-3 py-1.5 text-xs font-semibold text-[var(--apex-accent)]">
            <Check className="h-3.5 w-3.5" />
            {selectedSubs.length} selected
          </span>
        ) : null}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {APEX_FEATURED_VERTICALS.map(vertical => {
          const isSelected = selectedVertical?.id === vertical.id;
          return (
            <button
              key={vertical.id}
              type="button"
              onClick={() => {
                onSelectVertical(vertical);
                setQuery('');
              }}
              className={[
                'rounded-xl border px-3 py-3 text-left text-sm font-semibold transition',
                isSelected
                  ? 'border-[var(--apex-accent)] bg-[var(--apex-accent)] text-white'
                  : 'border-[var(--apex-line)] bg-[var(--apex-ink-soft)] text-[var(--apex-text)] hover:border-[var(--apex-line-strong)] hover:bg-[var(--apex-ink-soft)]',
              ].join(' ')}
            >
              {vertical.label}
            </button>
          );
        })}
      </div>

      {selectedVertical ? (
        <div className="mt-6 rounded-xl border border-[var(--apex-line)] bg-[var(--apex-ink-soft)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--apex-text-muted)]">
            {selectedVertical.label} · choose subcategories
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedVertical.subVerticals.map(sub => {
              const active = selectedSubs.some(item => item.id === sub.id);
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => onToggleSub(sub)}
                  className={[
                    'rounded-full border px-3 py-1.5 text-sm transition',
                    active
                      ? 'border-[var(--apex-warm)] bg-[var(--apex-warm)]/15 text-[var(--apex-warm)]'
                      : 'border-[var(--apex-line)] text-[var(--apex-text)] hover:border-[var(--apex-line-strong)]',
                  ].join(' ')}
                >
                  {active ? '✓ ' : ''}
                  {sub.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mt-5">
        <label htmlFor="apex-vertical-search" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--apex-text-muted)]">
          Or search any other category
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--apex-text-muted)]" />
          <input
            id="apex-vertical-search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g. pets, gambling, streaming, insurance…"
            className="w-full rounded-xl border border-[var(--apex-line)] bg-[var(--apex-panel-lift)] py-3 pl-10 pr-3 text-sm text-[var(--apex-text)] outline-none transition placeholder:text-[var(--apex-text-muted)]/70 focus:border-[var(--apex-accent)] focus:ring-2 focus:ring-[var(--apex-glow)]"
          />
        </div>
        {query.trim() ? (
          <div className="mt-2 max-h-48 overflow-auto rounded-xl border border-[var(--apex-line)] bg-[var(--apex-ink-soft)]">
            {results.length === 0 ? (
              <p className="px-4 py-3 text-sm text-[var(--apex-text-muted)]">
                No matching vertical in this catalog yet.
              </p>
            ) : (
              results.map(vertical => (
                <button
                  key={vertical.id}
                  type="button"
                  onClick={() => {
                    onSelectVertical(findVertical(vertical.id) ?? vertical);
                    setQuery('');
                  }}
                  className="flex w-full items-center justify-between border-b border-[var(--apex-line)] px-4 py-2.5 text-left text-sm last:border-b-0 hover:bg-[var(--apex-ink-soft)]"
                >
                  <span>{vertical.label}</span>
                  {vertical.featured ? (
                    <span className="text-[10px] uppercase tracking-wide text-[var(--apex-warm)]">
                      Top
                    </span>
                  ) : null}
                </button>
              ))
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
