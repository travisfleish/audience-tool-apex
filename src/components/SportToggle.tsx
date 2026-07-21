import { AUDIENCE_SPORT_FILTERS } from '../core/audienceSportFilters';
import { AUDIENCE_CARD_CTA_KLARHEIT_CLASS } from './ui/HeroCtaPill';

const TOGGLE_SECTION_LABEL_CLASS = 'text-moment-step-row-label m-0 text-slate-900';

type SportOption = {
  slug: string;
  label: string;
};

type SportToggleProps = {
  selectedSport: string | null;
  onSportChange: (sportSlug: string) => void;
  sports?: SportOption[];
  /** When true, omits the "Sport" label (e.g. hero filter row). */
  hideLabel?: boolean;
  /** Hero: responsive chip grid for many options. Segmented: single connected pill for short lists. */
  variant?: 'hero' | 'segmented';
  /** Light grey chips for the dark hero band. */
  heroControl?: boolean;
  chipClassName?: string;
  /** Hero grid column count (default 5). Use 4 for even rows of 4. */
  columns?: 4 | 5;
  className?: string;
};

const SEGMENTED_BUTTON_CLASS = `px-4 py-2 transition-colors ${AUDIENCE_CARD_CTA_KLARHEIT_CLASS}`;

const HERO_CONTROL_CHIP_CLASS =
  'hero-control hero-control-surface bg-[#eef1f6] border border-[rgba(255,255,255,0.2)] text-[#0c1220] hover:border-gs-accent-500/35 hover:bg-[#e4e8ef]';

function SportChip({
  sport,
  isSelected,
  onSelect,
  heroControl = false,
  chipClassName = '',
}: {
  sport: SportOption;
  isSelected: boolean;
  onSelect: () => void;
  heroControl?: boolean;
  chipClassName?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`w-full min-h-[44px] rounded-full border px-3 py-2 text-sm font-heading font-normal transition-colors max-md:text-xs max-md:px-2 sm:px-4 ${AUDIENCE_CARD_CTA_KLARHEIT_CLASS} ${chipClassName} ${
        isSelected
          ? 'border-gs-accent-500 bg-gs-accent-500 text-white shadow-sm'
          : heroControl
            ? HERO_CONTROL_CHIP_CLASS
            : 'border-gs-border bg-gs-surface text-gs-primary-900 hover:border-gs-accent-500/35 hover:bg-neutral-50'
      }`}
    >
      {sport.label}
    </button>
  );
}

export function SportToggle({
  selectedSport,
  onSportChange,
  sports = AUDIENCE_SPORT_FILTERS,
  hideLabel = false,
  variant = 'hero',
  heroControl = false,
  chipClassName = '',
  columns = 5,
  className = '',
}: SportToggleProps) {
  if (variant === 'segmented') {
    return (
      <div className={className ? className : 'text-center'}>
        {!hideLabel ? <p className={TOGGLE_SECTION_LABEL_CLASS}>Sport</p> : null}
        <div
          className={`${hideLabel ? '' : 'mt-2 '}inline-flex max-w-full overflow-hidden rounded-full border border-gs-border`}
        >
          {sports.map((sport, index) => {
            const isSelected = sport.slug === selectedSport;
            return (
              <button
                key={sport.slug}
                type="button"
                onClick={() => onSportChange(sport.slug)}
                className={`${SEGMENTED_BUTTON_CLASS} ${
                  index > 0 ? 'border-l border-gs-border' : ''
                } ${
                  isSelected
                    ? 'bg-gs-accent-500 text-white'
                    : 'bg-white text-gs-primary-900 hover:bg-neutral-50'
                }`}
                aria-pressed={isSelected}
              >
                {sport.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-5xl mx-auto ${className}`.trim()}>
      {!hideLabel ? <p className={`${TOGGLE_SECTION_LABEL_CLASS} text-center`}>Sport</p> : null}
      <div
        role="group"
        aria-label="Filter by sport"
        className={`grid gap-2 ${columns === 4 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5'} ${hideLabel ? '' : 'mt-3'}`}
      >
        {sports.map((sport) => (
          <SportChip
            key={sport.slug}
            sport={sport}
            isSelected={sport.slug === selectedSport}
            onSelect={() => onSportChange(sport.slug)}
            heroControl={heroControl}
            chipClassName={chipClassName}
          />
        ))}
      </div>
    </div>
  );
}
