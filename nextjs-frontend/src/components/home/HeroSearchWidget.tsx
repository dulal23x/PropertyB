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
      <div className="flex bg-gray-50/80 border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('buy')}
          className={`flex-1 md:flex-none px-12 py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'buy' ? 'text-brand-green bg-white' : 'text-gray-400 hover:text-brand-dark'}`}
        >
          Buy
          {activeTab === 'buy' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-green animate-in fade-in slide-in-from-bottom-1 duration-300" />}
        </button>
        <button 
          onClick={() => setActiveTab('rent')}
          className={`flex-1 md:flex-none px-12 py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'rent' ? 'text-brand-green bg-white' : 'text-gray-400 hover:text-brand-dark'}`}
        >
          Rent
          {activeTab === 'rent' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-green animate-in fade-in slide-in-from-bottom-1 duration-300" />}
        </button>
        <button 
          onClick={() => setActiveTab('projects')}
          className={`flex-1 md:flex-none px-12 py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'projects' ? 'text-brand-green bg-white' : 'text-gray-400 hover:text-brand-dark'}`}
        >
          Projects
          {activeTab === 'projects' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-green animate-in fade-in slide-in-from-bottom-1 duration-300" />}
        </button>
      </div>

      {/* Phase 1 & 2: Inputs Sizing & Typography */}
      <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Location */}
          <div className="relative group border-b lg:border-b-0 lg:border-r border-gray-100 pb-5 lg:pb-0 lg:pr-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-brand-green transition-colors">Location</label>
            <div className="relative flex items-center h-12">
              <MapPin size={20} className="text-brand-green shrink-0 mr-3" />
              <input 
                type="text" 
                placeholder="e.g. Gulshan, Dhaka" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFind()}
                className="w-full py-2 bg-transparent focus:outline-none text-[15px] font-bold text-brand-dark placeholder-gray-300"
              />
            </div>
          </div>

          {/* Property Type */}
          <div className="relative group border-b lg:border-b-0 lg:border-r border-gray-100 pb-5 lg:pb-0 lg:pl-2 lg:pr-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-brand-green transition-colors">Property Type</label>
            <div className="relative flex items-center h-12">
              <Building2 size={20} className="text-brand-green shrink-0 mr-3" />
              <select 
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full py-2 bg-transparent focus:outline-none appearance-none text-[15px] font-bold text-brand-dark cursor-pointer"
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
          <div className="relative group border-b lg:border-b-0 lg:border-r border-gray-100 pb-5 lg:pb-0 lg:pl-2 lg:pr-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-brand-green transition-colors">Price (BDT)</label>
            <div className="relative flex items-center h-12">
              <Banknote size={20} className="text-brand-green shrink-0 mr-3" />
              <select 
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full py-2 bg-transparent focus:outline-none appearance-none text-[15px] font-bold text-brand-dark cursor-pointer"
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
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-brand-green transition-colors">Beds & Baths</label>
            <div className="relative flex items-center h-12">
              <BedDouble size={20} className="text-brand-green shrink-0 mr-3" />
              <select 
                value={beds}
                onChange={(e) => setBeds(e.target.value)}
                className="w-full py-2 bg-transparent focus:outline-none appearance-none text-[15px] font-bold text-brand-dark cursor-pointer"
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
            className="w-full lg:w-auto h-[64px] flex items-center justify-center gap-3 bg-brand-green text-white font-black px-14 rounded-xl shadow-[0_12px_24px_-8px_rgba(0,161,96,0.5)] hover:bg-brand-greenHover transition-all hover:-translate-y-1 active:scale-95 group"
          >
            <Search size={24} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm tracking-[0.2em] font-black">FIND</span>
          </button>
        </div>
      </div>
    </div>
  );
}
