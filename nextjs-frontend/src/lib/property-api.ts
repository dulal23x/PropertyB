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

export type PropertyEditorItem = {
  id: number;
  slug: string;
  title: string;
  description: string;
  listing_purpose: string;
  property_type: string;
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
  balconies?: number | null;
  parking_spaces?: number | null;
  floor_number?: number | null;
  total_floors?: number | null;
  size_value?: number | null;
  size_unit?: string | null;
  land_size_value?: number | null;
  land_size_unit?: string | null;
  plot_type?: string | null;
  facing?: string | null;
  handover_status?: string | null;
  handover_date?: string | null;
  furnishing_status?: string | null;
  owner_note?: string | null;
  admin_note?: string | null;
  status?: string;
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

export async function fetchMyListings(query = "") {
  const url = query ? `/properties/me?${query}` : "/properties/me";
  const res = await apiFetch(url, {
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

export async function fetchOwnerDashboardSummary() {
  const res = await apiFetch("/properties/me-summary", {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  if (!res.ok) {
    return { total: 0, pending_review: 0, approved: 0, rejected: 0, recent: [] };
  }
  return res.json();
}

export async function fetchMyListing(listingId: number) {
  const res = await apiFetch(`/properties/me/${listingId}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  if (!res.ok) {
    return null;
  }
  return res.json() as Promise<PropertyEditorItem>;
}

export async function fetchMyInquiries() {
  const res = await apiFetch("/properties/me/inquiries", {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  if (!res.ok) return { items: [] };
  return res.json() as Promise<{ items: any[] }>;
}

export async function fetchListingImages(listingId: number) {
  const res = await apiFetch(`/properties/me/${listingId}/images`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  if (!res.ok) return [];
  return res.json() as Promise<any[]>;
}

export async function uploadListingImage(listingId: number, file: File, isCover: boolean = false) {
  const formData = new FormData();
  formData.append("file", file);
  
  const res = await apiFetch(`/properties/me/${listingId}/upload-image?is_cover=${isCover}`, {
    method: "POST",
    headers: {
      ...authHeaders(),
    },
    body: formData,
  });
  
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || "Failed to upload image");
  }
  return res.json();
}

export async function deleteListingImage(listingId: number, imageId: number) {
  const res = await apiFetch(`/properties/me/${listingId}/images/${imageId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || "Failed to delete image");
  }
  return res.json();
}

export async function createListing(payload: Record<string, unknown>) {
  const res = await apiFetch("/properties", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || "Failed to create listing");
  }
  return res.json() as Promise<PropertyEditorItem>;
}

export async function updateMyListing(listingId: number, payload: Record<string, unknown>) {
  const res = await apiFetch(`/properties/me/${listingId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || "Failed to update listing");
  }
  return res.json() as Promise<PropertyEditorItem>;
}

export async function submitMyListing(listingId: number) {
  const res = await apiFetch(`/properties/me/${listingId}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || "Failed to submit listing");
  }
  return res.json() as Promise<{ id: number; status: string }>;
}

export async function deleteMyListing(listingId: number) {
  const res = await apiFetch(`/properties/me/${listingId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || "Failed to delete listing");
  }
  return res.json() as Promise<{ deleted?: boolean; archived?: boolean }>;
}

export function propertyImageUrl(path: string) {
  return apiUrl(path);
}

export async function fetchGlobalContactNumber(): Promise<string> {
  const res = await apiFetch("/properties/global-contact", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch contact number");
  }
  const data = await res.json();
  return data.contact_number;
}
