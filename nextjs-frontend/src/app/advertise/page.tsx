"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Check, Users, Layout, Globe, Zap, BarChart3, Mail, Phone, ChevronRight } from 'lucide-react';

export default function AdvertisePage() {
  const [valleyType, setValleyType] = useState<'inside' | 'outside'>('inside');

  return (
    <div className="bg-white min-h-screen">
      
      {/* Phase 2: Hero Section */}
      <section className="relative h-[450px] md:h-[550px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        
        <div className="relative z-10 w-full max-w-5xl px-4 text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight drop-shadow-xl tracking-tight">
            Maximize Your Property&apos;s <br className="hidden md:block" /> Reach Across Bangladesh
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
            Promote your listing to the right audience across multiple social platforms - for quicker deals
          </p>
          <Link href="/post-property" className="inline-block bg-brand-green text-white font-black text-sm md:text-base py-4 px-10 rounded uppercase tracking-widest hover:bg-brand-greenHover transition-all shadow-lg shadow-brand-green/30 active:scale-95">
            Promote My Property
          </Link>
        </div>
      </section>

      {/* Phase 3: Service Plans - Layout & Toggle */}
      <section className="py-20 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-brand-dark mb-6">Property Promotion Plans</h2>
            <div className="flex justify-center mt-8">
              <div className="bg-white p-1 rounded-full border border-gray-200 shadow-sm flex">
                <button 
                  onClick={() => setValleyType('inside')}
                  className={`px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${valleyType === 'inside' ? 'bg-brand-green text-white shadow-md' : 'text-gray-400 hover:text-brand-dark'}`}
                >
                  Inside Valley
                </button>
                <button 
                  onClick={() => setValleyType('outside')}
                  className={`px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${valleyType === 'outside' ? 'bg-brand-green text-white shadow-md' : 'text-gray-400 hover:text-brand-dark'}`}
                >
                  Outside Valley
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            {/* Phase 4: Service Plans - Feature Lists */}
            <div className="bg-white rounded-2xl border-2 border-brand-green shadow-xl overflow-hidden transform transition-all hover:scale-[1.02]">
              <div className="bg-brand-green p-8 text-center text-white">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                  <Zap size={32} className="fill-current" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">
                  {valleyType === 'inside' ? 'Standard Plan' : 'Digital Plan'}
                </h3>
                <div className="text-4xl font-black leading-none">
                   <span className="text-xl align-top mr-1 font-bold">BDT</span>
                   {valleyType === 'inside' ? '25,000' : '12,000'}
                </div>
                <p className="mt-2 text-white/80 text-sm font-bold uppercase tracking-widest italic">Per Property</p>
              </div>
              
              <div className="p-8">
                <ul className="space-y-4">
                  {[
                    valleyType === 'inside' ? 'Professional Videography & Photography' : 'Client-provided Photos & Videos',
                    'Listing valid until property is sold/rented',
                    'Strategic Social Media Promotion (FB, IG, TikTok)',
                    'Paid Ad Boosting for targeted reach',
                    '2 Custom Video Creatives',
                    '2 High-impact Graphic Designs',
                    '3-Month Dedicated Marketing Contract',
                    'Cross-promotion across PropertyBikri network'
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[15px] font-medium text-gray-700">
                      <div className="mt-1 shrink-0 text-brand-green">
                        <Check size={18} strokeWidth={3} />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-10">
                  <Link href="/post-property" className="block w-full text-center bg-brand-dark text-white font-black py-4 rounded uppercase tracking-widest hover:bg-gray-800 transition-colors">
                    Choose Plan
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Phase 5-6: "Drive Quality Leads" Section - Benefit Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-brand-dark mb-4 tracking-tight">Drive Quality Leads with Targeted Property Ads</h2>
          <p className="text-brand-textSecondary font-medium mb-16 max-w-2xl mx-auto">Our data-driven approach ensures your property stands out and reaches serious buyers.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {[
              { icon: <Users size={32} />, title: "Precision Audience Targeting", desc: "Targeting based on detailed demographics, interests, and real-time search behavior." },
              { icon: <Layout size={32} />, title: "High-Impact Creative Design", desc: "Scroll-stopping visuals and high-definition property videos designed for social engagement." },
              { icon: <Globe size={32} />, title: "Multi-Platform Ad Placement", desc: "Your property promoted across Facebook, Instagram, TikTok, and partner networks." },
              { icon: <Zap size={32} />, title: "Instant Lead Delivery", desc: "Real-time inquiry alerts sent directly to you, ensuring you never miss a potential deal." },
              { icon: <BarChart3 size={32} />, title: "Performance Optimization", desc: "Continuous ad monitoring and monthly performance reports to maximize your ROI." }
            ].map((benefit, idx) => (
              <div key={idx} className="p-8 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-shadow duration-300 group">
                <div className="w-16 h-16 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green mb-6 group-hover:bg-brand-green group-hover:text-white transition-colors">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-black text-brand-dark mb-3 leading-tight">{benefit.title}</h3>
                <p className="text-brand-textSecondary text-sm leading-relaxed font-medium">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Phase 7: Stats & Trusted Partners Section */}
      <section className="bg-brand-dark text-white overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 p-12 md:p-24 space-y-10">
             <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight">Smarter Property Marketing <br /> Backed by Results</h2>
             <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-4xl lg:text-5xl font-black text-brand-green mb-2 tracking-tighter">7,800+</div>
                  <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Properties Sold</p>
                </div>
                <div>
                  <div className="text-4xl lg:text-5xl font-black text-brand-green mb-2 tracking-tighter">8,000+</div>
                  <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Campaigns Boosted</p>
                </div>
             </div>
             <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-md">
                Our verified network of developers and professional agents ensures that your property is in the best hands from campaign launch to final deal.
             </p>
          </div>
          <div className="w-full md:w-1/2 h-[400px] md:h-[600px] relative">
             <div 
               className="absolute inset-0 bg-cover bg-center grayscale-[20%] hover:grayscale-0 transition-all duration-700"
               style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')" }}
             />
          </div>
        </div>
      </section>

      {/* Phase 8: FAQ & Support Illustration */}
      <section className="py-24 bg-brand-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-12 md:p-20 shadow-2xl shadow-black/5 flex flex-col md:flex-row items-center gap-16 border border-gray-100">
            <div className="w-full md:w-1/3">
               <div className="relative aspect-square rounded-full bg-brand-green/10 flex items-center justify-center p-8 overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-green to-transparent animate-pulse" />
                  <div
                    className="relative z-10 w-full h-full min-h-[280px] bg-contain bg-center bg-no-repeat transform hover:rotate-3 transition-transform duration-500"
                    style={{ backgroundImage: "url('https://placehold.co/400x400/transparent/64748b?text=Support+Illustration')" }}
                    aria-label="Support illustration"
                    role="img"
                  />
               </div>
            </div>
            <div className="w-full md:w-2/3 space-y-8">
               <h2 className="text-3xl md:text-4xl font-black text-brand-dark tracking-tight leading-tight">Need Help? <br /> We are here for you.</h2>
               <p className="text-brand-textSecondary text-lg font-medium leading-relaxed">
                  Have questions about our promotion plans? Reach out to our dedicated support team through email or phone number.
               </p>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-brand-light/50">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-brand-green"><Mail size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Us</p>
                      <p className="font-bold text-brand-dark">info@propertybikri.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-brand-light/50">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-brand-green"><Phone size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Call Us</p>
                      <p className="font-bold text-brand-dark">+880 1000 000000</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Phase 9: Final CTA - Conversion Zone */}
      <section className="py-24 bg-brand-green relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32" />
        
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tighter leading-none italic uppercase">Ready to Sell Faster?</h2>
          <p className="text-white/90 text-xl font-bold mb-12 max-w-2xl mx-auto leading-relaxed">
             Join thousands of successful owners who boosted their listings to reach over 10 million potential buyers.
          </p>
          <Link href="/post-property" className="inline-flex items-center gap-3 bg-white text-brand-green font-black py-5 px-14 rounded shadow-2xl hover:bg-brand-light transition-all transform hover:-translate-y-1 active:scale-95 group">
            GET STARTED TODAY
            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

    </div>
  );
}
