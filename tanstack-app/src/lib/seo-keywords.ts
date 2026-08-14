export const PRIMARY_SITE_KEYWORD = "Houses, Lands & Apartments For Sale in Dhaka";

export const PRIMARY_SITE_DESCRIPTION =
  "Find houses, lands and apartments for sale in Dhaka with PropertyBikri. Compare flats, plots, commercial properties, prices, photos and direct contact options in Gulshan, Banani, Bashundhara, Uttara, Dhanmondi and nearby areas.";

export function listingKeywordForType(propertyType?: string | null, areaName?: string | null, city?: string | null) {
  const location = [areaName, city || "Dhaka"].filter(Boolean).join(", ");
  const suffix = location ? ` in ${location}` : " in Dhaka";

  if (propertyType === "land") return `land for sale${suffix}`;
  if (propertyType === "house" || propertyType === "villa") return `house for sale${suffix}`;
  if (propertyType === "commercial" || propertyType === "office" || propertyType === "shop") {
    return `commercial property for sale${suffix}`;
  }
  return `apartment for sale${suffix}`;
}
