import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import type { AudienceDomain, AudienceDomainSelection } from '../core/audienceDomain';
import type { QuarterOption } from '../core/seasonalFilters';
import { AUDIENCE_SPORT_FILTERS, getAudienceSportFilterLabel } from '../core/audienceSportFilters';
import { SportToggle } from './SportToggle';
import { HERO_CTA_FOCUS_CLASS, HeroCtaPillSurface } from './ui/HeroCtaPill';

interface SearchAndFiltersProps {
  audienceDomain: AudienceDomainSelection;
  onAudienceDomainChange: (domain: AudienceDomain) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  onSearchClear: () => void;
  selectedCategory: string | null;
  onCategoryToggle: (category: string) => void;
  availableCategories: string[];
  /** Temp: quarterly sports events — pass to show Q1–Q4 seasonal filters (main page only). */
  quarterOptions?: QuarterOption[];
  selectedQuarters?: QuarterOption[];
  onQuarterToggle?: (quarter: QuarterOption) => void;
  selectedEventsByQuarter?: Partial<Record<QuarterOption, string>>;
  onQuarterEventChange?: (quarter: QuarterOption, eventName: string) => void;
  majorEventsByQuarter?: Record<QuarterOption, string[]>;
  /** When true, hides audience type, category, and seasonal filters (kept in DOM). */
  hideLegacyFilters?: boolean;
  selectedSport?: string | null;
  onSportChange?: (sportSlug: string) => void;
}

type FilterMenuKey = 'audience' | 'category';

const FILTER_LABEL_CLASS =
  'block w-full text-xs sm:text-sm font-semibold text-gs-text font-heading text-center truncate';

const FILTER_INLINE_LABEL_CLASS =
  'text-xs sm:text-sm font-semibold text-gs-text font-heading';

const HERO_CONTROL_CLASS =
  'hero-control hero-control-surface bg-[#eef1f6] border border-[rgba(255,255,255,0.2)] shadow-sm text-[#0c1220]';

/** Trigger: matches search pill radius + surface; not native select styling */
const FILTER_TRIGGER_CLASS =
  `relative w-full min-h-[44px] pl-4 pr-10 py-2.5 sm:py-3 rounded-full text-gs-text text-sm sm:text-base font-heading font-normal focus:outline-none focus:ring-2 focus:ring-gs-accent-500 focus:border-transparent transition-colors ${HERO_CONTROL_CLASS}`;

const FILTER_MENU_PANEL_CLASS =
  'absolute z-30 mt-1 w-full max-h-60 overflow-y-auto bg-gs-surface border border-gs-border rounded-2xl shadow-lg overflow-hidden py-1';

type FilterMenuOptionProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'children'> & {
  selected: boolean;
  children: ReactNode;
  /** Long labels — allow wrap instead of truncate */
  multilineLabel?: boolean;
};

/**
 * Same horizontal inset as {@link FILTER_TRIGGER_CLASS}: `pl-4 pr-10`. The trigger centers its label in
 * that asymmetric box (extra `pr-10` mirrors the chevron). Menu rows must use the same padding so the
 * text center lines up with the pill; the check is inset (`left-3`) so it clears the rounded menu edge
 * and does not overlap centered text; it does not affect
 * layout (`block w-full text-center` matches the trigger’s label span).
 */
function FilterMenuOption({ selected, children, multilineLabel, className = '', ...rest }: FilterMenuOptionProps) {
  return (
    <button
      type="button"
      className={`relative w-full min-h-[44px] pl-4 pr-10 py-2.5 sm:py-3 text-sm sm:text-base font-heading font-normal text-gs-text hover:bg-gs-bg-muted transition-colors ${className}`.trim()}
      {...rest}
    >
      {selected ? (
        <Check
          className={`pointer-events-none absolute left-3 z-[1] h-4 w-4 text-gs-accent-500 ${
            multilineLabel ? 'top-3' : 'top-1/2 -translate-y-1/2'
          }`}
          aria-hidden
        />
      ) : null}
      {multilineLabel ? (
        <span className="block w-full text-center whitespace-normal leading-snug [text-wrap:balance]">
          {children}
        </span>
      ) : (
        <span className="block w-full truncate text-center">{children}</span>
      )}
    </button>
  );
}

export function SearchAndFilters({
  audienceDomain,
  onAudienceDomainChange,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
  selectedCategory,
  onCategoryToggle,
  availableCategories,
  quarterOptions,
  selectedQuarters,
  onQuarterToggle,
  selectedEventsByQuarter,
  onQuarterEventChange,
  majorEventsByQuarter,
  hideLegacyFilters = false,
  selectedSport,
  onSportChange,
}: SearchAndFiltersProps) {
  const [openFilterMenu, setOpenFilterMenu] = useState<FilterMenuKey | null>(null);
  const [seasonalDropdownOpen, setSeasonalDropdownOpen] = useState(false);
  const [sportDropdownOpen, setSportDropdownOpen] = useState(false);
  const filterSectionRef = useRef<HTMLDivElement | null>(null);
  const seasonalDropdownRef = useRef<HTMLDivElement | null>(null);
  const sportDropdownRef = useRef<HTMLDivElement | null>(null);
  const showSeasonalFilters =
    !hideLegacyFilters && Boolean(quarterOptions && selectedQuarters && onQuarterToggle);
  const showSportToggle = Boolean(onSportChange);

  const showCategoryFilter = audienceDomain !== null;
  const audienceLabel =
    audienceDomain === null ? 'Select type' : audienceDomain === 'sports' ? 'Sports' : 'Retail';

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!filterSectionRef.current?.contains(event.target as Node)) {
        setOpenFilterMenu(null);
      }
      if (!seasonalDropdownRef.current?.contains(event.target as Node)) {
        setSeasonalDropdownOpen(false);
      }
      if (!sportDropdownRef.current?.contains(event.target as Node)) {
        setSportDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    if (!showCategoryFilter && openFilterMenu === 'category') {
      setOpenFilterMenu(null);
    }
  }, [showCategoryFilter, openFilterMenu]);

  const toggleFilterMenu = (key: FilterMenuKey) => {
    setOpenFilterMenu((prev) => (prev === key ? null : key));
  };

  return (
    <div className="space-y-6">
      <div className="relative hero-search flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gs-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={'Search audiences...'}
            className={`w-full pl-12 pr-12 py-3.5 rounded-full text-base text-gs-text font-heading font-normal placeholder-gs-text-muted focus:outline-none focus:ring-2 focus:ring-gs-accent-500 focus:border-transparent ${HERO_CONTROL_CLASS}`}
          />
          {searchQuery && (
            <button
              onClick={onSearchClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gs-muted hover:text-gs-text transition-colors"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onSearchSubmit}
          className={`${HERO_CTA_FOCUS_CLASS} w-auto shrink-0 self-center sm:w-auto`}
        >
          <HeroCtaPillSurface variant="light" onDarkBackground compact>
            <span className="flex items-center justify-center gap-1.5 whitespace-nowrap sm:gap-2">
              <Search className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" aria-hidden />
              Search
            </span>
          </HeroCtaPillSurface>
        </button>
      </div>

      {showSportToggle ? (
        <div className="pt-4 sm:pt-6">
          <p className="text-moment-step-row-label m-0 pb-4 text-center">Select a Sport:</p>

          <div className="relative mx-auto max-w-md md:hidden" ref={sportDropdownRef}>
            <button
              id="sport-filter-trigger"
              type="button"
              aria-haspopup="listbox"
              aria-expanded={sportDropdownOpen}
              onClick={() => setSportDropdownOpen((prev) => !prev)}
              className={FILTER_TRIGGER_CLASS}
            >
              <span className="block w-full truncate text-center">
                {selectedSport ? getAudienceSportFilterLabel(selectedSport) : 'Select a sport'}
              </span>
              <ChevronDown
                className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 shrink-0 text-gs-muted transition-transform ${sportDropdownOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
            {sportDropdownOpen && (
              <div className={FILTER_MENU_PANEL_CLASS} role="listbox">
                {AUDIENCE_SPORT_FILTERS.map((sport) => {
                  const isSelected = selectedSport === sport.slug;
                  return (
                    <FilterMenuOption
                      key={sport.slug}
                      role="option"
                      aria-selected={isSelected}
                      selected={isSelected}
                      onClick={() => {
                        onSportChange!(sport.slug);
                        setSportDropdownOpen(false);
                      }}
                    >
                      {sport.label}
                    </FilterMenuOption>
                  );
                })}
              </div>
            )}
          </div>

          <div className="hidden md:block">
            <SportToggle
              selectedSport={selectedSport ?? null}
              onSportChange={onSportChange!}
              hideLabel
              variant="hero"
              heroControl
            />
          </div>
        </div>
      ) : null}

      <div
        ref={filterSectionRef}
        className={`w-full hero-search space-y-3${hideLegacyFilters ? ' hidden' : ''}`}
        aria-hidden={hideLegacyFilters || undefined}
      >
        <div
          className={
            showCategoryFilter
              ? 'grid gap-2 sm:gap-4 grid-cols-2'
              : 'flex justify-center gap-2 sm:gap-4'
          }
        >
          {/* Audience Type */}
          <div
            className={`space-y-1 min-w-0 relative ${showCategoryFilter ? '' : 'w-full max-w-[12rem]'}`}
          >
            <label htmlFor="audience-type-filter-trigger" className={FILTER_LABEL_CLASS}>
              Audience Type
            </label>
            <button
              id="audience-type-filter-trigger"
              type="button"
              aria-haspopup="listbox"
              aria-expanded={openFilterMenu === 'audience'}
              onClick={() => toggleFilterMenu('audience')}
              className={FILTER_TRIGGER_CLASS}
            >
              <span className="block w-full truncate text-center">{audienceLabel}</span>
              <ChevronDown
                className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gs-muted shrink-0 transition-transform ${openFilterMenu === 'audience' ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
            {openFilterMenu === 'audience' && (
              <div className={FILTER_MENU_PANEL_CLASS} role="listbox">
                {(['sports', 'retail'] as const).map((domain) => {
                  const label = domain === 'sports' ? 'Sports' : 'Retail';
                  const selected = audienceDomain === domain;
                  return (
                    <FilterMenuOption
                      key={domain}
                      role="option"
                      aria-selected={selected}
                      selected={selected}
                      onClick={() => {
                        onAudienceDomainChange(domain);
                        setOpenFilterMenu(null);
                      }}
                    >
                      {label}
                    </FilterMenuOption>
                  );
                })}
              </div>
            )}
          </div>

          {/* Category — only after Retail or Sports is chosen */}
          {showCategoryFilter ? (
            <div className="space-y-1 min-w-0 relative">
              <label htmlFor="category-filter-trigger" className={FILTER_LABEL_CLASS}>
                Category
              </label>
              <button
                id="category-filter-trigger"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={openFilterMenu === 'category'}
                onClick={() => toggleFilterMenu('category')}
                className={FILTER_TRIGGER_CLASS}
              >
                <span className="block w-full truncate text-center">{selectedCategory ?? 'All categories'}</span>
                <ChevronDown
                  className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gs-muted shrink-0 transition-transform ${openFilterMenu === 'category' ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>
              {openFilterMenu === 'category' && (
                <div className={FILTER_MENU_PANEL_CLASS} role="listbox">
                  <FilterMenuOption
                    role="option"
                    aria-selected={selectedCategory === null}
                    selected={selectedCategory === null}
                    onClick={() => {
                      onCategoryToggle('');
                      setOpenFilterMenu(null);
                    }}
                  >
                    All categories
                  </FilterMenuOption>
                  {availableCategories.map((category) => {
                    const selected = selectedCategory === category;
                    return (
                      <FilterMenuOption
                        key={category}
                        role="option"
                        aria-selected={selected}
                        selected={selected}
                        onClick={() => {
                          onCategoryToggle(category);
                          setOpenFilterMenu(null);
                        }}
                      >
                        {category}
                      </FilterMenuOption>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {showSeasonalFilters && (
          <div className="space-y-3 pt-4">
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center sm:items-center sm:gap-3">
              <span className={`${FILTER_INLINE_LABEL_CLASS} text-center sm:text-left shrink-0`}>
                Seasonal:
              </span>
              <div className={`inline-grid grid-cols-2 sm:grid-cols-4 rounded-xl sm:rounded-full overflow-hidden min-h-[44px] sm:min-h-0 ${HERO_CONTROL_CLASS}`}>
                {quarterOptions!.map((quarter, index) => {
                  const isSelected = selectedQuarters!.includes(quarter);
                  return (
                    <button
                      key={quarter}
                      type="button"
                      onClick={() => onQuarterToggle!(quarter)}
                      className={`px-3 sm:px-7 py-2.5 sm:py-2 text-sm sm:text-base font-normal transition-colors min-h-[44px] sm:min-h-0 ${
                        index < quarterOptions!.length - 1 ? 'border-r border-[rgba(255,255,255,0.2)]' : ''
                      } ${
                        isSelected
                          ? 'bg-gs-accent-500 text-white'
                          : 'hero-control bg-[#eef1f6] text-[#5b6472] hover:text-[#0c1220] hover:bg-[#e4e8ef]'
                      }`}
                      aria-pressed={isSelected}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {quarter}
                        {isSelected && <X className="w-3.5 h-3.5" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedQuarters!.length > 0 && (
              <div className="max-w-md mx-auto">
                <label className="block text-xs font-normal text-gs-muted mb-1 text-center">
                  {selectedQuarters![0]} Event
                </label>
                <div className="relative" ref={seasonalDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setSeasonalDropdownOpen((prev) => !prev)}
                    className={`w-full px-3 py-2 rounded-lg text-gs-text focus:outline-none focus:ring-2 focus:ring-gs-accent-500 focus:border-transparent text-sm font-normal flex items-center justify-between ${HERO_CONTROL_CLASS}`}
                  >
                    <span>
                      {selectedEventsByQuarter?.[selectedQuarters![0]] || 'Select an event'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gs-muted transition-transform ${seasonalDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {seasonalDropdownOpen && (
                    <div className="absolute z-20 mt-1 w-full bg-gs-surface border border-gs-border rounded-lg shadow-lg overflow-hidden">
                      {(majorEventsByQuarter?.[selectedQuarters![0]] || []).map((eventName) => {
                        const isSelected = selectedEventsByQuarter?.[selectedQuarters![0]] === eventName;
                        return (
                          <button
                            key={eventName}
                            type="button"
                            onClick={() => {
                              onQuarterEventChange?.(selectedQuarters![0], eventName);
                              setSeasonalDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm font-normal text-gs-text hover:bg-gs-bg-muted transition-colors flex items-center gap-2"
                          >
                            {isSelected ? <Check className="w-4 h-4 text-gs-accent-500" /> : <span className="w-4 h-4" />}
                            <span>{eventName}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
