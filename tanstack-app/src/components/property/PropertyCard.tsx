import { Camera, BedDouble, Bath, Square, PhoneCall, Mail, MessageCircleMore, MapPinned } from "lucide-react";
import { formatBDT } from "../../utils/formatters";

export interface PropertyCardItem {
  id: number;
  slug: string;
  title: string;
  property_type: string;
  listing_purpose: string;
  price_amount?: number | null;
  price_label?: string | null;
  price_visibility?: string;
  currency?: string;
  area_name?: string;
  city?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  size_value?: number | null;
  size_unit?: string | null;
  featured?: boolean | number;
  cover_image_url?: string | null;
  image_count?: number;
  business_contact_phone?: string;
  business_contact_whatsapp?: string;
}

interface PropertyCardProps {
  property: PropertyCardItem;
  viewMode?: "grid" | "list";
}

export default function PropertyCard({ property, viewMode = "grid" }: PropertyCardProps) {
  const imageCount = property.image_count || 1;
  const phone = property.business_contact_phone || "+8801700000000";
  const waPhone = (property.business_contact_whatsapp || phone).replace(/[^0-9]/g, "");
  const isList = viewMode === "list";
  const priceAmount = Number(property.price_amount || 0);
  const bedroomCount = Number(property.bedrooms || 0);
  const bathroomCount = Number(property.bathrooms || 0);
  const sizeValue = Number(property.size_value || 0);
  const isCallForPrice = property.price_visibility === "call_for_price" || property.price_visibility === "contact_for_price";
  const priceText = isCallForPrice
    ? property.price_label || "Call for details"
    : `${property.currency || "BDT"} ${formatBDT(priceAmount)}`;

  const coverSrc = property.cover_image_url || "/assets/propertybikri-demo-call-for-details.png";

  return (
    <div
      className={`bg-white rounded-xl border border-brand-border overflow-hidden hover:shadow-2xl transition-all duration-500 group flex ${isList ? "flex-col md:flex-row h-auto md:h-[280px]" : "flex-col h-full"}`}
    >
      {/* Image Section */}
      <div className={`relative shrink-0 cursor-pointer overflow-hidden bg-gray-100 ${isList ? "aspect-[16/9] md:aspect-auto md:w-[380px]" : "aspect-[16/9] w-full"}`}>
        <a href={`/properties/${property.slug}`}>
          <img
            src={coverSrc}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
          />
        </a>

        {Boolean(property.featured) && (
          <div className="absolute top-4 left-0 bg-brand-featured text-[#1a1a1a] text-[10px] font-extrabold px-3 py-1.5 uppercase tracking-[0.1em] shadow-md z-10">
            Featured
          </div>
        )}

        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[11px] font-bold px-2 py-1 rounded flex items-center gap-1.5 z-10">
          <Camera size={14} className="stroke-[1.5]" />
          {imageCount}
        </div>
      </div>

      {/* Details Section */}
      <div className={`p-5 flex flex-col flex-grow relative text-left ${isList ? "md:p-6" : ""}`}>
        <div className={`absolute right-5 bg-white p-1 rounded border border-brand-border shadow-md z-20 w-14 h-14 flex items-center justify-center overflow-hidden transition-transform group-hover:-translate-y-1 ${isList ? "top-6" : "-top-7"}`}>
          <div className="bg-brand-green/10 w-full h-full flex items-center justify-center rounded border border-brand-green/10">
            <span className="text-[8px] font-black text-brand-green text-center leading-none px-1 uppercase tracking-tighter">Verified Agency</span>
          </div>
        </div>

        <p className="text-brand-textSecondary text-[10px] font-black uppercase tracking-[0.1em] mb-1.5 opacity-70">
          {property.property_type} - For {property.listing_purpose}
        </p>

        <div className="mb-3 pr-16">
          <a href={`/properties/${property.slug}`}>
            <h3 className="font-black text-[24px] leading-none text-brand-dark hover:text-brand-green transition-colors mb-2 tracking-tight">
              {priceText}
            </h3>
          </a>
          {isCallForPrice && (
            <p className="mb-2 text-[12px] font-semibold leading-snug text-brand-textSecondary">
              Pictures and current availability shared after contact.
            </p>
          )}

          <a href={`/properties/${property.slug}`}>
            <h4 className="text-brand-dark text-[16px] font-bold line-clamp-1 hover:text-brand-green transition-colors leading-tight mb-2 tracking-tight">
              {property.title}
            </h4>
          </a>
        </div>

        <div className="flex items-start text-brand-textSecondary text-[13px] mb-4 font-medium opacity-80">
          <MapPinned size={14} className="mr-1.5 mt-0.5 shrink-0 text-brand-green" />
          <span className="line-clamp-1">{property.area_name}, {property.city}</span>
        </div>

        <div className="flex items-center gap-6 mt-auto pt-4 border-t border-gray-100 text-[14px] text-brand-dark font-black tracking-tight">
          {bedroomCount > 0 && (
            <div className="flex items-center gap-1.5">
              <BedDouble size={16} className="text-brand-green" />
              <span>{bedroomCount} Beds</span>
            </div>
          )}
          {bathroomCount > 0 && (
            <div className="flex items-center gap-1.5">
              <Bath size={16} className="text-brand-green" />
              <span>{bathroomCount} Baths</span>
            </div>
          )}
          {sizeValue > 0 && (
            <div className="flex items-center gap-1.5">
              <Square size={16} className="text-brand-green" />
              <span>{sizeValue} {property.size_unit || "sqft"}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
          <a
            href={`tel:${phone}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-xs font-black uppercase tracking-wider text-brand-dark transition-colors hover:border-brand-green hover:text-brand-green"
          >
            <PhoneCall size={14} className="text-brand-green" />
            <span>Call</span>
          </a>
          <a
            href={`https://wa.me/${waPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#25D366]/10 py-2 text-xs font-black uppercase tracking-wider text-[#128C7E] transition-colors hover:bg-[#25D366]/20"
          >
            <MessageCircleMore size={14} />
            <span>WhatsApp</span>
          </a>
          <a
            href={`/properties/${property.slug}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-green py-2 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-brand-greenHover"
          >
            <Mail size={14} />
            <span>Inquire</span>
          </a>
        </div>
      </div>
    </div>
  );
}
