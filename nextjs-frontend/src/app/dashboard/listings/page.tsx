"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { deleteMyListing, fetchMyListings } from '@/lib/property-api';
import { getAuthSession } from '@/lib/auth';

type ListingRow = {
  id: number;
  slug?: string;
  title: string;
  status: string;
  listing_purpose: string;
  property_type: string;
  city?: string | null;
  area_name?: string | null;
  price_amount?: number | null;
  currency?: string;
  updated_at?: string;
  created_at?: string;
  next_action?: string;
};

export default function MyPropertiesPage() {
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadListings = async (targetPage = page, targetStatus = status) => {
    setLoading(true);
    const query = new URLSearchParams();
    if (targetStatus) query.set('status', targetStatus);
    query.set('page', String(targetPage));
    query.set('page_size', '10');

    try {
      const data = await fetchMyListings(query.toString());
      if ('items' in data) {
        setListings(data.items || []);
        setTotal(data.total || 0);
        setError('');
      } else {
        setError('Failed to load listings');
      }
    } catch (_err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.access_token) {
      window.location.href = '/auth/login';
      return;
    }

    void loadListings();
  }, [page, status]);

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setPage(1);
  };

  const removeListing = async (id: number) => {
    if (!window.confirm('Delete or archive this listing?')) return;
    try {
      await deleteMyListing(id);
      await loadListings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete listing');
    }
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-brand-border p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">My Properties</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your draft, pending, approved, and archived listings.</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={status} 
            onChange={(e) => handleStatusChange(e.target.value)}
            className="rounded-md border-gray-300 text-sm focus:ring-brand-green"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Published</option>
            <option value="rejected">Rejected</option>
            <option value="unpublished">Unpublished</option>
            <option value="archived">Archived</option>
          </select>
          <Link href="/dashboard/listings/new" className="bg-brand-green text-white px-4 py-2 rounded-md font-bold hover:bg-brand-greenHover transition-colors text-sm whitespace-nowrap">
            + Add New
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-sm text-gray-500">Loading listings...</div>
      ) : error ? (
        <div className="py-12 text-sm text-red-600">{error}</div>
      ) : listings.length === 0 ? (
        <div className="py-12 text-sm text-gray-500 text-center border-2 border-dashed rounded-lg">
          <p>No listings found matching the filters.</p>
          <button onClick={() => handleStatusChange('')} className="mt-2 text-brand-green font-bold underline">Show all</button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                  <th className="p-4 font-medium">Property Details</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Updated</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listings.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-bold text-gray-800">{item.title}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {item.listing_purpose} | {item.property_type} | {item.area_name || item.city || 'Unknown area'}
                      </p>
                      <p className="text-xs text-gray-500">ID: {item.id}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-700">
                      {item.price_amount ? `${item.currency || 'BDT'} ${item.price_amount}` : 'Call for price'}
                    </td>
                    <td className="p-4 text-sm text-gray-700">{item.updated_at?.slice(0, 10) || item.created_at?.slice(0, 10) || '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] font-black rounded-full uppercase ${
                        item.status === 'approved' ? 'bg-green-100 text-green-800' :
                        item.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                        item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {(item.status || 'draft').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right text-sm">
                      <div className="flex justify-end gap-3">
                        <Link href={`/dashboard/listings/${item.id}/edit`} className="text-brand-green font-medium hover:underline">Edit</Link>
                        {item.status === 'approved' && item.slug ? (
                          <Link href={`/properties/${item.slug}`} className="text-brand-green font-medium hover:underline">
                            View Public
                          </Link>
                        ) : null}
                        {item.status !== 'pending_review' && (
                          <button className="text-red-500 font-medium hover:underline" type="button" onClick={() => void removeListing(item.id)}>
                            {item.status === 'approved' || item.status === 'unpublished' ? 'Archive' : 'Delete'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-xs text-gray-500">Showing {listings.length} of {total} listings</p>
              <div className="flex gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 border rounded text-xs font-bold disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="px-3 py-1 text-xs font-bold">Page {page} of {totalPages}</span>
                <button 
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 border rounded text-xs font-bold disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
