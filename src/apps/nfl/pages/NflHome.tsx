import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchAndFilters } from '../../../components/SearchAndFilters';
import { AudienceGridExpansionControls } from '../../../components/AudienceGridExpansionControls';
import { MobileAudienceCarousel } from '../../../components/MobileAudienceCarousel';
import { FilteredAudienceResults } from '../../../components/FilteredAudienceResults';
import { useAudienceGridExpansion } from '../../../core/useAudienceGridExpansion';
import { MomentsSection } from '../../../components/MomentsSection';
import { GeniusAudiencesHeader } from '../../../components/GeniusAudiencesHeader';
import { HeroSection } from '../../../components/HeroSection';
import { AudienceCard } from '../../../components/AudienceCard';
import { PromoCarouselSection } from '../../../components/PromoCarouselSection';
import { Loader2, Search } from 'lucide-react';
import { useAudiences } from '../../../core/useAudiences';
import { getDisplayName, normalizeCategoryLabel } from '../../../core/audienceDisplay';
import { filterAudiencesByKeyword, filterAudiencesWithProfile, logSearchQuery } from '../../../core/semanticSearch';
import { sortAudiencesByCategory, sortLeagueAudiences } from '../../../core/audienceSorting';
import { getProfileConfig } from '../../../core/profileConfig';
import { Audience } from '../../../core/types';
import type { AppCopy, PromoModuleConfig } from '../../../core/config/appConfig';
import { audienceMatchesDomain, type AudienceDomainSelection } from '../../../core/audienceDomain';
import {
  audienceMatchesSportFilter,
  getAudienceSportFilterLabel,
} from '../../../core/audienceSportFilters';
import {
  resolvePopularAudiencesForSport,
  SPORT_TO_LEAGUE,
} from '../../../components/PopularAudiences';
import { getMobileHeroSubhead } from '../../../core/heroCopy';
import { HeroDisplayTitle } from '../../../components/ui/HeroDisplayTitle';

import type { Deal } from '../../../core/dealBuilder';
import type { MomentActivationTarget } from '../../../core/moments/types';

const LOCKED_SPORT = 'nfl';
const LOCKED_MOMENT_SPORT = 'football';

interface NflHomeProps {
  deal: Deal;
  onAddAudienceToDeal: (audience: Audience) => void;
  onAddMomentToDeal: (moment: MomentActivationTarget) => void;
  copy: AppCopy;
  promoModules: PromoModuleConfig[];
}

function sortNflAudiencesByDefaultOrder(
  audiences: Audience[],
  displayNameCache: Map<string, string>
): Audience[] {
  return audiences.sort((a, b) => {
    const displayNameA = displayNameCache.get(a.id) || '';
    const displayNameB = displayNameCache.get(b.id) || '';

    const getPriority = (displayName: string): number => {
      const lowerName = displayName.toLowerCase();
      if (lowerName === 'nfl fans') return 1;
      if (lowerName.endsWith(' fans') && lowerName.includes('nfl')) return 10;
      return 1000;
    };

    const priorityA = getPriority(displayNameA);
    const priorityB = getPriority(displayNameB);

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    return displayNameA.localeCompare(displayNameB);
  });
}

type CategoryIntent = {
  category: string;
  aliases: string[];
  league?: string;
};

const NFL_CATEGORY_QUERY_INTENTS: CategoryIntent[] = [
  {
    category: 'Football',
    aliases: [
      'football',
      'nfl',
      'national football league',
      'football teams',
      'nfl teams',
      'football clubs',
      'nfl clubs',
      'football audience',
      'football audiences',
    ],
  },
];

function normalizeQueryForCategoryIntent(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ');
}

function getCategoryIntentFromQuery(rawQuery: string): CategoryIntent | null {
  const normalized = normalizeQueryForCategoryIntent(rawQuery);
  if (!normalized) return null;
  if (normalized.match(/\s+(fan|fans|audience|audiences|segment|segments|team|teams|club|clubs)$/)) {
    return getCategoryIntentFromQuery(
      normalized.replace(/\s+(fan|fans|audience|audiences|segment|segments|team|teams|club|clubs)$/, '')
    );
  }

  for (const intent of NFL_CATEGORY_QUERY_INTENTS) {
    if (intent.aliases.includes(normalized)) {
      return intent;
    }
  }

  return null;
}

export function NflHome({ deal, onAddAudienceToDeal, onAddMomentToDeal, copy, promoModules }: NflHomeProps) {
  const REFINE_SEARCH_THRESHOLD = 20;
  const [searchParams, setSearchParams] = useSearchParams();
  const { audiences, loading } = useAudiences();
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [audienceDomain, setAudienceDomain] = useState<AudienceDomainSelection>('sports');
  const [resultsRefineQuery, setResultsRefineQuery] = useState('');

  const activeProfileId = searchParams.get('p');
  const activeProfile = getProfileConfig(activeProfileId);

  const nflAudiences = useMemo(
    () => audiences.filter((audience) => audienceMatchesSportFilter(audience, LOCKED_SPORT)),
    [audiences]
  );

  const domainAudiences = useMemo(
    () => nflAudiences.filter((a) => audienceMatchesDomain(a, audienceDomain)),
    [nflAudiences, audienceDomain]
  );

  useEffect(() => {
    setSelectedCategory((prev) => {
      if (prev === null) return null;
      const stillValid = domainAudiences.some(
        (a) => normalizeCategoryLabel(a.category) === prev
      );
      return stillValid ? prev : null;
    });
  }, [domainAudiences]);

  useEffect(() => {
    if (activeProfile) {
      setSearchQuery(activeProfile.displayName);
      setSubmittedQuery(activeProfile.displayName);
    }
  }, [activeProfileId, activeProfile]);

  const effectiveSubmittedQuery = useMemo(() => submittedQuery.trim(), [submittedQuery]);

  const searchResults = useMemo(() => {
    if (activeProfile) {
      return filterAudiencesWithProfile(nflAudiences, activeProfile.displayName, activeProfile).filter(
        (audience) => audienceMatchesSportFilter(audience, LOCKED_SPORT)
      );
    }
    if (getCategoryIntentFromQuery(submittedQuery)) {
      return [];
    }
    if (effectiveSubmittedQuery.length >= 2) {
      return filterAudiencesByKeyword(nflAudiences, submittedQuery.trim(), 50);
    }
    return [];
  }, [nflAudiences, effectiveSubmittedQuery, activeProfile, submittedQuery]);

  useEffect(() => {
    if (effectiveSubmittedQuery.length >= 2) {
      logSearchQuery(submittedQuery.trim());
    }
  }, [effectiveSubmittedQuery, submittedQuery]);

  const displayNameCache = useMemo(() => {
    const cache = new Map<string, string>();
    nflAudiences.forEach((audience) => {
      cache.set(audience.id, getDisplayName(audience, nflAudiences));
    });
    return cache;
  }, [nflAudiences]);

  const allCategories = useMemo(
    () =>
      Array.from(new Set(domainAudiences.map((a) => normalizeCategoryLabel(a.category)))).sort(),
    [domainAudiences]
  );

  const isSearchActive = effectiveSubmittedQuery.length >= 2 || activeProfile !== null;
  const isFiltering = isSearchActive || selectedCategory !== null;

  const baseFilteredAudiences = useMemo(() => {
    const categoryIntent = activeProfile ? null : getCategoryIntentFromQuery(submittedQuery);
    const hasCategoryIntentSearch = isSearchActive && Boolean(categoryIntent);

    if (hasCategoryIntentSearch && categoryIntent) {
      const intentFiltered = domainAudiences.filter((audience) => {
        if (categoryIntent.league) {
          return audience.sports_league === categoryIntent.league;
        }
        return (
          normalizeCategoryLabel(audience.category) ===
          normalizeCategoryLabel(categoryIntent.category)
        );
      });

      const selectedCategoryFiltered = selectedCategory
        ? intentFiltered.filter(
            (audience) => normalizeCategoryLabel(audience.category) === selectedCategory
          )
        : intentFiltered;

      if (selectedCategory) {
        return sortAudiencesByCategory(selectedCategoryFiltered, [selectedCategory], displayNameCache);
      }

      if (categoryIntent.league) {
        return sortLeagueAudiences(selectedCategoryFiltered, categoryIntent.league, displayNameCache);
      }

      return sortAudiencesByCategory(
        selectedCategoryFiltered,
        [normalizeCategoryLabel(categoryIntent.category)],
        displayNameCache
      );
    }

    const base = isSearchActive
      ? searchResults.filter((a) => audienceMatchesDomain(a, audienceDomain))
      : domainAudiences;
    const filtered = base.filter((a) => {
      const matchesCategory =
        !selectedCategory || normalizeCategoryLabel(a.category) === selectedCategory;
      return matchesCategory && audienceMatchesSportFilter(a, LOCKED_SPORT);
    });

    if (isSearchActive) return filtered;

    if (selectedCategory) {
      return sortAudiencesByCategory(filtered, [selectedCategory], displayNameCache);
    }

    const league = SPORT_TO_LEAGUE[LOCKED_SPORT];
    if (league) {
      return sortLeagueAudiences(filtered, league, displayNameCache, 'Football');
    }

    return sortNflAudiencesByDefaultOrder([...filtered], displayNameCache);
  }, [
    domainAudiences,
    searchResults,
    isSearchActive,
    selectedCategory,
    displayNameCache,
    activeProfile,
    submittedQuery,
    audienceDomain,
  ]);

  const filteredAudiences = useMemo(() => {
    const refine = resultsRefineQuery.trim().toLowerCase();
    if (!refine) return baseFilteredAudiences;

    return baseFilteredAudiences.filter((audience) => {
      const displayName = (displayNameCache.get(audience.id) || '').toLowerCase();
      const name = (audience.name || '').toLowerCase();
      const description = (audience.description || '').toLowerCase();
      const tags = (audience.tags || []).join(' ').toLowerCase();
      return (
        displayName.includes(refine) ||
        name.includes(refine) ||
        description.includes(refine) ||
        tags.includes(refine)
      );
    });
  }, [baseFilteredAudiences, resultsRefineQuery, displayNameCache]);

  const gridExpansion = useAudienceGridExpansion(filteredAudiences.length);
  const allNflAudiences = useMemo(() => {
    const league = SPORT_TO_LEAGUE[LOCKED_SPORT];
    if (league) {
      return sortLeagueAudiences([...domainAudiences], league, displayNameCache, 'Football');
    }
    return sortNflAudiencesByDefaultOrder([...domainAudiences], displayNameCache);
  }, [domainAudiences, displayNameCache]);
  const allNflGridExpansion = useAudienceGridExpansion(allNflAudiences.length);
  const popularNflAudiences = useMemo(
    () => resolvePopularAudiencesForSport(nflAudiences, LOCKED_SPORT, audienceDomain),
    [nflAudiences, audienceDomain],
  );

  useEffect(() => {
    gridExpansion.reset();
  }, [
    effectiveSubmittedQuery,
    selectedCategory,
    activeProfileId,
    audienceDomain,
    gridExpansion.reset,
  ]);

  useEffect(() => {
    allNflGridExpansion.reset();
  }, [audienceDomain, allNflGridExpansion.reset]);

  const handleSearchSubmit = () => setSubmittedQuery(searchQuery);

  const handleSearchClear = () => {
    setSearchQuery('');
    setSubmittedQuery('');
    setResultsRefineQuery('');
    setSearchParams({});
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (activeProfile && q !== activeProfile.displayName) setSearchParams({});
    if (q.trim() === '') setSubmittedQuery('');
  };

  const handleCategoryToggle = (category: string) => {
    setResultsRefineQuery('');
    if (category === '') {
      setSelectedCategory(null);
      return;
    }
    setSelectedCategory((prev) => (prev === category ? null : category));
  };

  const shouldShowRefineSearch =
    isFiltering &&
    (baseFilteredAudiences.length > REFINE_SEARCH_THRESHOLD || resultsRefineQuery.trim().length > 0);
  const audienceDealSlotTaken = deal.audience !== null;
  const dealMomentSlotTaken = deal.moment !== null;
  const dealMomentId = deal.moment?.id ?? null;

  const momentsSection = (
    <div className="relative left-1/2 w-[min(100vw,90rem)] -translate-x-1/2 px-4 sm:px-6 lg:px-8 layout-gutter:px-10 xl:px-12">
      <MomentsSection
        mobileOptimized
        selectedSport={LOCKED_MOMENT_SPORT}
        title={copy.momentsTitle}
        subtitle={copy.momentsSubtitle}
        onAddMomentToDeal={onAddMomentToDeal}
        dealMomentId={dealMomentId}
        dealMomentSlotTaken={dealMomentSlotTaken}
        audienceSportSlug={LOCKED_SPORT}
      />
    </div>
  );

  const promoSections = promoModules.map((module) => (
    <PromoCarouselSection key={module.id} module={module} />
  ));

  if (loading) {
    return (
      <div className="min-h-screen bg-gs-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gs-accent-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <HeroSection className="pt-20 pb-14 sm:pt-28 sm:pb-20">
        <div className="text-center mb-10 sm:mb-14">
          <HeroDisplayTitle
            title={copy.heroTitle}
            titleLine2={copy.heroTitleLine2}
            className="hero-site-title mb-4 max-md:px-0.5 md:px-0"
          />

          <p className="mt-3 px-3 text-base leading-relaxed font-normal text-white/90 sm:hidden">
            {getMobileHeroSubhead(copy.heroSubtitle)}
          </p>

          <div className="hidden sm:block">
            {copy.heroSubtitle && (
              <p className="text-subhead hero-subhead font-normal mt-5">
                {`${copy.heroSubtitle}${copy.heroSubtitle2 ? ` ${copy.heroSubtitle2}` : ''}`}
              </p>
            )}
          </div>
        </div>

        <div id="audience-explorer" className="scroll-mt-24">
          <SearchAndFilters
            audienceDomain={audienceDomain}
            onAudienceDomainChange={setAudienceDomain}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onSearchSubmit={handleSearchSubmit}
            onSearchClear={handleSearchClear}
            selectedCategory={selectedCategory}
            onCategoryToggle={handleCategoryToggle}
            availableCategories={allCategories}
            hideLegacyFilters
            selectedSport={LOCKED_SPORT}
          />
        </div>
      </HeroSection>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 layout-gutter:px-10 xl:px-12 pb-12">
        <GeniusAudiencesHeader
          resultCount={isFiltering ? filteredAudiences.length : undefined}
          searchTerm={effectiveSubmittedQuery.length >= 2 ? submittedQuery : undefined}
          filterLabel={
            isFiltering
              ? selectedCategory ?? getAudienceSportFilterLabel(LOCKED_SPORT)
              : getAudienceSportFilterLabel(LOCKED_SPORT)
          }
          showRefineSearch={isFiltering && shouldShowRefineSearch}
          refineQuery={resultsRefineQuery}
          onRefineQueryChange={setResultsRefineQuery}
        />

        {!isFiltering && (
          <>
            {popularNflAudiences.length > 0 && (
              <section className="page-section-gap">
                <h2 className="text-2xl sm:text-3xl font-bold text-gs-primary-900 mb-6 sm:mb-8">
                  Popular NFL Audiences
                </h2>

                <MobileAudienceCarousel
                  items={popularNflAudiences}
                  renderItem={(audience, index) => (
                    <AudienceCard
                      key={audience.id}
                      audience={audience}
                      onAddToNotebook={onAddAudienceToDeal}
                      isInNotebook={deal.audience?.id === audience.id}
                      audienceDealSlotTaken={audienceDealSlotTaken}
                      isTopPerformer={index === 0}
                      displayName={
                        displayNameCache.get(audience.id) ||
                        getDisplayName(audience, nflAudiences)
                      }
                    />
                  )}
                  ariaLabel="Popular NFL audiences"
                />
                <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {popularNflAudiences.map((audience, index) => (
                    <AudienceCard
                      key={audience.id}
                      audience={audience}
                      onAddToNotebook={onAddAudienceToDeal}
                      isInNotebook={deal.audience?.id === audience.id}
                      audienceDealSlotTaken={audienceDealSlotTaken}
                      isTopPerformer={index === 0}
                      displayName={
                        displayNameCache.get(audience.id) ||
                        getDisplayName(audience, nflAudiences)
                      }
                    />
                  ))}
                </div>
              </section>
            )}

            <section className="page-section-gap">
              <h2 className="text-2xl sm:text-3xl font-bold text-gs-primary-900 mb-6 sm:mb-8">
                All NFL Audiences
              </h2>

              <FilteredAudienceResults
                items={allNflAudiences}
                displayCount={allNflGridExpansion.displayCount}
                renderItem={(audience) => (
                  <AudienceCard
                    key={audience.id}
                    audience={audience}
                    onAddToNotebook={onAddAudienceToDeal}
                    isInNotebook={deal.audience?.id === audience.id}
                    audienceDealSlotTaken={audienceDealSlotTaken}
                    displayName={
                      displayNameCache.get(audience.id) ||
                      getDisplayName(audience, nflAudiences)
                    }
                  />
                )}
              />
              {allNflGridExpansion.showControls && (
                <AudienceGridExpansionControls
                  canSeeMore={allNflGridExpansion.canSeeMore}
                  seeMoreIncrement={allNflGridExpansion.seeMoreIncrement}
                  hiddenCount={allNflGridExpansion.hiddenCount}
                  showLess={allNflGridExpansion.showLess}
                  onSeeMore={allNflGridExpansion.seeMore}
                  onShowAll={allNflGridExpansion.showAllResults}
                  onShowLess={allNflGridExpansion.collapse}
                />
              )}
            </section>

            {momentsSection}

            {promoSections}
          </>
        )}

        {isFiltering && baseFilteredAudiences.length > 0 ? (
          <section>
            {filteredAudiences.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gs-muted text-lg">No audiences match your in-list search.</p>
              </div>
            ) : (
              <>
                <FilteredAudienceResults
                  items={filteredAudiences}
                  displayCount={gridExpansion.displayCount}
                  renderItem={(audience) => (
                    <AudienceCard
                      key={audience.id}
                      audience={audience}
                      onAddToNotebook={onAddAudienceToDeal}
                      isInNotebook={deal.audience?.id === audience.id}
                      audienceDealSlotTaken={audienceDealSlotTaken}
                      displayName={
                        displayNameCache.get(audience.id) || getDisplayName(audience, nflAudiences)
                      }
                    />
                  )}
                />
                {gridExpansion.showControls && (
                  <AudienceGridExpansionControls
                    canSeeMore={gridExpansion.canSeeMore}
                    seeMoreIncrement={gridExpansion.seeMoreIncrement}
                    hiddenCount={gridExpansion.hiddenCount}
                    showLess={gridExpansion.showLess}
                    onSeeMore={gridExpansion.seeMore}
                    onShowAll={gridExpansion.showAllResults}
                    onShowLess={gridExpansion.collapse}
                  />
                )}
              </>
            )}
          </section>
        ) : isFiltering && baseFilteredAudiences.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="w-12 h-12 text-gs-muted mb-4" aria-hidden />
            <h2 className="text-xl font-semibold text-gs-primary-900 mb-2">Sorry, no results found</h2>
            <p className="text-gs-muted max-w-md">
              {effectiveSubmittedQuery.length >= 2
                ? 'Try different keywords or switch to keyword-only search to broaden your results.'
                : 'No audiences match your current filters. Try adjusting your selection.'}
            </p>
          </div>
        ) : null}

        {isFiltering && (
          <div className="mt-20 sm:mt-24">
            {momentsSection}
            {promoSections}
          </div>
        )}
      </main>
    </>
  );
}
