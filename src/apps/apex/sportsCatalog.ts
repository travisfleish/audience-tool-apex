export type ApexSport = {
  slug: string;
  label: string;
  /** Maps to moments catalog sport slug when available. */
  momentSportSlug?: string;
  featured?: boolean;
};

/** Featured toggles shown first (World Cup intentionally omitted). */
export const APEX_FEATURED_SPORTS: ApexSport[] = [
  { slug: 'nfl', label: 'NFL', momentSportSlug: 'football', featured: true },
  { slug: 'nba', label: 'NBA', momentSportSlug: 'basketball', featured: true },
  { slug: 'mlb', label: 'MLB', momentSportSlug: 'mlb', featured: true },
  { slug: 'nhl', label: 'NHL', momentSportSlug: 'nhl', featured: true },
  { slug: 'mls', label: 'MLS', momentSportSlug: 'soccer_world_cup', featured: true },
  { slug: 'wnba', label: 'WNBA', momentSportSlug: 'basketball', featured: true },
  { slug: 'nwsl', label: 'NWSL', momentSportSlug: 'soccer_world_cup', featured: true },
  { slug: 'golf', label: 'Golf', featured: true },
  { slug: 'tennis', label: 'Tennis', featured: true },
  { slug: 'ncaa', label: 'College / NCAA', featured: true },
];

/** Additional sports discoverable via search (stub until Gina expands). */
export const APEX_SEARCHABLE_SPORTS: ApexSport[] = [
  ...APEX_FEATURED_SPORTS,
  { slug: 'f1', label: 'Formula 1' },
  { slug: 'nascar', label: 'NASCAR' },
  { slug: 'boxing', label: 'Boxing' },
  { slug: 'mma', label: 'MMA / UFC' },
  { slug: 'cricket', label: 'Cricket' },
  { slug: 'rugby', label: 'Rugby' },
  { slug: 'volleyball', label: 'Volleyball' },
  { slug: 'pickleball', label: 'Pickleball' },
  { slug: 'esports', label: 'Esports' },
  { slug: 'olympics', label: 'Olympics' },
];

export function findApexSport(slug: string): ApexSport | undefined {
  return APEX_SEARCHABLE_SPORTS.find(sport => sport.slug === slug);
}

export function searchApexSports(query: string): ApexSport[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return APEX_SEARCHABLE_SPORTS.filter(
    sport =>
      sport.label.toLowerCase().includes(normalized) ||
      sport.slug.toLowerCase().includes(normalized),
  );
}
