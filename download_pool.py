import urllib.request
import os
from pathlib import Path
import time

# Unsplash real estate pool
pool = [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200',
    'https://images.unsplash.com/photo-1600607687940-47a0f9259d4b?q=80&w=1200',
    'https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?q=80&w=1200',
    'https://images.unsplash.com/photo-1600585154542-a8436a0bd0b1?q=80&w=1200',
    'https://images.unsplash.com/photo-1600121848594-d86cc950958d?q=80&w=1200',
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1200',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1200',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1200',
    'https://images.unsplash.com/photo-1572120339554-727239fb3b2c?q=80&w=1200',
    'https://images.unsplash.com/photo-1576941089067-2de3c901e126?q=80&w=1200',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?q=80&w=1200',
    'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1200',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1200',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200',
    'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1200',
    'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?q=80&w=1200',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1200'
]

output_dir = Path('C:/realestatesite/app/backend/userdata/seed_data/image_pool')
output_dir.mkdir(parents=True, exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
}

for i, url in enumerate(pool):
    dest = output_dir / f'pool_{i+1}.jpg'
    print(f'Downloading pool image {i+1}...')
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            with open(dest, 'wb') as f:
                f.write(response.read())
        print(f'Saved to {dest}')
        time.sleep(0.1)
    except Exception as e:
        print(f'Failed to download {url}: {e}')

print('Asset pool localization complete.')
