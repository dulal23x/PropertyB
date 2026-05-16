import { apiFetch, apiUrl } from "@/lib/api";
import { authHeaders } from "@/lib/auth";

export type PropertyListItem = {
  id: number;
  slug: string;
  title: string;
  description?: string;
  listing_purpose: string;
  property_type: string;
  status?: string;
  division?: string | null;
  district?: string | null;
  city?: string | null;
  area_name?: string | null;
  display_address?: string | null;
  price_amount?: number | null;
  price_label?: string | null;
  price_visibility?: string;
  price_period?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  size_value?: number | null;
  size_unit?: string | null;
  land_size_value?: number | null;
  land_size_unit?: string | null;
  featured?: boolean;
  cover_image_url?: string | null;
  image_count?: number;
  business_phone?: string;
  business_email?: string;
  currency?: string;
};

export type PropertyListResponse = {
  items: PropertyListItem[];
  page: number;
  page_size: number;
  total: number;
};

export async function fetchProperties(query: string) {
  const res = await apiFetch(`/properties?${query}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    return { items: [], total: 0, page: 1, page_size: 0 } as PropertyListResponse;
  }
  return res.json() as Promise<PropertyListResponse>;
}

export async function fetchProperty(slug: string) {
  const res = await apiFetch(`/properties/${slug}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchMyListings() {
  const res = await apiFetch("/properties/me", {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  if (!res.ok) {
    return { items: [] };
  }
  return res.json();
}

export function propertyImageUrl(path: string) {
  return apiUrl(path);
}
