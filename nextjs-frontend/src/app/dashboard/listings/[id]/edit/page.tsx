"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthSession } from "@/lib/use-auth-session";
import ListingEditorForm from "@/components/property/ListingEditorForm";

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

  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return <div className="p-8 text-red-600">Invalid listing ID.</div>;
  }

  return <ListingEditorForm editId={id} />;
}
