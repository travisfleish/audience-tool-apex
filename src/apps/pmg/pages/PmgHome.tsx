import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchAndFilters } from '../../../components/SearchAndFilters';
import { FeaturedAudiences } from '../../../components/FeaturedAudiences';
import { FeaturedReport } from '../../../components/FeaturedReport';
import { AudienceGridExpansionControls } from '../../../components/AudienceGridExpansionControls';
import { FilteredAudienceResults } from '../../../components/FilteredAudienceResults';
import { useAudienceGridExpansion } from '../../../core/useAudienceGridExpansion';
import { MomentsComingSoonSection, MomentsSection } from '../../../components/MomentsSection';
import { GeniusAudiencesHeader } from '../../../components/GeniusAudiencesHeader';
import { HeroSection } from '../../../components/HeroSection';
import { AudienceCard } from '../../../components/AudienceCard';
import { Loader2, Search } from 'lucide-react';
import { useAudiences } from '../../../core/useAudiences';
import { getDisplayName, normalizeCategoryLabel } from '../../../core/audienceDisplay';
import { filterAudiencesByKeyword, filterAudiencesWithProfile, logSearchQuery } from '../../../core/semanticSearch';
import { sortAudiencesByCategory, sortLeagueAudiences } from '../../../core/audienceSorting';
import { getProfileConfig } from '../../../core/profileConfig';
import { Audience } from '../../../core/types';
import { supabase } from '../../../core/supabase';
import type { AppCopy } from '../../../core/config/appConfig';
import { audienceMatchesDomain, type AudienceDomainSelection } from '../../../core/audienceDomain';
import {
  audienceMatchesSportFilter,
  audienceSportHasMoments,
  getAudienceSportFilterLabel,
  getMomentSportFromAudienceSport,
  SPORT_TO_CATEGORY,
} from '../../../core/audienceSportFilters';
import { SPORT_TO_LEAGUE } from '../../../components/PopularAudiences';
import { useSportSelectionGuard } from '../../../core/hooks/useSportSelectionGuard';
import { getMobileHeroSubhead } from '../../../core/heroCopy';
import { HeroDisplayTitle } from '../../../components/ui/HeroDisplayTitle';

import type { Deal } from '../../../core/dealBuilder';
import type { MomentActivationTarget } from '../../../core/moments/types';

interface PmgHomeProps {
  deal: Deal;
  onAddAudienceToDeal: (audience: Audience) => void;
  onAddMomentToDeal: (moment: MomentActivationTarget) => void;
  copy: AppCopy;
}

function sortAudiencesByDefaultOrder(
  audiences: Audience[],
  displayNameCache: Map<string, string>
): Audience[] {
  return audiences.sort((a, b) => {
    const displayNameA = displayNameCache.get(a.id) || '';
    const displayNameB = displayNameCache.get(b.id) || '';

    const getPriority = (audience: Audience, displayName: string): number => {
      const lowerName = displayName.toLowerCase();

      if (lowerName === 'nfl fans') return 1;
      if (lowerName === 'nba fans') return 2;
      if (lowerName === 'mlb fans') return 3;
      if (lowerName === 'nhl fans') return 4;
      if (lowerName === 'mls fans') return 5;
      if (lowerName === 'college football fans') return 6;
      if (lowerName === 'college basketball fans') return 7;
      if (lowerName.endsWith(' fans') && ['nfl', 'nba', 'mlb', 'nhl', 'mls', 'wnba', 'nwsl'].includes(audience.sports_league?.toLowerCase() || '')) return 10;

      return 1000;
    };

    const priorityA = getPriority(a, displayNameA);
    const priorityB = getPriority(b, displayNameB);

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

const CATEGORY_QUERY_INTENTS: CategoryIntent[] = [
  {
    category: 'Baseball',
    aliases: [
      'baseball',
      'mlb',
      'major league baseball',
      'baseball teams',
      'mlb teams',
      'baseball clubs',
      'mlb clubs',
      'baseball audience',
      'baseball audiences',
    ],
  },
  {
    category: 'Basketball',
    aliases: ['basketball', 'basketball teams', 'basketball clubs', 'basketball audience', 'basketball audiences'],
  },
  {
    category: 'Basketball',
    league: 'NBA',
    aliases: ['nba', 'national basketball association', 'nba teams', 'nba clubs', 'nba audience', 'nba audiences'],
  },
  {
    category: 'Basketball',
    league: 'WNBA',
    aliases: ['wnba', 'wnba teams', 'wnba clubs', 'wnba audience', 'wnba audiences'],
  },
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
  {
    category: 'Hockey',
    aliases: [
      'hockey',
      'nhl',
      'national hockey league',
      'hockey teams',
      'nhl teams',
      'hockey clubs',
      'nhl clubs',
      'hockey audience',
      'hockey audiences',
    ],
  },
  {
    category: 'Soccer',
    aliases: [
      'soccer',
      'mls',
      'nwsl',
      'major league soccer',
      'soccer teams',
      'mls teams',
      'nwsl teams',
      'soccer clubs',
      'mls clubs',
      'nwsl clubs',
      'soccer audience',
      'soccer audiences',
    ],
  },
  {
    category: 'Golf',
    aliases: ['golf', 'pga', 'golf audience', 'golf audiences'],
  },
  {
    category: 'College Sports',
    aliases: ['college sports', 'ncaa', 'college athletics', 'college basketball', 'college football'],
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

  for (const intent of CATEGORY_QUERY_INTENTS) {
    if (intent.aliases.includes(normalized)) {
      return intent;
    }
  }

  return null;
}

export function PmgHome({ deal, onAddAudienceToDeal, onAddMomentToDeal, copy }: PmgHomeProps) {
  const REFINE_SEARCH_THRESHOLD = 20;
  const [searchParams, setSearchParams] = useSearchParams();
  const { audiences, loading } = useAudiences();
  const [featuredReport, setFeaturedReport] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [audienceDomain, setAudienceDomain] = useState<AudienceDomainSelection>(null);
  const [selectedAudienceSport, setSelectedAudienceSport] = useState<string | null>(null);
  const [resultsRefineQuery, setResultsRefineQuery] = useState('');

  const activeProfileId = searchParams.get('p');
  const activeProfile = getProfileConfig(activeProfileId);

  useEffect(() => {
    fetchFeaturedReport();
  }, []);

  const domainAudiences = useMemo(
    () => audiences.filter((a) => audienceMatchesDomain(a, audienceDomain)),
    [audiences, audienceDomain]
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
  }, [activeProfileId]);

  const effectiveSubmittedQuery = useMemo(() => submittedQuery.trim(), [submittedQuery]);

  const searchResults = useMemo(() => {
    if (activeProfile) {
      return filterAudiencesWithProfile(audiences, activeProfile.displayName, activeProfile);
    }
    if (getCategoryIntentFromQuery(submittedQuery)) {
      return [];
    }
    if (effectiveSubmittedQuery.length >= 2) {
      return filterAudiencesByKeyword(audiences, submittedQuery.trim(), 50);
    }
    return [];
  }, [audiences, effectiveSubmittedQuery, activeProfile, submittedQuery]);

  useEffect(() => {
    if (effectiveSubmittedQuery.length >= 2) {
      logSearchQuery(submittedQuery.trim());
    }
  }, [effectiveSubmittedQuery, submittedQuery]);

  const fetchFeaturedReport = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('is_featured', true)
        .order('published_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setFeaturedReport(data);
      }
    } catch (error) {
      console.error('Error fetching featured report:', error);
    }
  };

  const displayNameCache = useMemo(() => {
    const cache = new Map<string, string>();
    audiences.forEach(audience => {
      cache.set(audience.id, getDisplayName(audience, audiences));
    });
    return cache;
  }, [audiences]);

  const allCategories = useMemo(
    () =>
      Array.from(new Set(domainAudiences.map((a) => normalizeCategoryLabel(a.category)))).sort(),
    [domainAudiences]
  );

  const isSearchActive = effectiveSubmittedQuery.length >= 2 || activeProfile !== null;
  const isFiltering = isSearchActive || selectedCategory !== null || selectedAudienceSport !== null;

  const handleSportChange = (sportSlug: string) => {
    setResultsRefineQuery('');
    if (selectedAudienceSport === sportSlug) {
      setSelectedAudienceSport(null);
      return;
    }
    setSelectedAudienceSport(sportSlug);
    setAudienceDomain('sports');
  };

  const selectAudienceSport = (sportSlug: string) => {
    setResultsRefineQuery('');
    setSelectedAudienceSport(sportSlug);
    setAudienceDomain('sports');
  };

  const { guardSportSelection, sportSelectionModal } = useSportSelectionGuard({
    selectedSport: selectedAudienceSport,
    onSportSelect: selectAudienceSport,
  });

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
    const filtered = base.filter(
      (a) => {
        const matchesCategory =
          !selectedCategory || normalizeCategoryLabel(a.category) === selectedCategory;
        const matchesSport =
          !selectedAudienceSport || audienceMatchesSportFilter(a, selectedAudienceSport);
        return matchesCategory && matchesSport;
      }
    );

    if (isSearchActive) return filtered;

    if (selectedCategory) {
      return sortAudiencesByCategory(filtered, [selectedCategory], displayNameCache);
    }

    if (selectedAudienceSport) {
      const sportMatches = domainAudiences.filter((audience) =>
        audienceMatchesSportFilter(audience, selectedAudienceSport)
      );
      const league = SPORT_TO_LEAGUE[selectedAudienceSport];
      if (league) {
        return sortLeagueAudiences(
          sportMatches,
          league,
          displayNameCache,
          SPORT_TO_CATEGORY[selectedAudienceSport],
        );
      }
      return sportMatches.sort((a, b) => {
        const nameA = displayNameCache.get(a.id) || '';
        const nameB = displayNameCache.get(b.id) || '';
        return nameA.localeCompare(nameB);
      });
    }

    return sortAudiencesByDefaultOrder([...filtered], displayNameCache);
  }, [
    domainAudiences,
    searchResults,
    isSearchActive,
    selectedCategory,
    displayNameCache,
    activeProfile,
    submittedQuery,
    audienceDomain,
    selectedAudienceSport,
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

  useEffect(() => {
    gridExpansion.reset();
  }, [
    effectiveSubmittedQuery,
    selectedCategory,
    activeProfileId,
    audienceDomain,
    selectedAudienceSport,
    gridExpansion.reset,
  ]);

  const handleSearchSubmit = () => setSubmittedQuery(searchQuery);

  const handleSearchClear = () => {
    setSearchQuery('');
    setSubmittedQuery('');
    setResultsRefineQuery('');
    setSearchParams({});
    setSelectedAudienceSport(null);
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

  const featuredAudiences = domainAudiences.filter((a) => a.is_featured).slice(0, 6);
  const shouldShowRefineSearch = isFiltering && (baseFilteredAudiences.length > REFINE_SEARCH_THRESHOLD || resultsRefineQuery.trim().length > 0);
  const audienceDealSlotTaken = deal.audience !== null;
  const dealMomentSlotTaken = deal.moment !== null;
  const dealMomentId = deal.moment?.id ?? null;
  const selectedMomentSport = useMemo(
    () => getMomentSportFromAudienceSport(selectedAudienceSport),
    [selectedAudienceSport]
  );
  const showMomentsComingSoon =
    selectedAudienceSport !== null && !audienceSportHasMoments(selectedAudienceSport);

  const momentsSection = (
    <div className="relative left-1/2 w-[min(100vw,90rem)] -translate-x-1/2 px-4 sm:px-6 lg:px-8 layout-gutter:px-10 xl:px-12">
      {showMomentsComingSoon ? (
        <MomentsComingSoonSection
          sportLabel={getAudienceSportFilterLabel(selectedAudienceSport)}
        />
      ) : (
        <MomentsSection
          mobileOptimized
          {...(selectedMomentSport ? { selectedSport: selectedMomentSport } : {})}
          onAddMomentToDeal={onAddMomentToDeal}
          dealMomentId={dealMomentId}
          dealMomentSlotTaken={dealMomentSlotTaken}
          guardSportSelection={guardSportSelection}
          audienceSportSlug={selectedAudienceSport}
          onAudienceSportSelect={selectAudienceSport}
        />
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gs-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gs-accent-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {sportSelectionModal}
      <HeroSection className="pt-20 pb-14 sm:pt-28 sm:pb-20">
        <div className="text-center mb-10 sm:mb-14">
          <HeroDisplayTitle title={copy.heroTitle} className="hero-site-title mb-4 max-md:px-0.5 md:px-0" />

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
            selectedSport={selectedAudienceSport}
            onSportChange={handleSportChange}
          />
        </div>
      </HeroSection>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 layout-gutter:px-10 xl:px-12 pb-12">

      <GeniusAudiencesHeader
        resultCount={isFiltering ? filteredAudiences.length : undefined}
        searchTerm={effectiveSubmittedQuery.length >= 2 ? submittedQuery : undefined}
        filterLabel={
          selectedAudienceSport
            ? getAudienceSportFilterLabel(selectedAudienceSport)
            : selectedCategory
        }
        showRefineSearch={isFiltering && shouldShowRefineSearch}
        refineQuery={resultsRefineQuery}
        onRefineQueryChange={setResultsRefineQuery}
      />

      {!isFiltering && (
        <>
          <FeaturedAudiences
            audiences={featuredAudiences}
            allAudiences={audiences}
            onAddToNotebook={onAddAudienceToDeal}
            dealAudienceId={deal.audience?.id ?? null}
            audienceDealSlotTaken={audienceDealSlotTaken}
            audienceDomain={audienceDomain}
          />

          {momentsSection}

          {featuredReport && (
            <div id="planning-guide" className="scroll-mt-24">
              <FeaturedReport report={featuredReport} />
            </div>
          )}
        </>
      )}

      {isFiltering && baseFilteredAudiences.length > 0 ? (
        <section>
          {filteredAudiences.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gs-muted text-lg">
                No audiences match your in-list search.
              </p>
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
                    displayName={displayNameCache.get(audience.id) || getDisplayName(audience, audiences)}
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
          <h2 className="text-xl font-semibold text-gs-primary-900 mb-2">
            Sorry, no results found
          </h2>
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

          {featuredReport && (
            <div id="planning-guide" className="scroll-mt-24">
              <FeaturedReport report={featuredReport} />
            </div>
          )}
        </div>
      )}
    </main>
    </>
  );
}
