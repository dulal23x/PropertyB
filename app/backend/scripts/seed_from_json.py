import shutil
import asyncio
import json
import os
from pathlib import Path
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.models.entities import PropertyListing, PropertyImage, User
from app.core.security import hash_password
from datetime import datetime, timezone

DATABASE_URL = "sqlite+aiosqlite:///./bproperty_clone.db"

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def seed_data():
    seed_file = Path("userdata/seed_data/listings.json")
    if not seed_file.exists():
        print("No seed data found.")
        return

    with open(seed_file, "r", encoding="utf-8") as f:
        listings = json.load(f)

    async with async_session() as session:
        # Create a mock owner user
        owner_email = "mock_owner@bproperty.clone"
        mock_user = User(
            email=owner_email,
            password_hash=hash_password("password123"),
            is_active=True,
            role="client"
        )
        session.add(mock_user)
        await session.commit()
        await session.refresh(mock_user)
        
        for idx, item in enumerate(listings):
            slug = f"{item['title'].lower().replace(' ', '-')}-{item['id']}"
            
            db_listing = PropertyListing(
                owner_user_id=mock_user.id,
                title=item["title"],
                slug=slug,
                description=item["description"],
                listing_purpose=item["purpose"],
                property_type=item["property_type"],
                status="approved",
                price_amount=item["price"],
                currency=item["currency"],
                city=item["city"],
                area_name=item["area"],
                bedrooms=item["bedrooms"],
                bathrooms=item["bathrooms"],
                size_value=item["size_sqft"],
                size_unit="sqft",
                approved_by_user_id=1,
                approved_at=datetime.now(timezone.utc),
                published_at=datetime.now(timezone.utc)
            )
            session.add(db_listing)
            await session.commit()
            await session.refresh(db_listing)

            dest_folder = Path(f"userdata/property-images/{db_listing.id}")
            dest_folder.mkdir(parents=True, exist_ok=True)

            for order, img_url in enumerate(item["images"]):
                ext = "png"
                src_filename = f"{item['id']}_{order+1}.{ext}"
                src_path = Path(f"userdata/seed_data/images/{src_filename}")
                dest_path = dest_folder / src_filename
                
                if src_path.exists():
                    shutil.copy(src_path, dest_path)

                storage_path = f"userdata/property-images/{db_listing.id}/{src_filename}"
                db_image = PropertyImage(
                    listing_id=db_listing.id,
                    storage_path=storage_path,
                    public_url=f"http://localhost:8090/images/{db_listing.id}/{src_filename}",
                    sort_order=order,
                    is_cover=(order == 0),
                    uploaded_by_user_id=mock_user.id
                )
                session.add(db_image)
            
            await session.commit()

        print(f"Successfully seeded {len(listings)} listings into {DATABASE_URL}")

if __name__ == "__main__":
    asyncio.run(seed_data())