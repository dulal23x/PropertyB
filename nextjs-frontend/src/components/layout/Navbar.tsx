"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useAuthSession } from "@/lib/use-auth-session";

export default function Navbar() {
  const { loading, isAuthenticated, isAdmin, dashboardHref } = useAuthSession();
  
  const accountLabel = loading
    ? "Account"
    : isAuthenticated
      ? isAdmin
        ? "Admin Dashboard"
        : "Dashboard"
      : "Sign In / Sign Up";
  
  const accountHref = isAuthenticated ? dashboardHref : "/auth/login";
  const postPropertyHref = isAuthenticated
    ? isAdmin
      ? "/admin/properties"
      : "/dashboard/listings/new"
    : "/post-property";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-brand-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image 
                src="/assets/bproperty-logo.svg" 
                alt="Bproperty Logo" 
                width={140} 
                height={30} 
                priority 
              />
            </Link>
            <nav className="hidden lg:ml-8 lg:flex lg:space-x-4">
              <Link href="/properties?purpose=sale" className="text-brand-dark hover:text-brand-green px-2 py-2 text-[13px] font-bold uppercase tracking-wider transition-colors">Buy</Link>
              <Link href="/properties?purpose=rent" className="text-brand-dark hover:text-brand-green px-2 py-2 text-[13px] font-bold uppercase tracking-wider transition-colors">Rent</Link>
              <Link href="/advertise" className="text-brand-dark hover:text-brand-green px-2 py-2 text-[13px] font-bold uppercase tracking-wider transition-colors">Advertise</Link>
              <Link href="/about" className="text-brand-dark hover:text-brand-green px-2 py-2 text-[13px] font-bold uppercase tracking-wider transition-colors">About Us</Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center gap-1 text-[13px] font-black text-brand-dark border-r border-gray-200 pr-6 mr-2">
               <button className="text-brand-green">EN</button>
               <span className="text-gray-300">|</span>
               <button className="hover:text-brand-green transition-colors">BN</button>
            </div>

            <Link href={postPropertyHref} className="hidden sm:inline-flex items-center justify-center px-6 py-2 bg-brand-green text-white text-[12px] font-black uppercase tracking-widest rounded shadow-lg shadow-brand-green/20 hover:bg-brand-greenHover transition-all">
              Post Property
            </Link>
            
            <Link href={accountHref} className="flex items-center gap-2 text-brand-dark hover:text-brand-green transition-colors group">
              <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-brand-green">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-brand-green">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <span className="text-[12px] font-black uppercase tracking-widest hidden lg:inline">{accountLabel}</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
