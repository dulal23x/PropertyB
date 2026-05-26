import Link from 'next/link';
import Image from 'next/image';
import nextDynamic from 'next/dynamic';
import { Suspense } from 'react';
import PropertyCard from '@/components/property/PropertyCard';
import { PropertyCardSkeleton } from '@/components/ui/Skeletons';
import HeroSearchWidgetSkeleton from '@/components/home/HeroSearchWidgetSkeleton';
import { fetchProperties } from '@/lib/property-api';

export const dynamic = 'force-dynamic';

// Dynamically import client component widget
const HeroSearchWidget = nextDynamic(() => import('@/components/home/HeroSearchWidget'), {
  ssr: true,
  loading: () => <HeroSearchWidgetSkeleton />
});

async function getFeaturedProperties() {
  try {
    const data = await fetchProperties('sort=featured_first&page_size=3');
    return data.items;
  } catch {
    return [];
  }
}

export default async function Home() {
  const featuredProperties = await getFeaturedProperties();

  return (
    <div className="bg-white min-h-screen">
      
      {/* Hero Section */}
      <section className="relative min-h-[720px] md:h-[600px] flex items-start md:items-center justify-center overflow-hidden">
        {/* Background Image - Locally Hosted */}
        <Image 
          src="/assets/home/hero/hero-bg.jpg"
          alt="PropertyBikri Hero"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        
        <div className="relative z-10 w-full max-w-5xl px-4 pt-24 pb-10 text-center md:pt-0 md:pb-0 md:mt-[-60px]">
          <h1 className="mx-auto mb-5 max-w-[14ch] text-[28px] font-extrabold leading-[1.08] tracking-tight text-white drop-shadow-xl md:mb-8 md:max-w-4xl md:text-4xl lg:text-[42px]">
            Search 10,000+ Houses, Apartments, and Land in Dhaka, Bangladesh
          </h1>
          
          <Suspense fallback={<HeroSearchWidgetSkeleton />}>
            <HeroSearchWidget />
          </Suspense>
        </div>
      </section>

      {/* City Section */}
      <section className="bg-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-7 text-2xl font-black tracking-tight uppercase text-brand-dark md:mb-10 md:text-[28px]">Browse properties by city</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-8">
            {[
              { name: 'Dhaka', count: '8,421', img: '/assets/home/cities/dhaka.jpg' },
              { name: 'Chattogram', count: '1,245', img: '/assets/home/cities/chattogram.jpg' },
              { name: 'Sylhet', count: '452', img: '/assets/home/cities/sylhet.jpg' }
            ].map((city) => (
              <Link key={city.name} href={`/properties?city=${city.name.toLowerCase()}&listing_purpose=sale`} className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-700">
                <Image 
                  src={city.img} 
                  alt={city.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-5 left-5 text-white md:bottom-8 md:left-8">
                  <p className="mb-1 text-[9px] font-black uppercase tracking-[0.22em] text-brand-green md:mb-2 md:text-[10px] md:tracking-[0.25em]">{city.count} Properties</p>
                  <h3 className="text-[34px] font-black tracking-tighter md:text-4xl">{city.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Property Type Section */}
      <section className="bg-brand-light py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-7 text-center text-2xl font-black tracking-tight uppercase text-brand-dark md:mb-10 md:text-left md:text-[28px]">Browse properties by type</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 md:gap-6">
            {[ 
              { label: 'Apartments', value: 'apartment', count: '6,214' },
              { label: 'Houses', value: 'house', count: '1,452' },
              { label: 'Commercial', value: 'commercial', count: '942' },
              { label: 'Land', value: 'land', count: '1,120' },
              { label: 'Duplex', value: 'other', count: '241' }
            ].map((cat) => (
              <Link key={cat.label} href={`/properties?property_type=${cat.value}&listing_purpose=sale`} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 text-center flex flex-col items-center group md:p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-green/10 text-brand-green transition-colors group-hover:bg-brand-green group-hover:text-white md:mb-6 md:h-16 md:w-16">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
                </div>
                <h3 className="font-black text-brand-dark uppercase tracking-widest text-xs mb-2">{cat.label}</h3>
                <p className="text-[11px] font-bold text-brand-textSecondary uppercase tracking-widest">{cat.count} listings</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="bg-white py-14 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
            <div>
               <h2 className="text-2xl font-black tracking-tight uppercase text-brand-dark md:text-[32px]">Featured Properties</h2>
               <p className="mt-2 text-base font-medium text-brand-textSecondary md:text-lg">Hand-picked exclusive deals for you</p>
            </div>
            <Link href="/properties" className="text-brand-green font-black text-sm uppercase tracking-widest hover:text-brand-greenHover flex items-center gap-1 group">
              View All Properties 
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M9 18l6-6-6-6"></path></svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProperties.length === 0 ? (
              [1, 2, 3].map(i => <PropertyCardSkeleton key={i} />)
            ) : (
              featuredProperties.map((prop) => (
                <PropertyCard key={prop.slug} property={prop} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="border-y border-gray-100 bg-brand-beige py-14 md:py-24">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16 items-center">
               <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl transition-transform duration-700 lg:-rotate-2 lg:hover:rotate-0">
                  <Image 
                    src="/assets/home/projects/projects-promo.jpg" 
                    alt="Projects" 
                    fill
                    className="object-cover" 
                  />
               </div>
               <div className="space-y-6 md:space-y-8">
                  <h2 className="text-[28px] font-black leading-[1.05] tracking-tight italic uppercase text-brand-dark md:text-5xl">Discover <br /> New Projects</h2>
                  <p className="text-base font-medium leading-relaxed text-brand-textSecondary md:text-lg">
                     Be the first to know about upcoming residential and commercial developments in Bangladesh&apos;s most sought-after locations.
                  </p>
                  <button className="w-full bg-brand-dark px-10 py-4 font-black uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 hover:bg-gray-800 md:w-auto rounded-full">
                     Browse Projects
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* Insights Section */}
      <section className="border-t border-gray-100 bg-white py-14 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
            <div>
               <h2 className="text-2xl font-black tracking-tight uppercase italic text-brand-dark md:text-[32px]">PropertyBikri Insights</h2>
               <p className="mt-2 text-base font-medium italic text-brand-textSecondary md:text-lg">Your guide to real estate in Bangladesh</p>
            </div>
            <button className="text-brand-green font-black text-sm uppercase tracking-widest hover:text-brand-greenHover flex items-center gap-1 group">
              Read All Articles
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M9 18l6-6-6-6"></path></svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
            {[
              { title: "Top 5 Neighborhoods for Families in Dhaka", date: "May 12, 2026", img: "/assets/home/blog/families.jpg" },
              { title: "How to Secure the Best Home Loan in 2026", date: "May 10, 2026", img: "/assets/home/blog/loan.jpg" },
              { title: "The Ultimate Guide to Buying Land in Purbachal", date: "May 08, 2026", img: "/assets/home/blog/land.jpg" }
            ].map((blog, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="relative mb-5 aspect-video overflow-hidden rounded-3xl border border-gray-100 shadow-xl md:mb-6">
                  <Image 
                    src={blog.img} 
                    alt={blog.title} 
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-brand-green">{blog.date}</p>
                <h3 className="text-[20px] font-black leading-[1.1] tracking-tight text-brand-dark transition-colors group-hover:text-brand-green md:text-[22px]">{blog.title}</h3>
                <p className="mt-4 text-[15px] font-medium leading-relaxed text-brand-textSecondary line-clamp-2 opacity-80">
                  Discover everything you need to know about the local property market with our expert-led guides and market analysis...
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Post Property Section */}
      <section className="bg-brand-dark py-12 md:py-20">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="mb-6 text-2xl font-black uppercase tracking-wider text-white md:mb-8 md:text-3xl">List your property with us</h2>
            <Link href="/post-property" className="inline-block rounded bg-brand-green px-12 py-4 font-black uppercase tracking-widest text-white shadow-2xl shadow-brand-green/20 transition-all active:scale-95 hover:bg-brand-greenHover transform hover:-translate-y-1">
               Post Your Property for Free
            </Link>
         </div>
      </section>

    </div>
  );
}
