"use client";

import Link from 'next/link';
import { BadgeCheck, Globe, Mail, MessageCircleMore, PhoneCall, Users } from "lucide-react";

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
              <a href="#" aria-label="Visit our website" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition-all hover:-translate-y-1 hover:bg-brand-green">
                <Globe size={18} strokeWidth={2.1} />
              </a>
              <a href="#" aria-label="Email us" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition-all hover:-translate-y-1 hover:bg-brand-green">
                <Mail size={18} strokeWidth={2.1} />
              </a>
              <a href="#" aria-label="Call us" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition-all hover:-translate-y-1 hover:bg-brand-green">
                <PhoneCall size={18} strokeWidth={2.1} />
              </a>
              <a href="#" aria-label="Community updates" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition-all hover:-translate-y-1 hover:bg-brand-green">
                <Users size={18} strokeWidth={2.1} />
              </a>
              <a href="#" aria-label="Message us" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition-all hover:-translate-y-1 hover:bg-brand-green">
                <MessageCircleMore size={18} strokeWidth={2.1} />
              </a>
              <a href="#" aria-label="Trusted support" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition-all hover:-translate-y-1 hover:bg-brand-green">
                <BadgeCheck size={18} strokeWidth={2.1} />
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
