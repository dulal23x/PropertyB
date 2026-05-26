import sqlite3
import shutil
from pathlib import Path
import random
from datetime import datetime, timezone

ROOT = Path(r"C:\realestatesite")
BACKEND = ROOT / "app" / "backend"
DB_PATH = BACKEND / "realestate_mvp_v1.db"
POOL_DIR = BACKEND / "userdata" / "seed_data" / "image_pool"
IMAGE_ROOT = BACKEND / "userdata" / "property-images"

def main():
    if not DB_PATH.exists():
        print(f"DB not found: {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Get all listings to update
    cur.execute("SELECT id, title FROM property_listings")
    listings = cur.fetchall()

    # Get downloaded images
    pool_images = list(POOL_DIR.glob("bproperty_*.webp")) + list(POOL_DIR.glob("bproperty_*.jpg")) + list(POOL_DIR.glob("bproperty_*.png"))
    pool_images.sort()

    if not pool_images:
        print("No pool images found.")
        return

    print(f"Updating {len(listings)} listings with real Bproperty images...")

    for i, listing in enumerate(listings):
        listing_id = listing['id']
        # Assign 1 image per listing for now to spread them out
        source_img = pool_images[i % len(pool_images)]
        
        target_dir = IMAGE_ROOT / str(listing_id)
        target_dir.mkdir(parents=True, exist_ok=True)
        
        dest_filename = source_img.name
        dest_path = target_dir / dest_filename
        
        shutil.copy2(source_img, dest_path)
        
        # Update property_images table
        # First, find if there's an existing cover image or clear them
        # For simplicity, we'll set this one as cover and delete others for these specific listings
        cur.execute("DELETE FROM property_images WHERE listing_id = ?", (listing_id,))
        
        storage_path = f"userdata/property-images/{listing_id}/{dest_filename}"
        public_url = f"http://localhost:8090/images/{listing_id}/{dest_filename}"
        
        cur.execute("""
            INSERT INTO property_images 
            (listing_id, storage_path, public_url, sort_order, is_cover, uploaded_by_user_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (listing_id, storage_path, public_url, 0, 1, 1, datetime.now(timezone.utc).isoformat())) # Assuming admin/system user 1
        
        print(f"  Updated Listing ID {listing_id} with {dest_filename}")

    conn.commit()
    conn.close()
    print("Update complete.")

if __name__ == "__main__":
    main()
