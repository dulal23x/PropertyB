"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PropertyCard from "@/components/property/PropertyCard";
import { Search, ChevronRight, LayoutGrid, List as ListIcon, SlidersHorizontal, ChevronDown, MapPin, X, ChevronLeft } from 'lucide-react';
import { PropertyCardSkeleton } from '@/components/ui/Skeletons';
import { fetchProperties, type PropertyListResponse } from '@/lib/property-api';

export const dynamic = 'force-dynamic';

function buildQuery(params: URLSearchParams) {
  const normalized = new URLSearchParams();
  const purpose = params.get('listing_purpose') || params.get('purpose') || 'sale';
  const propertyType = params.get('property_type') || params.get('type') || '';
  const city = params.get('city') || '';
  const areaName = params.get('area_name') || '';
  const minPrice = params.get('min_price') || '';
  const maxPrice = params.get('max_price') || '';
  const bedrooms = params.get('bedrooms') || '';
  const sort = params.get('sort') || 'newest';

  normalized.set('listing_purpose', purpose);
  if (propertyType) normalized.set('property_type', propertyType);
  if (city) normalized.set('city', city);
  if (areaName) normalized.set('area_name', areaName);
  if (minPrice) normalized.set('min_price', minPrice);
  if (maxPrice) normalized.set('max_price', maxPrice);
  if (bedrooms && bedrooms !== 'Any') normalized.set('bedrooms', bedrooms === '4+' ? '4' : bedrooms);
  if (sort) normalized.set('sort', sort);
  return normalized.toString();
}

export default function PropertiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [data, setData] = useState<PropertyListResponse>({ items: [], total: 0, page: 1, page_size: 0 });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Local filter states
  const [localFilters, setLocalFilters] = useState({
    purpose: searchParams.get('listing_purpose') || searchParams.get('purpose') || 'sale',
    property_type: searchParams.get('property_type') || searchParams.get('type') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    bedrooms: searchParams.get('bedrooms') || 'Any',
    sort: searchParams.get('sort') || 'newest',
    area_name: searchParams.get('area_name') || ''
  });

  // Sync local state when URL changes
  useEffect(() => {
    setLocalFilters({
      purpose: searchParams.get('listing_purpose') || searchParams.get('purpose') || 'sale',
      property_type: searchParams.get('property_type') || searchParams.get('type') || '',
      min_price: searchParams.get('min_price') || '',
      max_price: searchParams.get('max_price') || '',
      bedrooms: searchParams.get('bedrooms') || 'Any',
      sort: searchParams.get('sort') || 'newest',
      area_name: searchParams.get('area_name') || ''
    });
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await fetchProperties(buildQuery(new URLSearchParams(searchParams.toString())));
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, [searchParams]);

  const updateFilters = useCallback((updates: Partial<typeof localFilters>) => {
    const newFilters = { ...localFilters, ...updates };
    const params = new URLSearchParams();
    params.set('listing_purpose', newFilters.purpose);
    Object.keys(newFilters).forEach(key => {
      const val = newFilters[key as keyof typeof newFilters];
      if (key === 'purpose') return;
      if (val && val !== 'Any' && val !== '') {
        if (key === 'bedrooms' && val === '4+') {
          params.set(key, '4');
          return;
        }
        params.set(key, val);
      }
    });
    router.push(`/properties?${params.toString()}`);
  }, [localFilters, router]);

  const resetFilters = () => {
    router.push('/properties?listing_purpose=sale');
  };

  return (
    <div className="bg-brand-light min-h-screen">
      
      {/* Header Section */}
      <div className="bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav className="flex items-center text-[13px] text-brand-textSecondary mb-4 font-medium">
            <Link href="/" className="hover:text-brand-green transition-colors font-bold">Home</Link>
            <ChevronRight size={14} className="mx-2 opacity-50" />
            <Link href="/properties" className="hover:text-brand-green transition-colors font-bold">Bangladesh</Link>
            <ChevronRight size={14} className="mx-2 opacity-50" />
            <span className="text-brand-dark font-black capitalize tracking-tight">Properties for {localFilters.purpose}</span>
          </nav>
          
          <h1 className="text-2xl md:text-[34px] font-black text-brand-dark leading-none tracking-tight">
            Properties for {localFilters.purpose} in Bangladesh
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Phase 9: Mobile optimized Drawer Sidebar */}
          <aside className={`fixed inset-0 z-[100] lg:relative lg:inset-auto lg:z-0 lg:block lg:w-[300px] shrink-0 transition-all duration-500 ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible lg:opacity-100 lg:visible'}`}>
            {/* Backdrop */}
            <div className={`lg:hidden fixed inset-0 bg-brand-dark/60 backdrop-blur-sm transition-opacity duration-500 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsSidebarOpen(false)}></div>
            
            {/* Drawer Content */}
            <div className={`fixed left-0 top-0 bottom-0 w-[300px] bg-white lg:bg-transparent lg:relative lg:w-full transform transition-transform duration-500 ease-out z-[101] overflow-y-auto lg:overflow-visible ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
              <div className="bg-white p-6 lg:rounded-2xl shadow-2xl lg:shadow-sm border-r lg:border border-brand-border sticky top-24 min-h-screen lg:min-h-0">
                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4 lg:pb-6">
                  <h2 className="text-[17px] font-black text-brand-dark uppercase tracking-wider">Filter Search</h2>
                  <div className="flex items-center gap-4">
                    <button onClick={resetFilters} className="text-[11px] font-black text-red-500 hover:text-red-600 uppercase tracking-widest flex items-center gap-1 transition-colors">
                      <X size={14} strokeWidth={3} />
                      Reset
                    </button>
                    <button className="lg:hidden text-brand-dark" onClick={() => setIsSidebarOpen(false)}>
                      <X size={24} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-8">
                  {/* Location */}
                  <div className="relative group">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-brand-green">Location</label>
                    <div className="relative h-14 flex items-center">
                      <MapPin size={18} className="absolute left-4 text-brand-green transition-transform group-focus-within:scale-110" />
                      <input 
                        type="text" 
                        placeholder="Enter City or Area" 
                        value={localFilters.area_name}
                        onChange={(e) => setLocalFilters({ ...localFilters, area_name: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && updateFilters({})}
                        className="w-full h-full pl-11 pr-4 bg-brand-light border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-[15px] font-bold text-brand-dark placeholder-gray-400 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Purpose */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Purpose</label>
                    <div className="flex bg-brand-light p-1.5 rounded-xl border border-transparent h-14 shadow-sm">
                      <button 
                        onClick={() => updateFilters({ purpose: 'sale' })}
                        className={`flex-1 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all ${localFilters.purpose === 'sale' ? 'bg-white shadow-lg text-brand-green' : 'text-gray-400 hover:text-brand-dark'}`}
                      >
                        Buy
                      </button>
                      <button 
                        onClick={() => updateFilters({ purpose: 'rent' })}
                        className={`flex-1 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all ${localFilters.purpose === 'rent' ? 'bg-white shadow-lg text-brand-green' : 'text-gray-400 hover:text-brand-dark'}`}
                      >
                        Rent
                      </button>
                    </div>
                  </div>
                  
                  {/* Property Type */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-brand-green">Property Type</label>
                    <div className="relative h-14">
                      <select 
                        value={localFilters.property_type}
                        onChange={(e) => updateFilters({ property_type: e.target.value })}
                        className="w-full h-full pl-4 pr-10 bg-brand-light border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green appearance-none text-[15px] font-bold text-brand-dark cursor-pointer transition-all shadow-sm"
                      >
                        <option value="">Any Type</option>
                        <option value="apartment">Apartment</option>
                        <option value="house">House</option>
                        <option value="commercial">Commercial</option>
                        <option value="land">Land</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-4.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* Price Range */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Price Range (BDT)</label>
                    <div className="flex gap-3 h-14">
                      <input 
                        type="number" 
                        placeholder="Min" 
                        value={localFilters.min_price}
                        onChange={(e) => setLocalFilters({ ...localFilters, min_price: e.target.value })}
                        onBlur={() => updateFilters({})}
                        className="w-1/2 px-4 bg-brand-light border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-[15px] font-bold text-brand-dark placeholder-gray-400 transition-all shadow-sm" 
                      />
                      <input 
                        type="number" 
                        placeholder="Max" 
                        value={localFilters.max_price}
                        onChange={(e) => setLocalFilters({ ...localFilters, max_price: e.target.value })}
                        onBlur={() => updateFilters({})}
                        className="w-1/2 px-4 bg-brand-light border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-[15px] font-bold text-brand-dark placeholder-gray-400 transition-all shadow-sm" 
                      />
                    </div>
                  </div>
                  
                  {/* Bedrooms */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Bedrooms</label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {['Any', '1', '2', '3', '4+'].map((opt) => (
                        <button 
                          key={opt} 
                          onClick={() => updateFilters({ bedrooms: opt })}
                          className={`py-3.5 text-[11px] font-black rounded-xl border transition-all shadow-sm ${localFilters.bedrooms === opt ? 'bg-brand-green border-brand-green text-white shadow-lg shadow-brand-green/30' : 'bg-brand-light border-transparent text-brand-dark hover:border-brand-green hover:bg-white'}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => updateFilters({})}
                    className="w-full bg-brand-green text-white font-black text-[14px] py-5 rounded-2xl hover:bg-brand-greenHover transition-all shadow-xl shadow-brand-green/40 uppercase tracking-[0.2em] active:scale-95 mt-6 border-b-4 border-brand-greenHover"
                  >
                    FIND PROPERTIES
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Results Section */}
          <main className="flex-1">
            
            <div className="bg-white rounded-2xl border border-brand-border p-4 mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
              <div className="flex items-center gap-4">
                <button 
                  className="lg:hidden flex items-center gap-2 px-5 py-3 bg-brand-dark text-white rounded-xl text-[13px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <SlidersHorizontal size={18} />
                  Filters
                </button>
                <div className="text-[16px] font-black text-brand-dark tracking-tight">
                  {loading ? (
                    <div className="h-6 w-48 shimmer rounded-lg" />
                  ) : (
                    <>
                      Showing <span className="text-brand-green">{data.items.length > 0 ? '1' : '0'} - {data.items.length}</span> of <span className="text-brand-green">{data.total}</span> Properties
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 border-r border-gray-100 pr-6">
                  <span className="text-[11px] font-black text-brand-textSecondary uppercase tracking-widest opacity-60">Sort By:</span>
                  <div className="relative">
                    <select 
                      value={localFilters.sort}
                      onChange={(e) => updateFilters({ sort: e.target.value })}
                      className="pl-2 pr-10 py-2 text-[14px] font-black text-brand-dark bg-transparent focus:outline-none appearance-none cursor-pointer tracking-tight"
                    >
                      <option value="newest">Newest First</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="size_desc">Size: Large to Small</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-1 top-2.5 text-brand-green pointer-events-none" />
                  </div>
                </div>
                
                <div className="flex gap-2 bg-brand-light p-1 rounded-xl border border-transparent">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-lg text-brand-green' : 'text-gray-400 hover:text-brand-dark'}`}
                    title="Grid View"
                  >
                    <LayoutGrid size={20} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-lg text-brand-green' : 'text-gray-400 hover:text-brand-dark'}`}
                    title="List View"
                  >
                    <ListIcon size={20} />
                  </button>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-10" : "flex flex-col gap-10"}>
                {[1, 2, 3, 4].map(i => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </div>
            ) : data.items.length === 0 ? (
              <div className="bg-white py-32 px-12 text-center rounded-3xl border border-brand-border shadow-2xl shadow-black/5">
                <div className="w-28 h-24 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-10 overflow-hidden relative">
                   <div className="shimmer absolute inset-0 opacity-10" />
                  <Search size={52} className="text-gray-300 relative z-10" />
                </div>
                <h3 className="text-[28px] font-black text-brand-dark mb-4 tracking-tighter uppercase italic">No Properties found</h3>
                <p className="text-brand-textSecondary max-w-sm mx-auto font-bold text-lg opacity-60 leading-tight mb-12">
                  Try adjusting your filters or resetting the search to discover more gems.
                </p>
                <button 
                  onClick={resetFilters}
                  className="px-12 py-5 bg-brand-green text-white font-black rounded-2xl hover:bg-brand-greenHover transition-all shadow-2xl shadow-brand-green/40 uppercase tracking-[0.2em] active:scale-95"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-10" : "flex flex-col gap-10"}>
                {data.items.map((prop) => (
                  <PropertyCard 
                    key={prop.slug} 
                    viewMode={viewMode}
                    property={prop}
                  />
                ))}
              </div>
            )}
            
            {/* Pagination Controls */}
            {!loading && data.total > 0 && (
              <div className="mt-20 flex flex-col items-center gap-8 border-t border-gray-100 pt-12">
                <div className="flex items-center gap-3">
                  <button className="w-14 h-14 flex items-center justify-center rounded-2xl border border-brand-border bg-white text-gray-400 cursor-not-allowed transition-all shadow-sm"><ChevronLeft size={18} /></button>
                  <button className="w-14 h-14 flex items-center justify-center rounded-2xl border border-brand-green bg-brand-green text-white font-black shadow-2xl shadow-brand-green/40">1</button>
                  <button className="w-14 h-14 flex items-center justify-center rounded-2xl border border-brand-border bg-white text-brand-dark font-black hover:border-brand-green hover:text-brand-green transition-all shadow-sm">2</button>
                  <button className="w-14 h-14 flex items-center justify-center rounded-2xl border border-brand-border bg-white text-brand-dark font-black hover:border-brand-green hover:text-brand-green transition-all shadow-sm">3</button>
                  <span className="px-3 text-gray-400 font-black text-xl">...</span>
                  <button className="w-14 h-14 flex items-center justify-center rounded-2xl border border-brand-border bg-white text-brand-green font-black hover:bg-green-50 transition-all shadow-sm"><ChevronRight size={18} /></button>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-[12px] font-black text-brand-textSecondary uppercase tracking-[0.25em] opacity-40">
                    Showing 1 to {data.items.length} of {data.total} properties
                  </p>
                  <div className="h-1 w-24 bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-brand-green" style={{ width: `${(data.items.length / data.total) * 100}%` }} />
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
