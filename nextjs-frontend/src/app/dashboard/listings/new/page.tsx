"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import {
  createListing,
  fetchMyListing,
  submitMyListing,
  updateMyListing,
  type PropertyEditorItem,
} from "@/lib/property-api";
import ListingImageUploader from "@/components/property/ListingImageUploader";

type FormState = {
  title: string;
  description: string;
  listing_purpose: "sale" | "rent";
  property_type: "apartment" | "house" | "land" | "commercial" | "office" | "shop" | "warehouse" | "factory" | "other";
  city: string;
  area_name: string;
  display_address: string;
  price_amount: string;
  bedrooms: string;
  bathrooms: string;
  size_value: string;
  size_unit: string;
  land_size_value: string;
  land_size_unit: string;
};

const initialState: FormState = {
  title: "",
  description: "",
  listing_purpose: "sale",
  property_type: "apartment",
  city: "Dhaka",
  area_name: "",
  display_address: "",
  price_amount: "",
  bedrooms: "0",
  bathrooms: "0",
  size_value: "",
  size_unit: "sqft",
  land_size_value: "",
  land_size_unit: "decimal",
};

function mapListingToState(listing: PropertyEditorItem): FormState {
  return {
    title: listing.title || "",
    description: listing.description || "",
    listing_purpose: listing.listing_purpose === "rent" ? "rent" : "sale",
    property_type: listing.property_type as FormState["property_type"],
    city: listing.city || "Dhaka",
    area_name: listing.area_name || "",
    display_address: listing.display_address || "",
    price_amount: listing.price_amount != null ? String(listing.price_amount) : "",
    bedrooms: listing.bedrooms != null ? String(listing.bedrooms) : "0",
    bathrooms: listing.bathrooms != null ? String(listing.bathrooms) : "0",
    size_value: listing.size_value != null ? String(listing.size_value) : "",
    size_unit: listing.size_unit || "sqft",
    land_size_value: listing.land_size_value != null ? String(listing.land_size_value) : "",
    land_size_unit: listing.land_size_unit || "decimal",
  };
}

export default function NewListingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = useMemo(() => {
    const raw = searchParams.get("id");
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) ? parsed : null;
  }, [searchParams]);

  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [existingId, setExistingId] = useState<number | null>(editId);
  const [loadedTitle, setLoadedTitle] = useState("");

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.access_token) {
      window.location.href = "/auth/login";
      return;
    }

    const loadExisting = async () => {
      if (!editId) {
        setLoading(false);
        return;
      }
      try {
        const listing = await fetchMyListing(editId);
        if (listing) {
          setForm(mapListingToState(listing));
          setExistingId(listing.id);
          setLoadedTitle(listing.title);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load listing");
      } finally {
        setLoading(false);
      }
    };

    loadExisting();
  }, [editId]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const buildPayload = () => ({
    title: form.title,
    description: form.description,
    listing_purpose: form.listing_purpose,
    property_type: form.property_type,
    city: form.city,
    area_name: form.area_name,
    display_address: form.display_address,
    price_amount: form.price_amount ? Number(form.price_amount) : null,
    bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
    bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
    size_value: form.size_value ? Number(form.size_value) : null,
    size_unit: form.size_unit || "sqft",
    land_size_value: form.land_size_value ? Number(form.land_size_value) : null,
    land_size_unit: form.land_size_unit || "decimal",
  });

  const saveListing = async (submitAfter: boolean) => {
    setError("");
    setSaving(true);
    try {
      let currentId = existingId;
      const payload = buildPayload();

      if (currentId) {
        await updateMyListing(currentId, payload);
      } else {
        const created = await createListing(payload);
        currentId = created.id;
        setExistingId(created.id);
      }

      if (submitAfter && currentId) {
        await submitMyListing(currentId);
      }

      router.push("/dashboard/listings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save listing");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="rounded-lg border border-brand-border bg-white p-6 text-sm text-gray-500">Loading listing form...</div>;
  }

  return (
    <div className="max-w-3xl rounded-lg border border-brand-border bg-white p-6 shadow-sm">
      <h1 className="mb-2 text-2xl font-bold text-brand-dark">{existingId ? "Edit Property" : "Post New Property"}</h1>
      <p className="mb-6 text-sm text-gray-500">
        {existingId ? `Editing listing #${existingId}${loadedTitle ? ` - ${loadedTitle}` : ""}` : "Create a draft first, then submit it for admin review."}
      </p>

      {error && <div className="mb-6 rounded-md border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600">{error}</div>}

      <form
        className="space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          void saveListing(true);
        }}
      >
        <section>
          <h2 className="mb-4 border-b pb-2 text-lg font-bold text-gray-800">Basic Information</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Purpose</label>
              <select value={form.listing_purpose} onChange={(e) => setField("listing_purpose", e.target.value as FormState["listing_purpose"])} className="w-full rounded-md border-gray-300 shadow-sm focus:ring-brand-green">
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Property Type</label>
              <select value={form.property_type} onChange={(e) => setField("property_type", e.target.value as FormState["property_type"])} className="w-full rounded-md border-gray-300 shadow-sm focus:ring-brand-green">
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land</option>
                <option value="office">Office</option>
                <option value="shop">Shop</option>
                <option value="warehouse">Warehouse</option>
                <option value="factory">Factory</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Property Title</label>
              <input value={form.title} onChange={(e) => setField("title", e.target.value)} type="text" placeholder="e.g. Beautiful 3 Bed Apartment in Banani" className="w-full rounded-md border-gray-300 shadow-sm focus:ring-brand-green" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 border-b pb-2 text-lg font-bold text-gray-800">Location & Price</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
              <input value={form.city} onChange={(e) => setField("city", e.target.value)} type="text" className="w-full rounded-md border-gray-300 shadow-sm focus:ring-brand-green" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Area / Neighborhood</label>
              <input value={form.area_name} onChange={(e) => setField("area_name", e.target.value)} type="text" placeholder="e.g. Gulshan 1" className="w-full rounded-md border-gray-300 shadow-sm focus:ring-brand-green" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Display Address</label>
              <input value={form.display_address} onChange={(e) => setField("display_address", e.target.value)} type="text" placeholder="e.g. Gulshan-2, Dhaka" className="w-full rounded-md border-gray-300 shadow-sm focus:ring-brand-green" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Price (BDT)</label>
              <input value={form.price_amount} onChange={(e) => setField("price_amount", e.target.value)} type="number" placeholder="e.g. 15000000" className="w-full rounded-md border-gray-300 shadow-sm focus:ring-brand-green" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Size (Sq. Ft.)</label>
              <input value={form.size_value} onChange={(e) => setField("size_value", e.target.value)} type="number" placeholder="e.g. 1800" className="w-full rounded-md border-gray-300 shadow-sm focus:ring-brand-green" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Size Unit</label>
              <select value={form.size_unit} onChange={(e) => setField("size_unit", e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:ring-brand-green">
                <option value="sqft">sqft</option>
                <option value="katha">katha</option>
                <option value="decimal">decimal</option>
                <option value="bigha">bigha</option>
                <option value="acre">acre</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 border-b pb-2 text-lg font-bold text-gray-800">Property Details</h2>
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Bedrooms</label>
              <input value={form.bedrooms} onChange={(e) => setField("bedrooms", e.target.value)} type="number" min="0" className="w-full rounded-md border-gray-300 shadow-sm focus:ring-brand-green" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Bathrooms</label>
              <input value={form.bathrooms} onChange={(e) => setField("bathrooms", e.target.value)} type="number" min="0" className="w-full rounded-md border-gray-300 shadow-sm focus:ring-brand-green" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={6} placeholder="Describe the property features..." className="w-full rounded-md border-gray-300 shadow-sm focus:ring-brand-green" />
          </div>
        </section>

        <section>
          <h2 className="mb-4 border-b pb-2 text-lg font-bold text-gray-800">Land Details</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Land Size</label>
              <input value={form.land_size_value} onChange={(e) => setField("land_size_value", e.target.value)} type="number" className="w-full rounded-md border-gray-300 shadow-sm focus:ring-brand-green" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Land Size Unit</label>
              <select value={form.land_size_unit} onChange={(e) => setField("land_size_unit", e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:ring-brand-green">
                <option value="decimal">decimal</option>
                <option value="katha">katha</option>
                <option value="bigha">bigha</option>
                <option value="acre">acre</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 border-b pb-2 text-lg font-bold text-gray-800">Images</h2>
          <ListingImageUploader listingId={existingId} />
        </section>

        <div className="flex justify-end gap-4 border-t pt-4">
          <button type="button" onClick={() => void saveListing(false)} disabled={saving} className="rounded-md border border-gray-300 px-6 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60">
            {saving ? "Saving..." : "Save as Draft"}
          </button>
          <button type="submit" disabled={saving} className="rounded-md bg-brand-green px-6 py-2 font-bold text-white hover:bg-brand-greenHover disabled:opacity-60">
            {saving ? "Submitting..." : "Submit for Review"}
          </button>
        </div>
      </form>
    </div>
  );
}
