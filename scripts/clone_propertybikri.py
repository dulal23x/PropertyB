import os
import re
import requests
import asyncio
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
from urllib.parse import urljoin, urlparse

# Configuration
BASE_URL = "https://propertybikroy.com"
NEW_DOMAIN = "propertybikri.com"
TARGET_DIR = "propertybikri_clone"
ASSETS_DIR = os.path.join(TARGET_DIR, "assets")
IMG_DIR = os.path.join(ASSETS_DIR, "images")
CSS_DIR = os.path.join(ASSETS_DIR, "css")
JS_DIR = os.path.join(ASSETS_DIR, "js")
PROPERTY_DIR = os.path.join(TARGET_DIR, "properties")

# Exclusions
EXCLUDED_CATEGORIES = [
    "Building Products", 
    "Construction Materials", 
    "Building and Property Services", 
    "Property Jobs",
    "বিল্ডিং পণ্য এবং সেবা",
    "বিল্ডিং এবং প্রপার্টি সেবা",
    "প্রপার্টি চাকরি",
    "Building%20Products",
    "Property%20Jobs",
    "Building%20and%20Property%20Services"
]

# Ensure directories
for d in [TARGET_DIR, ASSETS_DIR, IMG_DIR, CSS_DIR, JS_DIR, PROPERTY_DIR]:
    os.makedirs(d, exist_ok=True)

downloaded_assets = {}

async def download_asset(url, folder):
    if not url or url.startswith('data:') or url.startswith('blob:'):
        return None
    
    if url in downloaded_assets:
        return downloaded_assets[url]
    
    try:
        parsed = urlparse(url)
        filename = os.path.basename(parsed.path)
        if not filename or filename == "/":
            filename = "asset_unknown"
        
        # Clean filename
        filename = re.sub(r'[^\w\.-]', '_', filename)
        if not filename:
            filename = "index.html"
            
        local_path = os.path.join(folder, filename)
        
        counter = 1
        name, ext = os.path.splitext(filename)
        while os.path.exists(local_path):
            local_path = os.path.join(folder, f"{name}_{counter}{ext}")
            counter += 1
            
        response = requests.get(url, timeout=15)
        if response.status_code == 200:
            with open(local_path, 'wb') as f:
                f.write(response.content)
            
            rel_path = os.path.relpath(local_path, TARGET_DIR).replace('\\', '/')
            downloaded_assets[url] = rel_path
            return rel_path
    except Exception as e:
        print(f"Failed to download asset {url}: {e}")
    return None

async def clone_page(page, url, save_as):
    print(f"Cloning: {url} -> {save_as}")
    try:
        await page.goto(url, wait_until="load", timeout=60000)
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await asyncio.sleep(3)
        
        content = await page.content()
        soup = BeautifulSoup(content, 'html.parser')
        
        # 1. Localize assets using original URLs
        for tag, attr, folder in [('img', 'src', IMG_DIR), ('link', 'href', CSS_DIR), ('script', 'src', JS_DIR)]:
            for element in soup.find_all(tag, **{attr: True}):
                if tag == 'link' and element.get('rel') != ['stylesheet']:
                    continue
                src = element.get(attr)
                full_src = urljoin(url, src)
                
                if "propertybikroy.com" in full_src or not bool(urlparse(src).netloc):
                    local_path = await download_asset(full_src, folder)
                    if local_path:
                        print(f"Localized: {full_src} -> {local_path}")
                        depth = save_as.count(os.sep) - TARGET_DIR.count(os.sep)
                        prefix = "../" * depth
                        element[attr] = prefix + local_path
                    else:
                        print(f"Localization failed for: {full_src}")

        # 2. Convert to string and replace domain
        raw_html = str(soup)
        raw_html = raw_html.replace("propertybikroy.com", NEW_DOMAIN).replace("PropertyBikroy.com", "PropertyBikri.com")
        
        # 3. Save HTML
        with open(save_as, 'w', encoding='utf-8') as f:
            f.write(raw_html)
    except Exception as e:
        print(f"Error cloning {url}: {e}")

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()
        page.set_default_timeout(60000)

        # 1. Static Pages
        static_pages = {
            "/": "index.html",
            "/about": "about.html",
            "/our-service": "our-service.html",
            "/terms-conditions": "terms-conditions.html",
            "/career": "career.html",
            "/contact": "contact.html",
            "/representative": "representative.html",
            "/blogs": "blogs.html",
            "/news": "news.html"
        }

        for path, filename in static_pages.items():
            await clone_page(page, BASE_URL + path, os.path.join(TARGET_DIR, filename))

        # 2. Extract Categories and 1 Property per category
        print("Extracting property categories...")
        try:
            await page.goto(BASE_URL + "/ads", wait_until="load")
            
            categories = await page.evaluate("""() => {
                const links = Array.from(document.querySelectorAll('a[href*="type="]'));
                return links.map(a => ({
                    name: a.innerText.trim(),
                    url: a.href
                }));
            }""")

            filtered_categories = []
            seen_names = set()
            for cat in categories:
                is_excluded = False
                for ex in EXCLUDED_CATEGORIES:
                    if ex in cat['name'] or ex in cat['url']:
                        is_excluded = True
                        break
                if is_excluded:
                    continue
                if cat['name'] not in seen_names and cat['name'] != "":
                    filtered_categories.append(cat)
                    seen_names.add(cat['name'])

            print(f"Found {len(filtered_categories)} valid categories after exclusion.")

            for cat in filtered_categories:
                print(f"Processing Category: {cat['name']}")
                try:
                    await page.goto(cat['url'], wait_until="load", timeout=45000)
                    
                    property_link = await page.evaluate("""() => {
                        const link = document.querySelector('h3 a[href*="/ad/"]');
                        return link ? link.href : null;
                    }""")

                    if property_link:
                        slug = property_link.split('/')[-1]
                        save_path = os.path.join(PROPERTY_DIR, f"{slug}.html")
                        if not os.path.exists(save_path):
                            await clone_page(page, property_link, save_path)
                    else:
                        print(f"No properties found for category: {cat['name']}")
                except Exception as e:
                    print(f"Failed to process category {cat['name']}: {e}")

        except Exception as e:
            print(f"Failed to navigate to ads page: {e}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
