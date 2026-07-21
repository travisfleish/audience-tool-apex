import { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Audience } from '../lib/supabase';
import type { AudienceDomainSelection } from '../core/audienceDomain';
import { AudienceCard } from './AudienceCard';
import { getDisplayName } from '../utils/audienceDisplay';

interface PopularAudiencesProps {
  audiences: Audience[];
  onAddToNotebook: (audience: Audience) => void;
  dealAudienceId?: string | null;
  audienceDealSlotTaken?: boolean;
  /** When `retail`, shows retail taxonomy groupings; otherwise sports (including when unset). */
  audienceDomain: AudienceDomainSelection;
}

interface CategoryGroup {
  name: string;
  audienceTaxonomies: string[];
}

interface MobileCategoryCarouselProps {
  audiences: Audience[];
  renderAudienceCard: (audience: Audience) => React.ReactNode;
}

const POPULAR_CATEGORIES: CategoryGroup[] = [
  {
    name: 'World Cup',
    audienceTaxonomies: [
      'Genius Sports > International Sports > Events > FIFA World Cup',
      'Genius Sports > Soccer > World Cup > The Gamer Fan',
      'Genius Sports > Soccer > World Cup > The International Sports Fan',
      'Genius Sports > Soccer > World Cup > The Parent Fan',
      'Genius Sports > Soccer > World Cup > The Soccer Player',
      'Genius Sports > Soccer > World Cup > The Pop Culture Fan',
    ],
  },
  {
    name: 'NBA Playoffs',
    audienceTaxonomies: [
      'Genius Sports > Basketball > High Value Fans > NBA Fans',
      'Genius Sports > Basketball > NBA > New York Knicks',
      'Genius Sports > Basketball > NBA > Los Angeles Lakers',
    ],
  },
  {
    name: "Women's Sports",
    audienceTaxonomies: [
      "Genius Sports > Women's Sports > Community > Fans Of Women's Sports",
      "Genius Sports > Women's Sports > WNBA > WNBA Fans",
      "Genius Sports > Women's Sports > NWSL > NWSL Fans",
    ],
  },
  {
    name: 'NFL',
    audienceTaxonomies: [
      'Genius Sports > Football > High Value Fans > NFL Fans',
      'Genius Sports > Football > NFL > Kansas City Chiefs',
      'Genius Sports > General Sports Fans > Pop Culture > NFL Swifties',
    ],
  },
  {
    name: 'Youth Sports',
    audienceTaxonomies: [
      'Genius Sports > Youth Sports > Baseball > Little League Parents',
      'Genius Sports > Youth Sports > Soccer > Soccer Parents',
      'Genius Sports > Youth Sports > Figure Skating > Figure Skating Parents',
    ],
  },
  {
    name: 'Sports Betting',
    audienceTaxonomies: [
      'Genius Sports > Betting, Gaming & Wagering > Sports Betting > Football',
      'Genius Sports > Betting, Gaming & Wagering > Sports Betting > Basketball',
      'Genius Sports > Betting, Gaming & Wagering > Sports Betting > Baseball',
    ],
  },
  {
    name: 'NBA',
    audienceTaxonomies: [
      'Genius Sports > Basketball > High Value Fans > NBA Fans',
      'Genius Sports > Basketball > NBA > Los Angeles Lakers',
      'Genius Sports > Basketball > NBA > Golden State Warriors',
    ],
  },
  {
    name: 'MLB',
    audienceTaxonomies: [
      'Genius Sports > Baseball > High Value Fans > MLB Fans',
      'Genius Sports > Baseball > MLB > Los Angeles Dodgers',
      'Genius Sports > Baseball > MLB > New York Yankees',
    ],
  },
  {
    name: 'NWSL',
    audienceTaxonomies: [
      "Genius Sports > Women's Sports > High Value Fans > NWSL Fans",
      "Genius Sports > Women's Sports > NWSL > Angel City FC",
      "Genius Sports > Women's Sports > NWSL > Fans: Aged 21-39",
    ],
  },
];

const POPULAR_RETAIL_CATEGORIES: CategoryGroup[] = [
  {
    name: 'Grocery & Delivery',
    audienceTaxonomies: [
      'Retail Innovation Lab > Retailers > Supermarkets & Grocery Stores > Whole Foods Market Online Shoppers',
      'Retail Innovation Lab > Retailers > Online Grocers > Instacart Shoppers',
      'Retail Innovation Lab > Retailers > Supermarkets & Grocery Stores > Aldi Shoppers',
    ],
  },
  {
    name: 'Mass Merchants',
    audienceTaxonomies: [
      'Retail Innovation Lab > Retailers > Mass Merchants > Target Shoppers',
      'Retail Innovation Lab > Retailers > Mass Merchants > Walmart Shoppers',
      'Retail Innovation Lab > Retailers > Mass Merchants > Meijer Shoppers',
    ],
  },
  {
    name: 'Dining & Delivery',
    audienceTaxonomies: [
      'Retail Innovation Lab > Restaurants > Online Delivery > Uber Eats Customers',
      'Retail Innovation Lab > Restaurants > Casual > Buffalo Wild Wings Customers',
      'Retail Innovation Lab > Restaurants > QSR & Fast Casual > Sonic Customers',
    ],
  },
  {
    name: 'Travel & Experiences',
    audienceTaxonomies: [
      'Retail Innovation Lab > Travel > Airlines > United Airlines Customers',
      'Retail Innovation Lab > Attractions > Theme Parks > Disney World/Land Visitors',
      'Retail Innovation Lab > Travel > Cruises > Royal Caribbean International Customers',
    ],
  },
  {
    name: 'Home & Furnishings',
    audienceTaxonomies: [
      'Retail Innovation Lab > Home > Home Improvement & Hardware > The Home Depot Online Shoppers',
      'Retail Innovation Lab > Home Furnishings & Goods > Retail > Wayfair Shoppers',
      'Retail Innovation Lab > Home > Home Improvement & Hardware > Lowes Shoppers',
    ],
  },
  {
    name: 'Athletic & Athleisure',
    audienceTaxonomies: [
      'Retail Innovation Lab > Athleisure > Activewear > Lululemon Shoppers',
      'Retail Innovation Lab > Athleisure > Sneakers Plus > Hoka',
      'Retail Innovation Lab > Athletic > Sporting Goods > Dicks Sporting Goods',
    ],
  },
];

export const INITIAL_AUDIENCE_GRID_COUNT = 6;

/** Number of cards revealed per "See More" click (2 rows × 3 columns). */
export const AUDIENCE_GRID_EXPAND_COUNT = INITIAL_AUDIENCE_GRID_COUNT;

/** Homepage "Most Popular Audiences" rows (3 cards per category). */
export const FEATURED_POPULAR_CATEGORIES = ['NFL', 'World Cup'] as const;

const FEATURED_POPULAR_CATEGORY_LIMIT = 3;

export function resolveFeaturedPopularAudiences(
  audiences: Audience[],
  audienceDomain: AudienceDomainSelection = null,
): Audience[] {
  const resolved: Audience[] = [];
  const seen = new Set<string>();

  for (const categoryName of FEATURED_POPULAR_CATEGORIES) {
    const categoryAudiences = resolvePopularAudiencesForCategory(
      audiences,
      categoryName,
      audienceDomain,
    ).slice(0, FEATURED_POPULAR_CATEGORY_LIMIT);

    for (const audience of categoryAudiences) {
      if (!seen.has(audience.id)) {
        seen.add(audience.id);
        resolved.push(audience);
      }
    }
  }

  return resolved;
}

/** Maps sport filter slugs to curated `POPULAR_CATEGORIES` group names. */
export const SPORT_TO_POPULAR_CATEGORY: Record<string, string> = {
  nfl: 'NFL',
  nba: 'NBA Playoffs',
  mlb: 'MLB',
  world_cup: 'World Cup',
  nwsl: 'NWSL',
  wnba: "Women's Sports",
};

/** Maps sport filter slugs to league labels for result sorting. */
export const SPORT_TO_LEAGUE: Record<string, string> = {
  nfl: 'NFL',
  nba: 'NBA',
  nhl: 'NHL',
  mlb: 'MLB',
  mls: 'MLS',
  wnba: 'WNBA',
  nwsl: 'NWSL',
};

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/–/g, '-')
    .replace(/\s*\((?:fows)\)\s*$/i, '')
    .trim();
}

export function resolvePopularAudiencesForCategory(
  audiences: Audience[],
  categoryName: string,
  audienceDomain: AudienceDomainSelection = null,
): Audience[] {
  const source =
    audienceDomain === 'retail' ? POPULAR_RETAIL_CATEGORIES : POPULAR_CATEGORIES;
  const category = source.find((group) => group.name === categoryName);
  if (!category) return [];

  const taxonomyToAudience = new Map<string, Audience>();
  audiences.forEach((audience) => {
    taxonomyToAudience.set(normalizeString(audience.name), audience);
  });

  return category.audienceTaxonomies
    .map((taxonomy) => taxonomyToAudience.get(normalizeString(taxonomy)))
    .filter((audience): audience is Audience => audience !== undefined);
}

export function resolvePopularAudiencesForSport(
  audiences: Audience[],
  sportSlug: string,
  audienceDomain: AudienceDomainSelection = null,
): Audience[] {
  const categoryName = SPORT_TO_POPULAR_CATEGORY[sportSlug];
  if (!categoryName) return [];
  return resolvePopularAudiencesForCategory(audiences, categoryName, audienceDomain);
}

export function resolvePopularAudiences(
  audiences: Audience[],
  audienceDomain: AudienceDomainSelection,
): Audience[] {
  const source =
    audienceDomain === 'retail' ? POPULAR_RETAIL_CATEGORIES : POPULAR_CATEGORIES;
  const seen = new Set<string>();
  const resolved: Audience[] = [];

  for (const category of source) {
    for (const audience of resolvePopularAudiencesForCategory(
      audiences,
      category.name,
      audienceDomain,
    )) {
      if (!seen.has(audience.id)) {
        seen.add(audience.id);
        resolved.push(audience);
      }
    }
  }

  return resolved;
}

function MobileCategoryCarousel({ audiences, renderAudienceCard }: MobileCategoryCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const minimumSwipeDistance = 50;

  if (audiences.length === 0) {
    return null;
  }

  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < audiences.length - 1;

  const goPrev = () => {
    if (!canGoPrev) return;
    setActiveIndex((prev) => prev - 1);
  };

  const goNext = () => {
    if (!canGoNext) return;
    setActiveIndex((prev) => prev + 1);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;

    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const swipeDistance = endX - touchStartX.current;

    if (Math.abs(swipeDistance) >= minimumSwipeDistance) {
      if (swipeDistance < 0) {
        goNext();
      } else {
        goPrev();
      }
    }

    touchStartX.current = null;
  };

  return (
    <div className="md:hidden">
      <div
        className="max-w-sm mx-auto"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {renderAudienceCard(audiences[activeIndex])}
      </div>

      <div className="mt-3 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canGoPrev}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gs-border bg-gs-surface text-gs-primary-900 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous audience"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <p className="text-sm text-gs-muted min-w-[64px] text-center">
          {activeIndex + 1} / {audiences.length}
        </p>
        <button
          type="button"
          onClick={goNext}
          disabled={!canGoNext}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gs-border bg-gs-surface text-gs-primary-900 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next audience"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export function PopularAudiences({
  audiences,
  onAddToNotebook,
  dealAudienceId = null,
  audienceDealSlotTaken = false,
  audienceDomain,
}: PopularAudiencesProps) {
  const displayNameCache = useMemo(() => {
    const cache = new Map<string, string>();
    audiences.forEach(audience => {
      cache.set(audience.id, getDisplayName(audience, audiences));
    });
    return cache;
  }, [audiences]);

  const categoryData = useMemo(() => {
    const source =
      audienceDomain === 'retail' ? POPULAR_RETAIL_CATEGORIES : POPULAR_CATEGORIES;
    const taxonomyToAudience = new Map<string, Audience>();
    audiences.forEach((audience) => {
      taxonomyToAudience.set(normalizeString(audience.name), audience);
    });

    return source.map(category => {
      const matchedAudiences = category.audienceTaxonomies
        .map(taxonomy => taxonomyToAudience.get(normalizeString(taxonomy)))
        .filter((a): a is Audience => a !== undefined);
      return {
        name: category.name,
        audiences: matchedAudiences,
      };
    }).filter(cat => cat.audiences.length > 0);
  }, [audiences, audienceDomain]);

  const renderAudienceCard = (audience: Audience) => (
    <AudienceCard
      key={audience.id}
      audience={audience}
      onAddToNotebook={onAddToNotebook}
      isInNotebook={dealAudienceId === audience.id}
      audienceDealSlotTaken={audienceDealSlotTaken}
      displayName={displayNameCache.get(audience.id) || ''}
    />
  );

  return (
    <section className="page-section-gap">
      <h2 className="text-2xl sm:text-3xl font-bold text-gs-primary-900 mb-6 sm:mb-8">
        Popular Audiences
      </h2>
      <div className="space-y-12">
        {categoryData.map(category => (
          <div key={category.name}>
            <h3 className="text-lg sm:text-xl font-semibold text-gs-primary-800 mb-3 sm:mb-4 border-b border-gs-border pb-2">
              {category.name}
            </h3>

            <MobileCategoryCarousel
              audiences={category.audiences}
              renderAudienceCard={renderAudienceCard}
            />

            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.audiences.map(renderAudienceCard)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
