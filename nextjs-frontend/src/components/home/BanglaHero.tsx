"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BanglaHero() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [zone, setZone] = useState("");
  const [area, setArea] = useState("");
  const [place, setPlace] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    
    // Map the zone/area logic to backend if needed. For now just passing location.
    const location = place || area || zone;
    if (location) {
        // Just as an example, we append it. In the real app, this would map to city/area.
        params.append("area_name", location); 
    }
    
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <div className="w-full bg-[#009877] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 py-6 sm:py-8">
        <form onSubmit={handleSearch} className="relative">
          <input name="location" type="hidden" value={place || area || zone} />
          
          {/* Search Input */}
          <div className="relative sm:px-4 mx-auto max-w-lg">
            <input 
              className="block w-full h-12 rounded-full border-gray-300 pl-4 pr-12 py-2 text-gray-900 shadow-sm focus:ring-[#fdb913] focus:border-[#fdb913]" 
              id="search" 
              name="search" 
              placeholder="আপনি কোন ধরণের সম্পত্তি খুঁজছেন?" 
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="absolute inset-y-0 right-4 flex h-10 w-10 m-1 items-center justify-center rounded-full border border-[#fdb913] bg-[#fdb913] text-gray-900 hover:bg-[#e5a610] transition-colors" type="submit">
              <svg className="inline-flex items-center size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </button>
          </div>

          {/* Hero Text */}
          <div className="text-center py-4">
            <p className="text-lg sm:text-2xl lg:text-3xl py-2 font-bold">
              বাংলাদেশ-এর সবচেয়ে বড় প্রপার্টি মার্কেটপ্লেস!
            </p>
            <p className="text-lg py-2 opacity-90">
              বাংলাদেশ -এর ৮ টি সিটি, ৬৪ টি জেলা, ৪৯২ টি উপজেলা প্রপার্টি বিক্রি, প্রপার্টি ভাড়া, বিল্ডিং পণ্য এবং সেবা খুঁজে নিন!
            </p>
          </div>

          {/* Cascaded Location Filters */}
          <div className="grid lg:grid-cols-5 gap-4 sm:px-4 lg:px-8 text-center items-center mt-4">
            <h3 className="my-auto font-bold text-lg lg:text-left">আমার এলাকার বিজ্ঞাপন</h3>
            <div className="lg:col-span-3 grid sm:grid-cols-3 gap-4">
              <div className="text-sm text-gray-900 sm:mt-0">
                <select 
                  onChange={(e) => { setZone(e.target.value); setArea(''); setPlace(''); }} 
                  className="rounded block text-sm w-full border-gray-300 focus:ring-[#fdb913] focus:border-[#fdb913] h-10" 
                  id="zone" 
                  name="zone" 
                  value={zone}
                >
                  <option value="">জোন নির্বাচন করুন</option>
                  <option value="Dhaka">ঢাকা সিটি</option>
                  <option value="Chattogram">চট্টগ্রাম সিটি</option>
                  <option value="Sylhet">সিলেট সিটি</option>
                  <option value="Khulna">খুলনা সিটি</option>
                  <option value="Barishal">বরিশাল সিটি</option>
                  <option value="Rajshahi">রাজশাহী সিটি</option>
                  <option value="Rangpur">রংপুর সিটি</option>
                  <option value="Mymensingh">ময়মনসিংহ সিটি</option>
                  <option value="Dhaka Division">জেলা-ঢাকা বিভাগ</option>
                  <option value="Chattogram Division">জেলা-চট্টগ্রাম বিভাগ</option>
                  <option value="Sylhet Division">জেলা-সিলেট বিভাগ</option>
                  <option value="Barishal Division">জেলা-বরিশাল বিভাগ</option>
                  <option value="Khulna Division">জেলা-খুলনা বিভাগ</option>
                  <option value="Mymensingh Division">জেলা-ময়মনসিংহ বিভাগ</option>
                  <option value="Rajshahi Division">জেলা-রাজশাহী বিভাগ</option>
                  <option value="Rangpur Division">জেলা-রংপুর বিভাগ</option>
                </select>
              </div>
              <div className="text-sm text-gray-900 sm:mt-0">
                <select 
                  onChange={(e) => { setArea(e.target.value); setPlace(''); }} 
                  className="rounded block text-sm w-full border-gray-300 focus:ring-[#fdb913] focus:border-[#fdb913] disabled:opacity-50 h-10" 
                  id="area" 
                  name="area" 
                  value={area}
                  disabled={!zone}
                >
                  <option value="">এরিয়া নির্বাচন করুন</option>
                  {zone === 'Dhaka' && (
                    <>
                      <option value="Mirpur">মিরপুর</option>
                      <option value="Uttara">উত্তরা</option>
                      <option value="Gulshan">গুলশান</option>
                      <option value="Banani">বনানী</option>
                      <option value="Dhanmondi">ধানমন্ডি</option>
                      <option value="Mohammadpur">মোহাম্মদপুর</option>
                      <option value="Badda">বাড্ডা</option>
                      <option value="Bashundhara">বসুন্ধরা</option>
                    </>
                  )}
                  {zone === 'Chattogram' && (
                    <>
                      <option value="Agrabad">আগ্রাবাদ</option>
                      <option value="Halishahar">হালিশহর</option>
                      <option value="Khulshi">খুলশী</option>
                    </>
                  )}
                </select>
              </div>
              <div className="text-sm text-gray-900 sm:mt-0">
                <select 
                  onChange={(e) => setPlace(e.target.value)} 
                  className="rounded block text-sm w-full border-gray-300 focus:ring-[#fdb913] focus:border-[#fdb913] disabled:opacity-50 h-10" 
                  id="place" 
                  name="place" 
                  value={place}
                  disabled={!area}
                >
                  <option value="">স্থান নির্বাচন করুন</option>
                  {area === 'Mirpur' && (
                    <>
                      <option value="Mirpur 10">মিরপুর ১০</option>
                      <option value="Mirpur 11">মিরপুর ১১</option>
                      <option value="Mirpur 12">মিরপুর ১২</option>
                    </>
                  )}
                  {area === 'Gulshan' && (
                    <>
                      <option value="Gulshan 1">গুলশান ১</option>
                      <option value="Gulshan 2">গুলশান ২</option>
                    </>
                  )}
                </select>
              </div>
            </div>
            
            <button 
              className="text-center flex justify-center items-center gap-2 px-4 h-10 rounded-md text-sm bg-[#fdb913] text-gray-900 hover:bg-[#e5a610] font-bold tracking-wider leading-5 focus:outline-none transition duration-150 ease-in-out w-full lg:w-auto mt-4 lg:mt-0" 
              type="submit"
            >
              <svg className="size-5 inline-block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
              অনুসন্ধান করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
