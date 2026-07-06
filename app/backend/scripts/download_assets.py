import json
import os
import urllib.request
from pathlib import Path
import time

seed_file = Path("userdata/seed_data/listings.json")
image_dir = Path("userdata/seed_data/images")
image_dir.mkdir(parents=True, exist_ok=True)

frontend_assets_dir = Path("../../nextjs-frontend/public/assets")
frontend_assets_dir.mkdir(parents=True, exist_ok=True)

with open(seed_file, "r", encoding="utf-8") as f:
    listings = json.load(f)

print(f"Downloading images for {len(listings)} listings...")

for listing in listings:
    listing_id = listing["id"]
    for idx, img_url in enumerate(listing["images"]):
        ext = "png" # placehold.co returns png
        filename = f"{listing_id}_{idx+1}.{ext}"
        filepath = image_dir / filename
        if not filepath.exists():
            try:
                urllib.request.urlretrieve(img_url, filepath)
                print(f"Downloaded {filename}")
                time.sleep(0.5) # limit rate
            except Exception as e:
                print(f"Failed to download {img_url}: {e}")

# Create placeholder for logo
logo_path = frontend_assets_dir / "bproperty-logo.svg"
if not logo_path.exists():
    with open(logo_path, "w", encoding="utf-8") as f:
        f.write('<svg width="200" height="50" xmlns="http://www.w3.org/2000/svg"><text x="10" y="35" font-family="Arial" font-size="30" font-weight="bold" fill="#00a160">bproperty</text></svg>')
    print("Created mock bproperty logo.")

print("Phase 5 Asset downloading complete.")
