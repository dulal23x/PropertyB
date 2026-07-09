"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PropertyCard from "@/components/property/PropertyCard";
import {
  Search,
  ChevronRight,
  LayoutGrid,
  List as ListIcon,
  SlidersHorizontal,
  ChevronDown,
  MapPin,
  X,
  ChevronLeft,
} from "lucide-react";
import { PropertyCardSkeleton } from "@/components/ui/Skeletons";
import { fetchProperties, type PropertyListResponse } from "@/lib/property-api";

export const dynamic = "force-dynamic";

type PurposeFilter = "all" | "buy" | "rent";
type PropertyTypeFilter = "all" | "apartment" | "house" | "villa" | "commercial" | "land";
type BedroomFilter = "any" | "1" | "2" | "3" | "4" | "5";

type FilterState = {
  purpose: PurposeFilter;
  property_type: PropertyTypeFilter;
  max_price: string;
  bedrooms_min: BedroomFilter;
  amenities: string[];
  sort: string;
  area_name: string;
};

const PRICE_MAX = 10_000_000;
const PRICE_STEP = 1_000_000;

const PROPERTY_TYPE_OPTIONS: Array<{ label: string; value: PropertyTypeFilter }> = [
  { label: "All", value: "all" },
  { label: "Apartment", value: "apartment" },
  { label: "House", value: "house" },
  { label: "Villa", value: "villa" },
  { label: "Commercial", value: "commercial" },
  { label: "Land", value: "land" },
];

const PURPOSE_OPTIONS: Array<{ label: string; value: PurposeFilter }> = [
  { label: "All", value: "all" },
  { label: "Buy", value: "buy" },
  { label: "Rent", value: "rent" },
];

const BEDROOM_OPTIONS: Array<{ label: string; value: BedroomFilter }> = [
  { label: "Any", value: "any" },
  { label: "1+", value: "1" },
  { label: "2+", value: "2" },
  { label: "3+", value: "3" },
  { label: "4+", value: "4" },
  { label: "5+", value: "5" },
];

const AMENITY_OPTIONS = ["Parking", "Swimming Pool", "Furnished"];

function normalizePurpose(value: string | null): PurposeFilter {
  if (value === "rent") return "rent";
  if (value === "all") return "all";
  return "buy";
}

function normalizePropertyType(value: string | null): PropertyTypeFilter {
  if (
    value === "apartment" ||
    value === "house" ||
    value === "villa" ||
    value === "commercial" ||
    value === "land"
  ) {
    return value;
  }
  return "all";
}

function normalizeBedroomsMin(value: string | null): BedroomFilter {
  if (value === "1" || value === "2" || value === "3" || value === "4" || value === "5") {
    return value;
  }
  return "any";
}

function getPageFilters(params: URLSearchParams): FilterState {
  return {
    purpose: normalizePurpose(params.get("purpose") || params.get("listing_purpose")),
    property_type: normalizePropertyType(params.get("property_type") || params.get("type")),
    max_price: params.get("max_price") || String(PRICE_MAX),
    bedrooms_min: normalizeBedroomsMin(params.get("bedrooms_min")),
    amenities: (params.get("amenities") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    sort: params.get("sort") || "newest",
    area_name: params.get("area_name") || "",
  };
}

function buildApiQuery(params: URLSearchParams) {
  const normalized = new URLSearchParams();
  const purpose = normalizePurpose(params.get("purpose") || params.get("listing_purpose"));
  const propertyType = normalizePropertyType(params.get("property_type") || params.get("type"));
  const city = params.get("city") || "";
  const areaName = params.get("area_name") || "";
  const maxPrice = params.get("max_price") || String(PRICE_MAX);
  const bedroomsMin = normalizeBedroomsMin(params.get("bedrooms_min"));
  const sort = params.get("sort") || "newest";
  const amenities = params.get("amenities") || "";

  if (purpose !== "all") normalized.set("listing_purpose", purpose === "buy" ? "sale" : "rent");
  if (propertyType !== "all") normalized.set("property_type", propertyType);
  if (city) normalized.set("city", city);
  if (areaName) normalized.set("area_name", areaName);
  if (maxPrice) normalized.set("max_price", maxPrice);
  if (bedroomsMin !== "any") normalized.set("bedrooms_min", bedroomsMin);
  if (amenities) normalized.set("amenities", amenities);
  if (sort) normalized.set("sort", sort);
  return normalized.toString();
}

function buildUrlFromFilters(filters: FilterState) {
  const params = new URLSearchParams();

  if (filters.purpose !== "all") params.set("purpose", filters.purpose);
  if (filters.property_type !== "all") params.set("property_type", filters.property_type);
  if (filters.area_name.trim()) params.set("area_name", filters.area_name.trim());
  if (filters.max_price) params.set("max_price", filters.max_price);
  if (filters.bedrooms_min !== "any") params.set("bedrooms_min", filters.bedrooms_min);
  if (filters.amenities.length > 0) params.set("amenities", filters.amenities.join(","));
  if (filters.sort) params.set("sort", filters.sort);

  const query = params.toString();
  return query ? `/properties?${query}` : "/properties";
}

function formatPriceBucket(value: string) {
  const numericValue = Number(value || PRICE_MAX);
  if (!Number.isFinite(numericValue) || numericValue >= PRICE_MAX) return "10M+";
  if (numericValue >= 1_000_000) return `${Math.round(numericValue / 1_000_000)}M`;
  if (numericValue >= 1_000) return `${Math.round(numericValue / 1_000)}K`;
  return numericValue.toLocaleString();
}

export default function PropertiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<PropertyListResponse>({ items: [], total: 0, page: 1, page_size: 0 });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [localFilters, setLocalFilters] = useState<FilterState>(() => getPageFilters(new URLSearchParams(searchParams.toString())));
  const purposeLabel = localFilters.purpose === "rent" ? "Rent" : localFilters.purpose === "all" ? "All" : "Buy";

  useEffect(() => {
    setLocalFilters(getPageFilters(new URLSearchParams(searchParams.toString())));
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await fetchProperties(buildApiQuery(new URLSearchParams(searchParams.toString())));
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, [searchParams]);

  const pushFilters = useCallback(
    (nextFilters: FilterState) => {
      setLocalFilters(nextFilters);
      router.push(buildUrlFromFilters(nextFilters));
    },
    [router]
  );

  const resetFilters = () => {
    pushFilters({
      purpose: "buy",
      property_type: "all",
      max_price: String(PRICE_MAX),
      bedrooms_min: "any",
      amenities: [],
      sort: "newest",
      area_name: "",
    });
    setIsSidebarOpen(false);
  };

  const toggleAmenity = (amenity: string) => {
    const amenities = localFilters.amenities.includes(amenity)
      ? localFilters.amenities.filter((item) => item !== amenity)
      : [...localFilters.amenities, amenity];
    pushFilters({ ...localFilters, amenities });
  };

  return (
    <div className="min-h-screen bg-brand-light">
      <div className="border-b border-brand-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <nav className="mb-4 flex items-center text-[13px] font-medium text-brand-textSecondary">
            <Link href="/" className="font-bold transition-colors hover:text-brand-green">
              Home
            </Link>
            <ChevronRight size={14} className="mx-2 opacity-50" />
            <Link href="/properties?purpose=buy" className="font-bold transition-colors hover:text-brand-green">
              Bangladesh
            </Link>
            <ChevronRight size={14} className="mx-2 opacity-50" />
            <span className="capitalize tracking-tight text-brand-dark font-black">
              Properties for {purposeLabel}
            </span>
          </nav>

          <h1 className="text-2xl font-black leading-none tracking-tight text-brand-dark md:text-[34px]">
            Properties for {purposeLabel} in Bangladesh
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row">
          <aside
            className={`fixed inset-0 z-[100] shrink-0 transition-all duration-500 lg:relative lg:inset-auto lg:z-0 lg:block lg:w-[320px] ${
              isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible lg:opacity-100 lg:visible"
            }`}
          >
            <div
              className={`fixed inset-0 bg-brand-dark/60 backdrop-blur-sm transition-opacity duration-500 lg:hidden ${
                isSidebarOpen ? "opacity-100" : "opacity-0"
              }`}
              onClick={() => setIsSidebarOpen(false)}
            />

            <div
              className={`fixed left-0 top-0 bottom-0 z-[101] w-[86%] max-w-[340px] overflow-y-auto bg-white shadow-2xl transition-transform duration-500 ease-out lg:relative lg:top-auto lg:bottom-auto lg:w-full lg:max-w-none lg:translate-x-0 lg:overflow-visible lg:bg-transparent lg:shadow-none ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
              }`}
            >
              <div className="sticky top-24 min-h-screen border border-brand-border bg-white p-6 shadow-sm lg:min-h-0 lg:rounded-[28px] lg:border-gray-200 lg:shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
                <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
                  <h2 className="text-[22px] font-black tracking-tight text-brand-dark">Filters</h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={resetFilters}
                      className="rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-brand-textSecondary transition-colors hover:text-brand-dark"
                    >
                      Clear
                    </button>
                    <button className="lg:hidden text-brand-dark" onClick={() => setIsSidebarOpen(false)}>
                      <X size={24} />
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <section>
                    <p className="mb-3 text-[13px] font-black uppercase tracking-[0.22em] text-brand-textSecondary">
                      Property Type
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {PROPERTY_TYPE_OPTIONS.map((option) => {
                        const active = localFilters.property_type === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => pushFilters({ ...localFilters, property_type: option.value })}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                              active
                                ? "border-brand-green bg-brand-green text-white shadow-lg shadow-brand-green/20"
                                : "border-gray-200 bg-white text-brand-dark hover:border-brand-green hover:bg-green-50"
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <section>
                    <p className="mb-3 text-[13px] font-black uppercase tracking-[0.22em] text-brand-textSecondary">
                      Listing Type
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {PURPOSE_OPTIONS.map((option) => {
                        const active = localFilters.purpose === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => pushFilters({ ...localFilters, purpose: option.value })}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                              active
                                ? "border-brand-green bg-brand-green text-white shadow-lg shadow-brand-green/20"
                                : "border-gray-200 bg-white text-brand-dark hover:border-brand-green hover:bg-green-50"
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <section>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-[13px] font-black uppercase tracking-[0.22em] text-brand-textSecondary">
                        Price Range: BDT 0 - {formatPriceBucket(localFilters.max_price)}
                      </p>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={PRICE_MAX}
                      step={PRICE_STEP}
                      value={Number(localFilters.max_price || PRICE_MAX)}
                      onChange={(e) => pushFilters({ ...localFilters, max_price: e.target.value })}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full accent-brand-green"
                    />
                  </section>

                  <section>
                    <p className="mb-3 text-[13px] font-black uppercase tracking-[0.22em] text-brand-textSecondary">
                      Min Bedrooms
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {BEDROOM_OPTIONS.map((option) => {
                        const active = localFilters.bedrooms_min === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => pushFilters({ ...localFilters, bedrooms_min: option.value })}
                            className={`min-w-[54px] rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                              active
                                ? "border-brand-green bg-brand-green text-white shadow-lg shadow-brand-green/20"
                                : "border-gray-200 bg-white text-brand-dark hover:border-brand-green hover:bg-green-50"
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <section>
                    <p className="mb-3 text-[13px] font-black uppercase tracking-[0.22em] text-brand-textSecondary">
                      Amenities
                    </p>
                    <div className="space-y-3">
                      {AMENITY_OPTIONS.map((amenity) => {
                        const checked = localFilters.amenities.includes(amenity);
                        return (
                          <label key={amenity} className="flex cursor-pointer items-center gap-3 text-brand-dark">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleAmenity(amenity)}
                              className="h-5 w-5 rounded border-gray-300 text-brand-green focus:ring-brand-green"
                            />
                            <span className="text-base font-medium">{amenity}</span>
                          </label>
                        );
                      })}
                    </div>
                  </section>

                  <section>
                    <p className="mb-3 text-[13px] font-black uppercase tracking-[0.22em] text-brand-textSecondary">
                      Location
                    </p>
                    <div className="relative group">
                      <MapPin
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-green transition-transform group-focus-within:scale-110"
                      />
                      <input
                        type="text"
                        placeholder="Enter City or Area"
                        value={localFilters.area_name}
                        onChange={(e) => pushFilters({ ...localFilters, area_name: e.target.value })}
                        className="h-14 w-full rounded-full border border-gray-200 bg-white pl-11 pr-4 text-[15px] font-medium text-brand-dark placeholder:text-gray-400 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                      />
                    </div>
                  </section>

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="w-full rounded-full border border-gray-200 bg-white py-3 text-[15px] font-medium text-brand-textSecondary transition-all hover:border-brand-green hover:text-brand-dark"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <div className="mb-10 flex flex-col justify-between gap-6 rounded-2xl border border-brand-border bg-white p-4 shadow-sm sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <button
                  className="flex items-center gap-2 rounded-xl bg-brand-dark px-5 py-3 text-[13px] font-black uppercase tracking-widest text-white transition-all active:scale-95 lg:hidden"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <SlidersHorizontal size={18} />
                  Filters
                </button>
                <div className="text-[16px] font-black tracking-tight text-brand-dark">
                  {loading ? (
                    <div className="h-6 w-48 rounded-lg shimmer" />
                  ) : (
                    <>
                      Showing{" "}
                      <span className="text-brand-green">
                        {data.items.length > 0 ? "1" : "0"} - {data.items.length}
                      </span>{" "}
                      of <span className="text-brand-green">{data.total}</span> Properties
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 border-r border-gray-100 pr-6">
                  <span className="text-[11px] font-black uppercase tracking-widest text-brand-textSecondary opacity-60">
                    Sort By:
                  </span>
                  <div className="relative">
                    <select
                      value={localFilters.sort}
                      onChange={(e) => pushFilters({ ...localFilters, sort: e.target.value })}
                      className="cursor-pointer appearance-none bg-transparent py-2 pl-2 pr-10 text-[14px] font-black tracking-tight text-brand-dark focus:outline-none"
                    >
                      <option value="newest">Newest First</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="size_desc">Size: Large to Small</option>
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute right-1 top-2.5 text-brand-green" />
                  </div>
                </div>

                <div className="flex gap-2 rounded-xl border border-transparent bg-brand-light p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`rounded-lg p-2.5 transition-all ${
                      viewMode === "grid" ? "bg-white text-brand-green shadow-lg" : "text-gray-400 hover:text-brand-dark"
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`rounded-lg p-2.5 transition-all ${
                      viewMode === "list" ? "bg-white text-brand-green shadow-lg" : "text-gray-400 hover:text-brand-dark"
                    }`}
                    title="List View"
                  >
                    <ListIcon size={20} />
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className={viewMode === "grid" ? "grid grid-cols-1 gap-10 md:grid-cols-2" : "flex flex-col gap-10"}>
                {[1, 2, 3, 4].map((i) => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </div>
            ) : data.items.length === 0 ? (
              <div className="rounded-3xl border border-brand-border bg-white px-12 py-32 text-center shadow-2xl shadow-black/5">
                <div className="relative mx-auto mb-10 flex h-24 w-28 items-center justify-center overflow-hidden rounded-full bg-brand-light">
                  <div className="shimmer absolute inset-0 opacity-10" />
                  <Search size={52} className="relative z-10 text-gray-300" />
                </div>
                <h3 className="mb-4 text-[28px] font-black uppercase italic tracking-tighter text-brand-dark">
                  No Properties found
                </h3>
                <p className="mx-auto mb-12 max-w-sm text-lg font-bold leading-tight text-brand-textSecondary opacity-60">
                  Try adjusting your filters or resetting the search to discover more gems.
                </p>
                <button
                  onClick={resetFilters}
                  className="rounded-2xl bg-brand-green px-12 py-5 text-white shadow-2xl shadow-brand-green/40 transition-all active:scale-95 hover:bg-brand-greenHover font-black uppercase tracking-[0.2em]"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-1 gap-10 md:grid-cols-2" : "flex flex-col gap-10"}>
                {data.items.map((prop) => (
                  <PropertyCard key={prop.slug} viewMode={viewMode} property={prop} />
                ))}
              </div>
            )}

            {!loading && data.total > 0 && (
              <div className="mt-20 flex flex-col items-center gap-8 border-t border-gray-100 pt-12">
                <div className="flex items-center gap-3">
                  <button className="flex h-14 w-14 cursor-not-allowed items-center justify-center rounded-2xl border border-brand-border bg-white text-gray-400 shadow-sm">
                    <ChevronLeft size={18} />
                  </button>
                  <button className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-green bg-brand-green font-black text-white shadow-2xl shadow-brand-green/40">
                    1
                  </button>
                  <button className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-border bg-white font-black text-brand-dark shadow-sm transition-all hover:border-brand-green hover:text-brand-green">
                    2
                  </button>
                  <button className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-border bg-white font-black text-brand-dark shadow-sm transition-all hover:border-brand-green hover:text-brand-green">
                    3
                  </button>
                  <span className="px-3 text-xl font-black text-gray-400">...</span>
                  <button className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-border bg-white font-black text-brand-green shadow-sm transition-all hover:bg-green-50">
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-[12px] font-black uppercase tracking-[0.25em] text-brand-textSecondary opacity-40">
                    Showing 1 to {data.items.length} of {data.total} properties
                  </p>
                  <div className="h-1 w-24 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full bg-brand-green"
                      style={{ width: `${data.total > 0 ? (data.items.length / data.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
