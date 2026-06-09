export const DHAKA_AREAS = [
  "Gulshan",
  "Banani",
  "Bashundhara",
  "Baridhara",
  "Badda",
  "Mohakhali",
  "Tejgaon",
  "Uttara",
  "Mirpur",
  "Mohammadpur",
  "Dhanmondi",
  "Shyamoli",
  "Adabor",
  "Rampura",
  "Banasree",
  "Aftab Nagar",
  "Khilgaon",
  "Malibagh",
  "Motijheel",
  "Banglamotor",
  "Wari",
  "Jatrabari",
  "Khilkhet",
  "Purbachal",
  "Keraniganj",
  "Savar",
  "Tongi",
] as const;

export function formatPropertyLocation(property: { display_address?: string | null; area_name?: string | null; city?: string | null }) {
  const displayAddress = property.display_address?.trim();
  if (displayAddress) return displayAddress;

  const areaName = property.area_name?.trim();
  const city = property.city?.trim();
  if (areaName && city) return `${areaName}, ${city}`;
  return areaName || city || "Location not specified";
}
