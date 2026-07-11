"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, UserRound } from 'lucide-react';
import { useAuthSession } from "@/lib/use-auth-session";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-brand-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image 
                src="/assets/propertybikri-logo.png" 
                alt="PropertyBikri logo" 
                width={1437} 
                height={355} 
                className="h-auto w-[168px] object-contain sm:w-[196px]"
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
            <Link href={postPropertyHref} className="hidden sm:inline-flex items-center justify-center px-6 py-2 bg-brand-green text-white text-[12px] font-black uppercase tracking-widest rounded shadow-lg shadow-brand-green/20 hover:bg-brand-greenHover transition-all">
              Post Property
            </Link>
            
            <Link href={accountHref} className="flex items-center gap-2 text-brand-dark hover:text-brand-green transition-colors group">
              <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-brand-green">
                <UserRound size={18} strokeWidth={1.9} className="text-gray-400 group-hover:text-brand-green" />
              </div>
              <span className="text-[12px] font-black uppercase tracking-widest hidden lg:inline">{accountLabel}</span>
            </Link>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-brand-dark transition-colors hover:border-brand-green hover:text-brand-green lg:hidden"
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="Close navigation overlay"
              onClick={closeMobileMenu}
            />
            <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <span className="text-sm font-black uppercase tracking-[0.24em] text-brand-dark">Menu</span>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-brand-dark"
                  aria-label="Close navigation menu"
                  onClick={closeMobileMenu}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-col gap-2 px-5 py-5">
                <Link onClick={closeMobileMenu} href="/properties?purpose=sale" className="rounded-xl border border-gray-100 px-4 py-3 text-sm font-bold uppercase tracking-wider text-brand-dark">Buy</Link>
                <Link onClick={closeMobileMenu} href="/properties?purpose=rent" className="rounded-xl border border-gray-100 px-4 py-3 text-sm font-bold uppercase tracking-wider text-brand-dark">Rent</Link>
                <Link onClick={closeMobileMenu} href="/advertise" className="rounded-xl border border-gray-100 px-4 py-3 text-sm font-bold uppercase tracking-wider text-brand-dark">Advertise</Link>
                <Link onClick={closeMobileMenu} href="/about" className="rounded-xl border border-gray-100 px-4 py-3 text-sm font-bold uppercase tracking-wider text-brand-dark">About Us</Link>
                <Link onClick={closeMobileMenu} href={postPropertyHref} className="mt-2 rounded-xl bg-brand-green px-4 py-3 text-sm font-black uppercase tracking-wider text-white">Post Property</Link>
                <Link onClick={closeMobileMenu} href={accountHref} className="rounded-xl border border-gray-100 px-4 py-3 text-sm font-bold uppercase tracking-wider text-brand-dark">{accountLabel}</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
