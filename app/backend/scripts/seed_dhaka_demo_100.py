#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import shutil
import sqlite3
import sys
import time
from datetime import datetime, timezone
from pathlib import Path


DEFAULT_DEMO_IMAGE_NAME = "default site banner.png"
DEFAULT_DEMO_IMAGE_STORAGE = f"nextjs-frontend/public/{DEFAULT_DEMO_IMAGE_NAME}"
DEFAULT_DEMO_IMAGE_URL = "https://propertybikri.com/default%20site%20banner.png"
DEMO_DISCLOSURE = (
    "This is a PropertyBikri demo/inquiry listing. Call us for current pictures, price and availability before shortlisting."
)

AREAS = [
    ("Gulshan", 23.7925, 90.4078),
    ("Banani", 23.7937, 90.4043),
    ("Bashundhara", 23.8191, 90.4315),
    ("Uttara", 23.8759, 90.3795),
    ("Dhanmondi", 23.7465, 90.3760),
    ("Baridhara", 23.8045, 90.4206),
    ("Mirpur", 23.8067, 90.3686),
    ("Mohammadpur", 23.7646, 90.3587),
    ("Badda", 23.7805, 90.4267),
    ("Purbachal", 23.8302, 90.5298),
]

AREA_NOTES = {
    "Gulshan": "This is a premium Dhaka address, so I would judge it by road access, lift quality, parking, security and how close it sits to Gulshan 1, Gulshan 2 and diplomatic side roads.",
    "Banani": "Banani works well for buyers who want a central lifestyle without feeling too far from Gulshan, Mohakhali, airport road and daily restaurants or office runs.",
    "Bashundhara": "Bashundhara is a practical family area because schools, hospitals, shopping and wide residential blocks are part of the buying decision here.",
    "Uttara": "Uttara is easier to compare sector by sector, and many buyers like it for airport access, wider roads, schools and planned residential blocks.",
    "Dhanmondi": "Dhanmondi is still one of the strongest old central markets, especially for buyers who care about schools, hospitals, lake access and daily city movement.",
    "Baridhara": "Baridhara is more premium and quieter, so buyers usually look closely at privacy, security, road width, parking and the building profile.",
    "Mirpur": "Mirpur has a wide price range, so the smart move is to compare block, road, transport access, building age and the real usable size.",
    "Mohammadpur": "Mohammadpur is a solid family market with good access to Dhanmondi, Shyamoli and central Dhaka, but exact block and road condition matter a lot.",
    "Badda": "Badda is useful for buyers who need access to Gulshan, Rampura, Aftab Nagar and Pragati Sarani while keeping the budget more practical.",
    "Purbachal": "Purbachal is more future-facing, so land papers, road access, block position, utility plan and long-term development value matter most.",
}

AMENITIES = [
    "Lift",
    "Generator Backup",
    "Security Staff",
    "CCTV Security",
    "Parking",
    "Gas Line",
    "Community Space",
    "Intercom",
    "Rooftop Access",
    "Fire Safety",
]


def slugify(value: str) -> str:
    out = []
    last_dash = False
    for char in value.lower():
        if char.isalnum():
            out.append(char)
            last_dash = False
        elif not last_dash:
            out.append("-")
            last_dash = True
    return "".join(out).strip("-")


def get_demo_image_pool(image_root: Path, dry_run: bool) -> list[Path]:
    target = image_root / DEFAULT_DEMO_IMAGE_NAME
    if dry_run:
        return [target]
    if target.exists() and target.stat().st_size >= 10_000:
        return [target]
    repo_asset = Path(__file__).resolve().parents[3] / "nextjs-frontend" / "public" / DEFAULT_DEMO_IMAGE_NAME
    if repo_asset.exists() and repo_asset.stat().st_size >= 10_000:
        image_root.mkdir(parents=True, exist_ok=True)
        shutil.copy2(repo_asset, target)
        return [target]
    raise RuntimeError(f"Default demo image missing: {target}")


def get_or_create_owner(conn: sqlite3.Connection, dry_run: bool) -> int:
    row = conn.execute("SELECT id FROM users WHERE email = ?", ("demo-owner@propertybikri.com",)).fetchone()
    if row:
        return int(row[0])
    admin = conn.execute("SELECT id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1").fetchone()
    if dry_run:
        return int(admin[0]) if admin else 1
    now = datetime.now(timezone.utc).isoformat()
    conn.execute(
        """
        INSERT INTO users(email, password_hash, role, full_name, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        ("demo-owner@propertybikri.com", "disabled-demo-seed-owner", "client", "PropertyBikri Demo Listings", 0, now),
    )
    return int(conn.execute("SELECT last_insert_rowid()").fetchone()[0])


def listing_mix(area: str, index: int) -> str:
    if area == "Purbachal":
        return "land" if index <= 6 else "apartment"
    if area == "Baridhara":
        return "house" if index <= 4 else "apartment"
    if area == "Bashundhara":
        return "land" if index in (8, 9) else "apartment"
    if area in {"Banani", "Dhanmondi", "Badda"} and index == 10:
        return "commercial"
    if area in {"Gulshan", "Uttara", "Mirpur", "Mohammadpur"} and index == 10:
        return "house"
    return "apartment"


def title_for(area: str, property_type: str, index: int) -> str:
    hooks = [
        "Bright Family",
        "Ready",
        "Corner Side",
        "Well Planned",
        "South Facing",
        "Premium",
        "Practical",
        "Spacious",
        "Quiet Road",
        "Buyer Friendly",
    ]
    type_label = {"apartment": "Flat", "house": "House", "land": "Plot", "commercial": "Commercial Space"}[property_type]
    return f"{hooks[index - 1]} {type_label} for Sale in {area}"


def specs(area: str, property_type: str, index: int) -> dict:
    premium = area in {"Gulshan", "Banani", "Baridhara"}
    if property_type == "land":
        katha = [3, 5, 7, 10, 12, 15][(index - 1) % 6]
        price = (katha * (12_000_000 if area in {"Bashundhara", "Purbachal"} else 18_000_000)) + index * 250_000
        return {
            "bedrooms": None,
            "bathrooms": None,
            "size_value": None,
            "land_size_value": katha,
            "price_amount": price,
            "property_subtype": "residential_plot",
            "plot_type": "residential",
        }
    if property_type == "commercial":
        size = 950 + index * 90
        price = size * (35_000 if premium else 22_000)
        return {
            "bedrooms": None,
            "bathrooms": 2,
            "size_value": size,
            "land_size_value": None,
            "price_amount": price,
            "property_subtype": "office",
            "plot_type": None,
        }
    if property_type == "house":
        size = 2600 + index * 180
        price = size * (25_000 if premium else 16_000)
        return {
            "bedrooms": 4 + (index % 2),
            "bathrooms": 4 + (index % 3),
            "size_value": size,
            "land_size_value": None,
            "price_amount": price,
            "property_subtype": "duplex",
            "plot_type": None,
        }
    size = 1050 + index * 135 + (300 if premium else 0)
    price = size * (20_000 if premium else 12_500)
    return {
        "bedrooms": 2 + (index % 4),
        "bathrooms": 2 + (index % 3),
        "size_value": size,
        "land_size_value": None,
        "price_amount": price,
        "property_subtype": "flat",
        "plot_type": None,
    }


def description_for(area: str, property_type: str, index: int, spec: dict) -> str:
    type_label = {"apartment": "flat", "house": "house", "land": "plot", "commercial": "commercial space"}[property_type]
    area_note = AREA_NOTES[area]
    size_line = (
        f"The size is around {int(spec['size_value'])} sqft, with {spec['bedrooms'] or 'flexible'} rooms and {spec['bathrooms'] or 'planned'} bathrooms."
        if spec["size_value"]
        else f"The land size is around {spec['land_size_value']} katha, so the main thing is to verify papers, road access and boundary position before moving ahead."
    )
    return (
        f"{DEMO_DISCLOSURE}\n\n"
        f"This {type_label} for sale in {area}, Dhaka is added for buyers who want a clear and useful starting point instead of a thin listing with only a price and one line. "
        f"{area_note} {size_line} The layout is planned for normal Dhaka living, so I would check light, ventilation, stair and lift condition, parking access, generator backup and the final usable space during viewing.\n\n"
        f"For a buyer, the good part of this listing is the location logic. It is not only about the building. You should compare how quickly you can reach main roads, schools, hospitals, mosque, kitchen market, office routes and daily transport. "
        f"Price, pictures, document status, floor position and handover condition should be confirmed directly with PropertyBikri before you shortlist it seriously. If you are looking for {type_label} in {area}, keep this one beside two or three nearby options and compare them honestly.\n\n"
        f"My simple advice is this: visit in daylight, ask for ownership papers, check utility bills, confirm parking, and do not decide only from photos. PropertyBikri keeps the listing easy to scan, but the final decision should come after a proper visit and document check."
    )


def nearby_for(area: str) -> list[str]:
    common = {
        "Gulshan": ["Gulshan 1", "Gulshan 2", "Banani", "Baridhara"],
        "Banani": ["Banani 11", "Gulshan", "Mohakhali", "Airport Road"],
        "Bashundhara": ["Jamuna Future Park", "Apollo/ Evercare area", "Nadda", "Khilkhet"],
        "Uttara": ["Uttara Sector Roads", "Airport", "Diabari", "House Building"],
        "Dhanmondi": ["Dhanmondi Lake", "Satmasjid Road", "Kalabagan", "Green Road"],
        "Baridhara": ["Baridhara DOHS", "Gulshan 2", "Diplomatic Zone", "Bashundhara"],
        "Mirpur": ["Mirpur 10", "Kazipara", "Shewrapara", "Pallabi"],
        "Mohammadpur": ["Shyamoli", "Dhanmondi", "Adabor", "Town Hall"],
        "Badda": ["Gulshan Link Road", "Rampura", "Aftab Nagar", "Pragati Sarani"],
        "Purbachal": ["300 Feet Road", "Bashundhara", "Khilkhet", "Kanchan Bridge"],
    }
    return common[area]


def build_listing(area: str, lat: float, lng: float, index: int) -> dict:
    property_type = listing_mix(area, index)
    spec = specs(area, property_type, index)
    title = title_for(area, property_type, index)
    slug = f"pb-demo-{slugify(area)}-{slugify(property_type)}-{index:02d}"
    amenities = AMENITIES[index % 4:index % 4 + 6]
    if len(amenities) < 6:
        amenities += AMENITIES[: 6 - len(amenities)]
    return {
        "title": title,
        "slug": slug,
        "description": description_for(area, property_type, index, spec),
        "listing_purpose": "sale",
        "property_type": property_type,
        "property_subtype": spec["property_subtype"],
        "status": "approved",
        "price_amount": None,
        "price_label": "Call for details",
        "price_visibility": "call_for_price",
        "currency": "BDT",
        "price_period": None,
        "division": "Dhaka",
        "district": "Dhaka",
        "city": "Dhaka",
        "area_name": area,
        "address_line": f"{area} residential area",
        "display_address": f"{area}, Dhaka",
        "bedrooms": spec["bedrooms"],
        "bathrooms": spec["bathrooms"],
        "balconies": 1 + (index % 3) if property_type == "apartment" else None,
        "parking_spaces": 1 if property_type in {"apartment", "commercial"} else 2,
        "floor_number": index if property_type == "apartment" else None,
        "total_floors": 10 + (index % 8) if property_type == "apartment" else None,
        "size_value": spec["size_value"],
        "size_unit": "sqft" if spec["size_value"] else None,
        "land_size_value": spec["land_size_value"],
        "land_size_unit": "katha" if spec["land_size_value"] else None,
        "plot_type": spec["plot_type"],
        "facing": ["South", "East", "North", "West"][index % 4],
        "handover_status": "ready",
        "handover_date": "Ready for viewing",
        "furnishing_status": ["unfurnished", "semi_furnished", "furnished"][index % 3],
        "amenities_json": json.dumps(amenities),
        "nearby_places_json": json.dumps(nearby_for(area)),
        "map_lat": round(lat + (index * 0.0007), 6),
        "map_lng": round(lng + (index * 0.0007), 6),
        "featured": 1 if index in (1, 2) else 0,
    }


def insert_or_update_listing(conn: sqlite3.Connection, owner_id: int, admin_id: int, item: dict, dry_run: bool) -> int:
    existing = conn.execute("SELECT id FROM property_listings WHERE slug = ?", (item["slug"],)).fetchone()
    now = datetime.now(timezone.utc).isoformat()
    values = {
        **item,
        "owner_user_id": owner_id,
        "approved_by_user_id": admin_id,
        "approved_at": now,
        "published_at": now,
        "created_at": now,
        "updated_at": now,
    }
    if dry_run:
        return int(existing[0]) if existing else -1
    columns = [
        "owner_user_id", "title", "slug", "description", "listing_purpose", "property_type", "property_subtype", "status",
        "price_amount", "price_label", "price_visibility", "currency", "price_period", "division", "district", "city",
        "area_name", "address_line", "display_address", "bedrooms", "bathrooms", "balconies", "parking_spaces",
        "floor_number", "total_floors", "size_value", "size_unit", "land_size_value", "land_size_unit", "plot_type",
        "facing", "handover_status", "handover_date", "furnishing_status", "amenities_json", "nearby_places_json",
        "map_lat", "map_lng", "featured", "approved_by_user_id", "approved_at", "published_at", "created_at", "updated_at",
    ]
    if existing:
        listing_id = int(existing[0])
        update_columns = [col for col in columns if col not in {"slug", "created_at"}]
        conn.execute(
            f"UPDATE property_listings SET {', '.join(f'{col} = ?' for col in update_columns)} WHERE id = ?",
            [values[col] for col in update_columns] + [listing_id],
        )
        return listing_id
    conn.execute(
        f"INSERT INTO property_listings ({', '.join(columns)}) VALUES ({', '.join('?' for _ in columns)})",
        [values[col] for col in columns],
    )
    return int(conn.execute("SELECT last_insert_rowid()").fetchone()[0])


def replace_images(conn: sqlite3.Connection, listing_id: int, item: dict, owner_id: int, image_pool: list[Path], image_root: Path, dry_run: bool) -> None:
    if dry_run:
        return
    conn.execute("DELETE FROM property_images WHERE listing_id = ?", (listing_id,))
    image_pool[0]
    conn.execute(
        """
        INSERT INTO property_images(listing_id, storage_path, public_url, alt_text, sort_order, is_cover, uploaded_by_user_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            listing_id,
            DEFAULT_DEMO_IMAGE_STORAGE,
            DEFAULT_DEMO_IMAGE_URL,
            "PropertyBikri demo listing image - call for details and pictures in Dhaka",
            0,
            1,
            owner_id,
            datetime.now(timezone.utc).isoformat(),
        ),
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", default="./realestate_mvp_v1.db")
    parser.add_argument("--image-root", default="./userdata/property-images")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--limit", type=int, default=100)
    args = parser.parse_args()

    db_path = Path(args.db)
    image_root = Path(args.image_root)
    if not db_path.exists():
        print(f"DB not found: {db_path}", file=sys.stderr)
        return 1

    image_pool = get_demo_image_pool(image_root, args.dry_run)
    items = [build_listing(area, lat, lng, index) for area, lat, lng in AREAS for index in range(1, 11)]
    items = items[: args.limit]

    conn = sqlite3.connect(db_path)
    try:
        conn.execute("PRAGMA foreign_keys = ON")
        admin_row = conn.execute("SELECT id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1").fetchone()
        admin_id = int(admin_row[0]) if admin_row else 1
        owner_id = get_or_create_owner(conn, args.dry_run)
        for item in items:
            listing_id = insert_or_update_listing(conn, owner_id, admin_id, item, args.dry_run)
            replace_images(conn, listing_id, item, owner_id, image_pool, image_root, args.dry_run)
        if args.dry_run:
            conn.rollback()
            print(f"DRY RUN: prepared {len(items)} listings across {len(AREAS)} areas.")
        else:
            conn.commit()
            print(f"Seeded/updated {len(items)} listings across {len(AREAS)} areas.")
            time.sleep(0.1)
            count = conn.execute("SELECT count(*) FROM property_listings WHERE slug LIKE 'pb-demo-%'").fetchone()[0]
            print(f"Total pb-demo listings: {count}")
    finally:
        conn.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
