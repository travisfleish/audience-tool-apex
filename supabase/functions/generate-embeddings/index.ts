import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MODEL_NAME = "text-embedding-3-large";
const DIMENSIONS = 1536;
const PREPROCESS_VERSION = "v1";
const INTENT_CATALOG_VERSION = "intents_2026_02_22";
const NAMESPACE = `emb:${MODEL_NAME}:${DIMENSIONS}:${PREPROCESS_VERSION}:${INTENT_CATALOG_VERSION}`;
const MAX_QUERY_LENGTH = 500;
const PER_IP_REQUESTS_PER_MIN = 30;
const GLOBAL_EMBEDDING_GENERATIONS_PER_SEC = 5;

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
  penalty?: {
    tags?: string[];
    categories?: string[];
    leagues?: string[];
  };
  notes?: string;
};

/**
 * Phase 1 intent catalog (86 intents)
 *
 * Key behavior:
 * - Deterministic phrase matching via query n-grams (no substring "includes" drift)
 * - Select up to 2 intents (longest n-gram match wins)
 * - Deduped expansion terms capped at 15
 *
 * Output:
 * - embedding_input: sent to OpenAI embeddings (may include ". Related: ...")
 * - lexical_input: clean space-joined string (no "Related:" label) intended for SQL full-text search
 * - raw_query: original user query (use this for token counting / weighting)
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
      "racing",
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
  },
  {
    "id": "sport_soccer",
    "type": "sport",
    "triggers": [
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
      "premier league",
      "soccer"
    ]
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
      "golfers",
      "lpga",
      "pga"
    ]
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
      "wta"
    ]
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
      "motorsports",
      "nascar",
      "racing"
    ]
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
      "wwe"
    ]
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
    ]
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
    ]
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
      "sustainability"
    ]
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
      "cats",
      "dogs",
      "pet lovers",
      "pet owners",
      "pets"
    ]
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
    ]
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
    ]
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
    ]
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
    ]
  }
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ");
}

const DOMAIN_STOPWORDS = new Set([
  "fan",
  "fans",
  "audience",
  "audiences",
  "segment",
  "segments",
]);

const TEAM_OR_CLUB_TOKENS = new Set(["team", "teams", "club", "clubs"]);

type LeagueTeamSynonymRule = {
  aliases: string[];
  expansions: string[];
};

const LEAGUE_TEAM_SYNONYM_RULES: LeagueTeamSynonymRule[] = [
  {
    aliases: ["mlb", "major league baseball"],
    expansions: ["MLB", "baseball", "mlb teams", "baseball teams", "teams"],
  },
  {
    aliases: ["nba", "national basketball association"],
    expansions: ["NBA", "basketball", "nba teams", "basketball teams", "teams"],
  },
  {
    aliases: ["nfl", "national football league"],
    expansions: ["NFL", "football", "nfl teams", "football teams", "teams"],
  },
  {
    aliases: ["nhl", "national hockey league"],
    expansions: ["NHL", "hockey", "nhl teams", "hockey teams", "teams"],
  },
  {
    aliases: ["mls", "major league soccer"],
    expansions: ["MLS", "soccer", "mls teams", "soccer teams", "teams"],
  },
  {
    aliases: ["wnba"],
    expansions: ["WNBA", "wnba teams", "teams"],
  },
  {
    aliases: ["nwsl"],
    expansions: ["NWSL", "nwsl teams", "teams"],
  },
];

function containsNormalizedPhrase(normalizedText: string, phrase: string): boolean {
  const haystack = ` ${normalizedText} `;
  const needle = ` ${normalize(phrase)} `;
  return haystack.includes(needle);
}

function addLeagueTeamSynonymExpansions(
  normalizedQuery: string,
  tokens: string[],
  expansionSet: Set<string>,
): void {
  const hasTeamOrClubIntent = tokens.some((token) => TEAM_OR_CLUB_TOKENS.has(token));
  if (!hasTeamOrClubIntent) return;

  for (const rule of LEAGUE_TEAM_SYNONYM_RULES) {
    const hasLeagueMention = rule.aliases.some((alias) =>
      containsNormalizedPhrase(normalizedQuery, alias)
    );
    if (!hasLeagueMention) continue;

    for (const term of rule.expansions) {
      expansionSet.add(term);
    }
  }
}

function removeDomainStopwords(text: string): string {
  return text
    .split(" ")
    .filter((word) => !DOMAIN_STOPWORDS.has(word.toLowerCase()))
    .join(" ");
}

function generateNgrams(tokens: string[], maxN = 4): string[] {
  const ngrams: string[] = [];
  for (let n = 1; n <= maxN; n++) {
    for (let i = 0; i <= tokens.length - n; i++) {
      ngrams.push(tokens.slice(i, i + n).join(" "));
    }
  }
  // Prefer longest matches first
  ngrams.sort((a, b) => b.length - a.length);
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

const SEASON_YEAR = 2026;

const QUARTER_ALIASES: Record<string, string[]> = {
  Q1: ["q1", "quarter 1", "first quarter", "jan-mar", "winter", "early year"],
  Q2: ["q2", "quarter 2", "second quarter", "apr-jun", "spring"],
  Q3: ["q3", "quarter 3", "third quarter", "jul-sep", "summer"],
  Q4: ["q4", "quarter 4", "fourth quarter", "oct-dec", "holiday season", "year-end"],
};

const EVENT_ALIASES: Record<string, string[]> = {
  super_bowl: ["super bowl", "big game", "halftime show"],
  fifa_world_cup: ["fifa world cup", "world cup", "soccer world cup"],
  march_madness: ["march madness", "final four", "bracket", "selection sunday"],
  nba_finals: ["nba finals", "the finals"],
  world_series: ["world series", "fall classic"],
  nfl_kickoff: ["nfl kickoff", "football is back", "week 1"],
  nfl_regular_season_peak: ["nfl season", "football sunday", "playoff push"],
  nba_playoffs: ["nba playoffs", "postseason"],
  stanley_cup_finals: ["stanley cup", "nhl finals", "nhl playoffs"],
  mlb_postseason: ["mlb playoffs", "pennant race"],
  cfp_national_championship: [
    "cfp",
    "cfp national championship",
    "college football playoff",
    "college football playoff national championship",
    "college football championship"
  ],
  cfb_rivalry_and_bowls: ["rivalry week", "conference championship", "bowl season"],
  mls_playoffs: ["mls playoffs", "mls cup", "mls final"],
  wnba_playoffs: ["wnba playoffs", "wnba finals", "wnba postseason"],
  nwsl_playoffs: ["nwsl playoffs", "nwsl championship", "nwsl final"],
  daytona_500: ["daytona 500", "daytona"],
  indy_500: ["indy 500", "indianapolis 500"],
  kentucky_derby: ["kentucky derby", "triple crown", "derby"],
  us_open_series: ["us open", "us open tennis", "grand slam tennis"],
};

function extractSeasonalContext(originalText: string): {
  seasonYear: number | null;
  seasonQuarter: string | null;
  seasonEventKeys: string[];
} {
  const norm = normalize(originalText);
  if (!norm) {
    return { seasonYear: null, seasonQuarter: null, seasonEventKeys: [] };
  }

  const tokens = norm.split(" ").filter(Boolean);
  const ngrams = generateNgrams(tokens, 6);
  const gramSet = new Set(ngrams);

  let seasonQuarter: string | null = null;
  for (const [quarter, aliases] of Object.entries(QUARTER_ALIASES)) {
    if (aliases.some((a) => gramSet.has(normalize(a)))) {
      seasonQuarter = quarter;
      break;
    }
  }

  const seasonEventKeys = Object.entries(EVENT_ALIASES)
    .filter(([, aliases]) => aliases.some((a) => gramSet.has(normalize(a))))
    .map(([eventKey]) => eventKey)
    .slice(0, 6);

  if (!seasonQuarter && seasonEventKeys.length === 0) {
    return { seasonYear: null, seasonQuarter: null, seasonEventKeys: [] };
  }

  return {
    seasonYear: SEASON_YEAR,
    seasonQuarter,
    seasonEventKeys,
  };
}

function expandQueryIntent(originalText: string): {
  raw_query: string;
  embedding_input: string;
  lexical_input: string;
  wasExpanded: boolean;
  matchedIntents: string[];
  expansionTerms: string[];
} {
  const raw_query = originalText;
  const norm = normalize(originalText);
  const tokens = norm.split(" ").filter(Boolean);

  if (tokens.length === 0) {
    return {
      raw_query,
      embedding_input: raw_query,
      lexical_input: removeDomainStopwords(raw_query),
      wasExpanded: false,
      matchedIntents: [],
      expansionTerms: [],
    };
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
    return {
      raw_query,
      embedding_input: raw_query,
      lexical_input: removeDomainStopwords(raw_query),
      wasExpanded: false,
      matchedIntents: [],
      expansionTerms: [],
    };
  }

  // Dedupe expansions and cap to prevent "topic soup"
  const expansionSet = new Set<string>();
  for (const intent of matched) {
    for (const term of intent.expansions) {
      const cleaned = term.trim();
      if (cleaned) expansionSet.add(cleaned);
    }
  }
  addLeagueTeamSynonymExpansions(norm, tokens, expansionSet);

  const expansionTerms = Array.from(expansionSet).slice(0, 15);
  const matchedIntents = matched.map((m) => m.id);

  // For embeddings, keep ". Related: ..." (readable in logs)
  const embedding_input = `${raw_query}. Related: ${expansionTerms.join(", ")}`;

  // For lexical, remove the "Related:" label and punctuation. Use space-joined bag of terms.
  // This avoids the token "related" polluting FTS and keeps tsquery behavior stable.
  // Also remove domain stopwords like "fan", "fans" which add noise in a sports audience context.
  const lexical_terms = [raw_query, ...expansionTerms].map((s) => s.trim()).filter(Boolean);
  const lexical_input = removeDomainStopwords(lexical_terms.join(" "));

  return {
    raw_query,
    embedding_input,
    lexical_input,
    wasExpanded: true,
    matchedIntents,
    expansionTerms,
  };
}

class RateLimitError extends Error {
  status: number;
  errorType: string;

  constructor(message: string, errorType: string) {
    super(message);
    this.status = 429;
    this.errorType = errorType;
  }
}

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function createSupabaseAdminClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function buildCacheKey(canonicalInput: string): Promise<string> {
  return sha256Hex(
    `${MODEL_NAME}:${DIMENSIONS}:${PREPROCESS_VERSION}:${INTENT_CATALOG_VERSION}:${canonicalInput}`,
  );
}

function canonicalizeForCache(input: string): string {
  return normalize(input);
}

function getClientIp(req: Request): string | null {
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  return req.headers.get("x-real-ip");
}

function getMinuteBucket(now: Date): { bucketLabel: string; bucketStartIso: string } {
  const minuteStart = new Date(now);
  minuteStart.setSeconds(0, 0);
  return {
    bucketLabel: minuteStart.toISOString().slice(0, 16),
    bucketStartIso: minuteStart.toISOString(),
  };
}

function getSecondBucket(now: Date): { bucketLabel: string; bucketStartIso: string } {
  const secondStart = new Date(now);
  secondStart.setMilliseconds(0);
  return {
    bucketLabel: secondStart.toISOString().slice(0, 19),
    bucketStartIso: secondStart.toISOString(),
  };
}

async function incrementRateLimitCounter(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  bucketKey: string,
  bucketStartIso: string,
): Promise<number | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("increment_rate_limit_counter", {
    p_bucket_key: bucketKey,
    p_bucket_start: bucketStartIso,
  });

  if (error) {
    console.error("Rate limiter counter error:", error);
    return null;
  }

  if (typeof data === "number") return data;
  return null;
}

async function enforcePerIpRateLimit(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  ipHash: string,
  now: Date,
): Promise<void> {
  const { bucketLabel, bucketStartIso } = getMinuteBucket(now);
  const bucketKey = `ip:${ipHash}:${bucketLabel}`;
  const count = await incrementRateLimitCounter(supabase, bucketKey, bucketStartIso);

  if (count !== null && count > PER_IP_REQUESTS_PER_MIN) {
    throw new RateLimitError("Rate limit exceeded. Please slow down.", "rate_limit_ip");
  }
}

async function enforceGlobalGenerationRateLimit(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  now: Date,
): Promise<void> {
  const { bucketLabel, bucketStartIso } = getSecondBucket(now);
  const bucketKey = `global:openai:${bucketLabel}`;
  const count = await incrementRateLimitCounter(supabase, bucketKey, bucketStartIso);

  if (count !== null && count > GLOBAL_EMBEDDING_GENERATIONS_PER_SEC) {
    throw new RateLimitError("Embedding service is busy. Please retry shortly.", "rate_limit_global");
  }
}

function parseEmbedding(raw: unknown): number[] | null {
  if (Array.isArray(raw)) {
    const numeric = raw.map((value) => Number(value));
    return numeric.every((v) => Number.isFinite(v)) ? numeric : null;
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;
      const numeric = parsed.map((value) => Number(value));
      return numeric.every((v) => Number.isFinite(v)) ? numeric : null;
    } catch {
      return null;
    }
  }

  return null;
}

async function readEmbeddingFromCache(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  cacheKey: string,
): Promise<number[] | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("query_embedding_cache")
    .select("embedding")
    .eq("cache_key", cacheKey)
    .maybeSingle();

  if (error) {
    console.error("Cache lookup error:", error);
    return null;
  }

  if (!data) return null;
  return parseEmbedding(data.embedding);
}

async function touchCacheRow(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  cacheKey: string,
): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.rpc("touch_query_embedding_cache", {
    p_cache_key: cacheKey,
  });

  if (error) {
    console.error("Cache touch error:", error);
  }
}

async function upsertCacheRow(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  payload: {
    cacheKey: string;
    canonicalInput: string;
    embedding: number[];
    appVariant: string | null;
  },
): Promise<void> {
  if (!supabase) return;

  const nowIso = new Date().toISOString();
  const { error } = await supabase
    .from("query_embedding_cache")
    .upsert(
      {
        cache_key: payload.cacheKey,
        namespace: NAMESPACE,
        canonical_input: payload.canonicalInput,
        model_name: MODEL_NAME,
        dimensions: DIMENSIONS,
        preprocess_version: PREPROCESS_VERSION,
        intent_catalog_version: INTENT_CATALOG_VERSION,
        embedding: payload.embedding,
        app_variant: payload.appVariant,
        created_at: nowIso,
        last_accessed_at: nowIso,
        hit_count: 1,
      },
      { onConflict: "cache_key" },
    );

  if (error) {
    console.error("Cache upsert error:", error);
  }
}

async function logEmbeddingMetric(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  payload: {
    cacheHit: boolean;
    openaiCalled: boolean;
    cacheLookupMs: number;
    openaiLatencyMs: number;
    totalEmbeddingPathMs: number;
    queryLength: number;
    canonicalInputHash: string;
    errorType: string | null;
  },
): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.from("embedding_request_metrics").insert({
    cache_hit: payload.cacheHit,
    openai_called: payload.openaiCalled,
    cache_lookup_ms: payload.cacheLookupMs,
    openai_latency_ms: payload.openaiLatencyMs,
    total_embedding_path_ms: payload.totalEmbeddingPathMs,
    model_name: MODEL_NAME,
    dimensions: DIMENSIONS,
    preprocess_version: PREPROCESS_VERSION,
    intent_catalog_version: INTENT_CATALOG_VERSION,
    query_length: payload.queryLength,
    canonical_input_hash: payload.canonicalInputHash,
    error_type: payload.errorType,
  });

  if (error) {
    console.error("Metrics insert error:", error);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const requestStartMs = Date.now();
  const supabase = createSupabaseAdminClient();
  const requesterIp = getClientIp(req);
  const ipHash = requesterIp ? await sha256Hex(requesterIp) : "unknown";

  let queryText = "";
  let cacheTerm: string | null = null;
  let cacheLookupMs = 0;
  let openaiLatencyMs = 0;
  let cacheKey: string | null = null;
  let cacheCanonicalInput = "";
  let appVariant: string | null = null;

  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return jsonResponse(500, { error: "OpenAI API key not configured" });
    }

    const body = await req.json() as { text?: unknown; app_variant?: unknown };
    queryText = typeof body.text === "string" ? body.text : "";
    appVariant =
      typeof body.app_variant === "string" && body.app_variant.trim()
        ? body.app_variant.trim()
        : null;

    if (!queryText.trim()) {
      const fallbackHash = await sha256Hex("validation:text-required");
      await logEmbeddingMetric(supabase, {
        cacheHit: false,
        openaiCalled: false,
        cacheLookupMs,
        openaiLatencyMs,
        totalEmbeddingPathMs: Date.now() - requestStartMs,
        queryLength: 0,
        canonicalInputHash: fallbackHash,
        errorType: "validation_error",
      });
      return jsonResponse(400, { error: "Text is required" });
    }

    if (queryText.length > MAX_QUERY_LENGTH) {
      const fallbackHash = await sha256Hex(`validation:max-length:${queryText.length}`);
      await logEmbeddingMetric(supabase, {
        cacheHit: false,
        openaiCalled: false,
        cacheLookupMs,
        openaiLatencyMs,
        totalEmbeddingPathMs: Date.now() - requestStartMs,
        queryLength: queryText.length,
        canonicalInputHash: fallbackHash,
        errorType: "validation_error",
      });
      return jsonResponse(400, { error: `Text exceeds max length of ${MAX_QUERY_LENGTH} characters` });
    }

    await enforcePerIpRateLimit(supabase, ipHash, new Date());

    const cleanedText = removeDomainStopwords(queryText).trim();
    const queryToProcess = cleanedText || queryText;
    const { seasonYear, seasonQuarter, seasonEventKeys } = extractSeasonalContext(queryText);

    const {
      raw_query,
      embedding_input,
      lexical_input,
      matchedIntents,
      expansionTerms,
    } = expandQueryIntent(queryToProcess);
    cacheTerm = embedding_input;
    cacheCanonicalInput = canonicalizeForCache(embedding_input);
    cacheKey = await buildCacheKey(cacheCanonicalInput);

    const cacheLookupStartMs = Date.now();
    const cachedEmbedding = await readEmbeddingFromCache(supabase, cacheKey);
    cacheLookupMs = Date.now() - cacheLookupStartMs;

    if (cachedEmbedding) {
      // L1 cache (if added later) is opportunistic only; correctness depends on Postgres L2.
      void touchCacheRow(supabase, cacheKey);

      await logEmbeddingMetric(supabase, {
        cacheHit: true,
        openaiCalled: false,
        cacheLookupMs,
        openaiLatencyMs: 0,
        totalEmbeddingPathMs: Date.now() - requestStartMs,
        queryLength: queryText.length,
        canonicalInputHash: cacheKey,
        errorType: null,
      });

      return jsonResponse(200, {
        embedding: cachedEmbedding,
        expanded_query: lexical_input,
        raw_query,
        embedding_input,
        lexical_input,
        matched_intents: matchedIntents,
        expansion_terms: expansionTerms,
        season_year: seasonYear,
        season_quarter: seasonQuarter,
        season_event_keys: seasonEventKeys,
      });
    }

    await enforceGlobalGenerationRateLimit(supabase, new Date());

    const openAiStartMs = Date.now();
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        input: embedding_input,
        dimensions: DIMENSIONS,
      }),
    });
    openaiLatencyMs = Date.now() - openAiStartMs;

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      await logEmbeddingMetric(supabase, {
        cacheHit: false,
        openaiCalled: true,
        cacheLookupMs,
        openaiLatencyMs,
        totalEmbeddingPathMs: Date.now() - requestStartMs,
        queryLength: queryText.length,
        canonicalInputHash: cacheKey,
        errorType: "openai_error",
      });
      return jsonResponse(response.status, { error: "Failed to generate embedding" });
    }

    const data = await response.json();
    const embedding = parseEmbedding(data?.data?.[0]?.embedding);

    if (!embedding) {
      await logEmbeddingMetric(supabase, {
        cacheHit: false,
        openaiCalled: true,
        cacheLookupMs,
        openaiLatencyMs,
        totalEmbeddingPathMs: Date.now() - requestStartMs,
        queryLength: queryText.length,
        canonicalInputHash: cacheKey,
        errorType: "openai_error",
      });
      return jsonResponse(502, { error: "Invalid embedding response from OpenAI" });
    }

    await upsertCacheRow(supabase, {
      cacheKey,
      canonicalInput: cacheCanonicalInput,
      embedding,
      appVariant,
    });

    await logEmbeddingMetric(supabase, {
      cacheHit: false,
      openaiCalled: true,
      cacheLookupMs,
      openaiLatencyMs,
      totalEmbeddingPathMs: Date.now() - requestStartMs,
      queryLength: queryText.length,
      canonicalInputHash: cacheKey,
      errorType: null,
    });

    return jsonResponse(200, {
      embedding,

      // IMPORTANT:
      // - Use lexical_input for SQL full-text search (query_text)
      // - Use raw_query for token counting / weight selection in SQL
      // - Use embedding_input ONLY for embeddings (already applied here)
      expanded_query: lexical_input,
      raw_query,
      embedding_input,
      lexical_input,

      matched_intents: matchedIntents,
      expansion_terms: expansionTerms,
      season_year: seasonYear,
      season_quarter: seasonQuarter,
      season_event_keys: seasonEventKeys,
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      const fallbackHash = cacheKey ?? await sha256Hex(`rate-limit:${queryText || "unknown"}`);
      await logEmbeddingMetric(supabase, {
        cacheHit: false,
        openaiCalled: false,
        cacheLookupMs,
        openaiLatencyMs,
        totalEmbeddingPathMs: Date.now() - requestStartMs,
        queryLength: queryText.length,
        canonicalInputHash: fallbackHash,
        errorType: error.errorType,
      });
      return jsonResponse(error.status, { error: error.message });
    }

    console.error("Error generating embedding:", error);
    const fallbackHash = cacheKey ?? await sha256Hex(`internal-error:${queryText || "unknown"}`);
    await logEmbeddingMetric(supabase, {
      cacheHit: false,
      openaiCalled: false,
      cacheLookupMs,
      openaiLatencyMs,
      totalEmbeddingPathMs: Date.now() - requestStartMs,
      queryLength: queryText.length,
      canonicalInputHash: fallbackHash,
      errorType: "internal_error",
    });
    return jsonResponse(500, { error: (error as Error).message });
  }
});
