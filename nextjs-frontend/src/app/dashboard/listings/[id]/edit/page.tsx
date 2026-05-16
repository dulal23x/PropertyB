"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthSession } from "@/lib/use-auth-session";

export default function EditListingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { loading, isAuthenticated, isAdmin } = useAuthSession();

  useEffect(() => {
    if (!loading && (!isAuthenticated || isAdmin)) {
      router.replace(isAuthenticated ? "/admin" : "/auth/login");
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  if (loading || !isAuthenticated || isAdmin) {
    return <div className="p-8">Loading editor...</div>;
  }

  // Redirect to new page with id for temporary compatibility
  router.replace(`/dashboard/listings/new?id=${params.id}`);
  
  return <div className="p-8">Redirecting...</div>;
}
