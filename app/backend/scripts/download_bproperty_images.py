import urllib.request
import os
from pathlib import Path
import time

# Real Bproperty image URLs extracted from live site
bproperty_images = [
    'https://api.bproperty.com/api/files/a4alnectuppemjo/73cmhhfi8gyrq50/lake_placid_2_rKgKKCsfIz.webp',
    'https://api.bproperty.com/api/files/a4alnectuppemjo/73cmhhfi8gyrq50/lake_placid_1_UHejFQopOX.webp',
    'https://api.bproperty.com/api/files/a4alnectuppemjo/yndh4inh8r97c9b/pexels_ahmetcotur_24805042_qE7iyUKZEQ.jpg',
    'https://api.bproperty.com/api/files/a4alnectuppemjo/5o7sj65z2fhont6/pexels_fotoaibe_1643383_qMQLl0X47j.jpg',
    'https://api.bproperty.com/api/files/a4alnectuppemjo/v0jatn5lwezwiyh/r_green_p_16_rek5k51nnog4uj59knlpbku34j0bu0d6n096ap3egs_FcghNs8ZMs.webp',
    'https://api.bproperty.com/api/files/a4alnectuppemjo/wakg7cwytpxq05r/pexels_aksinfo7_30781823_jEG5uDN5fM.jpg',
    'https://api.bproperty.com/api/files/a4alnectuppemjo/142e5wmwsnwlvac/ddewfewf_raj6kd8l7rq7bkt3ud0acw70j47ihdta0o9yu48irg_sxfyo4oAjn.png',
    'https://api.bproperty.com/api/files/a4alnectuppemjo/pxnlpvi7n4sd7sf/pexels_ahmetcotur_24805042_bMfLViS5TI.jpg',
    'https://api.bproperty.com/api/files/a4alnectuppemjo/yo1q0wnr696ktyf/pexels_aksinfo7_30781823_AqejZ6aPcy.jpg',
    'https://api.bproperty.com/api/files/a4alnectuppemjo/nw47y4x99h3z704/pexels_bohlemedia_1330753_942x603_1_MP3w78v8n0.jpg',
    'https://api.bproperty.com/api/files/a4alnectuppemjo/n7fsgnd4z2w1b0y/pexels_expect_best_79873_323772_1_942x603_2_30JLVwV2uu.jpg'
]

output_dir = Path('app/backend/userdata/seed_data/image_pool')
output_dir.mkdir(parents=True, exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Referer': 'https://www.bproperty.com/'
}

print(f"Starting download of {len(bproperty_images)} real property images...")

for i, url in enumerate(bproperty_images):
    ext = url.split('.')[-1]
    if '?' in ext: ext = ext.split('?')[0]
    dest = output_dir / f'bproperty_{i+1}.{ext}'
    
    print(f'Downloading {url}...')
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            with open(dest, 'wb') as f:
                f.write(response.read())
        print(f'Saved to {dest}')
        time.sleep(0.5) # Politeness delay
    except Exception as e:
        print(f'Failed to download {url}: {e}')

print("\nReal Bproperty image download complete.")
print(f"Images saved to: {output_dir}")
