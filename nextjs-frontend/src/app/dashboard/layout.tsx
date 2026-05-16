"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthSession } from '@/lib/use-auth-session';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { loading, user, isAuthenticated, isAdmin, logout } = useAuthSession();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace("/auth/login");
      } else if (isAdmin) {
        router.replace("/admin");
      }
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  if (loading || !isAuthenticated || isAdmin) {
    return <div className="min-h-screen bg-gray-50 p-8 text-sm text-gray-600">Accessing Dashboard...</div>;
  }

  const name = user?.full_name || user?.email || 'Property Owner';

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Dashboard Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-brand-border p-4 sticky top-24">
              <div className="mb-6 pb-4 border-b">
                <p className="text-sm text-gray-500">Welcome,</p>
                <p className="font-bold text-brand-dark">{name}</p>
              </div>
              <nav className="space-y-2">
                <Link href="/dashboard" className="block px-4 py-2 rounded-md hover:bg-gray-50 text-gray-700 font-medium">
                  Dashboard Overview
                </Link>
                <Link href="/dashboard/listings" className="block px-4 py-2 rounded-md hover:bg-gray-50 text-gray-700 font-medium">
                  My Properties
                </Link>
                <Link href="/dashboard/listings/new" className="block px-4 py-2 rounded-md hover:bg-gray-50 text-gray-700 font-medium">
                  Post New Property
                </Link>
                <Link href="/dashboard/profile" className="block px-4 py-2 rounded-md hover:bg-gray-50 text-gray-700 font-medium">
                  Profile Settings
                </Link>
                <button onClick={() => logout()} className="block w-full text-left px-4 py-2 rounded-md hover:bg-red-50 text-red-600 font-medium mt-4">
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Dashboard Main Content */}
          <main className="flex-1">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}
