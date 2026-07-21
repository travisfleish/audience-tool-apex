export type ApexSubVertical = {
  id: string;
  label: string;
};

export type ApexVertical = {
  id: string;
  label: string;
  /** Featured on the step UI (top ~10). */
  featured?: boolean;
  subVerticals: ApexSubVertical[];
};

/**
 * Static Apex category / subcategory taxonomy from
 * "Category List - July 2026.xlsx" (201 leaf rows → 46 categories).
 * Lives in-app; not stored in Supabase.
 */
export const APEX_VERTICALS: ApexVertical[] = [
  {
    id: "auto",
    label: "Auto",
    featured: true,
    subVerticals: [
      { id: "auto--auto-parts", label: "Auto Parts" },
      { id: "auto--auto-service", label: "Auto Service" },
      { id: "auto--car-dealers", label: "Car Dealers" },
      { id: "auto--car-washes", label: "Car Washes" },
      { id: "auto--ev-charging", label: "EV Charging" },
      { id: "auto--motorcycle-dealers", label: "Motorcycle Dealers" },
      { id: "auto--oil-change", label: "Oil Change" },
      { id: "auto--tire-service", label: "Tire Service" },
    ],
  },
  {
    id: "restaurants",
    label: "Restaurants",
    featured: true,
    subVerticals: [
      { id: "restaurants--casual", label: "Casual" },
      { id: "restaurants--fine-dining", label: "Fine Dining" },
      { id: "restaurants--hospitality", label: "Hospitality" },
      { id: "restaurants--online-delivery", label: "Online Delivery" },
      { id: "restaurants--qsr-fast-casual", label: "QSR & Fast Casual" },
    ],
  },
  {
    id: "travel",
    label: "Travel",
    featured: true,
    subVerticals: [
      { id: "travel--airlines", label: "Airlines" },
      { id: "travel--airports", label: "Airports" },
      { id: "travel--cruises", label: "Cruises" },
      { id: "travel--rental-cars", label: "Rental Cars" },
      { id: "travel--retail", label: "Retail" },
      { id: "travel--train", label: "Train" },
      { id: "travel--travel-agencies", label: "Travel Agencies" },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    featured: true,
    subVerticals: [
      { id: "finance--banks", label: "Banks" },
      { id: "finance--buy-now-pay-later-bnpl", label: "Buy Now Pay Later (BNPL)" },
      { id: "finance--investment-platforms", label: "Investment Platforms" },
      { id: "finance--payment-wallets-money-transfers", label: "Payment Wallets & Money Transfers" },
      { id: "finance--services-tools", label: "Services & Tools" },
    ],
  },
  {
    id: "beverages",
    label: "Beverages",
    featured: true,
    subVerticals: [
      { id: "beverages--alcohol", label: "Alcohol" },
      { id: "beverages--coffee-tea", label: "Coffee & Tea" },
      { id: "beverages--non-alcoholic", label: "Non-Alcoholic" },
    ],
  },
  {
    id: "health",
    label: "Health",
    featured: true,
    subVerticals: [
      { id: "health--diet", label: "Diet" },
      { id: "health--diet-medications", label: "Diet Medications" },
      { id: "health--genealogy-death-services", label: "Genealogy & Death Services" },
      { id: "health--healthcare", label: "Healthcare" },
      { id: "health--hospital-systems-urgent-care-retail-clinics", label: "Hospital Systems, Urgent Care & Retail Clinics" },
      { id: "health--natural-health-stores", label: "Natural Health Stores" },
      { id: "health--virtual-health", label: "Virtual Health" },
      { id: "health--vision-centers", label: "Vision Centers" },
      { id: "health--vitamins-supplements", label: "Vitamins & Supplements" },
      { id: "health--wearables", label: "Wearables" },
      { id: "health--wellness", label: "Wellness" },
      { id: "health--women-s-health", label: "Women's Health" },
    ],
  },
  {
    id: "retailers",
    label: "Retailers",
    featured: true,
    subVerticals: [
      { id: "retailers--club-warehouse-wholesale", label: "Club, Warehouse & Wholesale" },
      { id: "retailers--dollar-discount-stores", label: "Dollar & Discount Stores" },
      { id: "retailers--drug-stores-pharmacies", label: "Drug Stores & Pharmacies" },
      { id: "retailers--gas-stations-convenience-stores", label: "Gas Stations & Convenience Stores" },
      { id: "retailers--mass-merchants", label: "Mass Merchants" },
      { id: "retailers--online-e-tail", label: "Online E-Tail" },
      { id: "retailers--online-grocers", label: "Online Grocers" },
      { id: "retailers--supermarkets-grocery-stores", label: "Supermarkets & Grocery Stores" },
    ],
  },
  {
    id: "gambling",
    label: "Gambling",
    featured: true,
    subVerticals: [
      { id: "gambling--commercial-casinos", label: "Commercial Casinos" },
      { id: "gambling--commercial-casinos-las-vegas", label: "Commercial Casinos - Las Vegas" },
      { id: "gambling--lottery", label: "Lottery" },
      { id: "gambling--online", label: "Online" },
      { id: "gambling--racinos", label: "Racinos" },
      { id: "gambling--riverboat-casinos", label: "Riverboat Casinos" },
      { id: "gambling--social-sweepstakes-casinos", label: "Social & Sweepstakes Casinos" },
      { id: "gambling--tribal-casinos", label: "Tribal Casinos" },
    ],
  },
  {
    id: "streaming",
    label: "Streaming",
    featured: true,
    subVerticals: [
      { id: "streaming--ott", label: "OTT" },
      { id: "streaming--platforms", label: "Platforms" },
      { id: "streaming--specialty-ott-anime-asian", label: "Specialty OTT - Anime & Asian" },
      { id: "streaming--specialty-ott-genre", label: "Specialty OTT - Genre" },
      { id: "streaming--specialty-ott-sports", label: "Specialty OTT - Sports" },
    ],
  },
  {
    id: "entertainment-news",
    label: "Entertainment & News",
    featured: true,
    subVerticals: [
      { id: "entertainment-news--comedians", label: "Comedians" },
      { id: "entertainment-news--culture-publications", label: "Culture Publications" },
      { id: "entertainment-news--indoor-entertainment", label: "Indoor Entertainment" },
      { id: "entertainment-news--influencer-economy", label: "Influencer Economy" },
      { id: "entertainment-news--movies", label: "Movies" },
      { id: "entertainment-news--music-radio", label: "Music & Radio" },
      { id: "entertainment-news--musicians", label: "Musicians" },
      { id: "entertainment-news--news-publications", label: "News Publications" },
      { id: "entertainment-news--sports-publications", label: "Sports Publications" },
    ],
  },
  {
    id: "accessories",
    label: "Accessories",
    featured: false,
    subVerticals: [
      { id: "accessories--eyewear", label: "Eyewear" },
      { id: "accessories--jewelry-watches", label: "Jewelry & Watches" },
      { id: "accessories--luggage-bags", label: "Luggage & Bags" },
      { id: "accessories--outerwear", label: "Outerwear" },
    ],
  },
  {
    id: "amateur-sports",
    label: "Amateur Sports",
    featured: false,
    subVerticals: [
      { id: "amateur-sports--fitness-events-competitions", label: "Fitness Events & Competitions" },
      { id: "amateur-sports--national-governing-bodies-ngb", label: "National Governing Bodies (NGB)" },
      { id: "amateur-sports--recreational-sports", label: "Recreational Sports" },
      { id: "amateur-sports--venues-rinks-fields", label: "Venues, Rinks & Fields" },
      { id: "amateur-sports--youth-sports", label: "Youth Sports" },
    ],
  },
  {
    id: "apparel",
    label: "Apparel",
    featured: false,
    subVerticals: [
      { id: "apparel--department-stores", label: "Department Stores" },
      { id: "apparel--discount-outlets", label: "Discount & Outlets" },
      { id: "apparel--fast-fashion", label: "Fast Fashion" },
      { id: "apparel--general-apparel", label: "General Apparel" },
      { id: "apparel--intimate-swimwear", label: "Intimate & Swimwear" },
      { id: "apparel--juniors", label: "Juniors" },
      { id: "apparel--luxury", label: "Luxury" },
      { id: "apparel--maternity-bridal", label: "Maternity & Bridal" },
      { id: "apparel--occupational", label: "Occupational" },
      { id: "apparel--professional", label: "Professional" },
      { id: "apparel--specialty-apparel", label: "Specialty Apparel" },
      { id: "apparel--sports-merchandise", label: "Sports Merchandise" },
    ],
  },
  {
    id: "athleisure",
    label: "Athleisure",
    featured: false,
    subVerticals: [
      { id: "athleisure--activewear", label: "Activewear" },
      { id: "athleisure--sneakers-plus", label: "Sneakers Plus" },
    ],
  },
  {
    id: "athletic",
    label: "Athletic",
    featured: false,
    subVerticals: [
      { id: "athletic--gear", label: "Gear" },
      { id: "athletic--goods", label: "Goods" },
    ],
  },
  {
    id: "attractions",
    label: "Attractions",
    featured: false,
    subVerticals: [
      { id: "attractions--museums-landmarks", label: "Museums & Landmarks" },
      { id: "attractions--theme-parks", label: "Theme Parks" },
      { id: "attractions--zoos-aquariums", label: "Zoos & Aquariums" },
    ],
  },
  {
    id: "baby",
    label: "Baby",
    featured: false,
    subVerticals: [
      { id: "baby--formula-food", label: "Formula & Food" },
      { id: "baby--gear", label: "Gear" },
      { id: "baby--retail", label: "Retail" },
    ],
  },
  {
    id: "beauty",
    label: "Beauty",
    featured: false,
    subVerticals: [
      { id: "beauty--cosmetics-skincare", label: "Cosmetics & Skincare" },
      { id: "beauty--fragrance", label: "Fragrance" },
      { id: "beauty--haircare", label: "Haircare" },
      { id: "beauty--men-s-grooming", label: "Men's Grooming" },
      { id: "beauty--salons-spas", label: "Salons & Spas" },
    ],
  },
  {
    id: "business-services",
    label: "Business Services",
    featured: false,
    subVerticals: [
      { id: "business-services--artificial-intelligence-ai", label: "Artificial Intelligence (AI)" },
      { id: "business-services--digital-services-software", label: "Digital Services & Software" },
      { id: "business-services--internet-security", label: "Internet Security" },
      { id: "business-services--real-estate", label: "Real Estate" },
      { id: "business-services--tax-legal-services", label: "Tax & Legal Services" },
    ],
  },
  {
    id: "cannabis-vaping",
    label: "Cannabis & Vaping",
    featured: false,
    subVerticals: [
      { id: "cannabis-vaping--general", label: "General" },
    ],
  },
  {
    id: "charitable-giving",
    label: "Charitable Giving",
    featured: false,
    subVerticals: [
      { id: "charitable-giving--non-profit", label: "Non Profit" },
      { id: "charitable-giving--political", label: "Political" },
    ],
  },
  {
    id: "collectibles",
    label: "Collectibles",
    featured: false,
    subVerticals: [
      { id: "collectibles--art", label: "Art" },
      { id: "collectibles--cards", label: "Cards" },
      { id: "collectibles--coins-currency", label: "Coins & Currency" },
      { id: "collectibles--figurines", label: "Figurines" },
    ],
  },
  {
    id: "colleges-universities",
    label: "Colleges & Universities",
    featured: false,
    subVerticals: [
      { id: "colleges-universities--bookstores", label: "Bookstores" },
      { id: "colleges-universities--sports", label: "Sports" },
    ],
  },
  {
    id: "dating",
    label: "Dating",
    featured: false,
    subVerticals: [
      { id: "dating--general", label: "General" },
    ],
  },
  {
    id: "education-resources",
    label: "Education Resources",
    featured: false,
    subVerticals: [
      { id: "education-resources--adolescents-children", label: "Adolescents & Children" },
      { id: "education-resources--adults", label: "Adults" },
    ],
  },
  {
    id: "electronics",
    label: "Electronics",
    featured: false,
    subVerticals: [
      { id: "electronics--brands", label: "Brands" },
      { id: "electronics--retail", label: "Retail" },
    ],
  },
  {
    id: "fitness",
    label: "Fitness",
    featured: false,
    subVerticals: [
      { id: "fitness--gyms-clubs", label: "Gyms & Clubs" },
      { id: "fitness--home-fitness", label: "Home Fitness" },
      { id: "fitness--workout-classes", label: "Workout Classes" },
    ],
  },
  {
    id: "footwear",
    label: "Footwear",
    featured: false,
    subVerticals: [
      { id: "footwear--casual-shoes", label: "Casual Shoes" },
      { id: "footwear--retail", label: "Retail" },
    ],
  },
  {
    id: "gaming",
    label: "Gaming",
    featured: false,
    subVerticals: [
      { id: "gaming--consoles", label: "Consoles" },
      { id: "gaming--online", label: "Online" },
      { id: "gaming--publisher", label: "Publisher" },
      { id: "gaming--retail", label: "Retail" },
      { id: "gaming--virtual-reality", label: "Virtual Reality" },
    ],
  },
  {
    id: "home",
    label: "Home",
    featured: false,
    subVerticals: [
      { id: "home--home-improvement-hardware", label: "Home Improvement & Hardware" },
      { id: "home--home-services", label: "Home Services" },
      { id: "home--retail", label: "Retail" },
      { id: "home--security", label: "Security" },
      { id: "home--utilities", label: "Utilities" },
    ],
  },
  {
    id: "home-furnishings-goods",
    label: "Home Furnishings & Goods",
    featured: false,
    subVerticals: [
      { id: "home-furnishings-goods--appliances", label: "Appliances" },
      { id: "home-furnishings-goods--furniture", label: "Furniture" },
      { id: "home-furnishings-goods--retail", label: "Retail" },
    ],
  },
  {
    id: "insurance",
    label: "Insurance",
    featured: false,
    subVerticals: [
      { id: "insurance--health", label: "Health" },
      { id: "insurance--home-auto", label: "Home & Auto" },
      { id: "insurance--life", label: "Life" },
      { id: "insurance--travel", label: "Travel" },
    ],
  },
  {
    id: "live-entertainment",
    label: "Live Entertainment",
    featured: false,
    subVerticals: [
      { id: "live-entertainment--comedy", label: "Comedy" },
      { id: "live-entertainment--concerts", label: "Concerts" },
      { id: "live-entertainment--festivals", label: "Festivals" },
      { id: "live-entertainment--misc-sports", label: "Misc Sports" },
      { id: "live-entertainment--symphony-orchestra", label: "Symphony & Orchestra" },
      { id: "live-entertainment--theater", label: "Theater" },
    ],
  },
  {
    id: "lodging-accommodation",
    label: "Lodging & Accommodation",
    featured: false,
    subVerticals: [
      { id: "lodging-accommodation--alternative-accommodations", label: "Alternative Accommodations" },
      { id: "lodging-accommodation--hotels", label: "Hotels" },
    ],
  },
  {
    id: "miscellaneous",
    label: "Miscellaneous",
    featured: false,
    subVerticals: [
      { id: "miscellaneous--unknown", label: "Unknown" },
    ],
  },
  {
    id: "moving-shipping-services",
    label: "Moving & Shipping Services",
    featured: false,
    subVerticals: [
      { id: "moving-shipping-services--general-shipping", label: "General Shipping" },
      { id: "moving-shipping-services--moving-services", label: "Moving Services" },
      { id: "moving-shipping-services--storage", label: "Storage" },
    ],
  },
  {
    id: "pets",
    label: "Pets",
    featured: false,
    subVerticals: [
      { id: "pets--pet-food", label: "Pet Food" },
      { id: "pets--pet-healthcare", label: "Pet Healthcare" },
      { id: "pets--pet-services", label: "Pet Services" },
      { id: "pets--pet-supplies", label: "Pet Supplies" },
      { id: "pets--retail", label: "Retail" },
      { id: "pets--subscriptions", label: "Subscriptions" },
    ],
  },
  {
    id: "professional-sports",
    label: "Professional Sports",
    featured: false,
    subVerticals: [
      { id: "professional-sports--arenas-stadiums", label: "Arenas & Stadiums" },
      { id: "professional-sports--merchandise", label: "Merchandise" },
      { id: "professional-sports--misc-events", label: "Misc Events" },
      { id: "professional-sports--misc-leagues", label: "Misc Leagues" },
      { id: "professional-sports--teams", label: "Teams" },
    ],
  },
  {
    id: "resale",
    label: "Resale",
    featured: false,
    subVerticals: [
      { id: "resale--fashion", label: "Fashion" },
      { id: "resale--general", label: "General" },
    ],
  },
  {
    id: "social-media",
    label: "Social Media",
    featured: false,
    subVerticals: [
      { id: "social-media--general", label: "General" },
    ],
  },
  {
    id: "specialty-food-gifts",
    label: "Specialty Food & Gifts",
    featured: false,
    subVerticals: [
      { id: "specialty-food-gifts--candy", label: "Candy" },
      { id: "specialty-food-gifts--flowers", label: "Flowers" },
      { id: "specialty-food-gifts--gift-baskets-food", label: "Gift Baskets & Food" },
      { id: "specialty-food-gifts--meal-kits", label: "Meal Kits" },
      { id: "specialty-food-gifts--prepared-foods", label: "Prepared Foods" },
      { id: "specialty-food-gifts--snacks", label: "Snacks" },
      { id: "specialty-food-gifts--subscriptions", label: "Subscriptions" },
    ],
  },
  {
    id: "specialty-retailers",
    label: "Specialty Retailers",
    featured: false,
    subVerticals: [
      { id: "specialty-retailers--agriculture-farm-supply", label: "Agriculture & Farm Supply" },
      { id: "specialty-retailers--arts-crafts", label: "Arts & Crafts" },
      { id: "specialty-retailers--books", label: "Books" },
      { id: "specialty-retailers--custom-printing", label: "Custom Printing" },
      { id: "specialty-retailers--office-stationery", label: "Office & Stationery" },
      { id: "specialty-retailers--outdoor", label: "Outdoor" },
      { id: "specialty-retailers--seasonal-sentiment", label: "Seasonal & Sentiment" },
      { id: "specialty-retailers--toys", label: "Toys" },
    ],
  },
  {
    id: "sportstainment",
    label: "Sportstainment",
    featured: false,
    subVerticals: [
      { id: "sportstainment--golf-golf-resorts", label: "Golf & Golf Resorts" },
      { id: "sportstainment--indoor-entertainment", label: "Indoor Entertainment" },
      { id: "sportstainment--ski-ski-resorts", label: "Ski & Ski Resorts" },
      { id: "sportstainment--tennis-pickleball", label: "Tennis & Pickleball" },
    ],
  },
  {
    id: "telcom",
    label: "Telcom",
    featured: false,
    subVerticals: [
      { id: "telcom--internet-cable-providers", label: "Internet & Cable Providers" },
      { id: "telcom--mobile-services", label: "Mobile Services" },
      { id: "telcom--telcom-companies", label: "Telcom Companies" },
    ],
  },
  {
    id: "ticketing-platforms",
    label: "Ticketing Platforms",
    featured: false,
    subVerticals: [
      { id: "ticketing-platforms--primary", label: "Primary" },
      { id: "ticketing-platforms--secondary", label: "Secondary" },
    ],
  },
  {
    id: "transit",
    label: "Transit",
    featured: false,
    subVerticals: [
      { id: "transit--mass-transit", label: "Mass Transit" },
      { id: "transit--micromobility", label: "Micromobility" },
      { id: "transit--parking-tolls-licenses", label: "Parking, Tolls & Licenses" },
      { id: "transit--rideshare", label: "Rideshare" },
    ],
  },
];

export const APEX_FEATURED_VERTICALS = APEX_VERTICALS.filter(v => v.featured);

export function findVertical(id: string): ApexVertical | undefined {
  return APEX_VERTICALS.find(v => v.id === id);
}

export function searchVerticals(query: string): ApexVertical[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return APEX_VERTICALS.filter(vertical => {
    if (vertical.label.toLowerCase().includes(normalized)) return true;
    return vertical.subVerticals.some(sub => sub.label.toLowerCase().includes(normalized));
  });
}
