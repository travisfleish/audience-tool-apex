export const QUARTER_OPTIONS = ['Q1', 'Q2', 'Q3', 'Q4'] as const;
export type QuarterOption = typeof QUARTER_OPTIONS[number];

export const SEASONAL_EVENT_OPTIONS_BY_QUARTER: Record<QuarterOption, Array<{ label: string; eventKey: string }>> = {
  Q1: [
    { label: 'Super Bowl', eventKey: 'super_bowl' },
    { label: 'March Madness', eventKey: 'march_madness' },
    { label: 'NFL Playoffs', eventKey: 'nfl_playoffs' },
    { label: 'College Football Playoff National Championship', eventKey: 'cfp_national_championship' },
  ],
  Q2: [
    { label: 'NBA Finals', eventKey: 'nba_finals' },
    { label: 'NBA Playoffs', eventKey: 'nba_playoffs' },
    { label: 'Stanley Cup Finals', eventKey: 'stanley_cup_finals' },
    { label: 'FIFA World Cup', eventKey: 'fifa_world_cup' },
    { label: 'MLB Opening Day', eventKey: 'mlb_opening_day' },
  ],
  Q3: [
    { label: 'NFL Kickoff', eventKey: 'nfl_kickoff' },
    { label: 'WNBA Playoffs', eventKey: 'wnba_playoffs' },
    { label: 'US Open (Tennis)', eventKey: 'us_open_series' },
  ],
  Q4: [
    { label: 'World Series', eventKey: 'world_series' },
    { label: 'MLB Postseason', eventKey: 'mlb_postseason' },
    { label: 'NFL Regular Season Peak', eventKey: 'nfl_regular_season_peak' },
    { label: 'CFB Rivalry & Bowls', eventKey: 'cfb_rivalry_and_bowls' },
  ],
};

export const MAJOR_EVENTS_BY_QUARTER: Record<QuarterOption, string[]> = {
  Q1: SEASONAL_EVENT_OPTIONS_BY_QUARTER.Q1.map((e) => e.label),
  Q2: SEASONAL_EVENT_OPTIONS_BY_QUARTER.Q2.map((e) => e.label),
  Q3: SEASONAL_EVENT_OPTIONS_BY_QUARTER.Q3.map((e) => e.label),
  Q4: SEASONAL_EVENT_OPTIONS_BY_QUARTER.Q4.map((e) => e.label),
};

export function buildSeasonalIntentSuffix(
  selectedQuarters: QuarterOption[],
  selectedEventsByQuarter: Partial<Record<QuarterOption, string>>
): string {
  const selectedQuarterEvents = selectedQuarters
    .map((q) => ({ quarter: q, event: selectedEventsByQuarter[q]?.trim() }))
    .filter((item): item is { quarter: QuarterOption; event: string } => Boolean(item.event));

  const quarterTerms = selectedQuarterEvents.map((item) => item.quarter.toLowerCase());
  const eventTerms = selectedQuarterEvents.map((item) => item.event);

  return [...quarterTerms, ...eventTerms].join(' ').trim();
}

export function getEventKeyFromSelection(
  quarter: QuarterOption | null,
  selectedEventLabel: string | null
): string | null {
  if (!quarter || !selectedEventLabel) return null;
  const match = (SEASONAL_EVENT_OPTIONS_BY_QUARTER[quarter] || []).find((event) => event.label === selectedEventLabel);
  return match?.eventKey ?? null;
}

const EVENT_KEY_BY_NORMALIZED_LABEL = Object.values(SEASONAL_EVENT_OPTIONS_BY_QUARTER)
  .flat()
  .reduce<Record<string, string>>((acc, event) => {
    acc[normalizeForEventMatch(event.label)] = event.eventKey;
    return acc;
  }, {});

const EVENT_QUERY_ALIASES: Record<string, string> = {
  superbowl: 'super_bowl',
  'super bowl': 'super_bowl',
  'march madness': 'march_madness',
  'nfl playoffs': 'nfl_playoffs',
  'cfp championship': 'cfp_national_championship',
  'college football playoff': 'cfp_national_championship',
  'college football playoff national championship': 'cfp_national_championship',
  'nba finals': 'nba_finals',
  'nba playoffs': 'nba_playoffs',
  'stanley cup finals': 'stanley_cup_finals',
  'fifa world cup': 'fifa_world_cup',
  'mlb opening day': 'mlb_opening_day',
  'nfl kickoff': 'nfl_kickoff',
  'wnba playoffs': 'wnba_playoffs',
  'us open tennis': 'us_open_series',
  'world series': 'world_series',
  'mlb postseason': 'mlb_postseason',
  'nfl regular season': 'nfl_regular_season_peak',
  'cfb rivalry bowls': 'cfb_rivalry_and_bowls',
};

function normalizeForEventMatch(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getEventKeysFromQuery(query: string): string[] {
  const normalizedQuery = normalizeForEventMatch(query);
  if (!normalizedQuery) return [];

  const matched = new Set<string>();

  Object.entries(EVENT_QUERY_ALIASES).forEach(([alias, eventKey]) => {
    if (normalizedQuery.includes(alias)) {
      matched.add(eventKey);
    }
  });

  Object.entries(EVENT_KEY_BY_NORMALIZED_LABEL).forEach(([normalizedLabel, eventKey]) => {
    if (normalizedQuery.includes(normalizedLabel)) {
      matched.add(eventKey);
    }
  });

  return Array.from(matched);
}

