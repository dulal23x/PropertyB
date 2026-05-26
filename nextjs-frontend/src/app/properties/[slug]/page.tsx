import Image from 'next/image';
import Link from 'next/link';
import { fetchProperty } from '@/lib/property-api';
import { formatBDT } from '@/utils/formatters';
import PropertyInquiryForm from '@/components/property/PropertyInquiryForm';
import RevealContactButton from '@/components/property/RevealContactButton';
import { getSafePropertyImageSrc } from '@/lib/image';

export const dynamic = 'force-dynamic';

type PropertyImage = {
  public_url: string;
};

type PropertyDetail = {
  id: number;
  slug: string;
  title: string;
  description: string;
  listing_purpose?: string | null;
  property_type?: string | null;
  area_name?: string | null;
  city?: string | null;
  currency?: string | null;
  price_amount?: number | string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  size_value?: number | null;
  size_unit?: string | null;
  business_phone?: string | null;
  amenities?: string[] | null;
  amenities_json?: string | null;
  images?: PropertyImage[] | null;
};

async function getProperty(slug: string) {
  return fetchProperty(slug) as Promise<PropertyDetail | null>;
}

function parseAmenities(property: PropertyDetail) {
  if (Array.isArray(property?.amenities)) return property.amenities;
  if (typeof property?.amenities_json === 'string') {
    try {
      const parsed = JSON.parse(property.amenities_json);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
}

export default async function PropertyDetailPage({ params }: { params: { slug: string } }) {
  const property = await getProperty(params.slug);

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Property Not Found</h1>
          <Link href="/properties" className="text-brand-green hover:underline">Return to Search</Link>
        </div>
      </div>
    );
  }

  const priceAmount = Number(property.price_amount || 0);
  const bedroomCount = Number(property.bedrooms || 0);
  const bathroomCount = Number(property.bathrooms || 0);
  const sizeValue = Number(property.size_value || 0);
  const amenities = parseAmenities(property);
  const listingPurpose = property.listing_purpose || 'sale';
  const propertyType = property.property_type || 'property';
  const businessPhone = property.business_phone || '+8801000000000';

  return (
    <div className="bg-brand-light min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <nav className="text-sm text-gray-500 mb-4 flex gap-2">
            <Link href="/" className="hover:text-brand-green">Home</Link>
            <span>/</span>
            <Link href={`/properties?listing_purpose=${listingPurpose}`} className="hover:text-brand-green capitalize">
              {listingPurpose}
            </Link>
            <span>/</span>
            <span className="text-gray-700 capitalize">{propertyType} in {property.area_name}</span>
          </nav>
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-brand-dark">{property.title}</h1>
              <p className="text-gray-600 mt-2 flex items-center">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {property.area_name}, {property.city}
              </p>
            </div>
            <div className="text-left md:text-right">
              <div className="text-3xl font-bold text-brand-dark">
                {property.currency || 'BDT'} {formatBDT(priceAmount)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <main className="w-full lg:w-2/3 space-y-8">
            <div className="bg-white p-2 rounded-lg shadow-sm border border-brand-border">
              <div className="relative h-96 w-full rounded-md overflow-hidden bg-gray-100">
                <Image
                  src={getSafePropertyImageSrc(property.images?.[0]?.public_url)}
                  alt={property.title}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                {property.images?.slice(1).map((img: { public_url: string }, idx: number) => (
                  <div key={idx} className="relative h-24 w-32 shrink-0 rounded overflow-hidden cursor-pointer hover:opacity-80">
                    <Image src={getSafePropertyImageSrc(img.public_url)} alt="Thumbnail" fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-brand-border flex flex-wrap justify-between items-center gap-6">
              <div className="flex flex-col items-center">
                <span className="text-gray-500 text-sm">Type</span>
                <span className="font-bold text-lg capitalize">{propertyType}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-gray-500 text-sm">Purpose</span>
                <span className="font-bold text-lg capitalize">{listingPurpose}</span>
              </div>
              {bedroomCount > 0 && (
                <div className="flex flex-col items-center">
                  <span className="text-gray-500 text-sm">Bedrooms</span>
                  <div className="flex items-center gap-1 font-bold text-lg">{bedroomCount}</div>
                </div>
              )}
              {bathroomCount > 0 && (
                <div className="flex flex-col items-center">
                  <span className="text-gray-500 text-sm">Bathrooms</span>
                  <div className="flex items-center gap-1 font-bold text-lg">{bathroomCount}</div>
                </div>
              )}
              {sizeValue > 0 && (
                <div className="flex flex-col items-center">
                  <span className="text-gray-500 text-sm">Size</span>
                  <div className="flex items-center gap-1 font-bold text-lg">{sizeValue} {property.size_unit}</div>
                </div>
              )}
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-brand-border">
              <h2 className="text-xl font-bold text-brand-dark mb-4">Property Description</h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                {property.description}
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-brand-border">
              <h2 className="text-xl font-bold text-brand-dark mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(amenities.length > 0 ? amenities : ['Security Staff', 'CCTV Security', 'Electricity Backup', 'Elevator', 'Intercom']).map((amenity: string) => (
                  <div key={amenity} className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          </main>

          <aside className="w-full lg:w-1/3 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-brand-border sticky top-24">
              <h2 className="text-lg font-bold text-brand-dark mb-4">Contact Agent</h2>

              <div className="mb-6 flex items-center gap-4 border-b pb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  <Image src="/assets/bproperty-logo.svg" alt="PropertyBikri" width={50} height={12} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">PropertyBikri Verified</h3>
                  <p className="text-sm text-gray-500">Corporate Seller</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <RevealContactButton />
              </div>

              <PropertyInquiryForm listingId={property.id} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
