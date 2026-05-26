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
      <section className="relative h-[480px] md:h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image - Locally Hosted */}
        <Image 
          src="/assets/home/hero/hero-bg.jpg"
          alt="PropertyBikri Hero"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        
        <div className="relative z-10 w-full max-w-5xl px-4 text-center mt-[-40px] md:mt-[-60px]">
          <h1 className="text-2xl md:text-4xl lg:text-[42px] font-extrabold text-white mb-8 leading-snug tracking-tight drop-shadow-xl max-w-4xl mx-auto">
            Search 10,000+ Houses, Apartments, and Land in Dhaka, Bangladesh
          </h1>
          
          <Suspense fallback={<HeroSearchWidgetSkeleton />}>
            <HeroSearchWidget />
          </Suspense>
        </div>
      </section>

      {/* City Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-[28px] font-black text-brand-dark mb-10 tracking-tight uppercase">Browse properties by city</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
                <div className="absolute bottom-8 left-8 text-white">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-green mb-2">{city.count} Properties</p>
                  <h3 className="text-4xl font-black tracking-tighter">{city.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Property Type Section */}
      <section className="py-20 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-[28px] font-black text-brand-dark mb-10 tracking-tight uppercase text-center md:text-left">Browse properties by type</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[ 
              { label: 'Apartments', value: 'apartment', count: '6,214' },
              { label: 'Houses', value: 'house', count: '1,452' },
              { label: 'Commercial', value: 'commercial', count: '942' },
              { label: 'Land', value: 'land', count: '1,120' },
              { label: 'Duplex', value: 'other', count: '241' }
            ].map((cat) => (
              <Link key={cat.label} href={`/properties?property_type=${cat.value}&listing_purpose=sale`} className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 text-center flex flex-col items-center group">
                <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center text-brand-green mb-6 group-hover:bg-brand-green group-hover:text-white transition-colors">
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
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
               <h2 className="text-2xl md:text-[32px] font-black text-brand-dark tracking-tight uppercase">Featured Properties</h2>
               <p className="text-brand-textSecondary font-medium mt-2 text-lg">Hand-picked exclusive deals for you</p>
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
      <section className="py-24 bg-brand-beige border-y border-gray-100">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
               <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-700">
                  <Image 
                    src="/assets/home/projects/projects-promo.jpg" 
                    alt="Projects" 
                    fill
                    className="object-cover" 
                  />
               </div>
               <div className="space-y-8">
                  <h2 className="text-3xl md:text-5xl font-black text-brand-dark leading-tight tracking-tight italic uppercase">Discover <br /> New Projects</h2>
                  <p className="text-brand-textSecondary text-lg font-medium leading-relaxed">
                     Be the first to know about upcoming residential and commercial developments in Bangladesh&apos;s most sought-after locations.
                  </p>
                  <button className="bg-brand-dark text-white font-black py-4 px-10 rounded-full uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl active:scale-95">
                     Browse Projects
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* Insights Section */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
               <h2 className="text-2xl md:text-[32px] font-black text-brand-dark tracking-tight uppercase italic">PropertyBikri Insights</h2>
               <p className="text-brand-textSecondary font-medium mt-2 text-lg italic">Your guide to real estate in Bangladesh</p>
            </div>
            <button className="text-brand-green font-black text-sm uppercase tracking-widest hover:text-brand-greenHover flex items-center gap-1 group">
              Read All Articles
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M9 18l6-6-6-6"></path></svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { title: "Top 5 Neighborhoods for Families in Dhaka", date: "May 12, 2026", img: "/assets/home/blog/families.jpg" },
              { title: "How to Secure the Best Home Loan in 2026", date: "May 10, 2026", img: "/assets/home/blog/loan.jpg" },
              { title: "The Ultimate Guide to Buying Land in Purbachal", date: "May 08, 2026", img: "/assets/home/blog/land.jpg" }
            ].map((blog, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="relative aspect-video rounded-3xl overflow-hidden mb-6 shadow-xl border border-gray-100">
                  <Image 
                    src={blog.img} 
                    alt={blog.title} 
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-brand-green text-[10px] font-black uppercase tracking-[0.25em] mb-3">{blog.date}</p>
                <h3 className="text-[22px] font-black text-brand-dark group-hover:text-brand-green transition-colors leading-[1.1] tracking-tight">{blog.title}</h3>
                <p className="text-brand-textSecondary text-[15px] mt-4 font-medium line-clamp-2 leading-relaxed opacity-80">
                  Discover everything you need to know about the local property market with our expert-led guides and market analysis...
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Post Property Section */}
      <section className="py-20 bg-brand-dark">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-8 tracking-wider uppercase">List your property with us</h2>
            <Link href="/post-property" className="inline-block bg-brand-green text-white font-black py-4 px-12 rounded uppercase tracking-widest hover:bg-brand-greenHover transition-all transform hover:-translate-y-1 active:scale-95 shadow-2xl shadow-brand-green/20">
               Post Your Property for Free
            </Link>
         </div>
      </section>

    </div>
  );
}
