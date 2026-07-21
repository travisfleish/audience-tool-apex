import { ProfileConfig } from './types';

export type { ProfileConfig };

export const PROFILE_CONFIGS: Record<string, ProfileConfig> = {
  'mlb': {
    id: 'mlb',
    displayName: 'MLB Fans',
    leagues: ['MLB'],
    categories: ['Baseball'],
    boostKeywords: [
      'merchandise', 'lids', 'theme park', 'disney', 'universal',
      'sportstainment', 'pickleball', 'golf', 'emerging sports'
    ]
  },
  'nba': {
    id: 'nba',
    displayName: 'NBA Fans',
    leagues: ['NBA'],
    categories: ['Basketball'],
    boostKeywords: [
      'tech', 'electronics', 'best buy', 'concerts', 'festivals',
      'costco', 'sneakers'
    ]
  },
  'nfl': {
    id: 'nfl',
    displayName: 'NFL Fans',
    leagues: ['NFL'],
    categories: ['Football'],
    boostKeywords: [
      'beauty', 'cosmetics', 'ulta', 'betting', 'fantasy', 'fanduel',
      'gaming', 'madden', 'sneakers', 'swiftie', 'theme park'
    ]
  },
  'nhl': {
    id: 'nhl',
    displayName: 'NHL Fans',
    leagues: ['NHL'],
    categories: ['Hockey'],
    boostKeywords: [
      'youth sports', 'hockey gear', 'fitness', 'workout', 'amazon',
      'cyber monday', 'lululemon', 'athleta', 'gen z'
    ]
  },
  'wnba': {
    id: 'wnba',
    displayName: 'WNBA Fans',
    leagues: ['WNBA'],
    categories: ['Basketball', "Women's Sports"],
    boostKeywords: [
      'outdoor', 'healthy', 'protein', 'supplement', 'uber', 'rideshare',
      'lululemon', 'athleta', 'sneakers'
    ]
  },
  'nwsl': {
    id: 'nwsl',
    displayName: 'NWSL Fans',
    leagues: ['NWSL'],
    categories: ['Soccer', "Women's Sports"],
    boostKeywords: [
      'trendsetters', 'gen z', 'values driven', 'sustainable',
      'boutique fitness', 'cycling', 'crossfit', 'yoga', 'athleisure'
    ]
  },
  'mls': {
    id: 'mls',
    displayName: 'MLS Fans',
    leagues: ['MLS'],
    categories: ['Soccer'],
    boostKeywords: [
      'travel', 'airlines', 'car rental', 'merchandise', 'disney',
      'movie', 'theater', 'amc', 'streaming'
    ]
  },
  'golf': {
    id: 'golf',
    displayName: 'Golf Fans',
    leagues: ['PGA'],
    categories: ['Golf'],
    boostKeywords: [
      'athleisure', 'performance', 'home improvement', 'hardware',
      'discount', 'restaurants', 'alcohol', 'lids', 'sportstainment'
    ]
  },
  'pwhl': {
    id: 'pwhl',
    displayName: 'PWHL Fans',
    leagues: ['PWHL'],
    categories: ['Hockey', "Women's Sports"],
    boostKeywords: [
      'pets', 'petsmart', 'chewy', 'entertainment', 'concerts',
      'festivals', 'barstool', 'cinema', 'streaming', 'values driven', 'books'
    ]
  },
  'college-bowl': {
    id: 'college-bowl',
    displayName: 'College Football Bowl Games',
    leagues: ['NCAA'],
    categories: ['College Sports'],
    requiredTags: ['college', 'football', 'ncaa'],
    boostKeywords: [
      'performance', 'activewear', 'athleisure', 'travel', 'hotels',
      'merchandise', 'fanatics', 'draftkings'
    ]
  },
  'march-madness': {
    id: 'march-madness',
    displayName: 'College Basketball - March Madness',
    leagues: ['NCAA'],
    categories: ['College Sports', 'Basketball'],
    requiredTags: ['college', 'basketball', 'ncaa'],
    boostKeywords: [
      'sportstainment', 'topgolf', 'home depot', 'lowes', 'movie',
      'theater', 'betting', 'brackets'
    ]
  },
  'super-bowl': {
    id: 'super-bowl',
    displayName: 'Super Bowl Fans',
    leagues: ['NFL'],
    categories: ['Football'],
    boostKeywords: [
      'youth sports', 'sports parents', 'recreational', 'home improvement',
      'ikea', 'wayfair', 'swiftie', 'gen z', 'betting'
    ]
  },
  'holiday': {
    id: 'holiday',
    displayName: 'Holiday Shoppers',
    boostKeywords: [
      'holiday', 'black friday', 'cyber monday', 'amazon', 'walmart',
      'target', 'best buy', 'pets', 'athleisure', 'merchandise',
      'sneakers', 'cosmetics', 'sustainable'
    ]
  },
  'general-sports': {
    id: 'general-sports',
    displayName: 'General Sports Fans',
    categories: ['General Sports Fans', 'Football', 'Basketball', 'Hockey', 'Baseball'],
    boostKeywords: [
      'sports', 'merchandise', 'recreational', 'sportstainment',
      'betting', 'streaming', 'ott', 'delivery', 'restaurants',
      'athleisure', 'snacks'
    ]
  }
};

export function getProfileConfig(profileId: string | null): ProfileConfig | null {
  if (!profileId) return null;
  return PROFILE_CONFIGS[profileId] || null;
}
