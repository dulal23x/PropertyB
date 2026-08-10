import type { Metadata } from "next";
import PropertiesClient from "@/components/properties/PropertiesClient";
import { PRIMARY_SITE_DESCRIPTION, PRIMARY_SITE_KEYWORD } from "@/lib/seo-keywords";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(searchParams: SearchParams, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

function normalizedPurpose(searchParams: SearchParams) {
  const value = firstParam(searchParams, "purpose") || firstParam(searchParams, "listing_purpose");
  if (value === "rent") return "rent";
  return "sale";
}

function hasNonCanonicalFilters(searchParams: SearchParams) {
  const allowed = new Set(["purpose", "listing_purpose"]);
  return Object.keys(searchParams).some((key) => {
    if (allowed.has(key)) return false;
    const value = firstParam(searchParams, key);
    return value !== undefined && value !== "";
  });
}

export function generateMetadata({ searchParams }: { searchParams: SearchParams }): Metadata {
  const purpose = normalizedPurpose(searchParams);
  const noindex = hasNonCanonicalFilters(searchParams);

  if (purpose === "rent") {
    return {
      title: "Properties for Rent in Dhaka | Flats, Houses & Commercial",
      description: "Browse rental properties in Dhaka including flats, apartments, houses and commercial spaces with direct PropertyBikri contact options.",
      alternates: { canonical: "/properties?purpose=rent" },
      robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
      openGraph: {
        title: "Properties for Rent in Dhaka | PropertyBikri",
        description: "Browse rental properties in Dhaka with direct contact options.",
        url: "https://propertybikri.com/properties?purpose=rent",
        siteName: "PropertyBikri",
        type: "website",
      },
    };
  }

  return {
    title: `${PRIMARY_SITE_KEYWORD} | PropertyBikri`,
    description: PRIMARY_SITE_DESCRIPTION,
    alternates: { canonical: "/properties?purpose=sale" },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: `${PRIMARY_SITE_KEYWORD} | PropertyBikri`,
      description: PRIMARY_SITE_DESCRIPTION,
      url: "https://propertybikri.com/properties?purpose=sale",
      siteName: "PropertyBikri",
      type: "website",
    },
  };
}

export default function PropertiesPage() {
  return <PropertiesClient />;
}
