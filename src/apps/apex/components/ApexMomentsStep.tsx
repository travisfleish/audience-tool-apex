import { useMemo } from 'react';
import { Check, Lock } from 'lucide-react';
import {
  CONTEXT_PACKAGES,
  getPackageDescriptionForSport,
  getPackageItemsForSport,
  getSportLabel,
} from '../../../core/moments/momentsCatalog';
import type { MomentActivationTarget, ThemedMomentPackage } from '../../../core/moments/types';
import { isCustomApexMoment } from '../apexDeal';
import type { ApexSport } from '../sportsCatalog';
import { apexConfig } from '../config';

type ApexMomentsStepProps = {
  locked: boolean;
  sport: ApexSport | null;
  selectedMoments: MomentActivationTarget[];
  onToggleMoment: (moment: MomentActivationTarget) => void;
  isActive: boolean;
};

function PackageBlock({
  pkg,
  momentSportSlug,
  sportLabel,
  selectedIds,
  onToggle,
}: {
  pkg: ThemedMomentPackage;
  momentSportSlug: string;
  sportLabel: string;
  selectedIds: Set<string>;
  onToggle: (moment: MomentActivationTarget) => void;
}) {
  const signals = getPackageItemsForSport(pkg, momentSportSlug);
  const description = getPackageDescriptionForSport(pkg, momentSportSlug);

  return (
    <div className="border-b border-[var(--apex-line)] last:border-b-0">
      <div className="px-4 py-4">
        <h3 className="text-base font-semibold text-[var(--apex-text)]">{pkg.name}</h3>
        {description || pkg.subtitle ? (
          <p className="mt-1 text-sm text-[var(--apex-text-muted)]">{description ?? pkg.subtitle}</p>
        ) : null}
      </div>
      <div className="grid gap-2 px-4 pb-4 sm:grid-cols-2">
        {signals.length === 0 ? (
          <p className="text-sm text-[var(--apex-text-muted)] sm:col-span-2">
            No discrete signals listed for this sport yet — you can still note interest in your RFP.
          </p>
        ) : (
          signals.map(signal => {
            const id = `${pkg.id}:${signal.id}`;
            const active = selectedIds.has(id);
            const target: MomentActivationTarget = {
              id,
              name: signal.name,
              category: pkg.category,
              sportLabel,
              packageName: pkg.name,
            };
            return (
              <button
                key={id}
                type="button"
                onClick={() => onToggle(target)}
                className={[
                  'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition',
                  active
                    ? 'border-[var(--apex-accent)] bg-[var(--apex-glow)] text-[var(--apex-accent)]'
                    : 'border-[var(--apex-line)] bg-[var(--apex-ink-soft)] text-[var(--apex-text)] hover:border-[var(--apex-line-strong)]',
                ].join(' ')}
              >
                {active ? (
                  <Check className="h-4 w-4 shrink-0" />
                ) : (
                  <span className="h-4 w-4 shrink-0 rounded-full border border-[var(--apex-line-strong)]" />
                )}
                <span>{signal.name}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export function ApexMomentsStep({
  locked,
  sport,
  selectedMoments,
  onToggleMoment,
  isActive,
}: ApexMomentsStepProps) {
  const catalogSportSlug = sport?.momentSportSlug;
  /** Unmapped sports (e.g. College / NCAA) still show context packages via shared signals. */
  const momentSportSlug = catalogSportSlug ?? 'all_sport';
  const hasCatalogCoverage = Boolean(catalogSportSlug);
  const sportLabel = catalogSportSlug
    ? getSportLabel(catalogSportSlug)
    : sport?.label ?? '';
  const catalogMoments = useMemo(
    () => selectedMoments.filter(moment => !isCustomApexMoment(moment)),
    [selectedMoments],
  );
  const selectedIds = useMemo(() => new Set(catalogMoments.map(m => m.id)), [catalogMoments]);

  if (locked) {
    return (
      <section
        id="apex-moments"
        className="rounded-2xl border border-[var(--apex-line)] bg-[var(--apex-locked)] p-5 opacity-55 sm:p-7"
        aria-disabled
      >
        <div className="flex items-center gap-2 text-[var(--apex-text-muted)]">
          <Lock className="h-4 w-4" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">Step 3 · locked</p>
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--apex-text-muted)] sm:text-3xl">
          {apexConfig.copy.momentsTitle}
        </h2>
        <p className="mt-2 text-sm text-[var(--apex-text-muted)]">
          Unlock after you select a sport and at least one vertical subcategory.
        </p>
      </section>
    );
  }

  return (
    <section
      id="apex-moments"
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
            Step 3
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {apexConfig.copy.momentsTitle}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--apex-text-muted)]">
            {apexConfig.copy.momentsSubtitle} Add as many as you want — this is inspiration for your
            custom recommendation, not a final buy.
          </p>
        </div>
        {catalogMoments.length > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--apex-accent)]/40 bg-[var(--apex-glow)] px-3 py-1.5 text-xs font-semibold text-[var(--apex-accent)]">
            <Check className="h-3.5 w-3.5" />
            {catalogMoments.length} moments
          </span>
        ) : null}
      </div>

      {!hasCatalogCoverage ? (
        <p className="mt-6 rounded-xl border border-[var(--apex-warm)]/30 bg-[var(--apex-warm)]/10 px-4 py-3 text-sm text-[var(--apex-warm)]">
          Off-the-shelf moment signals for {sport?.label} are limited — showing shared context
          packages as inspiration. Add sport-specific needs in your RFP notes at submit.
        </p>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-xl border border-[var(--apex-line)]">
        <p className="border-b border-[var(--apex-line)] bg-[var(--apex-ink-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--apex-text-muted)]">
          Context · pre-game, in-game &amp; post-game inspiration
        </p>
        {CONTEXT_PACKAGES.map(pkg => (
          <PackageBlock
            key={pkg.id}
            pkg={pkg}
            momentSportSlug={momentSportSlug}
            sportLabel={sportLabel}
            selectedIds={selectedIds}
            onToggle={onToggleMoment}
          />
        ))}
      </div>
    </section>
  );
}
