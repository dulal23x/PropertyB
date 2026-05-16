"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authHeaders, getAuthSession } from '@/lib/auth';
import { apiFetch } from '@/lib/api';

type FormState = {
  title: string;
  description: string;
  listing_purpose: 'sale' | 'rent';
  property_type: 'apartment' | 'house' | 'land' | 'commercial' | 'office' | 'shop' | 'warehouse' | 'factory' | 'other';
  city: string;
  area_name: string;
  display_address: string;
  price_amount: string;
  bedrooms: string;
  bathrooms: string;
  size_value: string;
  size_unit: string;
};

const initialState: FormState = {
  title: '',
  description: '',
  listing_purpose: 'sale',
  property_type: 'apartment',
  city: 'Dhaka',
  area_name: '',
  display_address: '',
  price_amount: '',
  bedrooms: '0',
  bathrooms: '0',
  size_value: '',
  size_unit: 'sqft',
};

export default function NewListingPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.access_token) {
      window.location.href = '/auth/login';
    }
  }, []);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
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
        size_unit: form.size_unit || 'sqft',
      };
      const res = await apiFetch('/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || 'Failed to create listing');
      }
      router.push('/dashboard/listings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-brand-border p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-brand-dark mb-6">Post New Property</h1>

      {error && <div className="mb-6 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-md p-3">{error}</div>}

      <form className="space-y-8" onSubmit={handleSubmit}>
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
              <select value={form.listing_purpose} onChange={(e) => setField('listing_purpose', e.target.value as FormState['listing_purpose'])} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-green">
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <select value={form.property_type} onChange={(e) => setField('property_type', e.target.value as FormState['property_type'])} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-green">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Title</label>
              <input value={form.title} onChange={(e) => setField('title', e.target.value)} type="text" placeholder="e.g. Beautiful 3 Bed Apartment in Banani" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-green" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Location & Price</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input value={form.city} onChange={(e) => setField('city', e.target.value)} type="text" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area / Neighborhood</label>
              <input value={form.area_name} onChange={(e) => setField('area_name', e.target.value)} type="text" placeholder="e.g. Gulshan 1" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Address</label>
              <input value={form.display_address} onChange={(e) => setField('display_address', e.target.value)} type="text" placeholder="e.g. Gulshan-2, Dhaka" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (BDT)</label>
              <input value={form.price_amount} onChange={(e) => setField('price_amount', e.target.value)} type="number" placeholder="e.g. 15000000" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size (Sq. Ft.)</label>
              <input value={form.size_value} onChange={(e) => setField('size_value', e.target.value)} type="number" placeholder="e.g. 1800" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size Unit</label>
              <select value={form.size_unit} onChange={(e) => setField('size_unit', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-green">
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
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Property Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
              <input value={form.bedrooms} onChange={(e) => setField('bedrooms', e.target.value)} type="number" min="0" defaultValue="0" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
              <input value={form.bathrooms} onChange={(e) => setField('bathrooms', e.target.value)} type="number" min="0" defaultValue="0" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-green" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setField('description', e.target.value)} rows={6} placeholder="Describe the property features..." className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-green"></textarea>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Images</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 cursor-pointer transition-colors">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-gray-600 font-medium">Image upload will be wired in the next step</p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB each</p>
          </div>
        </section>

        <div className="flex justify-end gap-4 pt-4 border-t">
          <button type="button" className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50" disabled={loading}>
            Save as Draft
          </button>
          <button type="submit" disabled={loading} className="px-6 py-2 bg-brand-green text-white font-bold rounded-md hover:bg-brand-greenHover disabled:opacity-60">
            {loading ? 'Saving...' : 'Submit for Review'}
          </button>
        </div>
      </form>
    </div>
  );
}
