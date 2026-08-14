"""
Generate SEO_AND_STATIC_MANIFEST.json
Follows Chapters 44-48 of PROPERTYBIKRI_100_CHAPTER_TANSTACK_CLOUDFLARE_MIGRATION_MASTER_PLAN.md
"""

import json
import os
import re

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUTPUT_MANIFEST_PATH = os.path.join(
    BASE_DIR, "real-estate-docs", "05-contracts", "SEO_AND_STATIC_MANIFEST.json"
)

# 1. Static Routes Contract
STATIC_ROUTES = [
    {
        "path": "/",
        "name": "Homepage",
        "title": "PropertyBikri | Real Estate in Bangladesh",
        "type": "marketing_home",
    },
    {
        "path": "/properties",
        "name": "Property Search",
        "title": "Search Properties for Sale and Rent | PropertyBikri",
        "type": "search",
    },
    {
        "path": "/post-property",
        "name": "Post Property CTA",
        "title": "Post Your Property Free | PropertyBikri",
        "type": "conversion",
    },
    {
        "path": "/about",
        "name": "About Us",
        "title": "About Us | PropertyBikri",
        "type": "company",
    },
    {
        "path": "/contact",
        "name": "Contact",
        "title": "Contact Us | PropertyBikri",
        "type": "company",
    },
    {
        "path": "/careers",
        "name": "Careers",
        "title": "Careers | PropertyBikri",
        "type": "company",
    },
    {
        "path": "/advertise",
        "name": "Advertise",
        "title": "Advertise with PropertyBikri",
        "type": "marketing",
    },
    {
        "path": "/privacy",
        "name": "Privacy Policy",
        "title": "Privacy Policy | PropertyBikri",
        "type": "legal",
    },
    {
        "path": "/terms",
        "name": "Terms of Service",
        "title": "Terms of Service | PropertyBikri",
        "type": "legal",
    },
    {
        "path": "/cookies",
        "name": "Cookie Policy",
        "title": "Cookie Policy | PropertyBikri",
        "type": "legal",
    },
    {
        "path": "/auth/login",
        "name": "Login",
        "title": "Login | PropertyBikri",
        "type": "auth",
    },
    {
        "path": "/auth/register",
        "name": "Register",
        "title": "Register | PropertyBikri",
        "type": "auth",
    },
    {
        "path": "/auth/reset",
        "name": "Password Reset",
        "title": "Reset Password | PropertyBikri",
        "type": "auth",
    },
]

# 2. Area definitions and SEO Slugs from seo-pages.ts
AREA_SLUGS = [
    ("gulshan", "Gulshan"),
    ("banani", "Banani"),
    ("bashundhara", "Bashundhara"),
    ("uttara", "Uttara"),
    ("dhanmondi", "Dhanmondi"),
    ("baridhara", "Baridhara"),
    ("mirpur", "Mirpur"),
    ("mohammadpur", "Mohammadpur"),
    ("badda", "Badda"),
    ("purbachal", "Purbachal"),
    ("aftab-nagar", "Aftab Nagar"),
    ("khilkhet", "Khilkhet"),
    ("tejgaon", "Tejgaon"),
    ("rampura", "Rampura"),
    ("wari", "Wari"),
]

CORE_SEO_SLUGS = [
    "properties-for-sale-in-dhaka",
    "property-for-sale-in-dhaka",
    "flat-for-sale-in-dhaka",
    "apartment-for-sale-in-dhaka",
    "house-for-sale-in-dhaka",
    "land-for-sale-in-dhaka",
    "plot-for-sale-in-dhaka",
    "commercial-property-for-sale-in-dhaka",
    "office-space-for-sale-in-dhaka",
    "properties-for-rent-in-dhaka",
    "flat-for-rent-in-dhaka",
    "apartment-for-rent-in-dhaka",
    "house-for-rent-in-dhaka",
    "commercial-property-for-rent-in-dhaka",
    "office-space-for-rent-in-dhaka",
]


def generate_seo_manifest():
    seo_pages = []

    # Add core SEO pages
    for slug in CORE_SEO_SLUGS:
        seo_pages.append(
            {
                "slug": slug,
                "url": f"/{slug}",
                "category": "core_dhaka",
                "city": "Dhaka",
            }
        )

    # Add area combinations
    for slug_prefix, area_name in AREA_SLUGS:
        # Sale area pages
        seo_pages.append(
            {
                "slug": f"flat-for-sale-in-{slug_prefix}",
                "url": f"/flat-for-sale-in-{slug_prefix}",
                "category": "area_apartment_sale",
                "area": area_name,
                "city": "Dhaka",
                "property_type": "apartment",
                "purpose": "sale",
            }
        )
        seo_pages.append(
            {
                "slug": f"apartment-for-sale-in-{slug_prefix}",
                "url": f"/apartment-for-sale-in-{slug_prefix}",
                "category": "area_apartment_sale",
                "area": area_name,
                "city": "Dhaka",
                "property_type": "apartment",
                "purpose": "sale",
            }
        )
        seo_pages.append(
            {
                "slug": f"house-for-sale-in-{slug_prefix}",
                "url": f"/house-for-sale-in-{slug_prefix}",
                "category": "area_house_sale",
                "area": area_name,
                "city": "Dhaka",
                "property_type": "house",
                "purpose": "sale",
            }
        )
        seo_pages.append(
            {
                "slug": f"land-for-sale-in-{slug_prefix}",
                "url": f"/land-for-sale-in-{slug_prefix}",
                "category": "area_land_sale",
                "area": area_name,
                "city": "Dhaka",
                "property_type": "land",
                "purpose": "sale",
            }
        )
        seo_pages.append(
            {
                "slug": f"flat-for-rent-in-{slug_prefix}",
                "url": f"/flat-for-rent-in-{slug_prefix}",
                "category": "area_apartment_rent",
                "area": area_name,
                "city": "Dhaka",
                "property_type": "apartment",
                "purpose": "rent",
            }
        )

    manifest = {
        "generated_at": "2026-08-14T14:58:00Z",
        "static_routes_count": len(STATIC_ROUTES),
        "static_routes": STATIC_ROUTES,
        "seo_landing_pages_count": len(seo_pages),
        "seo_landing_pages": seo_pages,
        "dynamic_feed_routes": [
            {"path": "/sitemap.xml", "mime": "application/xml"},
            {"path": "/robots.txt", "mime": "text/plain"},
        ],
    }

    os.makedirs(os.path.dirname(OUTPUT_MANIFEST_PATH), exist_ok=True)
    with open(OUTPUT_MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(
        f"SEO and Static Manifest created at {OUTPUT_MANIFEST_PATH} with {len(STATIC_ROUTES)} static routes and {len(seo_pages)} SEO landings."
    )


if __name__ == "__main__":
    generate_seo_manifest()
