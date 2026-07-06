"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import ListingEditorForm from "@/components/property/ListingEditorForm";

export default function NewListingPage() {
  const searchParams = useSearchParams();
  const editId = useMemo(() => {
    const raw = searchParams.get("id");
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) ? parsed : null;
  }, [searchParams]);

  return <ListingEditorForm editId={editId} />;
}
