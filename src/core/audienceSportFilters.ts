import type { Audience } from './types';
import { normalizeCategoryLabel } from './audienceDisplay';

export type AudienceSportFilter = {
  slug: string;
  label: string;
};

export const AUDIENCE_SPORT_FILTERS: AudienceSportFilter[] = [
  { slug: 'nfl', label: 'NFL' },
  { slug: 'nba', label: 'NBA' },
  { slug: 'nhl', label: 'NHL' },
  { slug: 'mlb', label: 'MLB' },
  { slug: 'mls', label: 'MLS' },
  { slug: 'world_cup', label: 'World Cup' },
  { slug: 'wnba', label: 'WNBA' },
  { slug: 'nwsl', label: 'NWSL' },
  { slug: 'golf', label: 'Golf' },
  { slug: 'tennis', label: 'Tennis' },
];

const AUDIENCE_TO_MOMENT_SPORT: Record<string, string> = {
  nfl: 'football',
  nba: 'basketball',
  wnba: 'basketball',
  nhl: 'nhl',
  mlb: 'mlb',
  mls: 'soccer_world_cup',
  world_cup: 'soccer_world_cup',
  nwsl: 'soccer_world_cup',
};

/** Audience sport filters limited to sports with Genius Moments packages. */
export const MOMENT_AUDIENCE_SPORT_FILTERS: AudienceSportFilter[] = AUDIENCE_SPORT_FILTERS.filter(
  (sport) => sport.slug in AUDIENCE_TO_MOMENT_SPORT,
);

type AudienceSportFilterSpec = {
  leagues?: string[];
  excludeLeagues?: string[];
  /** Broader sport category audiences (e.g. Basketball for NBA), sorted after league teams. */
  includeCategory?: string;
  category?: string;
  nameIncludes?: string[];
  tagIncludes?: string[];
};

const SPORT_FILTER_SPECS: Record<string, AudienceSportFilterSpec> = {
  nfl: { leagues: ['NFL'], includeCategory: 'Football', nameIncludes: ['nfl'] },
  nba: { leagues: ['NBA'], excludeLeagues: ['WNBA'], includeCategory: 'Basketball', nameIncludes: ['nba'] },
  nhl: { leagues: ['NHL'], includeCategory: 'Hockey', nameIncludes: ['nhl'] },
  mlb: { leagues: ['MLB'], includeCategory: 'Baseball', nameIncludes: ['mlb'] },
  mls: { leagues: ['MLS'], includeCategory: 'Soccer', nameIncludes: ['mls'] },
  world_cup: { tagIncludes: ['world cup'], nameIncludes: ['world cup', 'fifa world cup'] },
  wnba: { leagues: ['WNBA'], nameIncludes: ['wnba'] },
  nwsl: { leagues: ['NWSL'], nameIncludes: ['nwsl'] },
  golf: { category: 'Golf', nameIncludes: ['golf'] },
  tennis: { category: 'Racquet', nameIncludes: ['tennis'] },
};

function audienceText(audience: Audience): string {
  return [
    audience.name,
    audience.display_name,
    audience.description,
    ...(audience.tags ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/** Short league tokens need word boundaries so e.g. NBA does not match WNBA. */
function textIncludesSportTerm(text: string, term: string): boolean {
  const normalized = term.toLowerCase();
  if (normalized.length <= 4) {
    const pattern = new RegExp(`\\b${normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return pattern.test(text);
  }
  return text.includes(normalized);
}

function isExcludedFromSportFilter(audience: Audience, spec: AudienceSportFilterSpec): boolean {
  const league = audience.sports_league ?? '';
  if (spec.excludeLeagues?.some((value) => league === value)) {
    return true;
  }

  if (spec.excludeLeagues?.includes('WNBA')) {
    const hierarchy = audience.name.toLowerCase();
    if (/\bwnba\b/.test(hierarchy)) {
      return true;
    }
  }

  return false;
}

export const SPORT_TO_CATEGORY: Record<string, string> = {
  nfl: 'Football',
  nba: 'Basketball',
  nhl: 'Hockey',
  mlb: 'Baseball',
  mls: 'Soccer',
};

export function audienceMatchesSportFilter(audience: Audience, sportSlug: string): boolean {
  const spec = SPORT_FILTER_SPECS[sportSlug];
  if (!spec) return false;

  if (isExcludedFromSportFilter(audience, spec)) {
    return false;
  }

  const league = audience.sports_league ?? '';

  if (spec.leagues?.length) {
    if (spec.leagues.some((value) => league === value)) {
      return true;
    }

    const hierarchy = audience.name.toLowerCase();
    if (
      hierarchy.includes('high value fans') &&
      spec.nameIncludes?.some((term) => textIncludesSportTerm(hierarchy, term))
    ) {
      return true;
    }

    if (
      spec.includeCategory &&
      normalizeCategoryLabel(audience.category) === spec.includeCategory
    ) {
      return true;
    }

    if (spec.nameIncludes?.some((term) => textIncludesSportTerm(hierarchy, term))) {
      return true;
    }

    return false;
  }

  if (spec.category && normalizeCategoryLabel(audience.category) === spec.category) {
    return true;
  }

  const text = audienceText(audience);

  if (spec.tagIncludes?.some((term) => textIncludesSportTerm(text, term))) {
    return true;
  }

  if (spec.nameIncludes?.some((term) => textIncludesSportTerm(text, term))) {
    return true;
  }

  return false;
}

export function getAudienceSportFilterLabel(sportSlug: string): string {
  return AUDIENCE_SPORT_FILTERS.find((sport) => sport.slug === sportSlug)?.label ?? sportSlug;
}

export function getMomentSportFromAudienceSport(audienceSportSlug: string | null): string | null {
  if (!audienceSportSlug) return null;
  return AUDIENCE_TO_MOMENT_SPORT[audienceSportSlug] ?? null;
}

export function audienceSportHasMoments(audienceSportSlug: string | null): boolean {
  if (!audienceSportSlug) return false;
  return getMomentSportFromAudienceSport(audienceSportSlug) !== null;
}
