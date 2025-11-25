export interface CampaignPreset {
  slug: string;
  title: string;
  campaign_name: string;
  ad_groups: Array<{ name: string }>;
  keywords: string[];
  negative_keywords: string[];
  match_distribution: {
    exact: number;
    phrase: number;
    broad_mod: number;
  };
  max_cpc: number;
  daily_budget: number;
  ads: Array<{
    headline1: string;
    headline2: string;
    headline3: string;
    description1: string;
    description2: string;
  }>;
  final_url: string;
  landing_page_url?: string;
  cta: string;
  phone?: string;
}

export const campaignPresets: CampaignPreset[] = [
  {
    slug: "electrician",
    title: "Electrician",
    campaign_name: "Electrician - PPC Calls",
    landing_page_url: "/landing-pages/landing_page_1.html",
    ad_groups: [
      { name: "Emergency Electrician" },
      { name: "Residential Electrician" },
      { name: "Commercial Electrician" }
    ],
    keywords: [
      "electrician near me",
      "24 hour electrician near me",
      "emergency electrician near me",
      "local electrician",
      "ceiling fan installation near me",
      "electrical repair near me",
      "electrician call now",
      "licensed electrician near me",
      "same day electrician",
      "electric wiring repair",
      "electric panel replacement near me",
      "outlet repair near me",
      "home electrician near me",
      "troubleshoot electrical",
      "electrician quote near me",
      "breaker replacement near me",
      "EV charger installation near me",
      "smoke detector installation near me",
      "lighting installation near me",
      "circuit breaker repair near me"
    ],
    negative_keywords: ["training", "free", "jobs", "school", "DIY", "wholesale", "supply", "cheap parts", "repair manual", "how to"],
    match_distribution: { exact: 0.2, phrase: 0.5, broad_mod: 0.3 },
    max_cpc: 4.0,
    daily_budget: 100,
    ads: [{
      headline1: "24/7 Emergency Electrician — Call Now",
      headline2: "Licensed Local Electrician — Fast Response",
      headline3: "Same Day Electrical Repair",
      description1: "Fast, licensed electricians. Same-day service & up-front pricing. Call now for quick help.",
      description2: "Breaker, wiring, lighting & EV charger installs. Free phone estimate."
    }],
    final_url: "https://adiology.online/electrician?utm_source=adiology&utm_medium=ads&utm_campaign=electrician_ppc",
    cta: "Call Now"
  },
  {
    slug: "plumber",
    title: "Plumber",
    campaign_name: "Plumber - PPC Calls",
    landing_page_url: "/landing-pages/landing_page_2.html",
    ad_groups: [
      { name: "Emergency Plumber" },
      { name: "Drain & Leak Repair" },
      { name: "Installation & Replacement" }
    ],
    keywords: [
      "plumber near me",
      "emergency plumber near me",
      "24 hour plumber",
      "leak repair near me",
      "blocked drain service",
      "burst pipe repair near me",
      "toilet repair near me",
      "local plumber call now",
      "gas line plumber near me",
      "hot water repair near me",
      "water heater repair near me",
      "sewer line repair near me",
      "plumbing services near me",
      "same day plumber",
      "install shower door",
      "sink installation near me",
      "water leak detection near me",
      "pipe replacement near me",
      "plumber quote near me",
      "plumbing emergency service"
    ],
    negative_keywords: ["free", "DIY", "training", "jobs", "cheap", "coupon", "parts", "wholesale", "manual", "how to"],
    match_distribution: { exact: 0.2, phrase: 0.5, broad_mod: 0.3 },
    max_cpc: 4.5,
    daily_budget: 120,
    ads: [{
      headline1: "Emergency Plumber Near You — Call 24/7",
      headline2: "Fast Leak Repair | Same Day Service",
      headline3: "Licensed Local Plumbers",
      description1: "Burst pipes, blocked drains & water heaters. Call now for immediate dispatch.",
      description2: "No hidden fees. Up-front price & warranty."
    }],
    final_url: "https://adiology.online/plumber?utm_source=adiology&utm_medium=ads&utm_campaign=plumber_ppc",
    cta: "Call Now"
  },
  {
    slug: "carpenter",
    title: "Carpenter",
    campaign_name: "Carpenter - PPC Calls",
    landing_page_url: "/landing-pages/landing_page_3.html",
    ad_groups: [
      { name: "Emergency Repairs" },
      { name: "Custom Carpentry" },
      { name: "Cabinetry & Trim" }
    ],
    keywords: [
      "carpenter near me",
      "emergency carpenter near me",
      "cabinet maker near me",
      "deck repair near me",
      "door repair near me",
      "wood flooring repair near me",
      "trim carpenter near me",
      "carpentry services near me",
      "local carpenter quote",
      "carpenter small jobs near me",
      "furniture repair near me",
      "stair repair near me",
      "framing carpenter near me",
      "sash window repair near me",
      "shed repair near me",
      "custom cabinets near me",
      "closet installation near me",
      "kitchen cabinet repair near me",
      "wood floor install near me",
      "porch repair near me"
    ],
    negative_keywords: ["DIY", "training", "jobs", "free plans", "how to", "material supply", "lumber", "products", "buy", "tool"],
    match_distribution: { exact: 0.2, phrase: 0.5, broad_mod: 0.3 },
    max_cpc: 3.0,
    daily_budget: 70,
    ads: [{
      headline1: "Local Carpenter — Call for Fast Quote",
      headline2: "Custom Cabinets & Trim — Free Estimate",
      headline3: "Same Day Small Repairs",
      description1: "Experienced carpenters for repair & install. Quality workmanship & prompt service.",
      description2: "Get a fast quote & schedule today."
    }],
    final_url: "https://adiology.online/carpenter?utm_source=adiology&utm_medium=ads&utm_campaign=carpenter_ppc",
    cta: "Call Now"
  },
  {
    slug: "roofing",
    title: "Roofing",
    campaign_name: "Roofing - PPC Calls",
    landing_page_url: "/landing-pages/landing_page_4.html",
    ad_groups: [
      { name: "Roof Repair" },
      { name: "Roof Replacement" },
      { name: "Storm Damage" }
    ],
    keywords: [
      "roofing contractor near me",
      "roof repair near me",
      "roof replacement near me",
      "emergency roof repair near me",
      "leak in roof repair",
      "roof inspection near me",
      "hail damage roof repair",
      "shingle replacement near me",
      "metal roof repair near me",
      "flat roof repair near me",
      "roofing company near me",
      "roof quote near me",
      "same day roof repair",
      "wind damage roof repair",
      "gutter repair near me",
      "roof leak fix",
      "new roof cost near me",
      "roofing contractor call now",
      "tar roof repair near me",
      "roof patch near me"
    ],
    negative_keywords: ["DIY", "how to", "roofing supplies", "shingle sale", "training", "jobs", "roof paint", "roof tiles sale", "cheap", "materials"],
    match_distribution: { exact: 0.2, phrase: 0.5, broad_mod: 0.3 },
    max_cpc: 6.0,
    daily_budget: 200,
    ads: [{
      headline1: "Emergency Roof Repair — Call Now",
      headline2: "Free Roof Inspection — Local Contractor",
      headline3: "Storm Damage Specialists",
      description1: "Fast response, lifetime workmanship warranty. Call to book inspection.",
      description2: "Insurance claims help & fast repairs."
    }],
    final_url: "https://adiology.online/roofing?utm_source=adiology&utm_medium=ads&utm_campaign=roofing_ppc",
    cta: "Call Now"
  },
  {
    slug: "flooring",
    title: "Flooring",
    campaign_name: "Flooring - PPC Calls",
    landing_page_url: "/landing-pages/landing_page_5.html",
    ad_groups: [
      { name: "Installation" },
      { name: "Repair" },
      { name: "Hardwood Refinishing" }
    ],
    keywords: [
      "flooring installation near me",
      "hardwood floor repair near me",
      "tile installation near me",
      "vinyl plank install near me",
      "floor sanding near me",
      "flooring contractor near me",
      "floor repair near me",
      "laminate floor install near me",
      "flooring company near me",
      "floor installers near me",
      "engineered hardwood install near me",
      "commercial flooring near me",
      "floor quote near me",
      "floor replacement near me",
      "flooring store install near me"
    ],
    negative_keywords: ["DIY", "supply", "materials", "warehouse", "cheap flooring", "sale", "free sample", "jobs", "how to", "tutorial"],
    match_distribution: { exact: 0.2, phrase: 0.5, broad_mod: 0.3 },
    max_cpc: 3.5,
    daily_budget: 95,
    ads: [{
      headline1: "Top Flooring Installers — Call for Free Quote",
      headline2: "Hardwood, Tile & Vinyl — Expert Fitters",
      headline3: "Same Day Estimates",
      description1: "Professional installation and refinishing. Free in-home estimate.",
      description2: "Quality materials & certified installers."
    }],
    final_url: "https://adiology.online/flooring?utm_source=adiology&utm_medium=ads&utm_campaign=flooring_ppc",
    cta: "Get Quote"
  },
  {
    slug: "solar",
    title: "Solar Installation",
    campaign_name: "Solar - PPC Calls",
    landing_page_url: "/landing-pages/landing_page_6.html",
    ad_groups: [
      { name: "Residential Solar" },
      { name: "Commercial Solar" },
      { name: "Panel Repair" }
    ],
    keywords: [
      "solar installers near me",
      "solar panel installation near me",
      "residential solar quotes",
      "solar company near me",
      "solar installers call now",
      "solar panel repair near me",
      "solar financing near me",
      "solar energy installers near me",
      "best solar installer near me",
      "solar system installation near me",
      "solar panel replacement near me",
      "solar quotes near me",
      "home solar estimate",
      "solar lead near me",
      "rooftop solar installation near me",
      "solar battery installation near me"
    ],
    negative_keywords: ["DIY", "solar panels for sale", "cheap panels", "wholesale", "jobs", "how to", "review", "parts"],
    match_distribution: { exact: 0.2, phrase: 0.5, broad_mod: 0.3 },
    max_cpc: 8.0,
    daily_budget: 275,
    ads: [{
      headline1: "Residential Solar Installers — Call for Quote",
      headline2: "Save on Power — Free Solar Estimate",
      headline3: "Licensed Solar Installers Near You",
      description1: "Full design & install. Finance & rebates available. Call for assessment.",
      description2: "Increase savings with solar + battery. Free consultation."
    }],
    final_url: "https://adiology.online/solar?utm_source=adiology&utm_medium=ads&utm_campaign=solar_ppc",
    cta: "Book Free Estimate"
  },
  {
    slug: "pest-control",
    title: "Pest Control",
    campaign_name: "Pest Control - PPC Calls",
    landing_page_url: "/landing-pages/landing_page_7.html",
    ad_groups: [
      { name: "Exterminator" },
      { name: "Rodent Control" },
      { name: "Termite Treatment" }
    ],
    keywords: [
      "pest control near me",
      "exterminator near me",
      "termite treatment near me",
      "bed bug exterminator near me",
      "mouse control near me",
      "rodent removal near me",
      "pest control service near me",
      "ant exterminator near me",
      "wasp nest removal near me",
      "pest control immediate service",
      "emergency pest control",
      "termite inspection near me",
      "pest prevention service near me",
      "commercial pest control near me",
      "pest control quote near me"
    ],
    negative_keywords: ["do it yourself", "home remedy", "how to", "pesticide buy", "wholesale", "jobs", "training", "free", "coupon", "product"],
    match_distribution: { exact: 0.2, phrase: 0.5, broad_mod: 0.3 },
    max_cpc: 3.5,
    daily_budget: 100,
    ads: [{
      headline1: "Emergency Pest Control — Call Now",
      headline2: "Termite & Rodent Treatment — Free Quote",
      headline3: "Safe, Certified Exterminators",
      description1: "Fast response & guaranteed results. Call for same-day service.",
      description2: "Affordable plans & one-time treatments."
    }],
    final_url: "https://adiology.online/pest-control?utm_source=adiology&utm_medium=ads&utm_campaign=pestcontrol_ppc",
    cta: "Call Now"
  },
  {
    slug: "lawn-care",
    title: "Lawn Care",
    campaign_name: "Lawn Care - PPC Calls",
    landing_page_url: "/landing-pages/landing_page_8.html",
    ad_groups: [
      { name: "Lawn Mowing" },
      { name: "Lawn Maintenance" },
      { name: "Landscape Care" }
    ],
    keywords: [
      "lawn care near me",
      "lawn mowing service near me",
      "yard maintenance near me",
      "lawn mowing near me",
      "lawn service near me",
      "grass cutting near me",
      "lawn maintenance company near me",
      "lawn aeration near me",
      "weed control near me",
      "lawn treatment near me",
      "garden maintenance near me",
      "lawn mowing quote",
      "emergency lawn care near me"
    ],
    negative_keywords: ["hire mower", "buy lawn mower", "parts", "DIY", "how to", "cheap", "manual", "sales", "jobs", "used mowers"],
    match_distribution: { exact: 0.2, phrase: 0.5, broad_mod: 0.3 },
    max_cpc: 2.0,
    daily_budget: 60,
    ads: [{
      headline1: "Professional Lawn Mowing — Call Today",
      headline2: "Weekly Lawn Care Plans — Free Quote",
      headline3: "Reliable Local Lawn Service",
      description1: "Fast & friendly lawn care pros. Book online or call for an estimate.",
      description2: "Seasonal treatments & weed control available."
    }],
    final_url: "https://adiology.online/lawn-care?utm_source=adiology&utm_medium=ads&utm_campaign=lawncare_ppc",
    cta: "Schedule Now"
  },
  {
    slug: "movers-domestic",
    title: "Movers & Packers - Domestic",
    campaign_name: "Movers - Domestic PPC Calls",
    landing_page_url: "/landing-pages/landing_page_9.html",
    ad_groups: [
      { name: "Local Movers" },
      { name: "Interstate Moving" },
      { name: "Packing Services" }
    ],
    keywords: [
      "movers near me",
      "local movers near me",
      "moving companies near me",
      "house movers near me",
      "affordable movers near me",
      "moving and packing services near me",
      "same day movers near me",
      "best movers near me",
      "furniture movers near me",
      "apartment movers near me",
      "long distance movers near me",
      "packing services near me"
    ],
    negative_keywords: ["used movers", "DIY moving truck", "moving boxes", "jobs", "cheap movers", "hiring", "truck for rent"],
    match_distribution: { exact: 0.2, phrase: 0.5, broad_mod: 0.3 },
    max_cpc: 5.0,
    daily_budget: 150,
    ads: [{
      headline1: "Trusted Local Movers — Call for Free Quote",
      headline2: "Full Packing & Moving Services — Book Now",
      headline3: "Flat Rate Moving — No Hidden Fees",
      description1: "Licensed, insured movers. Free in-home estimate & packing options.",
      description2: "Same-day availability and secure handling."
    }],
    final_url: "https://adiology.online/movers-domestic?utm_source=adiology&utm_medium=ads&utm_campaign=movers_domestic_ppc",
    cta: "Call Now"
  },
  {
    slug: "movers-international",
    title: "Movers & Packers - International",
    campaign_name: "Movers - International PPC Calls",
    landing_page_url: "/landing-pages/landing_page_10.html",
    ad_groups: [
      { name: "International Shipping" },
      { name: "Customs Clearance" },
      { name: "Intl Packing" }
    ],
    keywords: [
      "international movers near me",
      "overseas movers near me",
      "international moving company",
      "ship household goods overseas",
      "international freight moving",
      "international moving quotes",
      "cross border movers near me",
      "international removals near me",
      "moving overseas services",
      "international moving company call now"
    ],
    negative_keywords: ["shipping containers for sale", "freight forwarding jobs", "how to ship", "cheap shipping"],
    match_distribution: { exact: 0.2, phrase: 0.5, broad_mod: 0.3 },
    max_cpc: 6.0,
    daily_budget: 200,
    ads: [{
      headline1: "International Movers — Free Quote",
      headline2: "Ship Household Goods Overseas — Call Now",
      headline3: "Customs & Door-to-Door Service",
      description1: "Worldwide moving experts. Door-to-door service & customs support.",
      description2: "Get a fast international moving quote today."
    }],
    final_url: "https://adiology.online/movers-international?utm_source=adiology&utm_medium=ads&utm_campaign=movers_intl_ppc",
    cta: "Call Now"
  },
  {
    slug: "hvac",
    title: "HVAC / AC Repair",
    campaign_name: "HVAC - PPC Calls",
    landing_page_url: "/landing-pages/landing_page_11.html",
    ad_groups: [
      { name: "Emergency AC Repair" },
      { name: "Furnace Repair" },
      { name: "Installation & Maintenance" }
    ],
    keywords: [
      "ac repair near me",
      "hvac repair near me",
      "furnace repair near me",
      "air conditioning repair near me",
      "emergency ac repair near me",
      "hvac contractor near me",
      "ac installation near me",
      "heat pump repair near me",
      "ac company near me",
      "air conditioner service near me",
      "refrigerant leak repair near me",
      "thermostat installation near me"
    ],
    negative_keywords: ["parts", "DIY", "ac for sale", "buy ac", "manual", "jobs"],
    match_distribution: { exact: 0.2, phrase: 0.5, broad_mod: 0.3 },
    max_cpc: 4.5,
    daily_budget: 135,
    ads: [{
      headline1: "AC Repair 24/7 — Call Now",
      headline2: "HVAC Service & Installation — Free Estimate",
      headline3: "Fast, Certified Technicians",
      description1: "Same day service & maintenance plans. Call for quick help.",
      description2: "Affordable rates & satisfaction guaranteed."
    }],
    final_url: "https://adiology.online/hvac?utm_source=adiology&utm_medium=ads&utm_campaign=hvac_ppc",
    cta: "Call Now"
  },
  {
    slug: "locksmith",
    title: "Locksmith",
    campaign_name: "Locksmith - PPC Calls",
    landing_page_url: "/landing-pages/landing_page_12.html",
    ad_groups: [
      { name: "Emergency Lockout" },
      { name: "Lock Replacement" },
      { name: "Commercial Locksmith" }
    ],
    keywords: [
      "locksmith near me",
      "24 hour locksmith near me",
      "emergency locksmith near me",
      "car locksmith near me",
      "house lockout near me",
      "lock repair near me",
      "rekey locks near me",
      "door lock replacement near me",
      "locksmith call now",
      "locksmith services near me"
    ],
    negative_keywords: ["locksmith tools", "how to pick a lock", "buy locks", "jobs", "training", "DIY"],
    match_distribution: { exact: 0.2, phrase: 0.5, broad_mod: 0.3 },
    max_cpc: 3.5,
    daily_budget: 80,
    ads: [{
      headline1: "24/7 Emergency Locksmith — Call Now",
      headline2: "Fast Lockout Service — Local Locksmith",
      headline3: "Car & Home Lock Services",
      description1: "Quick arrival & fair pricing. Call for emergency lockout help.",
      description2: "Rekey, replace, install locks."
    }],
    final_url: "https://adiology.online/locksmith?utm_source=adiology&utm_medium=ads&utm_campaign=locksmith_ppc",
    cta: "Call Now"
  },
  {
    slug: "water-damage",
    title: "Water Damage Restoration",
    campaign_name: "Water Damage - PPC Calls",
    landing_page_url: "/landing-pages/landing_page_13.html",
    ad_groups: [
      { name: "Emergency Drying" },
      { name: "Flood Cleanup" },
      { name: "Mold Remediation" }
    ],
    keywords: [
      "water damage restoration near me",
      "flood cleanup near me",
      "mold remediation near me",
      "water removal near me",
      "emergency water damage near me",
      "basement flood cleanup near me",
      "water damage repair near me",
      "carpet drying service near me",
      "restoration company near me",
      "burst pipe water damage near me"
    ],
    negative_keywords: ["how to dry", "DIY", "rental pumps", "sell", "used"],
    match_distribution: { exact: 0.2, phrase: 0.5, broad_mod: 0.3 },
    max_cpc: 6.5,
    daily_budget: 275,
    ads: [{
      headline1: "Emergency Water Damage Help — Call Now",
      headline2: "Flood & Mold Remediation — 24/7",
      headline3: "Fast Response Restoration",
      description1: "Mitigation, drying & repair. Insurance claim assistance. Call now.",
      description2: "Rapid response and certified technicians."
    }],
    final_url: "https://adiology.online/water-damage?utm_source=adiology&utm_medium=ads&utm_campaign=waterdamage_ppc",
    cta: "Call Now"
  },
  {
    slug: "pool-repair",
    title: "Pool Repair",
    campaign_name: "Pool Repair - PPC Calls",
    landing_page_url: "/landing-pages/landing_page_14.html",
    ad_groups: [
      { name: "Pool Pump Repair" },
      { name: "Leak Detection" },
      { name: "Pool Cleaning" }
    ],
    keywords: [
      "pool repair near me",
      "pool pump repair near me",
      "leak detection pool near me",
      "pool service near me",
      "pool cleaning near me",
      "pool maintenance near me",
      "pool tile repair near me",
      "pool heater repair near me",
      "pool filter repair near me",
      "pool leak repair near me"
    ],
    negative_keywords: ["pool supplies", "pool for sale", "DIY", "how to", "jobs"],
    match_distribution: { exact: 0.2, phrase: 0.5, broad_mod: 0.3 },
    max_cpc: 2.5,
    daily_budget: 75,
    ads: [{
      headline1: "Pool Repair Near You — Call for Fast Service",
      headline2: "Pump, Leak & Heater Repair — Free Quote",
      headline3: "Trusted Local Pool Pros",
      description1: "Quick diagnostics & repairs. Same day service available.",
      description2: "Seasonal maintenance & repairs. Call now."
    }],
    final_url: "https://adiology.online/pool-repair?utm_source=adiology&utm_medium=ads&utm_campaign=pool_ppc",
    cta: "Call Now"
  },
  {
    slug: "appliance-repair",
    title: "Appliance Repair",
    campaign_name: "Appliance Repair - PPC Calls",
    landing_page_url: "/landing-pages/landing_page_15.html",
    ad_groups: [
      { name: "Washer & Dryer" },
      { name: "Fridge & Oven" },
      { name: "Dishwasher Repair" }
    ],
    keywords: [
      "appliance repair near me",
      "washer repair near me",
      "fridge repair near me",
      "oven repair near me",
      "dryer repair near me",
      "dishwasher repair near me",
      "stove repair near me",
      "appliance service near me",
      "same day appliance repair near me",
      "local appliance technicians near me"
    ],
    negative_keywords: ["parts for sale", "appliance for sale", "manual", "how to fix", "DIY", "buy parts"],
    match_distribution: { exact: 0.2, phrase: 0.5, broad_mod: 0.3 },
    max_cpc: 2.5,
    daily_budget: 60,
    ads: [{
      headline1: "Same Day Appliance Repair — Call Now",
      headline2: "Fridge, Oven & Washer Repair — Local Technicians",
      headline3: "Fast & Affordable Service",
      description1: "Repair appointments today. Upfront pricing & warranty.",
      description2: "Book online or call for immediate service."
    }],
    final_url: "https://adiology.online/appliance-repair?utm_source=adiology&utm_medium=ads&utm_campaign=appliance_ppc",
    cta: "Call Now"
  },
  {
    slug: "window-cleaning",
    title: "Window Cleaning",
    campaign_name: "Window Cleaning - PPC Calls",
    landing_page_url: "/landing-pages/landing_page_16.html",
    ad_groups: [
      { name: "Residential Window Cleaning" },
      { name: "Commercial Window Cleaning" },
      { name: "Gutter & Window" }
    ],
    keywords: [
      "window cleaning near me",
      "commercial window cleaning near me",
      "residential window cleaning near me",
      "gutter cleaning and window cleaning near me",
      "high window cleaning near me",
      "window washers near me",
      "window cleaning service near me",
      "window cleaning quote near me"
    ],
    negative_keywords: ["squeegee for sale", "DIY", "how to", "jobs", "window film sale"],
    match_distribution: { exact: 0.2, phrase: 0.5, broad_mod: 0.3 },
    max_cpc: 1.5,
    daily_budget: 40,
    ads: [{
      headline1: "Sparkling Windows — Call for Quote",
      headline2: "Residential & Commercial Window Cleaning",
      headline3: "Reliable Local Window Pros",
      description1: "Safe, streak-free cleaning. Book online or call for estimate.",
      description2: "Experienced crews & satisfaction guarantee."
    }],
    final_url: "https://adiology.online/window-cleaning?utm_source=adiology&utm_medium=ads&utm_campaign=window_ppc",
    cta: "Schedule Now"
  },
  {
    slug: "tree-removal",
    title: "Tree Removal",
    campaign_name: "Tree Removal - PPC Calls",
    landing_page_url: "/landing-pages/landing_page_17.html",
    ad_groups: [
      { name: "Emergency Tree Removal" },
      { name: "Tree Trimming" },
      { name: "Stump Grinding" }
    ],
    keywords: [
      "tree removal near me",
      "tree cutting service near me",
      "stump grinding near me",
      "tree trimming near me",
      "emergency tree removal near me",
      "tree removal quote near me",
      "dangerous tree removal near me"
    ],
    negative_keywords: ["buy trees", "tree seeds", "how to prune", "jobs", "saplings", "nursery"],
    match_distribution: { exact: 0.2, phrase: 0.5, broad_mod: 0.3 },
    max_cpc: 3.0,
    daily_budget: 80,
    ads: [{
      headline1: "Emergency Tree Removal — Call Now",
      headline2: "Stump Grinding & Tree Trimming Services",
      headline3: "Licensed Arborists — Free Quote",
      description1: "Safe removal & clean-up. Insurance friendly. Call for rapid response.",
      description2: "Tree health & trimming specialists."
    }],
    final_url: "https://adiology.online/tree-removal?utm_source=adiology&utm_medium=ads&utm_campaign=tree_ppc",
    cta: "Call Now"
  },
  {
    slug: "painting",
    title: "Painting (Interior/Exterior)",
    campaign_name: "Painting - PPC Calls",
    landing_page_url: "/landing-pages/landing_page_18.html",
    ad_groups: [
      { name: "Interior Painting" },
      { name: "Exterior Painting" },
      { name: "Commercial Painting" }
    ],
    keywords: [
      "house painters near me",
      "interior painters near me",
      "exterior painters near me",
      "commercial painters near me",
      "paint quote near me",
      "wall painting service near me",
      "deck painting near me",
      "cabinet painting near me"
    ],
    negative_keywords: ["paint for sale", "paint supplies", "DIY", "how to paint", "jobs"],
    match_distribution: { exact: 0.2, phrase: 0.5, broad_mod: 0.3 },
    max_cpc: 2.5,
    daily_budget: 65,
    ads: [{
      headline1: "Local Painters — Free Estimate",
      headline2: "Interior & Exterior Painting — Call Now",
      headline3: "Professional Painters, Quality Finish",
      description1: "Licensed & insured painters. Color consult & warranty.",
      description2: "Fast turnaround & clean work."
    }],
    final_url: "https://adiology.online/painting?utm_source=adiology&utm_medium=ads&utm_campaign=painting_ppc",
    cta: "Get Quote"
  },
  {
    slug: "concrete",
    title: "Concrete / Driveway Contractor",
    campaign_name: "Concrete - PPC Calls",
    landing_page_url: "/landing-pages/landing_page_19.html",
    ad_groups: [
      { name: "Driveway Repair" },
      { name: "Concrete Pouring" },
      { name: "Stamped Concrete" }
    ],
    keywords: [
      "concrete contractor near me",
      "driveway repair near me",
      "concrete paving near me",
      "concrete contractors near me",
      "stamped concrete near me",
      "concrete driveway replacement near me",
      "concrete repair near me",
      "concrete patio near me"
    ],
    negative_keywords: ["buy cement", "concrete for sale", "DIY", "how to mix concrete", "jobs"],
    match_distribution: { exact: 0.2, phrase: 0.5, broad_mod: 0.3 },
    max_cpc: 3.5,
    daily_budget: 100,
    ads: [{
      headline1: "Expert Concrete Contractors — Call for Quote",
      headline2: "Driveway Repair & Replacement",
      headline3: "Stamped Concrete & Patios",
      description1: "Durable driveways & patios. Free consult & estimate.",
      description2: "Licensed crew & quality guarantee."
    }],
    final_url: "https://adiology.online/concrete?utm_source=adiology&utm_medium=ads&utm_campaign=concrete_ppc",
    cta: "Call Now"
  },
  {
    slug: "security-systems",
    title: "Security System Installation",
    campaign_name: "Security - PPC Calls",
    landing_page_url: "/landing-pages/landing_page_20.html",
    ad_groups: [
      { name: "Alarm Installation" },
      { name: "CCTV Installation" },
      { name: "Smart Home Security" }
    ],
    keywords: [
      "security system installers near me",
      "alarm installation near me",
      "cctv installation near me",
      "home security system near me",
      "commercial security installation near me",
      "security camera installers near me",
      "security system companies near me",
      "security system quote near me"
    ],
    negative_keywords: ["security camera for sale", "DIY camera", "how to install", "jobs", "repair parts"],
    match_distribution: { exact: 0.2, phrase: 0.5, broad_mod: 0.3 },
    max_cpc: 4.5,
    daily_budget: 160,
    ads: [{
      headline1: "Home Security Installation — Call for Quote",
      headline2: "CCTV & Alarm Systems — Free Consultation",
      headline3: "Smart Home Security Installers",
      description1: "24/7 monitoring options & professional install. Call for immediate quote.",
      description2: "Licensed installers & warranty included."
    }],
    final_url: "https://adiology.online/security-systems?utm_source=adiology&utm_medium=ads&utm_campaign=security_ppc",
    cta: "Call Now"
  },
  {
    slug: "garage-door",
    title: "Garage Door Repair",
    campaign_name: "Garage Door - PPC Calls",
    landing_page_url: "/landing-pages/landing_page_21.html",
    ad_groups: [
      { name: "Emergency Garage Repair" },
      { name: "Opener Repair" },
      { name: "Spring Replacement" }
    ],
    keywords: [
      "garage door repair near me",
      "garage door spring replacement near me",
      "garage door opener repair near me",
      "garage door replacement near me",
      "garage door cable repair near me",
      "garage door company near me",
      "garage door repair emergency"
    ],
    negative_keywords: ["garage door for sale", "DIY", "how to", "manual", "parts for sale"],
    match_distribution: { exact: 0.2, phrase: 0.5, broad_mod: 0.3 },
    max_cpc: 3.0,
    daily_budget: 80,
    ads: [{
      headline1: "Garage Door Repair — Same Day Service",
      headline2: "Spring Replacement & Opener Repair",
      headline3: "Trusted Local Technicians",
      description1: "Fast response & affordable pricing. Call for emergency repairs.",
      description2: "Parts & repair warranty included."
    }],
    final_url: "https://adiology.online/garage-door?utm_source=adiology&utm_medium=ads&utm_campaign=garage_ppc",
    cta: "Call Now"
  },
  {
    slug: "septic",
    title: "Septic Service",
    campaign_name: "Septic - PPC Calls",
    landing_page_url: "/landing-pages/landing_page_22.html",
    ad_groups: [
      { name: "Septic Pumping" },
      { name: "Septic Repair" },
      { name: "Septic Inspection" }
    ],
    keywords: [
      "septic service near me",
      "septic pumping near me",
      "septic tank pumping near me",
      "septic repair near me",
      "septic inspection near me",
      "septic tank service near me",
      "septic system repair near me",
      "emergency septic service near me"
    ],
    negative_keywords: ["septic tank for sale", "diy", "how to", "parts", "jobs"],
    match_distribution: { exact: 0.2, phrase: 0.5, broad_mod: 0.3 },
    max_cpc: 3.5,
    daily_budget: 80,
    ads: [{
      headline1: "Septic Pumping & Repair — Call Now",
      headline2: "Emergency Septic Service Near You",
      headline3: "Inspections & Maintenance",
      description1: "Licensed septic technicians & fast response.",
      description2: "Routine pumping & emergency repairs."
    }],
    final_url: "https://adiology.online/septic?utm_source=adiology&utm_medium=ads&utm_campaign=septic_ppc",
    cta: "Call Now"
  },
  {
    slug: "landscaping",
    title: "Landscaping",
    campaign_name: "Landscaping - PPC Calls",
    landing_page_url: "/landing-pages/landing_page_23.html",
    ad_groups: [
      { name: "Landscape Design" },
      { name: "Hardscaping" },
      { name: "Maintenance" }
    ],
    keywords: [
      "landscaping near me",
      "landscapers near me",
      "landscape design near me",
      "yard landscaping near me",
      "landscape companies near me",
      "garden design near me",
      "landscaping services near me",
      "commercial landscaping near me"
    ],
    negative_keywords: ["lawn supplies", "plants for sale", "how to plant", "jobs", "DIY"],
    match_distribution: { exact: 0.2, phrase: 0.5, broad_mod: 0.3 },
    max_cpc: 2.5,
    daily_budget: 80,
    ads: [{
      headline1: "Professional Landscaping — Call for Free Quote",
      headline2: "Design, Planting & Maintenance",
      headline3: "Transform Your Yard Today",
      description1: "Custom landscape design & installation. Free consultation.",
      description2: "Maintenance plans & seasonal services available."
    }],
    final_url: "https://adiology.online/landscaping?utm_source=adiology&utm_medium=ads&utm_campaign=landscaping_ppc",
    cta: "Get Quote"
  },
  {
    slug: "chimney",
    title: "Chimney Sweep & Repair",
    campaign_name: "Chimney - PPC Calls",
    landing_page_url: "/landing-pages/landing_page_24.html",
    ad_groups: [
      { name: "Chimney Cleaning" },
      { name: "Chimney Repair" },
      { name: "Chimney Inspection" }
    ],
    keywords: [
      "chimney sweep near me",
      "chimney cleaning near me",
      "chimney repair near me",
      "chimney inspection near me",
      "chimney flashing repair near me",
      "chimney cap replacement near me",
      "chimney liner repair near me"
    ],
    negative_keywords: ["firewood for sale", "DIY", "how to chimney", "jobs"],
    match_distribution: { exact: 0.2, phrase: 0.5, broad_mod: 0.3 },
    max_cpc: 1.8,
    daily_budget: 40,
    ads: [{
      headline1: "Chimney Cleaning Near You — Call Now",
      headline2: "Chimney Repair & Inspection Services",
      headline3: "Certified Chimney Sweeps",
      description1: "Ensure safe heating—sweep & inspect your chimney. Call for booking.",
      description2: "Fast service & competitive rates."
    }],
    final_url: "https://adiology.online/chimney?utm_source=adiology&utm_medium=ads&utm_campaign=chimney_ppc",
    cta: "Call Now"
  },
  {
    slug: "gutters",
    title: "Gutter Cleaning & Repair",
    campaign_name: "Gutters - PPC Calls",
    landing_page_url: "/landing-pages/landing_page_25.html",
    ad_groups: [
      { name: "Gutter Cleaning" },
      { name: "Gutter Repair" },
      { name: "Gutter Guards" }
    ],
    keywords: [
      "gutter cleaning near me",
      "gutter repair near me",
      "gutter guards installation near me",
      "gutter clean and repair near me",
      "downspout repair near me",
      "clogged gutter cleaning near me",
      "gutter service near me"
    ],
    negative_keywords: ["buy gutters", "diy", "how to", "gutter materials", "jobs"],
    match_distribution: { exact: 0.2, phrase: 0.5, broad_mod: 0.3 },
    max_cpc: 1.8,
    daily_budget: 45,
    ads: [{
      headline1: "Gutter Cleaning & Repair — Call Now",
      headline2: "Clogged Gutters? Fast Service",
      headline3: "Install Gutter Guards & Repair",
      description1: "Affordable gutter cleaning & repair. Book this week & save.",
      description2: "Prevent water damage—schedule now."
    }],
    final_url: "https://adiology.online/gutters?utm_source=adiology&utm_medium=ads&utm_campaign=gutters_ppc",
    cta: "Call Now"
  }
];

