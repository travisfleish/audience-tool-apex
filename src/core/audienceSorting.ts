import { Audience } from './types';
import { normalizeCategoryLabel } from './audienceDisplay';

export function isGeneralLeagueFans(displayName: string, league: string): boolean {
  const lowerDisplayName = displayName.toLowerCase().trim();
  const lowerLeague = league.toLowerCase();

  const patterns = [
    `${lowerLeague} fans`,
    'nfl fans',
    'nba fans',
    'mlb fans',
    'nhl fans',
    'mls fans',
    'wnba fans',
    'nwsl fans',
    'college football fans',
    'college basketball fans',
    'ufl fans',
    'pwhl fans'
  ];

  return patterns.includes(lowerDisplayName);
}

export function hasTeamTag(audience: Audience): boolean {
  const { tags } = audience;
  if (!tags) return false;

  if (Array.isArray(tags)) {
    return tags.some(
      (tag) => typeof tag === 'string' && tag.toLowerCase() === 'team',
    );
  }

  if (typeof tags === 'string') {
    return tags.toLowerCase().split(/[\s,]+/).includes('team');
  }

  return false;
}

export function isLeagueDemographicOrFanSegment(
  audience: Audience,
  displayName = '',
): boolean {
  const leaf = audience.name.split('>').pop()?.trim().toLowerCase() ?? '';
  const text = `${leaf} ${displayName}`.toLowerCase();

  const segmentKeywords = [
    'fans',
    'high value',
    'college',
    'graduate',
    'education',
    'school',
    'income',
    'aged',
    'children',
    'child',
    'hispanic',
    'millennial',
    'parent',
    'swifties',
    'partial',
    'degree',
    'male',
    'female',
    'asian',
    'african',
    'american',
    'without children',
    'with children',
  ];

  return segmentKeywords.some((keyword) => text.includes(keyword));
}

export function isLeagueTeamAudience(audience: Audience, league: string): boolean {
  if (hasTeamTag(audience)) return true;

  const leagueUpper = league.toUpperCase();
  if ((audience.sports_league ?? '').toUpperCase() !== leagueUpper) return false;

  const parts = audience.name.split('>').map((part) => part.trim());
  const leaguePartIndex = parts.findIndex((part) => part.toUpperCase() === leagueUpper);
  if (leaguePartIndex === -1 || leaguePartIndex !== parts.length - 2) return false;

  const leaf = parts[parts.length - 1];
  if (isGenerationalAudience(leaf)) return false;
  if (isLeagueDemographicOrFanSegment(audience, leaf)) return false;

  return true;
}

export function isGenerationalAudience(displayName: string): boolean {
  const lowerDisplayName = displayName.toLowerCase();
  const generationalKeywords = [
    'gen z', 'gen x', 'millennial', 'baby boomer', 'boomer', 'generation', 'generational'
  ];

  return generationalKeywords.some(keyword => lowerDisplayName.includes(keyword));
}

function hierarchyIncludesLeagueTerm(hierarchy: string, league: string): boolean {
  const normalized = league.toLowerCase();
  if (normalized.length <= 4) {
    const pattern = new RegExp(`\\b${normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return pattern.test(hierarchy);
  }
  return hierarchy.includes(normalized);
}

export function isLeaguePrimaryAudience(audience: Audience, league: string): boolean {
  const leagueUpper = league.toUpperCase();
  if ((audience.sports_league ?? '').toUpperCase() === leagueUpper) {
    return true;
  }

  const hierarchy = audience.name.toLowerCase();
  if (
    hierarchy.includes('high value fans') &&
    hierarchyIncludesLeagueTerm(hierarchy, league)
  ) {
    return true;
  }

  const parts = audience.name.split('>').map((part) => part.trim());
  return parts.some((part) => part.toUpperCase() === leagueUpper);
}

export function sortLeagueAudiences(
  audiences: Audience[],
  league: string,
  displayNameCache: Map<string, string>,
  sportCategory?: string,
): Audience[] {
  const generalLeagueFans: Audience[] = [];
  const highValueFans: Audience[] = [];
  const teamAudiences: Audience[] = [];
  const generationalAudiences: Audience[] = [];
  const otherAudiences: Audience[] = [];
  const sportCategoryAudiences: Audience[] = [];

  audiences.forEach(audience => {
    const isCategoryOnly =
      sportCategory !== undefined &&
      !isLeaguePrimaryAudience(audience, league) &&
      normalizeCategoryLabel(audience.category) === sportCategory;

    if (isCategoryOnly) {
      sportCategoryAudiences.push(audience);
      return;
    }

    const displayName = displayNameCache.get(audience.id) || '';
    const nameAndHierarchy = `${audience.name} ${displayName}`.toLowerCase();
    const taxonomyLeaf = audience.name.split('>').pop()?.trim() ?? '';

    if (isGeneralLeagueFans(displayName, league)) {
      generalLeagueFans.push(audience);
    } else if (nameAndHierarchy.includes('high value fans')) {
      highValueFans.push(audience);
    } else if (isGenerationalAudience(displayName) || isGenerationalAudience(taxonomyLeaf)) {
      generationalAudiences.push(audience);
    } else if (isLeagueDemographicOrFanSegment(audience, displayName)) {
      otherAudiences.push(audience);
    } else if (isLeagueTeamAudience(audience, league)) {
      teamAudiences.push(audience);
    } else {
      otherAudiences.push(audience);
    }
  });

  teamAudiences.sort((a, b) => {
    const nameA = displayNameCache.get(a.id) || '';
    const nameB = displayNameCache.get(b.id) || '';
    return nameA.localeCompare(nameB);
  });

  generationalAudiences.sort((a, b) => {
    const nameA = displayNameCache.get(a.id) || '';
    const nameB = displayNameCache.get(b.id) || '';
    const isGenZA = nameA.toLowerCase().includes('gen z');
    const isGenZB = nameB.toLowerCase().includes('gen z');
    if (isGenZA && !isGenZB) return -1;
    if (!isGenZA && isGenZB) return 1;
    return nameA.localeCompare(nameB);
  });

  otherAudiences.sort((a, b) => {
    const nameA = displayNameCache.get(a.id) || '';
    const nameB = displayNameCache.get(b.id) || '';
    return nameA.localeCompare(nameB);
  });

  sportCategoryAudiences.sort((a, b) => {
    const nameA = displayNameCache.get(a.id) || '';
    const nameB = displayNameCache.get(b.id) || '';
    return nameA.localeCompare(nameB);
  });

  return [
    ...generalLeagueFans,
    ...highValueFans,
    ...generationalAudiences,
    ...teamAudiences,
    ...otherAudiences,
    ...sportCategoryAudiences,
  ];
}

export function sortAudiencesByCategory(
  audiences: Audience[],
  selectedCategories: string[],
  displayNameCache: Map<string, string>
): Audience[] {
  const audiencesByCategory = new Map<string, Audience[]>();

  audiences.forEach(audience => {
    const key = normalizeCategoryLabel(audience.category);
    if (!audiencesByCategory.has(key)) {
      audiencesByCategory.set(key, []);
    }
    audiencesByCategory.get(key)!.push(audience);
  });

  const sortedCategories = selectedCategories.slice().sort();
  const sortedAudiences: Audience[] = [];

  sortedCategories.forEach(category => {
    const categoryAudiences = audiencesByCategory.get(category) || [];
    const audiencesByLeague = new Map<string, Audience[]>();

    categoryAudiences.forEach(audience => {
      const league = audience.sports_league || 'no-league';
      if (!audiencesByLeague.has(league)) {
        audiencesByLeague.set(league, []);
      }
      audiencesByLeague.get(league)!.push(audience);
    });

    const sortedLeagues = Array.from(audiencesByLeague.keys()).sort();

    sortedLeagues.forEach(league => {
      const leagueAudiences = audiencesByLeague.get(league)!;
      const sortedLeagueAudiences = sortLeagueAudiences(leagueAudiences, league, displayNameCache);
      sortedAudiences.push(...sortedLeagueAudiences);
    });
  });

  return sortedAudiences;
}
