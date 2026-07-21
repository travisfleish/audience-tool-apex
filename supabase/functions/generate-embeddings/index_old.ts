import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};  

const BRIDGE_MAP: Record<string, string> = {
  "cord cutters": "streaming, OTT, YouTube TV, Hulu Live, Sling TV, cord-cutting, digital TV",
  "cord cutting": "streaming, OTT, YouTube TV, Hulu Live, Sling TV, cord-cutters, digital TV",
  "cord-cutters": "streaming, OTT, YouTube TV, Hulu Live, Sling TV, cord cutting, digital TV",
  "pop star": "Taylor Swift, Swifties, celebrity fans, music fans, pop music",
  "pop music": "Taylor Swift, Swifties, celebrity fans, pop star, music fans",
  "luxury brands": "affluent, high income, premium, VIP, wealthy, luxury shoppers, upscale",
  "luxury": "affluent, high income, premium, VIP, wealthy, luxury shoppers, upscale brands",
  "affluent": "high income, luxury, premium, wealthy, upscale, high net worth",
  "women's sports": "WNBA, NWSL, NCAA women, PWHL, women athletes, women's basketball, women's soccer, women's hockey",
  "womens sports": "WNBA, NWSL, NCAA women, PWHL, women athletes, women's basketball, women's soccer, women's hockey",
  "esports": "gaming, competitive gaming, video games, gamers, Twitch, esports fans",
  "gaming": "esports, competitive gaming, video games, gamers, Twitch",
  "fantasy sports": "fantasy football, fantasy basketball, DFS, daily fantasy, FanDuel, DraftKings",
  "fantasy": "fantasy sports, fantasy football, fantasy basketball, DFS, daily fantasy",
  "betting": "sports betting, wagering, sportsbook, gambling, bettors",
  "sports betting": "wagering, sportsbook, gambling, bettors, betting",
  "gambling": "sports betting, wagering, sportsbook, bettors, casino",
  "gen z": "generation z, young adults, 18-24, youth, teens, young fans",
  "millennials": "millennial, 25-34, young professionals, young adults",
  "boomers": "baby boomers, older adults, 55+, seniors, mature audience",
  "families": "family, parents, kids, children, household, family-friendly",
  "parents": "families, kids, children, household, moms, dads",
  "hispanic": "Latino, Latina, Latinx, Spanish-speaking, Hispanic fans",
  "latino": "Hispanic, Latina, Latinx, Spanish-speaking, Latino fans",
  "black": "African American, Black fans, Black audience, Black community",
  "african american": "Black, Black fans, Black audience, Black community",
  "tailgating": "tailgate, pre-game, game day, parking lot, BBQ, party",
  "college sports": "NCAA, college football, college basketball, March Madness, collegiate",
  "college football": "NCAA football, college sports, CFP, bowl games, collegiate",
  "college basketball": "NCAA basketball, March Madness, college sports, collegiate",
  "soccer": "MLS, football, soccer fans, Premier League, Liga MX, NWSL",
  "football": "NFL, college football, football fans, Super Bowl, gridiron",
  "basketball": "NBA, college basketball, WNBA, basketball fans, hoops",
  "baseball": "MLB, baseball fans, softball, World Series",
  "hockey": "NHL, PWHL, hockey fans, ice hockey, puck",
  "golf": "PGA, LPGA, golf fans, golfers, country club",
  "tennis": "ATP, WTA, tennis fans, grand slam",
  "auto racing": "NASCAR, Formula 1, F1, IndyCar, racing fans, motorsports",
  "motorsports": "NASCAR, Formula 1, F1, IndyCar, auto racing, racing",
  "nascar": "auto racing, motorsports, stock car, racing fans",
  "formula 1": "F1, auto racing, motorsports, grand prix, racing",
  "f1": "Formula 1, auto racing, motorsports, grand prix, racing",
  "mma": "UFC, mixed martial arts, fighting, combat sports",
  "ufc": "MMA, mixed martial arts, fighting, combat sports",
  "fitness": "gym, workout, exercise, health, active lifestyle, wellness",
  "wellness": "health, fitness, mindfulness, self-care, healthy living",
  "outdoor": "outdoors, hiking, camping, adventure, nature, outdoor recreation",
  "travel": "travelers, tourism, vacation, trips, destinations",
  "foodies": "food, dining, restaurants, culinary, cooking, food lovers",
  "music festivals": "concerts, live music, festival-goers, Coachella, music events",
  "concerts": "live music, music festivals, shows, touring, music events",
  "sneakerheads": "sneakers, shoes, kicks, Nike, Adidas, footwear, streetwear",
  "streetwear": "fashion, sneakerheads, urban fashion, hypebeast, Supreme",
  "crypto": "cryptocurrency, blockchain, Bitcoin, Web3, NFT, digital assets",
  "sustainability": "eco-friendly, green, environmental, sustainable, climate",
  "pet owners": "pets, dogs, cats, pet lovers, animal lovers",
  "homeowners": "home, real estate, property, housing, mortgage",
  "renters": "apartment, renting, lease, housing",
  "students": "college students, university, education, student life",
  "veterans": "military, armed forces, service members, veteran",
  "small business": "SMB, entrepreneurs, small business owners, startups",
  "entrepreneurs": "startup, founders, small business, business owners",
  "high income": "affluent, wealthy, high net worth, premium, luxury, upscale",
  "low income": "budget, value, affordable, cost-conscious, price-sensitive",
  "rural": "small town, countryside, non-urban, heartland",
  "urban": "city, metropolitan, metro, downtown, city dwellers",
  "suburban": "suburbs, suburban families, suburban households",
  "streaming": "OTT, cord cutters, digital TV, Netflix, Hulu, Disney+, streaming services",
  "social media": "Instagram, TikTok, Twitter, Facebook, social platforms, influencers",
  "podcast": "podcasts, podcast listeners, audio, podcast fans",
  "retail": "shopping, shoppers, retail stores, e-commerce, buying",
  "e-commerce": "online shopping, digital retail, e-shop, online buyers",
  "auto": "automotive, cars, vehicles, car buyers, auto enthusiasts",
  "automotive": "auto, cars, vehicles, car buyers, car enthusiasts",
  "pharma": "pharmaceutical, health, medicine, healthcare, patients",
  "cpg": "consumer packaged goods, FMCG, grocery, household products",
  "qsr": "quick service restaurant, fast food, dining, restaurant",
  "fast food": "QSR, quick service restaurant, fast casual, dining",
};

function expandQuery(originalText: string): { expanded: string; wasExpanded: boolean } {
  const lower = originalText.toLowerCase().trim();

  const matchedExpansions: string[] = [];
  const sortedKeys = Object.keys(BRIDGE_MAP).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    if (lower.includes(key)) {
      matchedExpansions.push(BRIDGE_MAP[key]);
    }
  }

  if (matchedExpansions.length === 0) {
    return { expanded: originalText, wasExpanded: false };
  }

  const expanded = `${originalText}. Related: ${matchedExpansions.join(", ")}`;
  return { expanded, wasExpanded: true };
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
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { text } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { expanded, wasExpanded } = expandQuery(text);

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
      return new Response(
        JSON.stringify({ error: "Failed to generate embedding" }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const embedding = data.data[0].embedding;

    return new Response(
      JSON.stringify({
        embedding,
        expanded_query: wasExpanded ? expanded : text,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating embedding:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
