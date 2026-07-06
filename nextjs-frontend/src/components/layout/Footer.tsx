"use client";

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-brand-dark pb-8 pt-12 text-white md:pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-4 lg:gap-12">
          <div>
            <h3 className="mb-5 inline-block border-b border-gray-700 pb-2 text-[15px] font-black uppercase tracking-[0.1em]">Popular for Sale</h3>
            <ul className="space-y-3 text-sm font-medium text-gray-400">
              <li><Link href="/properties?purpose=sale&area_name=Gulshan" className="transition-colors hover:text-brand-green">Apartments for sale in Gulshan</Link></li>
              <li><Link href="/properties?purpose=sale&area_name=Banani" className="transition-colors hover:text-brand-green">Apartments for sale in Banani</Link></li>
              <li><Link href="/properties?purpose=sale&area_name=Dhanmondi" className="transition-colors hover:text-brand-green">Apartments for sale in Dhanmondi</Link></li>
              <li><Link href="/properties?purpose=sale&area_name=Uttara" className="transition-colors hover:text-brand-green">Apartments for sale in Uttara</Link></li>
              <li><Link href="/properties?purpose=sale&area_name=Bashundhara" className="transition-colors hover:text-brand-green">Apartments for sale in Bashundhara</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-5 inline-block border-b border-gray-700 pb-2 text-[15px] font-black uppercase tracking-[0.1em]">Popular for Rent</h3>
            <ul className="space-y-3 text-sm font-medium text-gray-400">
              <li><Link href="/properties?purpose=rent&area_name=Gulshan" className="transition-colors hover:text-brand-green">Apartments for rent in Gulshan</Link></li>
              <li><Link href="/properties?purpose=rent&area_name=Banani" className="transition-colors hover:text-brand-green">Apartments for rent in Banani</Link></li>
              <li><Link href="/properties?purpose=rent&area_name=Uttara" className="transition-colors hover:text-brand-green">Apartments for rent in Uttara</Link></li>
              <li><Link href="/properties?purpose=rent&area_name=Baridhara" className="transition-colors hover:text-brand-green">Apartments for rent in Baridhara</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-5 inline-block border-b border-gray-700 pb-2 text-[15px] font-black uppercase tracking-[0.1em]">Corporate</h3>
            <ul className="space-y-3 text-sm font-medium text-gray-400">
              <li><Link href="/about" className="transition-colors hover:text-brand-green">About Us</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-brand-green">Contact Us</Link></li>
              <li><Link href="/careers" className="transition-colors hover:text-brand-green">Careers</Link></li>
              <li><Link href="/terms" className="transition-colors hover:text-brand-green">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="transition-colors hover:text-brand-green">Privacy Policy</Link></li>
              <li><Link href="/advertise" className="transition-colors hover:text-brand-green">Advertise with Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-5 inline-block border-b border-gray-700 pb-2 text-[15px] font-black uppercase tracking-[0.1em]">Connect With Us</h3>
            <div className="mb-6 flex flex-wrap gap-4">
              {/* Facebook */}
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition-all hover:-translate-y-1 hover:bg-brand-green">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              {/* Twitter */}
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition-all hover:-translate-y-1 hover:bg-brand-green">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              {/* Linkedin */}
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition-all hover:-translate-y-1 hover:bg-brand-green">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              {/* Instagram */}
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition-all hover:-translate-y-1 hover:bg-brand-green">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              {/* Youtube */}
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition-all hover:-translate-y-1 hover:bg-brand-green">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.42 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.42-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
              </a>
            </div>
            <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4">
              <p className="mb-3 text-[11px] font-black uppercase tracking-widest text-gray-500">Language Selection</p>
              <div className="flex flex-wrap gap-3">
                <button className="text-sm font-black text-white transition-colors hover:text-brand-green">ENGLISH</button>
                <span className="text-gray-600">|</span>
                <button className="text-sm font-black text-gray-500 transition-colors hover:text-brand-green">à¦¬à¦¾à¦‚à¦²à¦¾</button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 text-center text-xs font-bold uppercase tracking-widest text-gray-500 md:flex-row md:text-left">
          <p>&copy; {new Date().getFullYear()} PropertyBikri. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 md:justify-start md:gap-6">
            <Link href="/sitemap" className="hover:text-brand-green">Sitemap</Link>
            <Link href="/cookies" className="hover:text-brand-green">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
