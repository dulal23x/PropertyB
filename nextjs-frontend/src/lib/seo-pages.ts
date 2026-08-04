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
  faqs: Array<{ question: string; answer: string }>;
  related: string[];
};

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
    title: "Properties for Sale in Dhaka | Flats, Houses & Land",
    description: "Browse properties for sale in Dhaka including flats, apartments, houses, land and commercial spaces in Gulshan, Banani, Bashundhara, Uttara and Dhanmondi.",
    h1: "Properties for sale in Dhaka",
    primaryKeyword: "properties for sale in Dhaka",
    intro: "Compare Dhaka property listings across apartments, houses, land, plots and commercial spaces. Use verified listing details, prices, photos and area information to shortlist the right property.",
    query: { listing_purpose: "sale", city: "Dhaka" },
    faqs: faq("properties for sale in Dhaka"),
    related: BASE_RELATED,
  },
  {
    slug: "property-for-sale-in-dhaka",
    title: "Property for Sale in Dhaka | PropertyBikri",
    description: "Find property for sale in Dhaka with updated apartment, house, land and commercial listings across popular Dhaka neighborhoods.",
    h1: "Property for sale in Dhaka",
    primaryKeyword: "property for sale in Dhaka",
    intro: "Search property for sale in Dhaka with practical filters for price, area, size and property type. PropertyBikri keeps the browsing path simple for buyers comparing real options.",
    query: { listing_purpose: "sale", city: "Dhaka" },
    faqs: faq("property for sale in Dhaka"),
    related: BASE_RELATED,
  },
  {
    slug: "flat-for-sale-in-dhaka",
    title: "Flat for Sale in Dhaka | Ready Flats & Apartments",
    description: "Search flats for sale in Dhaka, including ready flats and apartments in Gulshan, Banani, Bashundhara, Uttara, Dhanmondi and nearby areas.",
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
    title: "Apartment for Sale in Dhaka | PropertyBikri",
    description: "Browse apartments for sale in Dhaka with verified listing details, photos, prices and locations across premium and family-friendly areas.",
    h1: "Apartment for sale in Dhaka",
    primaryKeyword: "apartment for sale in Dhaka",
    intro: "Apartment buyers in Dhaka often compare location, building quality, size, parking, lift, security and nearby services. Use this page to review apartment listings in one place.",
    query: { listing_purpose: "sale", property_type: "apartment", city: "Dhaka" },
    propertyType: "apartment",
    faqs: faq("apartment for sale in Dhaka"),
    related: ["flat-for-sale-in-dhaka", "luxury-apartment-for-sale-in-dhaka", "flat-for-sale-in-gulshan", "flat-for-sale-in-bashundhara"],
  },
  {
    slug: "house-for-sale-in-dhaka",
    title: "House for Sale in Dhaka | Homes & Villas",
    description: "Find houses for sale in Dhaka including family homes, villas and duplex properties in prime residential neighborhoods.",
    h1: "House for sale in Dhaka",
    primaryKeyword: "house for sale in Dhaka",
    intro: "Compare houses for sale in Dhaka by area, price, land size, bedrooms, bathrooms and access to daily services. Houses and villas are limited in prime locations, so shortlist carefully.",
    query: { listing_purpose: "sale", property_type: "house", city: "Dhaka" },
    propertyType: "house",
    faqs: faq("house for sale in Dhaka"),
    related: ["house-for-sale-in-gulshan", "house-for-sale-in-banani", "house-for-sale-in-uttara", "properties-for-sale-in-dhaka"],
  },
  {
    slug: "land-for-sale-in-dhaka",
    title: "Land for Sale in Dhaka | Residential Land",
    description: "Search land for sale in Dhaka and nearby growth areas, including plots and residential land options for future development.",
    h1: "Land for sale in Dhaka",
    primaryKeyword: "land for sale in Dhaka",
    intro: "Land buyers in Dhaka should compare road access, plot size, approvals, ownership documents, utility access and future development potential before committing.",
    query: { listing_purpose: "sale", property_type: "land", city: "Dhaka" },
    propertyType: "land",
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
