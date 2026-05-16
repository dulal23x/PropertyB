import asyncio
import json
import os
import shutil
import urllib.request
from pathlib import Path
import random
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import delete
from app.models.entities import PropertyListing, PropertyImage, User
from app.core.security import hash_password
from datetime import datetime, timezone

DATABASE_URL = "sqlite+aiosqlite:///./bproperty_clone.db"

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def seed_original_assets():
    seed_file = Path("userdata/seed_data/original_listings.json")
    pool_dir = Path("userdata/seed_data/image_pool")
    target_img_root = Path("userdata/property-images")

    if not seed_file.exists():
        print("No original seed data found.")
        return

    with open(seed_file, "r", encoding="utf-8") as f:
        listings = json.load(f)

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }

    async with async_session() as session:
        # Clear existing data to ensure clean state
        await session.execute(delete(PropertyImage))
        await session.execute(delete(PropertyListing))
        await session.commit()

        # Get or create mock user
        mock_user_email = "owner@bproperty.clone"
        # Check if user exists
        from sqlalchemy import select
        res = await session.execute(select(User).where(User.email == mock_user_email))
        mock_user = res.scalar_one_or_none()
        if not mock_user:
            mock_user = User(
                email=mock_user_email,
                password_hash=hash_password("password123"),
                is_active=True,
                role="client"
            )
            session.add(mock_user)
            await session.commit()
            await session.refresh(mock_user)

        for item in listings:
            print(f"Processing listing: {item['title']}...")
            
            db_listing = PropertyListing(
                owner_user_id=mock_user.id,
                title=item["title"],
                slug=item["slug"],
                description=item["description"],
                listing_purpose=item["purpose"],
                property_type=item["property_type"],
                status="approved",
                price_amount=item["price"],
                currency=item["currency"],
                city=item["city"],
                area_name=item["area"],
                bedrooms=item.get("bedrooms", 0),
                bathrooms=item.get("bathrooms", 0),
                size_value=item.get("size", 0),
                size_unit=item.get("size_unit", "sqft"),
                approved_by_user_id=1,
                approved_at=datetime.now(timezone.utc),
                published_at=datetime.now(timezone.utc)
            )
            session.add(db_listing)
            await session.commit()
            await session.refresh(db_listing)

            listing_img_dir = target_img_root / str(db_listing.id)
            listing_img_dir.mkdir(parents=True, exist_ok=True)

            images_to_process = []
            if item.get("images") and len(item["images"]) > 0:
                # Use real Bproperty URLs
                for idx, url in enumerate(item["images"]):
                    filename = f"img_{idx+1}.webp"
                    dest = listing_img_dir / filename
                    print(f"  Downloading original image {idx+1}...")
                    try:
                        req = urllib.request.Request(url, headers=headers)
                        with urllib.request.urlopen(req) as response:
                            with open(dest, 'wb') as f:
                                f.write(response.read())
                        images_to_process.append(filename)
                    except Exception as e:
                        print(f"  Failed to download {url}: {e}")
            
            if not images_to_process:
                # Fallback to pool
                print(f"  Assigning fallback images from pool...")
                pool_files = list(pool_dir.glob("*.jpg"))
                if pool_files:
                    selected = random.sample(pool_files, min(5, len(pool_files)))
                    for idx, src in enumerate(selected):
                        filename = f"pool_{idx+1}.jpg"
                        shutil.copy(src, listing_img_dir / filename)
                        images_to_process.append(filename)

            for idx, filename in enumerate(images_to_process):
                db_image = PropertyImage(
                    listing_id=db_listing.id,
                    storage_path=f"userdata/property-images/{db_listing.id}/{filename}",
                    public_url=f"http://localhost:8090/images/{db_listing.id}/{filename}",
                    sort_order=idx,
                    is_cover=(idx == 0),
                    uploaded_by_user_id=mock_user.id
                )
                session.add(db_image)
            
            await session.commit()

        print(f"Seeding complete. Processed {len(listings)} listings.")

if __name__ == "__main__":
    asyncio.run(seed_original_assets())
