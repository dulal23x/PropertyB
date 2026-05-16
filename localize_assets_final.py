import urllib.request
import os
from pathlib import Path
import time

assets = [
    ('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1920', 'hero/hero-bg.jpg'),
    ('https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=800', 'cities/chattogram.jpg'),
    ('https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=800', 'cities/sylhet.jpg'),
]

root_dir = Path('C:/realestatesite/nextjs-frontend/public/assets/home')
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
}

for url, rel_path in assets:
    dest = root_dir / rel_path
    print(f'Finalizing {rel_path}...')
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            with open(dest, 'wb') as f:
                f.write(response.read())
        print(f'Successfully saved to {dest}')
        time.sleep(0.1)
    except Exception as e:
        print(f'Failed to download {url}: {e}')
