import os
import re
import asyncio
import shutil
import requests
from urllib.parse import urljoin, urlparse
from pathlib import Path
from bs4 import BeautifulSoup
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timezone

# Add backend to sys.path to import models
import sys
sys.path.append(os.path.join(os.getcwd(), "app", "backend"))

from app.models.entities import PropertyListing, PropertyImage, User
from app.core.security import hash_password

# Configuration
CLONE_DIR = "propertybikri_clone/properties"
DB_PATH = "app/backend/realestate_mvp_v1.db"
DATABASE_URL = f"sqlite+aiosqlite:///{DB_PATH}"
USERDATA_IMG_DIR = "app/backend/userdata/properties"

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

def parse_price(price_str):
    if not price_str:
        return None, None
    
    # Example: "৳ ৫০ লক্ষ", "৳ ৩ কোটি ৩০ লক্ষ", "৳ ২৮ হাজার"
    clean_price = price_str.replace("৳", "").strip()
    
    # Handle Bengali numbers if any (though usually they are English in the price field)
    # Simple conversion for "লক্ষ", "কোটি", "হাজার"
    multiplier = 1
    if "লক্ষ" in clean_price:
        multiplier = 100000
    elif "কোটি" in clean_price:
        multiplier = 10000000
    elif "হাজার" in clean_price:
        multiplier = 1000
    
    # Extract number
    match = re.search(r"(\d+(\.\d+)?)", clean_price)
    if match:
        val = float(match.group(1))
        return val * multiplier, price_str
    return None, price_str

def parse_spec(text):
    # Match numbers followed by keywords
    # ৩ বেডরুম, ২ বাথরুম, ১২০০ বর্গফুট
    match = re.search(r"(\d+)\s*(বেডরুম|বাথরুম|বর্গফুট|কাঠা)", text)
    if match:
        val = int(match.group(1))
        unit = match.group(2)
        return val, unit
    return None, None

async def integrate_properties():
    if not os.path.exists(CLONE_DIR):
        print(f"Clone directory {CLONE_DIR} not found.")
        return

    async with async_session() as session:
        # Get or create admin user
        admin_email = "admin@propertybikri.com"
        result = await session.execute(text(f"SELECT id FROM users WHERE email = '{admin_email}'"))
        user_row = result.fetchone()
        if not user_row:
            admin_user = User(
                email=admin_email,
                password_hash=hash_password("admin123"),
                role="admin",
                full_name="System Admin",
                is_active=True
            )
            session.add(admin_user)
            await session.commit()
            await session.refresh(admin_user)
            admin_id = admin_user.id
        else:
            admin_id = user_row[0]

        files = [f for f in os.listdir(CLONE_DIR) if f.endswith(".html")]
        print(f"Found {len(files)} property files to integrate.")

        for filename in files:
            path = os.path.join(CLONE_DIR, filename)
            slug = filename.replace(".html", "")
            
            with open(path, "r", encoding="utf-8") as f:
                soup = BeautifulSoup(f, 'html.parser')
            
            # Extract from Meta Tags
            og_title = soup.find('meta', property='og:title')
            og_desc = soup.find('meta', property='og:description')
            
            title = og_title['content'].strip() if og_title else slug
            description = og_desc['content'].strip() if og_desc else "No description available."
            
            price_text = ""
            price_tag = soup.find(string=re.compile("৳"))
            if price_tag:
                price_text = price_tag.parent.text.strip()
            
            price_amount, price_label = parse_price(price_text)
            
            # Extract Specs from og_description using regex
            # * Bedroom : 3
            # * Bathroom : 3
            # * Flat Size : Type A- 1430 sft
            beds = None
            baths = None
            size = None
            size_unit = "sqft"
            
            if og_desc:
                desc_content = og_desc['content']
                bed_match = re.search(r"Bedroom\s*:\s*(\d+)", desc_content, re.IGNORECASE)
                bath_match = re.search(r"Bathroom\s*:\s*(\d+)", desc_content, re.IGNORECASE)
                size_match = re.search(r"(\d+)\s*sft", desc_content, re.IGNORECASE)
                katha_match = re.search(r"(\d+(\.\d+)?)\s*Katha", desc_content, re.IGNORECASE)
                
                if bed_match: beds = int(bed_match.group(1))
                if bath_match: baths = int(bath_match.group(1))
                if size_match: size = float(size_match.group(1)); size_unit = "sqft"
                elif katha_match: size = float(katha_match.group(1)); size_unit = "katha"

            # Location from title or description
            area = ""
            city = ""
            loc_match = re.search(r"in\s+([\w\s]+),", title, re.IGNORECASE)
            if loc_match:
                area = loc_match.group(1).strip()
            
            city_match = re.search(r"Location:\s*.*,\s*.*,\s*([\w\s]+)\.", description, re.IGNORECASE)
            if city_match:
                city = city_match.group(1).strip()
            elif "Dhaka" in description:
                city = "Dhaka"

            # Determine Purpose
            purpose = "sale"
            if "rent" in title.lower() or "ভাড়া" in title or "Rent" in title:
                purpose = "rent"

            # Determine Property Type
            ptype = "Apartment"
            if "plot" in title.lower() or "land" in title.lower() or "জমি" in title or "প্লট" in title:
                ptype = "Plot"
            elif "commercial" in title.lower() or "shop" in title.lower() or "দোকান" in title:
                ptype = "Commercial"

            # Create Listing
            db_listing = PropertyListing(
                owner_user_id=admin_id,
                title=title,
                slug=slug,
                description=description,
                listing_purpose=purpose,
                property_type=ptype,
                status="approved",
                price_amount=price_amount,
                price_label=price_label,
                currency="BDT",
                city=city if city else "Dhaka",
                area_name=area,
                bedrooms=beds,
                bathrooms=baths,
                size_value=float(size) if size else None,
                size_unit=size_unit,
                approved_by_user_id=admin_id,
                approved_at=datetime.now(timezone.utc),
                published_at=datetime.now(timezone.utc),
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            
            # Delete existing to allow rerun
            from sqlalchemy import delete, select
            await session.execute(delete(PropertyListing).where(PropertyListing.slug == slug))
                
            session.add(db_listing)
            await session.commit()
            await session.refresh(db_listing)

            # Images
            img_tags = soup.find_all('img')
            processed_images = set()
            
            for i, img in enumerate(img_tags):
                src = img.get('src')
                if not src or "logo" in src.lower() or "avatar" in src.lower() or src in processed_images:
                    continue
                
                processed_images.add(src)
                filename = ""
                success = False
                
                # Case 1: Localized path (../assets/images/...)
                if src.startswith("../"):
                    clean_src = src.replace("../", "")
                    src_path = os.path.join("propertybikri_clone", clean_src)
                    if os.path.exists(src_path):
                        filename = os.path.basename(src_path)
                        dest_folder = os.path.join(USERDATA_IMG_DIR, str(db_listing.id))
                        os.makedirs(dest_folder, exist_ok=True)
                        shutil.copy(src_path, dest_folder)
                        success = True
                
                # Case 2: Still a remote URL (likely from propertybikri.com or propertybikroy.com)
                elif src.startswith("http"):
                    # Use original domain to download
                    download_url = src.replace("propertybikri.com", "propertybikroy.com")
                    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
                    try:
                        resp = requests.get(download_url, timeout=10, headers=headers)
                        if resp.status_code == 200:
                            filename = os.path.basename(urlparse(download_url).path)
                            if not filename: filename = f"img_{i}.jpg"
                            # Sanitize filename
                            filename = re.sub(r'[^\w\.-]', '_', filename)
                            dest_folder = os.path.join(USERDATA_IMG_DIR, str(db_listing.id))
                            os.makedirs(dest_folder, exist_ok=True)
                            with open(os.path.join(dest_folder, filename), 'wb') as f:
                                f.write(resp.content)
                            success = True
                        else:
                            print(f"  - Download failed (status {resp.status_code}): {download_url}")
                    except Exception as e:
                        print(f"  - Download error: {e} for {download_url}")

                if success:
                    storage_path = f"userdata/properties/{db_listing.id}/{filename}"
                    db_image = PropertyImage(
                        listing_id=db_listing.id,
                        storage_path=storage_path,
                        public_url=f"/api/v1/properties/images/{db_listing.id}/{filename}",
                        sort_order=i,
                        is_cover=(i == 0),
                        uploaded_by_user_id=admin_id,
                        created_at=datetime.now(timezone.utc)
                    )
                    session.add(db_image)
                    print(f"  - Image Integrated: {filename}")
            
            await session.commit()
            print(f"Integrated: {title[:50]}... ({slug})")

from sqlalchemy import text
if __name__ == "__main__":
    asyncio.run(integrate_properties())
