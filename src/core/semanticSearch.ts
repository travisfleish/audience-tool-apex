import { AUDIENCE_SELECT, toAudiences } from './audienceVariants';
import { supabase } from './supabase';
import { Audience, ProfileConfig } from './types';
import { getEventKeysFromQuery } from './seasonalFilters';
import { APP_VARIANT } from '../appVariant';

type SeasonalOverride = {
  seasonYear?: number | null;
  seasonQuarter?: string | null;
  seasonEventKeys?: string[];
};

type KeywordSeasonalFilter = {
  seasonYear?: number | null;
  seasonEventKey?: string | null;
};

let logTimeout: ReturnType<typeof setTimeout> | null = null;

export function logSearchQuery(query: string, expandedQuery: string | null = null): void {
  logSearchDebounced(query, expandedQuery);
}

function logSearchDebounced(
  query: string,
  expandedQuery: string | null
): void {
  if (logTimeout) {
    clearTimeout(logTimeout);
  }
  logTimeout = setTimeout(async () => {
    try {
      await supabase.from('search_logs').insert({
        query,
        expanded_query: expandedQuery,
        app_variant: APP_VARIANT,
      });
    } catch {
      // Silent fail
    }
  }, 1500);
}

/**
 * Legacy name: search previously used hybrid semantic + embeddings.
 * Now delegates to keyword search only.
 */
export async function searchAudiencesSemantic(
  query: string,
  limit: number = 50,
  seasonalOverride?: SeasonalOverride
): Promise<Audience[]> {
  const inferred = getEventKeysFromQuery(query);
  const eventKey =
    seasonalOverride?.seasonEventKeys?.[0] ?? inferred[0] ?? null;
  return searchAudiencesKeyword(query, limit, {
    seasonYear: seasonalOverride?.seasonYear ?? null,
    seasonEventKey: eventKey,
  });
}

export function filterAudiencesByKeyword(
  audiences: Audience[],
  query: string,
  limit: number = 50
): Audience[] {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const queryLower = trimmedQuery.toLowerCase();

  return audiences
    .filter((audience) => {
      const displayName = (audience.display_name || '').toLowerCase();
      const name = (audience.name || '').toLowerCase();
      const description = (audience.description || '').toLowerCase();
      const category = (audience.category || '').toLowerCase();
      const tags = (audience.tags || []).join(' ').toLowerCase();
      return (
        displayName.includes(queryLower) ||
        name.includes(queryLower) ||
        description.includes(queryLower) ||
        category.includes(queryLower) ||
        tags.includes(queryLower)
      );
    })
    .map((audience) => ({
      ...audience,
      keywordScore: getKeywordScore(audience, queryLower),
    }))
    .sort((a, b) => b.keywordScore - a.keywordScore)
    .slice(0, limit)
    .map(({ keywordScore, ...audience }) => audience);
}

export function filterAudiencesWithProfile(
  audiences: Audience[],
  query: string,
  profile: ProfileConfig,
  limit: number = 200
): Audience[] {
  const hasLeagues = profile.leagues && profile.leagues.length > 0;
  const hasCategories = profile.categories && profile.categories.length > 0;
  const hasFilters = hasLeagues || hasCategories;

  let filteredAudiences = audiences.filter((audience) => {
    if (hasLeagues && hasCategories) {
      const matchesLeague = profile.leagues!.includes(audience.sports_league || '');
      const matchesCategory = profile.categories!.includes(audience.category || '');
      if (!matchesLeague && !matchesCategory) return false;
    } else if (hasLeagues) {
      if (!profile.leagues!.includes(audience.sports_league || '')) return false;
    } else if (hasCategories) {
      if (!profile.categories!.includes(audience.category || '')) return false;
    }

    return matchesRequiredTags(audience, profile.requiredTags || []);
  });

  if (hasFilters && query.trim().length >= 3) {
    const queryLower = query.toLowerCase();
    filteredAudiences = filteredAudiences.filter((audience) => {
      const searchableText = [
        audience.display_name || '',
        audience.name || '',
        audience.description || '',
        ...(audience.tags || []),
      ]
        .join(' ')
        .toLowerCase();
      return searchableText.includes(queryLower);
    });
  }

  return filteredAudiences
    .map((audience) => ({
      ...audience,
      relevanceScore: 1 + calculateKeywordBoost(audience, profile.boostKeywords),
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit)
    .map(({ relevanceScore, ...audience }) => audience);
}

function getKeywordScore(audience: Audience, queryLower: string): number {
  let score = 0;
  const displayName = (audience.display_name || '').toLowerCase();
  const name = (audience.name || '').toLowerCase();
  const description = (audience.description || '').toLowerCase();
  const category = (audience.category || '').toLowerCase();
  const tags = (audience.tags || []).join(' ').toLowerCase();

  if (displayName === queryLower) score += 12;
  if (name === queryLower) score += 10;
  if (displayName.includes(queryLower)) score += 6;
  if (name.includes(queryLower)) score += 5;
  if (description.includes(queryLower)) score += 3;
  if (category.includes(queryLower)) score += 2;
  if (tags.includes(queryLower)) score += 2;
  if (audience.is_featured) score += 0.5;

  return score;
}

export async function searchAudiencesKeyword(
  query: string,
  limit: number = 50,
  seasonalFilter?: KeywordSeasonalFilter
): Promise<Audience[]> {
  const trimmedQuery = query.trim();
  const inferredSeasonEventKeys = getEventKeysFromQuery(trimmedQuery);
  const selectedSeasonEventKey =
    seasonalFilter?.seasonEventKey ?? inferredSeasonEventKeys[0] ?? null;
  const selectedSeasonYear = seasonalFilter?.seasonYear ?? 2026;

  if (!trimmedQuery && !selectedSeasonEventKey) return [];

  const queryLower = trimmedQuery.toLowerCase();
  const ilikePattern = `%${trimmedQuery}%`;

  try {
    let scopedAudienceIds: string[] | null = null;

    if (selectedSeasonEventKey) {
      const { data: mapData, error: mapError } = await supabase
        .from('audience_seasonal_map')
        .select('audience_id')
        .eq('year', selectedSeasonYear)
        .eq('component_type', 'event')
        .eq('event_key', selectedSeasonEventKey)
        .limit(5000);

      if (mapError) {
        console.error('Keyword seasonal map lookup error:', mapError);
        return [];
      }

      scopedAudienceIds = Array.from(
        new Set((mapData || []).map((row) => row.audience_id).filter(Boolean))
      ) as string[];

      if (scopedAudienceIds.length === 0) return [];
    }

    let queryBuilder = supabase
      .from('audiences')
      .select(AUDIENCE_SELECT);

    if (scopedAudienceIds) {
      queryBuilder = queryBuilder.in('id', scopedAudienceIds);
    }

    if (trimmedQuery) {
      queryBuilder = queryBuilder.or([
        `name.ilike.${ilikePattern}`,
        `display_name.ilike.${ilikePattern}`,
        `description.ilike.${ilikePattern}`,
        `category.ilike.${ilikePattern}`,
      ].join(','));
    }

    queryBuilder = queryBuilder.limit(500);

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Keyword search error:', error);
      return [];
    }

    const results = toAudiences(data)
      .map((audience) => ({
        ...audience,
        keywordScore: trimmedQuery ? getKeywordScore(audience, queryLower) : 1,
      }))
      .sort((a, b) => b.keywordScore - a.keywordScore)
      .slice(0, limit)
      .map(({ keywordScore, ...audience }) => audience);

    logSearchDebounced(query, null);
    return results;
  } catch (error) {
    console.error('Keyword search error:', error);
    return [];
  }
}

function matchesRequiredTags(audience: Audience, requiredTags: string[]): boolean {
  if (!requiredTags || requiredTags.length === 0) return true;
  if (!audience.tags || audience.tags.length === 0) return false;

  const audienceTagsLower = audience.tags.map(t => t.toLowerCase());
  return requiredTags.every(tag =>
    audienceTagsLower.some(audienceTag => audienceTag.includes(tag.toLowerCase()))
  );
}

function calculateKeywordBoost(audience: Audience, boostKeywords: string[]): number {
  let boost = 0;
  const searchableText = [
    audience.display_name || '',
    audience.description || '',
    ...(audience.tags || [])
  ].join(' ').toLowerCase();

  for (const keyword of boostKeywords) {
    if (searchableText.includes(keyword.toLowerCase())) {
      boost += 0.2;
    }
  }

  return boost;
}

export async function searchAudiencesWithProfile(
  query: string,
  profile: ProfileConfig,
  limit: number = 500
): Promise<Audience[]> {
  try {
    let queryBuilder = supabase
      .from('audiences')
      .select(AUDIENCE_SELECT);

    const hasLeagues = profile.leagues && profile.leagues.length > 0;
    const hasCategories = profile.categories && profile.categories.length > 0;
    const hasFilters = hasLeagues || hasCategories;

    if (hasLeagues && hasCategories) {
      const leagueFilters = profile.leagues!.map(league => `sports_league.eq.${league}`).join(',');
      const categoryFilters = profile.categories!.map(cat => `category.eq.${cat}`).join(',');
      queryBuilder = queryBuilder.or(`${leagueFilters},${categoryFilters}`);
    } else if (hasLeagues) {
      queryBuilder = queryBuilder.in('sports_league', profile.leagues!);
    } else if (hasCategories) {
      queryBuilder = queryBuilder.in('category', profile.categories!);
    }

    queryBuilder = queryBuilder.limit(limit);

    const { data: audiences, error } = await queryBuilder;

    if (error) {
      console.error('Profile search error:', error);
      return [];
    }

    if (!audiences) return [];

    let filteredAudiences = toAudiences(audiences).filter((audience) =>
      matchesRequiredTags(audience, profile.requiredTags || [])
    );

    if (hasFilters && query.trim().length >= 3) {
      const queryLower = query.toLowerCase();
      filteredAudiences = filteredAudiences.filter(audience => {
        const searchableText = [
          audience.display_name || '',
          audience.name || '',
          audience.description || '',
          ...(audience.tags || [])
        ].join(' ').toLowerCase();
        return searchableText.includes(queryLower);
      });
    }

    const audiencesWithScore = filteredAudiences.map(audience => {
      const keywordBoost = calculateKeywordBoost(audience, profile.boostKeywords);
      return {
        ...audience,
        relevanceScore: 1 + keywordBoost
      };
    });

    audiencesWithScore.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return audiencesWithScore.slice(0, 200);
  } catch (error) {
    console.error('Profile search error:', error);
    return [];
  }
}
