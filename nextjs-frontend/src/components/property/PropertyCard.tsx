"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Camera, BedDouble, Bath, Square, Phone, Mail, MessageCircle, MapPin } from 'lucide-react';
import { formatBDT } from '@/utils/formatters';
import type { PropertyListItem } from '@/lib/property-api';
import { getSafePropertyImageSrc } from '@/lib/image';

interface PropertyCardProps {
  property: PropertyListItem;
  viewMode?: 'grid' | 'list';
}

export default function PropertyCard({ property, viewMode = 'grid' }: PropertyCardProps) {
  const imageCount = property.image_count || 5; 
  const phone = property.business_phone || "+8801000000000";
  const waPhone = phone.replace(/[^0-9]/g, '');
  const isList = viewMode === 'list';
  const priceAmount = Number(property.price_amount || 0);
  const bedroomCount = Number(property.bedrooms || 0);
  const bathroomCount = Number(property.bathrooms || 0);
  const sizeValue = Number(property.size_value || 0);

  return (
    <div className={`bg-white rounded-xl border border-brand-border overflow-hidden hover:shadow-2xl transition-all duration-500 group flex ${isList ? 'flex-col md:flex-row h-auto md:h-[280px]' : 'flex-col h-full'}`}>
      
      {/* Image Section */}
      <div className={`relative shrink-0 cursor-pointer overflow-hidden bg-gray-100 ${isList ? 'aspect-[16/9] md:aspect-auto md:w-[380px]' : 'aspect-[16/9] w-full'}`}>
        <Link href={`/properties/${property.slug}`}>
          <Image 
            src={getSafePropertyImageSrc(property.cover_image_url)} 
            alt={property.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
          />
        </Link>
        
        {/* Featured Ribbon */}
        {property.featured && (
          <div className="absolute top-4 left-0 bg-brand-featured text-[#1a1a1a] text-[10px] font-extrabold px-3 py-1.5 uppercase tracking-[0.1em] shadow-md z-10">
            Featured
          </div>
        )}

        {/* Photo Count */}
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[11px] font-bold px-2 py-1 rounded flex items-center gap-1.5 z-10">
          <Camera size={14} className="stroke-[1.5]" />
          {imageCount}
        </div>
      </div>
      
      {/* Details Section */}
      <div className={`p-5 flex flex-col flex-grow relative text-left ${isList ? 'md:p-6' : ''}`}>
        
        {/* Agency Logo */}
        <div className={`absolute right-5 bg-white p-1 rounded border border-brand-border shadow-md z-20 w-14 h-14 flex items-center justify-center overflow-hidden transition-transform group-hover:-translate-y-1 ${isList ? 'top-6' : '-top-7'}`}>
           <div className="bg-brand-green/10 w-full h-full flex items-center justify-center rounded border border-brand-green/10">
              <span className="text-[8px] font-black text-brand-green text-center leading-none px-1 uppercase tracking-tighter">Verified Agency</span>
           </div>
        </div>

        {/* Header Label */}
        <p className="text-brand-textSecondary text-[10px] font-black uppercase tracking-[0.1em] mb-1.5 opacity-70">
          {property.property_type} - For {property.listing_purpose}
        </p>
        
        {/* Price & Title */}
        <div className="mb-3 pr-16">
          <Link href={`/properties/${property.slug}`}>
            <h3 className="font-black text-[24px] leading-none text-brand-dark hover:text-brand-green transition-colors mb-2 tracking-tight">
              {property.currency || 'BDT'} {formatBDT(priceAmount)}
            </h3>
          </Link>
          
          <Link href={`/properties/${property.slug}`}>
            <h4 className="text-brand-dark text-[16px] font-bold line-clamp-1 hover:text-brand-green transition-colors leading-tight mb-2 tracking-tight">
              {property.title}
            </h4>
          </Link>
        </div>

        {/* Location */}
        <div className="flex items-start text-brand-textSecondary text-[13px] mb-4 font-medium opacity-80">
          <MapPin size={14} className="mr-1.5 mt-0.5 shrink-0 text-brand-green" />
          <span className="line-clamp-1">{property.area_name}, {property.city}</span>
        </div>
        
        {/* Specs Divider & Icons */}
        <div className="flex items-center gap-6 mt-auto pt-4 border-t border-gray-100 text-[14px] text-brand-dark font-black tracking-tight">
          {bedroomCount > 0 && (
            <div className="flex items-center gap-2.5">
              <BedDouble size={20} className="text-gray-300 stroke-[1.2]" />
              <span>{bedroomCount}</span>
            </div>
          )}
          {bathroomCount > 0 && (
            <div className="flex items-center gap-2.5 border-l border-gray-100 pl-6">
              <Bath size={20} className="text-gray-300 stroke-[1.2]" />
              <span>{bathroomCount}</span>
            </div>
          )}
          {sizeValue > 0 && (
            <div className="flex items-center gap-2.5 border-l border-gray-100 pl-6">
              <Square size={18} className="text-gray-300 stroke-[1.2]" />
              <span className="whitespace-nowrap">{sizeValue} {property.size_unit}</span>
            </div>
          )}
        </div>
        
        {/* Action Footer */}
        <div className={`mt-5 flex gap-3 ${isList ? 'md:mt-6' : ''}`}>
           <a href={`tel:${phone}`} className="flex-[3] flex items-center justify-center gap-2 text-center py-3 border border-brand-green text-brand-green text-[13px] font-black rounded-lg hover:bg-green-50 transition-all shadow-sm active:scale-95">
             <Phone size={16} strokeWidth={3} />
             CALL
           </a>
           <Link href={`/properties/${property.slug}#contact`} className="flex-[3] flex items-center justify-center gap-2 text-center py-3 border border-gray-200 text-brand-dark text-[13px] font-black rounded-lg hover:bg-gray-50 transition-all shadow-sm active:scale-95">
             <Mail size={16} strokeWidth={3} />
             EMAIL
           </Link>
           <a href={`https://wa.me/${waPhone}`} target="_blank" className="flex-1 flex items-center justify-center py-3 bg-[#25D366] text-white rounded-lg hover:bg-[#20b858] transition-all shadow-lg shadow-green-500/20 active:scale-95" title="WhatsApp">
             <MessageCircle size={20} fill="currentColor" strokeWidth={0} />
           </a>
        </div>

      </div>
    </div>
  );
}
