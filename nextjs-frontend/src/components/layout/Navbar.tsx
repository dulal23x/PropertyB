"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, UserRound } from 'lucide-react';
import { useAuthSession } from "@/lib/use-auth-session";

const mainMenuItems = [
  { label: "Buy Apartments", shortLabel: "Buy Apartments", href: "/apartment-for-sale-in-dhaka" },
  { label: "Buy House", shortLabel: "Buy House", href: "/house-for-sale-in-dhaka" },
  { label: "Buy Land", shortLabel: "Buy Land", href: "/land-for-sale-in-dhaka" },
  { label: "Commercial Properties", shortLabel: "Commercial", href: "/commercial-property-for-sale-in-dhaka" },
  { label: "Advertise", shortLabel: "Advertise", href: "/advertise" },
  { label: "About Us", shortLabel: "About", href: "/about" },
];

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
        <div className="flex h-16 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center">
            <Link href="/" aria-label="PropertyBikri home" className="flex-shrink-0 flex items-center">
              <Image 
                src="/assets/propertybikri-logo.png" 
                alt="PropertyBikri logo" 
                width={1437} 
                height={355} 
                className="h-auto w-[152px] object-contain sm:w-[176px] xl:w-[190px]"
                priority 
              />
              <span className="sr-only">PropertyBikri</span>
            </Link>
            <nav className="hidden xl:ml-5 xl:flex xl:items-center xl:gap-1 2xl:ml-7 2xl:gap-2">
              {mainMenuItems.map((item) => (
                <Link key={item.href} href={item.href} className="whitespace-nowrap px-1.5 py-2 text-[11px] font-black uppercase tracking-normal text-brand-dark transition-colors hover:text-brand-green 2xl:px-2 2xl:text-[12px]">
                  {item.shortLabel}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link href={postPropertyHref} className="hidden h-9 items-center justify-center whitespace-nowrap rounded bg-brand-green px-3 text-[11px] font-black uppercase tracking-normal text-white shadow-md shadow-brand-green/15 transition-all hover:bg-brand-greenHover sm:inline-flex lg:px-4 2xl:px-5 2xl:tracking-widest">
              Post Property
            </Link>
            
            <Link href={accountHref} className="flex items-center gap-2 text-brand-dark hover:text-brand-green transition-colors group">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 group-hover:border-brand-green">
                <UserRound size={18} strokeWidth={1.9} className="text-gray-400 group-hover:text-brand-green" />
              </div>
              <span className="hidden whitespace-nowrap text-[11px] font-black uppercase tracking-normal xl:inline 2xl:text-[12px] 2xl:tracking-widest">{accountLabel}</span>
            </Link>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-brand-dark transition-colors hover:border-brand-green hover:text-brand-green xl:hidden"
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[60] xl:hidden">
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
                {mainMenuItems.map((item) => (
                  <Link key={item.href} onClick={closeMobileMenu} href={item.href} className="rounded-xl border border-gray-100 px-4 py-3 text-sm font-bold uppercase tracking-wider text-brand-dark">
                    {item.label}
                  </Link>
                ))}
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
