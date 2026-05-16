import urllib.request
import os
from pathlib import Path
import time

assets = [
    # Hero
    ('https://images.unsplash.com/photo-1448630360428-65ff2c025c79?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', 'hero/hero-bg.jpg'),
    # Cities
    ('https://images.unsplash.com/photo-1583212292454-1fe6229603b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'cities/dhaka.jpg'),
    ('https://images.unsplash.com/photo-1622215844263-49315c67a740?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'cities/chattogram.jpg'),
    ('https://images.unsplash.com/photo-1626014303757-0fc511739f82?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'cities/sylhet.jpg'),
    # Projects
    ('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'projects/projects-promo.jpg'),
    # Blog
    ('https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'blog/families.jpg'),
    ('https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'blog/loan.jpg'),
    ('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'blog/land.jpg'),
]

root_dir = Path('C:/realestatesite/nextjs-frontend/public/assets/home')
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
}

for url, rel_path in assets:
    dest = root_dir / rel_path
    print(f'Downloading {rel_path}...')
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            with open(dest, 'wb') as f:
                f.write(response.read())
        print(f'Successfully saved to {dest}')
        time.sleep(0.1)
    except Exception as e:
        print(f'Failed to download {url}: {e}')

print('Asset localization complete.')
