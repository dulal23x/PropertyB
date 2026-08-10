export type SeoLandingPage = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  query: Record<string, string>;
  primaryKeyword: string;
  area?: string;
  propertyType?: string;
  contentSections?: Array<{ heading: string; body: string }>;
  faqs: Array<{ question: string; answer: string }>;
  related: string[];
};

const PRIMARY_SITE_KEYWORD = "Houses, Lands & Apartments For Sale in Dhaka";

const BASE_RELATED = [
  "properties-for-sale-in-dhaka",
  "flat-for-sale-in-dhaka",
  "apartment-for-sale-in-dhaka",
  "house-for-sale-in-dhaka",
  "land-for-sale-in-dhaka",
];

const areaCopy: Record<string, string> = {
  Gulshan: "Gulshan is one of Dhaka's most established premium addresses, popular for larger apartments, corporate access, restaurants, schools, and diplomatic-area convenience.",
  Banani: "Banani attracts buyers who want central Dhaka access, active commercial streets, apartment living, and strong connectivity to Gulshan, Mohakhali, and airport road.",
  Bashundhara: "Bashundhara R/A is a major planned residential area with apartments, plots, schools, hospitals, shopping access, and strong demand from family buyers.",
  Uttara: "Uttara is a practical choice for buyers looking for planned sectors, airport access, schools, apartments, and comparatively wider residential roads.",
  Dhanmondi: "Dhanmondi remains a high-demand residential and lifestyle area with schools, hospitals, lakeside access, restaurants, and strong resale apartment demand.",
  Baridhara: "Baridhara is known for diplomatic-zone living, premium houses, luxury apartments, secure roads, and high-value residential demand.",
  Mirpur: "Mirpur is one of Dhaka's broadest residential markets, with apartment options across many budgets and good access to schools, commerce, and transport links.",
  Mohammadpur: "Mohammadpur offers established neighborhoods, family apartments, access to Dhanmondi and Shyamoli, and a wide range of mid-market housing.",
  Badda: "Badda is useful for buyers who want access to Gulshan, Rampura, Aftab Nagar, and Pragati Sarani while comparing more practical budgets.",
  Purbachal: "Purbachal is a future-growth location where buyers often compare plots, land, and project-led residential opportunities.",
  "Aftab Nagar": "Aftab Nagar is a planned residential market near Rampura and Badda, popular for flats, family housing, and quieter internal roads.",
  Khilkhet: "Khilkhet offers airport-side connectivity and access to Bashundhara, Nikunja, and Uttara for apartment and land buyers.",
  Tejgaon: "Tejgaon is central for buyers comparing residential convenience, commercial access, and shorter travel times to key Dhaka business areas.",
  Rampura: "Rampura connects buyers to Banasree, Badda, Malibagh, and central Dhaka, with many practical apartment options.",
  Wari: "Wari is one of old Dhaka's established residential areas, valued for community, schools, and central city access.",
};

const areaSlugs: Array<[string, string]> = [
  ["gulshan", "Gulshan"],
  ["banani", "Banani"],
  ["bashundhara", "Bashundhara"],
  ["uttara", "Uttara"],
  ["dhanmondi", "Dhanmondi"],
  ["baridhara", "Baridhara"],
  ["mirpur", "Mirpur"],
  ["mohammadpur", "Mohammadpur"],
  ["badda", "Badda"],
  ["purbachal", "Purbachal"],
  ["aftab-nagar", "Aftab Nagar"],
  ["khilkhet", "Khilkhet"],
  ["tejgaon", "Tejgaon"],
  ["rampura", "Rampura"],
  ["wari", "Wari"],
];

function faq(keyword: string, location = "Dhaka") {
  return [
    {
      question: `How do I compare ${keyword}?`,
      answer: `Start with location, budget, property type, size, bedrooms, building condition, and contact details. PropertyBikri helps you compare active listings and contact the listing team directly.`,
    },
    {
      question: `Which areas are popular for property buyers in ${location}?`,
      answer: "Common Dhaka searches include Gulshan, Banani, Bashundhara, Uttara, Dhanmondi, Baridhara, Mirpur, Mohammadpur, Badda, and Purbachal.",
    },
    {
      question: "Should I verify the property before buying?",
      answer: "Yes. Always verify ownership, approvals, location details, price, handover status, and legal documents before making a property decision.",
    },
  ];
}

const corePages: SeoLandingPage[] = [
  {
    slug: "properties-for-sale-in-dhaka",
    title: `${PRIMARY_SITE_KEYWORD} | PropertyBikri`,
    description: "Browse houses, lands and apartments for sale in Dhaka with prices, photos and direct contact options across Gulshan, Banani, Bashundhara, Uttara and Dhanmondi.",
    h1: PRIMARY_SITE_KEYWORD,
    primaryKeyword: PRIMARY_SITE_KEYWORD,
    intro: "Compare houses, lands and apartments for sale in Dhaka across flats, family homes, plots and commercial spaces. Use verified listing details, prices, photos and area information to shortlist the right property.",
    query: { listing_purpose: "sale", city: "Dhaka" },
    faqs: faq("properties for sale in Dhaka"),
    related: BASE_RELATED,
  },
  {
    slug: "property-for-sale-in-dhaka",
    title: "Property for Sale in Dhaka | Houses, Lands & Apartments",
    description: "Find property for sale in Dhaka including houses, lands, apartments, flats and commercial listings across popular Dhaka neighborhoods.",
    h1: "Property for sale in Dhaka",
    primaryKeyword: "property for sale in Dhaka",
    intro: "Search property for sale in Dhaka with practical filters for houses, lands, apartments, commercial spaces, price, area and size. PropertyBikri keeps the browsing path simple for buyers comparing real options.",
    query: { listing_purpose: "sale", city: "Dhaka" },
    faqs: faq("property for sale in Dhaka"),
    related: BASE_RELATED,
  },
  {
    slug: "flat-for-sale-in-dhaka",
    title: "Flat for Sale in Dhaka | Ready Flats & Apartments",
    description: "Search flats and apartments for sale in Dhaka, including ready flats in Gulshan, Banani, Bashundhara, Uttara, Dhanmondi and nearby areas.",
    h1: "Flat for sale in Dhaka",
    primaryKeyword: "flat for sale in Dhaka",
    intro: "Find flats for sale in Dhaka with location, price, bedroom, bathroom and size details. Compare ready flats and apartment listings in high-demand residential areas.",
    query: { listing_purpose: "sale", property_type: "apartment", city: "Dhaka" },
    propertyType: "apartment",
    faqs: faq("flat for sale in Dhaka"),
    related: ["apartment-for-sale-in-dhaka", "ready-flat-for-sale-in-dhaka", "flat-for-sale-in-gulshan", "flat-for-sale-in-banani", "flat-for-sale-in-uttara"],
  },
  {
    slug: "apartment-for-sale-in-dhaka",
    title: "Apartments for Sale in Dhaka | Flats & Ready Apartments",
    description: "Browse apartments for sale in Dhaka with verified listing details, photos, prices and locations across premium and family-friendly areas.",
    h1: "Apartment for sale in Dhaka",
    primaryKeyword: "apartment for sale in Dhaka",
    intro: "Apartment buyers in Dhaka often compare location, building quality, size, parking, lift, security and nearby services. Use this page to review apartment listings in one place.",
    query: { listing_purpose: "sale", property_type: "apartment", city: "Dhaka" },
    propertyType: "apartment",
    contentSections: [
      {
        heading: "How apartment buyers usually compare Dhaka listings",
        body: "When people search for an apartment for sale in Dhaka, the first thing is normally area and budget, but the better decision comes from checking the full living picture. A flat in Gulshan, Banani, Bashundhara, Uttara or Dhanmondi can look similar online, yet road width, lift quality, parking access, generator backup, service charge, security and the final usable layout can change the real value. Use this page to start with the broad apartment market, then narrow the shortlist by area, bedrooms, size and the kind of daily route your family or office life needs.",
      },
      {
        heading: "What to check before shortlisting a flat",
        body: "A practical apartment shortlist should include the asking price, per-square-foot comparison, floor position, sunlight, ventilation, building age, developer reputation, handover condition and document status. If the listing is a ready flat, visit during daylight and check the lobby, stairs, lift, parking, water line and common areas. If the apartment is under construction, compare payment schedule, delivery timeline, approval papers and the builder's previous work. PropertyBikri keeps the listing path simple so buyers can compare these details without jumping through too many pages.",
      },
      {
        heading: "Best areas for apartment searches",
        body: "Premium apartment buyers often start with Gulshan, Banani, Baridhara and Dhanmondi because these areas have strong lifestyle, office and school access. Family buyers also compare Bashundhara, Uttara, Mirpur, Mohammadpur and Badda because they can offer more practical sizes and budgets. There is no single best area for everyone. A good apartment for sale in Dhaka is the one where the location, building condition, monthly cost and future resale demand all make sense together.",
      },
    ],
    faqs: faq("apartment for sale in Dhaka"),
    related: ["flat-for-sale-in-dhaka", "luxury-apartment-for-sale-in-dhaka", "flat-for-sale-in-gulshan", "flat-for-sale-in-bashundhara"],
  },
  {
    slug: "house-for-sale-in-dhaka",
    title: "Houses for Sale in Dhaka | Homes, Villas & Duplex",
    description: "Find houses for sale in Dhaka including family homes, villas and duplex properties in prime residential neighborhoods.",
    h1: "House for sale in Dhaka",
    primaryKeyword: "house for sale in Dhaka",
    intro: "Compare houses for sale in Dhaka by area, price, land size, bedrooms, bathrooms and access to daily services. Houses and villas are limited in prime locations, so shortlist carefully.",
    query: { listing_purpose: "sale", property_type: "house", city: "Dhaka" },
    propertyType: "house",
    contentSections: [
      {
        heading: "Why house searches need a different checklist",
        body: "A house for sale in Dhaka is not the same decision as buying an apartment. You are not only comparing bedrooms and size; you are also looking at land value, road access, boundary condition, building structure, utility lines, parking, neighborhood security and future redevelopment potential. In areas like Gulshan, Banani, Baridhara, Dhanmondi and Uttara, a house can carry value because of the land and location as much as the building itself.",
      },
      {
        heading: "Family use, rental value and redevelopment value",
        body: "Some buyers want a ready family home, some want a duplex or villa, and some are looking at the plot and structure for long-term redevelopment. Before deciding, check whether the house suits daily living, whether the road can handle parking and access, how old the structure is, and whether the price makes sense beside nearby land and apartment values. A good house listing should help you compare both present use and future value.",
      },
      {
        heading: "Documents and visits matter more for houses",
        body: "For houses, document checking is especially important. Ownership papers, mutation, tax records, RAJUK or local approvals, utility bills and boundary measurements should be reviewed before any serious negotiation. Visit the property more than once if possible. Check water, drainage, roof condition, cracks, damp areas, staircase width, electrical load and the surrounding roads. This page is built to help buyers find house options first, then move carefully into verification.",
      },
    ],
    faqs: faq("house for sale in Dhaka"),
    related: ["house-for-sale-in-gulshan", "house-for-sale-in-banani", "house-for-sale-in-uttara", "properties-for-sale-in-dhaka"],
  },
  {
    slug: "land-for-sale-in-dhaka",
    title: "Lands for Sale in Dhaka | Residential Land & Plots",
    description: "Search lands for sale in Dhaka and nearby growth areas, including plots and residential land options for future development.",
    h1: "Land for sale in Dhaka",
    primaryKeyword: "lands for sale in Dhaka",
    intro: "Land buyers in Dhaka should compare road access, plot size, approvals, ownership documents, utility access and future development potential before committing.",
    query: { listing_purpose: "sale", property_type: "land", city: "Dhaka" },
    propertyType: "land",
    contentSections: [
      {
        heading: "Land buying is mostly about location, paper and access",
        body: "When someone searches for land for sale in Dhaka, the first mistake is looking only at price per katha. Land value depends heavily on exact road position, plot shape, access width, surrounding development, utility availability, soil and whether the papers are clean. Purbachal, Bashundhara, Uttara, Baridhara side areas and other growth locations can be interesting, but every plot needs careful checking before it becomes a real buying option.",
      },
      {
        heading: "How to compare plots without getting confused",
        body: "Start with the purpose. If you want to build a home, road width, neighborhood, schools, mosque, market and utility access matter. If you want investment value, compare future roads, nearby projects, development pace and resale demand. Then check land size, frontage, shape, facing, boundary, ownership history and whether the asking price matches nearby recent activity. A cheaper plot can become expensive later if the access, approval or document situation is weak.",
      },
      {
        heading: "Verification before negotiation",
        body: "Land needs the strongest verification process. Before payment, buyers should check title chain, mutation, khatian, tax, registration history, possession, boundary and any development authority requirements. Visit the land physically, speak with local sources, and make sure the measured land matches the papers. PropertyBikri's land pages are designed to organize land and plot searches, but final buying confidence should come from proper document review and site inspection.",
      },
    ],
    faqs: faq("land for sale in Dhaka"),
    related: ["plot-for-sale-in-dhaka", "land-for-sale-in-purbachal", "plot-for-sale-in-bashundhara"],
  },
  {
    slug: "plot-for-sale-in-dhaka",
    title: "Plot for Sale in Dhaka | PropertyBikri",
    description: "Find plots for sale in Dhaka with location, price and land-size details for residential and investment buyers.",
    h1: "Plot for sale in Dhaka",
    primaryKeyword: "plot for sale in Dhaka",
    intro: "Browse plot options for buyers comparing land in Dhaka and nearby developing locations. Always verify title, approvals, access roads and plot measurements.",
    query: { listing_purpose: "sale", property_type: "land", city: "Dhaka" },
    propertyType: "land",
    faqs: faq("plot for sale in Dhaka"),
    related: ["land-for-sale-in-dhaka", "land-for-sale-in-purbachal", "plot-for-sale-in-bashundhara"],
  },
  {
    slug: "commercial-property-for-sale-in-dhaka",
    title: "Commercial Property for Sale in Dhaka",
    description: "Search commercial property for sale in Dhaka including offices, retail spaces and business-ready locations.",
    h1: "Commercial property for sale in Dhaka",
    primaryKeyword: "commercial property for sale in Dhaka",
    intro: "Commercial property buyers should compare location visibility, access, building facilities, floor size, parking, utility capacity and business suitability.",
    query: { listing_purpose: "sale", property_type: "commercial", city: "Dhaka" },
    propertyType: "commercial",
    contentSections: [
      {
        heading: "Commercial property depends on business fit",
        body: "Commercial property for sale in Dhaka needs a different buying mindset from residential property. The right office, shop, showroom or business space should match customer movement, staff access, road visibility, parking, lift capacity, power load, building rules and long-term operating cost. A location that works for an office may not work for retail, and a retail-facing space may not be ideal for a quieter service business.",
      },
      {
        heading: "Compare visibility, access and building support",
        body: "For commercial searches, check how easily clients or employees can reach the building, whether the address is easy to explain, how traffic behaves during working hours, and whether parking or drop-off is realistic. Inside the building, compare floor plate, ceiling height, common area quality, generator backup, fire safety, lift service, security and maintenance. These details can affect rent potential, resale demand and the daily business experience.",
      },
      {
        heading: "Important checks before buying business space",
        body: "Before buying commercial property, review ownership documents, allowed use, building approval, service charge, utility capacity, handover status and any association rules. For shops or showrooms, frontage and foot movement can matter more than size alone. For offices, layout efficiency and staff commute may matter more. This page helps buyers start with focused commercial listings in Dhaka and then move into proper inspection and negotiation.",
      },
    ],
    faqs: faq("commercial property for sale in Dhaka"),
    related: ["properties-for-sale-in-dhaka", "office-space-for-sale-in-dhaka", "property-for-sale-in-dhaka"],
  },
  {
    slug: "luxury-apartment-for-sale-in-dhaka",
    title: "Luxury Apartment for Sale in Dhaka",
    description: "Browse luxury apartments for sale in Dhaka in premium neighborhoods such as Gulshan, Banani, Baridhara and Bashundhara.",
    h1: "Luxury apartment for sale in Dhaka",
    primaryKeyword: "luxury apartment for sale in Dhaka",
    intro: "Luxury apartment buyers usually compare location, building reputation, floor plan, parking, lift access, security, views and long-term resale demand.",
    query: { listing_purpose: "sale", property_type: "apartment", city: "Dhaka", min_price: "30000000" },
    propertyType: "apartment",
    faqs: faq("luxury apartment for sale in Dhaka"),
    related: ["flat-for-sale-in-gulshan", "flat-for-sale-in-banani", "flat-for-sale-in-baridhara", "apartment-for-sale-in-dhaka"],
  },
  {
    slug: "ready-flat-for-sale-in-dhaka",
    title: "Ready Flat for Sale in Dhaka | Move-in Options",
    description: "Find ready flats for sale in Dhaka with photos, prices, size details and direct inquiry options.",
    h1: "Ready flat for sale in Dhaka",
    primaryKeyword: "ready flat for sale in Dhaka",
    intro: "Ready flats are useful for buyers who want faster handover, visible construction quality and practical neighborhood comparisons before purchase.",
    query: { listing_purpose: "sale", property_type: "apartment", city: "Dhaka" },
    propertyType: "apartment",
    faqs: faq("ready flat for sale in Dhaka"),
    related: ["flat-for-sale-in-dhaka", "apartment-for-sale-in-dhaka", "flat-for-sale-in-uttara", "flat-for-sale-in-mirpur"],
  },
];

const areaPages: SeoLandingPage[] = areaSlugs.map(([slugArea, area]) => ({
  slug: `flat-for-sale-in-${slugArea}`,
  title: `Flat for Sale in ${area} | PropertyBikri`,
  description: `Find flats for sale in ${area}, Dhaka with updated apartment listings, prices, photos and direct contact options on PropertyBikri.`,
  h1: `Flat for sale in ${area}`,
  primaryKeyword: `flat for sale in ${area}`,
  area,
  propertyType: "apartment",
  intro: `${areaCopy[area]} Compare flats and apartments for sale with price, size, bedroom, bathroom and listing contact details.`,
  query: { listing_purpose: "sale", property_type: "apartment", area_name: area },
  faqs: faq(`flat for sale in ${area}`, area),
  related: ["flat-for-sale-in-dhaka", "apartment-for-sale-in-dhaka", "properties-for-sale-in-dhaka", "ready-flat-for-sale-in-dhaka"],
}));

const extraPages: SeoLandingPage[] = [
  ["gulshan", "Gulshan"],
  ["banani", "Banani"],
  ["uttara", "Uttara"],
].map(([slugArea, area]) => ({
  slug: `house-for-sale-in-${slugArea}`,
  title: `House for Sale in ${area} | PropertyBikri`,
  description: `Browse houses for sale in ${area}, Dhaka with price, size, location and direct inquiry options.`,
  h1: `House for sale in ${area}`,
  primaryKeyword: `house for sale in ${area}`,
  area,
  propertyType: "house",
  intro: `${areaCopy[area]} Review house and villa options by size, price, road access, bedrooms, parking and neighborhood fit.`,
  query: { listing_purpose: "sale", property_type: "house", area_name: area },
  faqs: faq(`house for sale in ${area}`, area),
  related: ["house-for-sale-in-dhaka", "properties-for-sale-in-dhaka", "flat-for-sale-in-dhaka"],
})).concat([
  {
    slug: "land-for-sale-in-purbachal",
    title: "Land for Sale in Purbachal | PropertyBikri",
    description: "Find land for sale in Purbachal with plot information, prices and buyer guidance for Dhaka growth-area property searches.",
    h1: "Land for sale in Purbachal",
    primaryKeyword: "land for sale in Purbachal",
    area: "Purbachal",
    propertyType: "land",
    intro: `${areaCopy.Purbachal} Compare land options by plot size, access, documents and long-term development potential.`,
    query: { listing_purpose: "sale", property_type: "land", area_name: "Purbachal" },
    faqs: faq("land for sale in Purbachal", "Purbachal"),
    related: ["land-for-sale-in-dhaka", "plot-for-sale-in-dhaka", "properties-for-sale-in-dhaka"],
  },
  {
    slug: "plot-for-sale-in-bashundhara",
    title: "Plot for Sale in Bashundhara | PropertyBikri",
    description: "Search plots for sale in Bashundhara, Dhaka with price, location and land details for residential buyers.",
    h1: "Plot for sale in Bashundhara",
    primaryKeyword: "plot for sale in Bashundhara",
    area: "Bashundhara",
    propertyType: "land",
    intro: `${areaCopy.Bashundhara} Plot buyers should compare block, road access, documents, land size and nearby amenities.`,
    query: { listing_purpose: "sale", property_type: "land", area_name: "Bashundhara" },
    faqs: faq("plot for sale in Bashundhara", "Bashundhara"),
    related: ["land-for-sale-in-dhaka", "plot-for-sale-in-dhaka", "flat-for-sale-in-bashundhara"],
  },
]);

export const SEO_LANDING_PAGES = [...corePages, ...areaPages, ...extraPages];

export function getSeoLandingPage(slug: string) {
  return SEO_LANDING_PAGES.find((page) => page.slug === slug);
}

export function landingPageHref(slug: string) {
  return `/${slug}`;
}

export function landingQueryString(page: SeoLandingPage, extra?: Record<string, string>) {
  const params = new URLSearchParams({ ...page.query, ...extra });
  return params.toString();
}
