"use client";

import Link from 'next/link';
import { useEffect } from 'react';
import { ChevronLeft, LifeBuoy } from 'lucide-react';
import { getAuthSession } from '@/lib/auth';

export default function PostPropertyPage() {
  useEffect(() => {
    const session = getAuthSession();
    if (session?.access_token) {
      window.location.href = '/dashboard/listings/new';
    }
  }, []);

  return (
    <div className="bg-[#f8f9fb] min-h-screen pb-20">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-400 hover:text-brand-dark transition-colors">
                <ChevronLeft size={24} />
              </Link>
              <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
              <h1 className="text-lg font-bold text-brand-dark hidden sm:block">Sell or Rent your Property</h1>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/help" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-green">
                <LifeBuoy size={18} />
                <span className="hidden md:inline">Need Help?</span>
              </Link>
              <Link href="/auth/login" className="text-sm font-bold text-brand-green border border-brand-green px-4 py-1.5 rounded hover:bg-green-50">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 pt-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-brand-dark mb-3">Post Your Property</h2>
          <p className="text-gray-600">Sign in to create a draft and submit it for review.</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-brand-green/10 text-brand-green px-4 py-1.5 rounded-full text-sm font-bold">
            You are posting this property for FREE!
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
          <div className="space-y-4 text-sm text-gray-700">
            <p>1. Create account or sign in.</p>
            <p>2. Add property details in the dashboard form.</p>
            <p>3. Upload photos and submit for admin review.</p>
            <p>4. Approved listings become public.</p>
          </div>
          <div className="mt-8 flex gap-4">
            <Link href="/auth/login" className="px-6 py-3 bg-brand-green text-white font-bold rounded-md hover:bg-brand-greenHover">
              Sign In
            </Link>
            <Link href="/auth/register" className="px-6 py-3 border border-gray-300 text-brand-dark font-bold rounded-md hover:bg-gray-50">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
