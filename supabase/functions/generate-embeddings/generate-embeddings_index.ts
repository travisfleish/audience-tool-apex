import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type Intent = {
  id: string;
  type?: string;
  triggers: string[];
  expansions: string[];
  boost?: {
    tags?: string[];
    categories?: string[];
    leagues?: string[];
    note?: string;
  };
};

/**
 * Phase 1 catalog-derived intents (v2026-02-11_phase1)
 * - Deterministic phrase matching via query n-grams (no substring includes drift)
 * - Expansion terms are capped + deduped at runtime
 */
const INTENTS: Intent[] = [
  {
    "id": "cat_retail",
    "type": "category",
    "triggers": [
      "retail"
    ],
    "expansions": [
      "Retail"
    ],
    "boost": {
      "categories": [
        "Retail"
      ]
    }
  },
  {
    "id": "cat_college_sports",
    "type": "category",
    "triggers": [
      "college athletics",
      "college basketball",
      "college football",
      "college sports",
      "collegiate",
      "march madness",
      "ncaa"
    ],
    "expansions": [
      "college athletics",
      "college basketball",
      "college football",
      "collegiate",
      "march madness",
      "ncaa"
    ],
    "boost": {
      "categories": [
        "College Sports"
      ]
    }
  },
  {
    "id": "cat_women_s_sports",
    "type": "category",
    "triggers": [
      "female athletes",
      "women athletes",
      "women's sports",
      "womens sports"
    ],
    "expansions": [
      "female athletes",
      "women athletes",
      "women's sports",
      "womens sports"
    ],
    "boost": {
      "categories": [
        "Women's Sports"
      ]
    }
  },
  {
    "id": "cat_betting_gaming_wagering",
    "type": "category",
    "triggers": [
      "betting",
      "betting, gaming & wagering",
      "daily fantasy",
      "dfs",
      "draftkings",
      "fanduel",
      "gambling",
      "sports betting",
      "sportsbook",
      "wagering"
    ],
    "expansions": [
      "betting",
      "daily fantasy",
      "dfs",
      "draftkings",
      "fanduel",
      "gambling",
      "sports betting",
      "sportsbook",
      "wagering"
    ],
    "boost": {
      "categories": [
        "Betting, Gaming & Wagering"
      ]
    }
  },
  {
    "id": "cat_baseball",
    "type": "category",
    "triggers": [
      "baseball"
    ],
    "expansions": [
      "Baseball"
    ],
    "boost": {
      "categories": [
        "Baseball"
      ]
    }
  },
  {
    "id": "cat_football",
    "type": "category",
    "triggers": [
      "football"
    ],
    "expansions": [
      "Football"
    ],
    "boost": {
      "categories": [
        "Football"
      ]
    }
  },
  {
    "id": "cat_basketball",
    "type": "category",
    "triggers": [
      "basketball"
    ],
    "expansions": [
      "Basketball"
    ],
    "boost": {
      "categories": [
        "Basketball"
      ]
    }
  },
  {
    "id": "cat_hockey",
    "type": "category",
    "triggers": [
      "hockey"
    ],
    "expansions": [
      "Hockey"
    ],
    "boost": {
      "categories": [
        "Hockey"
      ]
    }
  },
  {
    "id": "cat_soccer",
    "type": "category",
    "triggers": [
      "soccer"
    ],
    "expansions": [
      "Soccer"
    ],
    "boost": {
      "categories": [
        "Soccer"
      ]
    }
  },
  {
    "id": "cat_lifestyle",
    "type": "category",
    "triggers": [
      "lifestyle"
    ],
    "expansions": [
      "Lifestyle"
    ],
    "boost": {
      "categories": [
        "Lifestyle"
      ]
    }
  },
  {
    "id": "cat_international_sports",
    "type": "category",
    "triggers": [
      "global sports",
      "international sports",
      "olympics",
      "world cup"
    ],
    "expansions": [
      "global sports",
      "international sports",
      "olympics",
      "world cup"
    ],
    "boost": {
      "categories": [
        "International Sports"
      ]
    }
  },
  {
    "id": "cat_streaming",
    "type": "category",
    "triggers": [
      "cord cutters",
      "cord cutting",
      "live streaming",
      "ott",
      "streaming"
    ],
    "expansions": [
      "cord cutters",
      "cord cutting",
      "live streaming",
      "ott",
      "streaming"
    ],
    "boost": {
      "categories": [
        "Streaming"
      ]
    }
  },
  {
    "id": "cat_online_entertainment",
    "type": "category",
    "triggers": [
      "esports",
      "gaming",
      "online entertainment",
      "streaming entertainment",
      "twitch"
    ],
    "expansions": [
      "esports",
      "gaming",
      "online entertainment",
      "streaming entertainment",
      "twitch"
    ],
    "boost": {
      "categories": [
        "Online Entertainment"
      ]
    }
  },
  {
    "id": "cat_live_entertainment",
    "type": "category",
    "triggers": [
      "concerts",
      "festival goers",
      "live entertainment",
      "live music",
      "music festivals",
      "shows"
    ],
    "expansions": [
      "concerts",
      "festival goers",
      "live music",
      "music festivals",
      "shows"
    ],
    "boost": {
      "categories": [
        "Live Entertainment"
      ]
    }
  },
  {
    "id": "cat_apparel_gear",
    "type": "category",
    "triggers": [
      "apparel & gear"
    ],
    "expansions": [
      "Apparel & Gear"
    ],
    "boost": {
      "categories": [
        "Apparel & Gear"
      ]
    }
  },
  {
    "id": "cat_general_sports_fans",
    "type": "category",
    "triggers": [
      "all sports",
      "general sports",
      "general sports fans",
      "sports fans"
    ],
    "expansions": [
      "all sports",
      "general sports",
      "sports fans"
    ],
    "boost": {
      "categories": [
        "General Sports Fans"
      ]
    }
  },
  {
    "id": "cat_youth_sports",
    "type": "category",
    "triggers": [
      "youth sports"
    ],
    "expansions": [
      "Youth Sports"
    ],
    "boost": {
      "categories": [
        "Youth Sports"
      ]
    }
  },
  {
    "id": "league_bundesliga",
    "type": "league",
    "triggers": [
      "bundesliga"
    ],
    "expansions": [
      "Bundesliga"
    ],
    "boost": {
      "leagues": [
        "Bundesliga"
      ]
    }
  },
  {
    "id": "league_f1",
    "type": "league",
    "triggers": [
      "f1",
      "formula 1",
      "grand prix",
      "motorsports"
    ],
    "expansions": [
      "F1",
      "formula 1",
      "grand prix",
      "motorsports"
    ],
    "boost": {
      "leagues": [
        "F1"
      ]
    }
  },
  {
    "id": "league_lpga",
    "type": "league",
    "triggers": [
      "lpga"
    ],
    "expansions": [
      "LPGA"
    ],
    "boost": {
      "leagues": [
        "LPGA"
      ]
    }
  },
  {
    "id": "league_la_liga",
    "type": "league",
    "triggers": [
      "la liga",
      "laliga",
      "soccer",
      "spanish league"
    ],
    "expansions": [
      "La Liga",
      "football",
      "la liga",
      "soccer"
    ],
    "boost": {
      "leagues": [
        "La Liga"
      ]
    }
  },
  {
    "id": "league_mlb",
    "type": "league",
    "triggers": [
      "baseball",
      "mlb",
      "world series"
    ],
    "expansions": [
      "MLB",
      "baseball",
      "mlb",
      "world series"
    ],
    "boost": {
      "leagues": [
        "MLB"
      ]
    }
  },
  {
    "id": "league_mls",
    "type": "league",
    "triggers": [
      "major league soccer",
      "mls",
      "soccer"
    ],
    "expansions": [
      "MLS",
      "football",
      "soccer"
    ],
    "boost": {
      "leagues": [
        "MLS"
      ]
    }
  },
  {
    "id": "league_nascar",
    "type": "league",
    "triggers": [
      "auto racing",
      "motorsports",
      "nascar",
      "stock car"
    ],
    "expansions": [
      "NASCAR",
      "auto racing",
      "motorsports",
      "nascar"
    ],
    "boost": {
      "leagues": [
        "NASCAR"
      ]
    }
  },
  {
    "id": "league_nba",
    "type": "league",
    "triggers": [
      "basketball",
      "hoops",
      "nba"
    ],
    "expansions": [
      "NBA",
      "basketball",
      "nba"
    ],
    "boost": {
      "leagues": [
        "NBA"
      ]
    }
  },
  {
    "id": "league_ncaa",
    "type": "league",
    "triggers": [
      "ncaa"
    ],
    "expansions": [
      "NCAA"
    ],
    "boost": {
      "leagues": [
        "NCAA"
      ]
    }
  },
  {
    "id": "league_nfl",
    "type": "league",
    "triggers": [
      "football",
      "gridiron",
      "nfl",
      "super bowl"
    ],
    "expansions": [
      "NFL",
      "football",
      "nfl",
      "super bowl"
    ],
    "boost": {
      "leagues": [
        "NFL"
      ]
    }
  },
  {
    "id": "league_nhl",
    "type": "league",
    "triggers": [
      "hockey",
      "ice hockey",
      "nhl",
      "stanley cup"
    ],
    "expansions": [
      "NHL",
      "hockey",
      "nhl",
      "stanley cup"
    ],
    "boost": {
      "leagues": [
        "NHL"
      ]
    }
  },
  {
    "id": "league_nwsl",
    "type": "league",
    "triggers": [
      "nwsl",
      "women soccer",
      "women's soccer"
    ],
    "expansions": [
      "NWSL",
      "nwsl",
      "women's soccer"
    ],
    "boost": {
      "leagues": [
        "NWSL"
      ]
    }
  },
  {
    "id": "league_pga",
    "type": "league",
    "triggers": [
      "pga"
    ],
    "expansions": [
      "PGA"
    ],
    "boost": {
      "leagues": [
        "PGA"
      ]
    }
  },
  {
    "id": "league_premier_league",
    "type": "league",
    "triggers": [
      "english premier league",
      "epl",
      "premier league",
      "soccer"
    ],
    "expansions": [
      "Premier League",
      "football",
      "premier league",
      "soccer"
    ],
    "boost": {
      "leagues": [
        "Premier League"
      ]
    }
  },
  {
    "id": "league_ufc",
    "type": "league",
    "triggers": [
      "ufc"
    ],
    "expansions": [
      "UFC"
    ],
    "boost": {
      "leagues": [
        "UFC"
      ]
    }
  },
  {
    "id": "league_wnba",
    "type": "league",
    "triggers": [
      "wnba",
      "women basketball",
      "women's basketball"
    ],
    "expansions": [
      "WNBA",
      "wnba",
      "women's basketball"
    ],
    "boost": {
      "leagues": [
        "WNBA"
      ]
    }
  },
  {
    "id": "league_wwe",
    "type": "league",
    "triggers": [
      "wwe"
    ],
    "expansions": [
      "WWE"
    ],
    "boost": {
      "leagues": [
        "WWE"
      ]
    }
  },
  {
    "id": "beh_streaming_ott",
    "type": "behavior",
    "triggers": [
      "cord cutters",
      "cord cutting",
      "cord-cutters",
      "digital tv",
      "live tv streaming",
      "ott",
      "streaming"
    ],
    "expansions": [
      "cord-cutting",
      "digital tv",
      "hulu live",
      "live streaming",
      "ott",
      "sling tv",
      "sports streaming",
      "streaming",
      "youtube tv"
    ],
    "boost": {
      "categories": [
        "Streaming"
      ]
    }
  },
  {
    "id": "beh_fantasy_sports",
    "type": "behavior",
    "triggers": [
      "daily fantasy",
      "dfs",
      "draftkings",
      "fanduel",
      "fantasy",
      "fantasy football",
      "fantasy sports"
    ],
    "expansions": [
      "daily fantasy",
      "dfs",
      "draftkings",
      "fanduel",
      "fantasy basketball",
      "fantasy football",
      "fantasy sports",
      "lineups",
      "waiver wire"
    ],
    "boost": {
      "categories": [
        "Betting, Gaming & Wagering"
      ]
    }
  },
  {
    "id": "beh_sports_betting",
    "type": "behavior",
    "triggers": [
      "betting",
      "bettors",
      "gambling",
      "odds",
      "sports betting",
      "sportsbook",
      "wagering"
    ],
    "expansions": [
      "bettors",
      "casino",
      "draftkings",
      "fanduel",
      "odds",
      "parlays",
      "sports betting",
      "sportsbook",
      "wagering"
    ],
    "boost": {
      "categories": [
        "Betting, Gaming & Wagering"
      ]
    }
  },
  {
    "id": "beh_tailgating",
    "type": "behavior",
    "triggers": [
      "game day",
      "parking lot bbq",
      "pregame",
      "tailgate",
      "tailgate party",
      "tailgating"
    ],
    "expansions": [
      "bbq",
      "fan gear",
      "game day",
      "parking lot",
      "party",
      "pre-game",
      "stadium",
      "tailgate",
      "tailgating"
    ],
    "boost": {
      "categories": [
        "Football",
        "College Sports"
      ]
    }
  },
  {
    "id": "beh_esports_gaming",
    "type": "behavior",
    "triggers": [
      "competitive gaming",
      "e-sports",
      "esports",
      "gamers",
      "gaming",
      "twitch"
    ],
    "expansions": [
      "competitive gaming",
      "esports",
      "gamers",
      "gaming",
      "streamers",
      "twitch",
      "video games"
    ],
    "boost": {
      "categories": [
        "Online Entertainment",
        "Emerging Sports"
      ]
    }
  },
  {
    "id": "demo_gen_z",
    "type": "demographic",
    "triggers": [
      "18-24",
      "gen z",
      "generation z",
      "teens",
      "young adults",
      "youth"
    ],
    "expansions": [
      "18-24",
      "college students",
      "gen z",
      "teens",
      "tiktok",
      "young adults",
      "youth"
    ],
    "boost": {
      "categories": [
        "Youth Sports",
        "Online Entertainment"
      ]
    }
  },
  {
    "id": "demo_millennials",
    "type": "demographic",
    "triggers": [
      "25-34",
      "millennial",
      "millennials",
      "young professionals"
    ],
    "expansions": [
      "25-34",
      "millennials",
      "young adults",
      "young professionals"
    ],
    "boost": {
      "categories": [
        "Lifestyle"
      ]
    }
  },
  {
    "id": "demo_boomers",
    "type": "demographic",
    "triggers": [
      "55+",
      "baby boomers",
      "boomers",
      "older adults",
      "seniors"
    ],
    "expansions": [
      "55+",
      "baby boomers",
      "older adults",
      "seniors"
    ],
    "boost": {
      "categories": [
        "General Sports Fans"
      ]
    }
  },
  {
    "id": "demo_families_parents",
    "type": "demographic",
    "triggers": [
      "children",
      "dads",
      "families",
      "family",
      "household",
      "kids",
      "moms",
      "parents"
    ],
    "expansions": [
      "children",
      "families",
      "family-friendly",
      "household",
      "kids",
      "parents"
    ],
    "boost": {
      "categories": [
        "College Sports",
        "Youth Sports"
      ]
    }
  },
  {
    "id": "demo_hispanic_latino",
    "type": "demographic",
    "triggers": [
      "hispanic",
      "latina",
      "latino",
      "latinx",
      "spanish speaking",
      "spanish-speaking"
    ],
    "expansions": [
      "hispanic",
      "latina",
      "latino",
      "latinx",
      "liga mx",
      "soccer",
      "spanish-speaking"
    ],
    "boost": {
      "categories": [
        "Soccer"
      ]
    }
  },
  {
    "id": "demo_black_african_american",
    "type": "demographic",
    "triggers": [
      "african american",
      "african-american",
      "black",
      "black community"
    ],
    "expansions": [
      "african american",
      "black",
      "black community",
      "black fans"
    ],
    "boost": {
      "categories": [
        "Basketball",
        "Football"
      ]
    }
  },
  {
    "id": "income_affluent_hnw",
    "type": "income",
    "triggers": [
      "affluent",
      "high income",
      "high net worth",
      "hnw",
      "luxury",
      "luxury brands",
      "premium audience",
      "upscale",
      "wealthy"
    ],
    "expansions": [
      "affluent",
      "high income",
      "high net worth",
      "income $100k+",
      "income $250k+",
      "income $500k+",
      "premium",
      "upscale",
      "vip",
      "wealthy"
    ],
    "boost": {
      "tags": [
        "income"
      ]
    }
  },
  {
    "id": "income_value_budget",
    "type": "income",
    "triggers": [
      "affordable",
      "budget",
      "cost-conscious",
      "low income",
      "price-sensitive",
      "value"
    ],
    "expansions": [
      "affordable",
      "budget",
      "deal seekers",
      "low income",
      "price-sensitive",
      "value"
    ],
    "boost": {
      "tags": [
        "income"
      ]
    }
  },
  {
    "id": "geo_urban",
    "type": "geo",
    "triggers": [
      "city",
      "city dwellers",
      "downtown",
      "metro",
      "metropolitan",
      "urban"
    ],
    "expansions": [
      "city",
      "downtown",
      "metro",
      "metropolitan",
      "urban"
    ],
    "boost": {
      "tags": [
        "urban"
      ]
    }
  },
  {
    "id": "geo_suburban",
    "type": "geo",
    "triggers": [
      "suburban",
      "suburban families",
      "suburban households",
      "suburbs"
    ],
    "expansions": [
      "households",
      "suburban",
      "suburban families",
      "suburbs"
    ],
    "boost": {
      "tags": [
        "suburban"
      ]
    }
  },
  {
    "id": "geo_rural",
    "type": "geo",
    "triggers": [
      "countryside",
      "heartland",
      "non-urban",
      "rural",
      "small town"
    ],
    "expansions": [
      "countryside",
      "heartland",
      "rural",
      "small town"
    ],
    "boost": {
      "tags": [
        "rural"
      ]
    }
  },
  {
    "id": "event_super_bowl",
    "type": "event",
    "triggers": [
      "big game",
      "halftime show",
      "super bowl"
    ],
    "expansions": [
      "big game",
      "football",
      "halftime show",
      "nfl",
      "playoffs",
      "super bowl"
    ],
    "boost": {
      "leagues": [
        "NFL"
      ],
      "categories": [
        "Football"
      ]
    }
  },
  {
    "id": "event_march_madness",
    "type": "event",
    "triggers": [
      "bracket",
      "cinderella story",
      "final four",
      "march madness",
      "ncaa tournament"
    ],
    "expansions": [
      "bracket",
      "buzzer beater",
      "college basketball",
      "final four",
      "march madness",
      "ncaa tournament"
    ],
    "boost": {
      "categories": [
        "College Sports",
        "Basketball"
      ]
    }
  },
  {
    "id": "event_world_cup",
    "type": "event",
    "triggers": [
      "fifa world cup",
      "football world cup",
      "soccer world cup",
      "world cup"
    ],
    "expansions": [
      "fifa",
      "football",
      "international tournament",
      "soccer",
      "world cup"
    ],
    "boost": {
      "categories": [
        "Soccer",
        "International Sports"
      ]
    },
    "notes": "Ambiguous: consider UI disambiguation vs ICC cricket."
  },
  {
    "id": "event_cricket_world_cup",
    "type": "event",
    "triggers": [
      "cricket world cup",
      "icc t20",
      "icc world cup",
      "t20 world cup"
    ],
    "expansions": [
      "cricket",
      "cricket world cup",
      "icc",
      "international tournament",
      "t20"
    ],
    "boost": {
      "categories": [
        "International Sports"
      ]
    }
  },
  {
    "id": "event_olympics_summer",
    "type": "season_event",
    "triggers": [
      "olympic sports",
      "summer games",
      "summer olympics",
      "summer sports"
    ],
    "expansions": [
      "beach volleyball",
      "cycling",
      "gymnastics",
      "olympics",
      "rowing",
      "summer olympics",
      "swimming",
      "tennis",
      "track and field"
    ],
    "boost": {
      "categories": [
        "International Sports"
      ]
    },
    "penalty": {
      "categories": [
        "Retail",
        "Live Entertainment",
        "Apparel & Gear"
      ]
    }
  },
  {
    "id": "event_olympics_winter",
    "type": "season_event",
    "triggers": [
      "winter games",
      "winter olympics",
      "winter sports"
    ],
    "expansions": [
      "biathlon",
      "bobsled",
      "curling",
      "figure skating",
      "ice hockey",
      "olympics",
      "skiing",
      "snowboarding",
      "winter olympics"
    ],
    "boost": {
      "categories": [
        "International Sports"
      ]
    },
    "penalty": {
      "categories": [
        "Retail",
        "Live Entertainment",
        "Apparel & Gear"
      ]
    }
  },
  {
    "id": "event_playoffs",
    "type": "event",
    "triggers": [
      "championship",
      "finals",
      "playoffs",
      "postseason"
    ],
    "expansions": [
      "bracket",
      "championship",
      "finals",
      "playoffs",
      "postseason"
    ],
    "boost": {
      "categories": [
        "Football",
        "Basketball",
        "Baseball",
        "Hockey",
        "Soccer"
      ]
    }
  },
  {
    "id": "event_world_series",
    "type": "event",
    "triggers": [
      "fall classic",
      "world series"
    ],
    "expansions": [
      "baseball",
      "mlb",
      "playoffs",
      "world series"
    ],
    "boost": {
      "leagues": [
        "MLB"
      ],
      "categories": [
        "Baseball"
      ]
    }
  },
  {
    "id": "event_stanley_cup",
    "type": "event",
    "triggers": [
      "nhl playoffs",
      "stanley cup"
    ],
    "expansions": [
      "hockey",
      "nhl",
      "playoffs",
      "stanley cup"
    ],
    "boost": {
      "leagues": [
        "NHL"
      ],
      "categories": [
        "Hockey"
      ]
    }
  },
  {
    "id": "event_nba_finals",
    "type": "event",
    "triggers": [
      "nba finals",
      "the finals"
    ],
    "expansions": [
      "basketball",
      "nba",
      "nba finals",
      "playoffs"
    ],
    "boost": {
      "leagues": [
        "NBA"
      ],
      "categories": [
        "Basketball"
      ]
    }
  },
  {
    "id": "event_mls_cup",
    "type": "event",
    "triggers": [
      "mls cup"
    ],
    "expansions": [
      "mls",
      "mls cup",
      "playoffs",
      "soccer"
    ],
    "boost": {
      "leagues": [
        "MLS"
      ],
      "categories": [
        "Soccer"
      ]
    }
  },
  {
    "id": "vertical_retail_shopping",
    "type": "vertical",
    "triggers": [
      "e-commerce",
      "online shopping",
      "retail",
      "shoppers",
      "shopping",
      "store"
    ],
    "expansions": [
      "buyers",
      "e-commerce",
      "online shopping",
      "retail",
      "shoppers",
      "shopping"
    ],
    "boost": {
      "categories": [
        "Retail"
      ]
    }
  },
  {
    "id": "vertical_qsr_fast_food",
    "type": "vertical",
    "triggers": [
      "drive-thru",
      "fast food",
      "qsr",
      "quick service restaurant"
    ],
    "expansions": [
      "dining",
      "fast food",
      "qsr",
      "quick service restaurant",
      "restaurants"
    ],
    "boost": {
      "categories": [
        "Retail"
      ]
    }
  },
  {
    "id": "vertical_automotive",
    "type": "vertical",
    "triggers": [
      "auto",
      "automotive",
      "car buyers",
      "cars",
      "vehicles"
    ],
    "expansions": [
      "auto",
      "auto enthusiasts",
      "automotive",
      "car buyers",
      "cars",
      "vehicles"
    ],
    "boost": {
      "categories": [
        "Lifestyle"
      ]
    }
  },
  {
    "id": "vertical_fitness_wellness",
    "type": "vertical",
    "triggers": [
      "exercise",
      "fitness",
      "gym",
      "health",
      "wellness",
      "workout"
    ],
    "expansions": [
      "active lifestyle",
      "exercise",
      "fitness",
      "gym",
      "health",
      "wellness",
      "workout"
    ],
    "boost": {
      "categories": [
        "Lifestyle"
      ]
    }
  },
  {
    "id": "vertical_outdoor_travel",
    "type": "vertical",
    "triggers": [
      "camping",
      "hiking",
      "outdoor",
      "outdoors",
      "tourism",
      "travel",
      "vacation"
    ],
    "expansions": [
      "adventure",
      "camping",
      "destinations",
      "hiking",
      "outdoor",
      "tourism",
      "travel",
      "vacation"
    ],
    "boost": {
      "categories": [
        "Outdoor Sports",
        "Lifestyle"
      ]
    }
  },
  {
    "id": "media_social",
    "type": "media",
    "triggers": [
      "facebook",
      "influencers",
      "instagram",
      "social media",
      "tiktok",
      "twitter"
    ],
    "expansions": [
      "influencers",
      "instagram",
      "social media",
      "social platforms",
      "tiktok"
    ],
    "boost": {
      "categories": [
        "Online Entertainment",
        "Lifestyle"
      ]
    }
  },
  {
    "id": "media_podcast",
    "type": "media",
    "triggers": [
      "audio",
      "podcast",
      "podcast listeners",
      "podcasts"
    ],
    "expansions": [
      "audio",
      "podcast",
      "podcast listeners",
      "podcasts"
    ],
    "boost": {
      "categories": [
        "Online Entertainment"
      ]
    }
  },
  {
    "id": "tech_crypto_web3",
    "type": "tech",
    "triggers": [
      "bitcoin",
      "blockchain",
      "crypto",
      "cryptocurrency",
      "nft",
      "web3"
    ],
    "expansions": [
      "bitcoin",
      "blockchain",
      "crypto",
      "cryptocurrency",
      "digital assets",
      "nft",
      "web3"
    ],
    "boost": {
      "categories": [
        "Online Entertainment",
        "Lifestyle"
      ]
    }
  },
  {
    "id": "sport_football",
    "type": "sport",
    "triggers": [
      "college football",
      "football",
      "gridiron",
      "nfl football"
    ],
    "expansions": [
      "college football",
      "football",
      "gridiron",
      "nfl",
      "super bowl",
      "tailgating"
    ],
    "boost": {
      "categories": [
        "Football"
      ],
      "leagues": [
        "NFL"
      ]
    }
  },
  {
    "id": "sport_basketball",
    "type": "sport",
    "triggers": [
      "basketball",
      "college basketball",
      "hoops",
      "nba basketball",
      "wnba"
    ],
    "expansions": [
      "basketball",
      "college basketball",
      "hoops",
      "march madness",
      "nba",
      "wnba"
    ],
    "boost": {
      "categories": [
        "Basketball"
      ],
      "leagues": [
        "NBA",
        "WNBA"
      ]
    }
  },
  {
    "id": "sport_baseball",
    "type": "sport",
    "triggers": [
      "baseball",
      "mlb baseball",
      "softball"
    ],
    "expansions": [
      "ballpark",
      "baseball",
      "mlb",
      "softball",
      "world series"
    ],
    "boost": {
      "categories": [
        "Baseball"
      ],
      "leagues": [
        "MLB"
      ]
    }
  },
  {
    "id": "sport_hockey",
    "type": "sport",
    "triggers": [
      "hockey",
      "ice hockey",
      "nhl hockey"
    ],
    "expansions": [
      "hockey",
      "ice hockey",
      "nhl",
      "pwhl",
      "stanley cup"
    ],
    "boost": {
      "categories": [
        "Hockey"
      ],
      "leagues": [
        "NHL",
        "PWHL"
      ]
    }
  },
  {
    "id": "sport_soccer",
    "type": "sport",
    "triggers": [
      "football (soccer)",
      "futbol",
      "fútbol",
      "global football",
      "soccer"
    ],
    "expansions": [
      "fifa",
      "football",
      "la liga",
      "mls",
      "nws l",
      "premier league",
      "soccer"
    ],
    "boost": {
      "categories": [
        "Soccer"
      ],
      "leagues": [
        "MLS",
        "Premier League",
        "La Liga",
        "NWSL"
      ]
    }
  },
  {
    "id": "sport_golf",
    "type": "sport",
    "triggers": [
      "golf",
      "golfers",
      "lpga",
      "pga"
    ],
    "expansions": [
      "country club",
      "golf",
      "golf resort",
      "golfers",
      "lpga",
      "pga"
    ],
    "boost": {
      "categories": [
        "Golf"
      ]
    }
  },
  {
    "id": "sport_tennis",
    "type": "sport",
    "triggers": [
      "atp",
      "grand slam",
      "tennis",
      "wta"
    ],
    "expansions": [
      "atp",
      "grand slam",
      "tennis",
      "tennis fans",
      "wta"
    ],
    "boost": {
      "categories": [
        "Racquet"
      ]
    }
  },
  {
    "id": "sport_motorsports",
    "type": "sport",
    "triggers": [
      "auto racing",
      "f1",
      "formula 1",
      "grand prix",
      "motorsports",
      "nascar",
      "racing"
    ],
    "expansions": [
      "auto racing",
      "f1",
      "formula 1",
      "grand prix",
      "ind ycar",
      "motorsports",
      "nascar",
      "racing"
    ],
    "boost": {
      "categories": [
        "Racing"
      ],
      "leagues": [
        "NASCAR",
        "F1"
      ]
    }
  },
  {
    "id": "sport_combat",
    "type": "sport",
    "triggers": [
      "boxing",
      "combat sports",
      "mma",
      "ufc",
      "wrestling",
      "wwe"
    ],
    "expansions": [
      "boxing",
      "combat sports",
      "mma",
      "ufc",
      "wrestling",
      "wwe"
    ],
    "boost": {
      "categories": [
        "Combat Sports"
      ]
    }
  },
  {
    "id": "ent_music_festivals",
    "type": "entertainment",
    "triggers": [
      "coachella",
      "concerts",
      "festival goers",
      "live music",
      "music festivals",
      "touring"
    ],
    "expansions": [
      "concerts",
      "festival-goers",
      "live music",
      "music festivals",
      "shows",
      "touring"
    ],
    "boost": {
      "categories": [
        "Live Entertainment"
      ]
    }
  },
  {
    "id": "life_streetwear_sneakers",
    "type": "lifestyle",
    "triggers": [
      "hypebeast",
      "sneakerheads",
      "sneakers",
      "streetwear",
      "supreme"
    ],
    "expansions": [
      "adidas",
      "footwear",
      "hypebeast",
      "nike",
      "sneakerheads",
      "sneakers",
      "streetwear"
    ],
    "boost": {
      "categories": [
        "Retail",
        "Apparel & Gear"
      ]
    }
  },
  {
    "id": "life_sustainability",
    "type": "lifestyle",
    "triggers": [
      "climate",
      "eco friendly",
      "eco-friendly",
      "environmental",
      "green",
      "sustainability"
    ],
    "expansions": [
      "climate",
      "eco-friendly",
      "environmental",
      "green",
      "sustainability",
      "sustainable"
    ],
    "boost": {
      "categories": [
        "Lifestyle"
      ]
    }
  },
  {
    "id": "life_pets",
    "type": "lifestyle",
    "triggers": [
      "cat owners",
      "dog owners",
      "pet lovers",
      "pet owners",
      "pets"
    ],
    "expansions": [
      "animal lovers",
      "cats",
      "dogs",
      "pet lovers",
      "pet owners",
      "pets"
    ],
    "boost": {
      "categories": [
        "Lifestyle"
      ]
    }
  },
  {
    "id": "life_housing",
    "type": "lifestyle",
    "triggers": [
      "apartment",
      "home owner",
      "homeowners",
      "mortgage",
      "real estate",
      "renters",
      "renting"
    ],
    "expansions": [
      "apartment",
      "homeowners",
      "housing",
      "mortgage",
      "real estate",
      "renters",
      "renting"
    ],
    "boost": {
      "categories": [
        "Lifestyle"
      ]
    }
  },
  {
    "id": "biz_small_business",
    "type": "business",
    "triggers": [
      "entrepreneurs",
      "founders",
      "small business",
      "smb",
      "startup"
    ],
    "expansions": [
      "business owners",
      "entrepreneurs",
      "founders",
      "small business",
      "smb",
      "startup"
    ],
    "boost": {
      "categories": [
        "Lifestyle"
      ]
    }
  },
  {
    "id": "vertical_pharma_healthcare",
    "type": "vertical",
    "triggers": [
      "healthcare",
      "medicine",
      "patients",
      "pharma",
      "pharmaceutical"
    ],
    "expansions": [
      "health",
      "healthcare",
      "medicine",
      "patients",
      "pharma",
      "pharmaceutical"
    ],
    "boost": {
      "categories": [
        "Lifestyle"
      ]
    }
  },
  {
    "id": "vertical_cpg_fmcg",
    "type": "vertical",
    "triggers": [
      "consumer packaged goods",
      "cpg",
      "fmcg",
      "grocery",
      "household products"
    ],
    "expansions": [
      "consumer packaged goods",
      "cpg",
      "fmcg",
      "grocery",
      "household products"
    ],
    "boost": {
      "categories": [
        "Retail"
      ]
    }
  }
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ");
}

function generateNgrams(tokens: string[], maxN = 4): string[] {
  const ngrams: string[] = [];
  for (let n = 1; n <= maxN; n++) {
    for (let i = 0; i <= tokens.length - n; i++) {
      ngrams.push(tokens.slice(i, i + n).join(" "));
    }
  }
  ngrams.sort((a, b) => b.length - a.length); // longest first
  return ngrams;
}

function buildTriggerIndex(intents: Intent[]): Map<string, Intent[]> {
  const idx = new Map<string, Intent[]>();
  for (const intent of intents) {
    for (const rawTrigger of intent.triggers) {
      const t = normalize(rawTrigger);
      if (!t) continue;
      const arr = idx.get(t) ?? [];
      arr.push(intent);
      idx.set(t, arr);
    }
  }
  return idx;
}

const TRIGGER_INDEX = buildTriggerIndex(INTENTS);

function expandQueryIntent(originalText: string): {
  expanded: string;
  wasExpanded: boolean;
  matchedIntents: string[];
  expansionTerms: string[];
} {
  const norm = normalize(originalText);
  const tokens = norm.split(" ").filter(Boolean);

  if (tokens.length === 0) {
    return { expanded: originalText, wasExpanded: false, matchedIntents: [], expansionTerms: [] };
  }

  const ngrams = generateNgrams(tokens, 4);

  // Select up to 2 intents, preferring longest trigger matches
  const matched: Intent[] = [];
  const matchedIds = new Set<string>();

  for (const gram of ngrams) {
    const intentsForTrigger = TRIGGER_INDEX.get(gram);
    if (!intentsForTrigger) continue;

    for (const intent of intentsForTrigger) {
      if (!matchedIds.has(intent.id)) {
        matched.push(intent);
        matchedIds.add(intent.id);
      }
      if (matched.length >= 2) break;
    }
    if (matched.length >= 2) break;
  }

  if (matched.length === 0) {
    return { expanded: originalText, wasExpanded: false, matchedIntents: [], expansionTerms: [] };
  }

  const expansionSet = new Set<string>();
  for (const intent of matched) {
    for (const term of intent.expansions) {
      const cleaned = term.trim();
      if (cleaned) expansionSet.add(cleaned);
    }
  }

  // Hard caps to prevent "topic soup"
  const expansionTerms = Array.from(expansionSet).slice(0, 15);
  const matchedIntents = matched.map((m) => m.id);

  const expanded = `${originalText}. Related: ${expansionTerms.join(", ")}`;

  return { expanded, wasExpanded: true, matchedIntents, expansionTerms };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { text } = await req.json();
    if (!text) {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { expanded, wasExpanded, matchedIntents, expansionTerms } = expandQueryIntent(text);

    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-large",
        input: expanded,
        dimensions: 1536,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      return new Response(JSON.stringify({ error: "Failed to generate embedding" }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const embedding = data.data[0].embedding;

    return new Response(
      JSON.stringify({
        embedding,
        expanded_query: wasExpanded ? expanded : text,
        matched_intents: matchedIntents,
        expansion_terms: expansionTerms,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating embedding:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
