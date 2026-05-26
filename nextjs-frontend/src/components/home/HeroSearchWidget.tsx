"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, MapPin, Building2, Banknote, BedDouble, Search } from 'lucide-react';

export default function HeroSearchWidget() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'buy' | 'rent' | 'projects'>('buy');
  
  // Phase 3: Functional State for all fields
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [beds, setBeds] = useState('');

  const handleFind = () => {
    const params = new URLSearchParams();
    params.set('listing_purpose', activeTab === 'rent' ? 'rent' : 'sale');
    if (location) params.set('area_name', location);
    if (propertyType) params.set('property_type', propertyType);
    
    // Price Range parsing logic (simplified for mock)
    if (priceRange === '50-100') {
      params.set('min_price', '5000000');
      params.set('max_price', '10000000');
    } else if (priceRange === '100-500') {
      params.set('min_price', '10000000');
      params.set('max_price', '50000000');
    }

    if (beds) params.set('bedrooms', beds === '4' ? '4' : beds);

    router.push(`/properties?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden text-left max-w-4xl mx-auto border border-gray-100 transform transition-all">
      {/* Phase 2: Tab Navigation Refinement */}
      <div className="grid grid-cols-3 bg-gray-50/80 border-b border-gray-100 md:flex">
        <button 
          onClick={() => setActiveTab('buy')}
          className={`relative flex min-h-[52px] items-center justify-center px-2 py-4 text-[10px] font-black uppercase tracking-[0.14em] transition-all md:flex-1 md:px-12 md:py-5 md:text-[11px] md:tracking-[0.2em] ${activeTab === 'buy' ? 'text-brand-green bg-white' : 'text-gray-400 hover:text-brand-dark'}`}
        >
          Buy
          {activeTab === 'buy' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-green animate-in fade-in slide-in-from-bottom-1 duration-300" />}
        </button>
        <button 
          onClick={() => setActiveTab('rent')}
          className={`relative flex min-h-[52px] items-center justify-center px-2 py-4 text-[10px] font-black uppercase tracking-[0.14em] transition-all md:flex-1 md:px-12 md:py-5 md:text-[11px] md:tracking-[0.2em] ${activeTab === 'rent' ? 'text-brand-green bg-white' : 'text-gray-400 hover:text-brand-dark'}`}
        >
          Rent
          {activeTab === 'rent' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-green animate-in fade-in slide-in-from-bottom-1 duration-300" />}
        </button>
        <button 
          onClick={() => setActiveTab('projects')}
          className={`relative flex min-h-[52px] items-center justify-center px-2 py-4 text-[10px] font-black uppercase tracking-[0.14em] transition-all md:flex-1 md:px-12 md:py-5 md:text-[11px] md:tracking-[0.2em] ${activeTab === 'projects' ? 'text-brand-green bg-white' : 'text-gray-400 hover:text-brand-dark'}`}
        >
          Projects
          {activeTab === 'projects' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-green animate-in fade-in slide-in-from-bottom-1 duration-300" />}
        </button>
      </div>

      {/* Phase 1 & 2: Inputs Sizing & Typography */}
      <div className="grid grid-cols-1 gap-4 bg-white p-4 md:p-8 lg:grid-cols-[1fr_auto] lg:gap-6 lg:p-10">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {/* Location */}
          <div className="relative group border-b border-gray-100 pb-3 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-2">
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-brand-green">Location</label>
            <div className="relative flex items-center min-h-[44px]">
              <MapPin size={18} className="text-brand-green shrink-0 mr-3" />
              <input 
                type="text" 
                placeholder="e.g. Gulshan, Dhaka" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFind()}
                className="w-full bg-transparent py-2 text-[14px] font-bold text-brand-dark placeholder-gray-300 focus:outline-none md:text-[15px]"
              />
            </div>
          </div>

          {/* Property Type */}
          <div className="relative group border-b border-gray-100 pb-3 lg:border-b-0 lg:border-r lg:pb-0 lg:pl-2 lg:pr-2">
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-brand-green">Property Type</label>
            <div className="relative flex items-center min-h-[44px]">
              <Building2 size={18} className="text-brand-green shrink-0 mr-3" />
              <select 
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full cursor-pointer appearance-none bg-transparent py-2 text-[14px] font-bold text-brand-dark focus:outline-none md:text-[15px]"
              >
                <option value="">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="commercial">Commercial</option>
              </select>
              <ChevronDown size={14} className="text-gray-400 ml-1 pointer-events-none shrink-0" />
            </div>
          </div>

          {/* Price Range */}
          <div className="relative group border-b border-gray-100 pb-3 lg:border-b-0 lg:border-r lg:pb-0 lg:pl-2 lg:pr-2">
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-brand-green">Price (BDT)</label>
            <div className="relative flex items-center min-h-[44px]">
              <Banknote size={18} className="text-brand-green shrink-0 mr-3" />
              <select 
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full cursor-pointer appearance-none bg-transparent py-2 text-[14px] font-bold text-brand-dark focus:outline-none md:text-[15px]"
              >
                <option value="">Any Price</option>
                <option value="50-100">50 Lakhs - 1 Crore</option>
                <option value="100-500">1 Crore - 5 Crore</option>
              </select>
              <ChevronDown size={14} className="text-gray-400 ml-1 pointer-events-none shrink-0" />
            </div>
          </div>

          {/* Beds & Baths */}
          <div className="relative group lg:pl-2">
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-brand-green">Beds & Baths</label>
            <div className="relative flex items-center min-h-[44px]">
              <BedDouble size={18} className="text-brand-green shrink-0 mr-3" />
              <select 
                value={beds}
                onChange={(e) => setBeds(e.target.value)}
                className="w-full cursor-pointer appearance-none bg-transparent py-2 text-[14px] font-bold text-brand-dark focus:outline-none md:text-[15px]"
              >
                <option value="">Any</option>
                <option value="3">3+ Beds</option>
                <option value="4">4+ Beds</option>
              </select>
              <ChevronDown size={14} className="text-gray-400 ml-1 pointer-events-none shrink-0" />
            </div>
          </div>
        </div>

        {/* Phase 4: Find Button Premium Effects */}
        <div className="flex items-center">
          <button 
            onClick={handleFind}
            className="group flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-brand-green px-8 font-black text-white shadow-[0_12px_24px_-8px_rgba(0,161,96,0.5)] transition-all active:scale-95 hover:bg-brand-greenHover md:h-[64px] md:w-auto md:px-14 md:hover:-translate-y-1"
          >
            <Search size={22} strokeWidth={3} className="transition-transform group-hover:scale-110" />
            <span className="text-sm font-black tracking-[0.16em]">FIND</span>
          </button>
        </div>
      </div>
    </div>
  );
}
