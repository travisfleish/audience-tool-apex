import { useMemo, useState } from 'react';
import { Check, Search } from 'lucide-react';
import {
  APEX_FEATURED_SPORTS,
  findApexSport,
  searchApexSports,
  type ApexSport,
} from '../sportsCatalog';

type ApexSportStepProps = {
  selected: ApexSport | null;
  onSelect: (sport: ApexSport) => void;
  isActive: boolean;
};

export function ApexSportStep({ selected, onSelect, isActive }: ApexSportStepProps) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchApexSports(query), [query]);

  const handlePickFromSearch = (sport: ApexSport) => {
    onSelect(sport);
    setQuery('');
  };

  return (
    <section
      id="apex-sport"
      className={[
        'rounded-2xl border border-[var(--apex-line)] bg-[var(--apex-panel)] p-5 shadow-[0_12px_40px_rgba(12,18,32,0.08)] backdrop-blur-sm sm:p-7',
        isActive ? 'apex-step-active ring-1 ring-[var(--apex-accent)]/40' : '',
      ]
        .join(' ')
        .trim()}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--apex-accent)]">
            Step 1
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Select a sport</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--apex-text-muted)]">
            Every custom Apex moment starts with the sport you want to build in. Pick a featured
            league, or search to see if another sport is available.
          </p>
        </div>
        {selected ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--apex-accent)]/40 bg-[var(--apex-glow)] px-3 py-1.5 text-xs font-semibold text-[var(--apex-accent)]">
            <Check className="h-3.5 w-3.5" />
            {selected.label}
          </span>
        ) : null}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
        {APEX_FEATURED_SPORTS.map(sport => {
          const isSelected = selected?.slug === sport.slug;
          return (
            <button
              key={sport.slug}
              type="button"
              onClick={() => onSelect(sport)}
              className={[
                'rounded-xl border px-3 py-3 text-sm font-semibold transition',
                isSelected
                  ? 'border-[var(--apex-accent)] bg-[var(--apex-accent)] text-white shadow-[0_0_24px_var(--apex-glow)]'
                  : 'border-[var(--apex-line)] bg-[var(--apex-ink-soft)] text-[var(--apex-text)] hover:border-[var(--apex-accent)] hover:bg-[var(--apex-accent)] hover:text-white',
              ].join(' ')}
            >
              {sport.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        <label htmlFor="apex-sport-search" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--apex-text-muted)]">
          Or search any other sport
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--apex-text-muted)]" />
          <input
            id="apex-sport-search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g. NASCAR, volleyball, F1…"
            className="w-full rounded-xl border border-[var(--apex-line)] bg-[var(--apex-panel-lift)] py-3 pl-10 pr-3 text-sm text-[var(--apex-text)] outline-none transition placeholder:text-[var(--apex-text-muted)]/70 focus:border-[var(--apex-accent)] focus:ring-2 focus:ring-[var(--apex-glow)]"
          />
        </div>
        {query.trim() ? (
          <div className="mt-2 max-h-48 overflow-auto rounded-xl border border-[var(--apex-line)] bg-[var(--apex-ink-soft)]">
            {results.length === 0 ? (
              <p className="px-4 py-3 text-sm text-[var(--apex-text-muted)]">
                We don’t list that sport yet — pick a featured sport for now, or note it in your RFP
                at submit.
              </p>
            ) : (
              results.map(sport => (
                <button
                  key={sport.slug}
                  type="button"
                  onClick={() => handlePickFromSearch(sport)}
                  className="flex w-full items-center justify-between border-b border-[var(--apex-line)] px-4 py-2.5 text-left text-sm last:border-b-0 hover:bg-[var(--apex-ink-soft)]"
                >
                  <span>{sport.label}</span>
                  {findApexSport(sport.slug)?.featured ? (
                    <span className="text-[10px] uppercase tracking-wide text-[var(--apex-warm)]">
                      Featured
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
