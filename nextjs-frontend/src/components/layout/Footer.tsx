"use client";

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <h3 className="text-[15px] font-black uppercase tracking-[0.1em] mb-6 border-b border-gray-700 pb-2 inline-block">Popular for Sale</h3>
            <ul className="space-y-3 text-sm text-gray-400 font-medium">
              <li><Link href="/properties?purpose=sale&area_name=Gulshan" className="hover:text-brand-green transition-colors">Apartments for sale in Gulshan</Link></li>
              <li><Link href="/properties?purpose=sale&area_name=Banani" className="hover:text-brand-green transition-colors">Apartments for sale in Banani</Link></li>
              <li><Link href="/properties?purpose=sale&area_name=Dhanmondi" className="hover:text-brand-green transition-colors">Apartments for sale in Dhanmondi</Link></li>
              <li><Link href="/properties?purpose=sale&area_name=Uttara" className="hover:text-brand-green transition-colors">Apartments for sale in Uttara</Link></li>
              <li><Link href="/properties?purpose=sale&area_name=Bashundhara" className="hover:text-brand-green transition-colors">Apartments for sale in Bashundhara</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-[15px] font-black uppercase tracking-[0.1em] mb-6 border-b border-gray-700 pb-2 inline-block">Popular for Rent</h3>
            <ul className="space-y-3 text-sm text-gray-400 font-medium">
              <li><Link href="/properties?purpose=rent&area_name=Gulshan" className="hover:text-brand-green transition-colors">Apartments for rent in Gulshan</Link></li>
              <li><Link href="/properties?purpose=rent&area_name=Banani" className="hover:text-brand-green transition-colors">Apartments for rent in Banani</Link></li>
              <li><Link href="/properties?purpose=rent&area_name=Uttara" className="hover:text-brand-green transition-colors">Apartments for rent in Uttara</Link></li>
              <li><Link href="/properties?purpose=rent&area_name=Baridhara" className="hover:text-brand-green transition-colors">Apartments for rent in Baridhara</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-[15px] font-black uppercase tracking-[0.1em] mb-6 border-b border-gray-700 pb-2 inline-block">Corporate</h3>
            <ul className="space-y-3 text-sm text-gray-400 font-medium">
              <li><Link href="/about" className="hover:text-brand-green transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-brand-green transition-colors">Contact Us</Link></li>
              <li><Link href="/careers" className="hover:text-brand-green transition-colors">Careers</Link></li>
              <li><Link href="/terms" className="hover:text-brand-green transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-brand-green transition-colors">Privacy Policy</Link></li>
              <li><Link href="/advertise" className="hover:text-brand-green transition-colors">Advertise with Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-[15px] font-black uppercase tracking-[0.1em] mb-6 border-b border-gray-700 pb-2 inline-block">Connect With Us</h3>
            <div className="flex space-x-4 mb-8">
              {/* Facebook */}
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-brand-green transition-all transform hover:-translate-y-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              {/* Twitter */}
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-brand-green transition-all transform hover:-translate-y-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              {/* Linkedin */}
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-brand-green transition-all transform hover:-translate-y-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              {/* Instagram */}
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-brand-green transition-all transform hover:-translate-y-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              {/* Youtube */}
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-brand-green transition-all transform hover:-translate-y-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.42 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.42-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
              </a>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
              <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3">Language Selection</p>
              <div className="flex gap-4">
                <button className="text-sm font-black text-white hover:text-brand-green transition-colors">ENGLISH</button>
                <span className="text-gray-600">|</span>
                <button className="text-sm font-black text-gray-500 hover:text-brand-green transition-colors">বাংলা</button>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
          <p>&copy; {new Date().getFullYear()} PropertyBikri. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/sitemap" className="hover:text-brand-green">Sitemap</Link>
            <Link href="/cookies" className="hover:text-brand-green">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
