# PROPERTYBIKRI.COM COMPREHENSIVE CLONE & DATA EXTRACTION PLAN

## 1. Executive Summary
This document outlines the strategic and technical approach for a complete "as-is" clone of the public-facing pages and a subset of property data from `propertybikri.com`. The objective is to secure the original look-and-feel (HTML, CSS, Assets) and populate a local environment with representative data (3 items per category), while strictly excluding specific non-core categories.

## 2. Target Scope
### 2.1 Core Public Pages
The following static/information pages must be downloaded in full:
- Home Page (`/`)
- About Us (`/about`)
- Our Services (`/our-service`)
- Terms and Conditions (`/terms-conditions`)
- Careers (`/career`)
- Contact Us (`/contact`)
- District Agents (`/representative`)
- Blogs Index & Single Posts (`/blogs`)
- News Index & Single Posts (`/news`)

### 2.2 Property Data (3 Items Per Category)
Data extraction will target the following "Property" categories:
- Apartment/Flat Sale
- Plot/Land Sale
- Commercial Space Sale
- House Sale
- Apartment/Flat Rent
- Commercial Space Rent
- Room Rent
- Garage/Parking Rent

### 2.3 Exclusions (MANDATORY)
The following categories and their items MUST be ignored:
- **Building Products / Construction Materials**
- **Building and Property Services**
- **Property Jobs**

## 3. Technical Crawling Strategy
### 3.1 Tools & Environment
- **Automation:** Python with `Playwright` or `Selenium` for dynamic content rendering.
- **Extraction:** `BeautifulSoup4` for DOM parsing.
- **Asset Management:** Custom Python scripts for downloading and localizing images, CSS, and JS.
- **Database:** SQLite (aligned with existing MVP architecture) to store metadata.

### 3.2 Navigation Flow
1. **Discovery Phase:**
   - Navigate to `https://propertybikri.com/ads`.
   - Map all links under the "Category" sidebar.
   - Filter out the excluded categories.
2. **Sampling Phase:**
   - For each valid category, navigate to its specific URL (e.g., `ads?type=Apartment%20%2F%20Flat%20Sale`).
   - Identify the first 3 property listing links.
   - Queue these URLs for deep crawling.
3. **Deep Crawl Phase:**
   - Navigate to each individual property page (e.g., `ad/SLUG`).
   - Extract full details: Title, Price, Location, Description, Specifications (Beds, Baths, Size), and all Gallery Images.
   - Capture the full HTML of the page for "as-is" rendering reference.

## 4. Asset Localization (Original Content Preservation)
To achieve an "as-is" clone, we must break the dependency on live servers:
- **CSS/JS:** Download all external stylesheets and scripts. Rewrite `<link>` and `<script>` tags in the downloaded HTML to point to local paths.
- **Images:**
  - Logo and UI Icons: Localize immediately.
  - Property Thumbnails/Gallery: Download and rename to match local record IDs.
  - Background Images: Extract from CSS and localize.
- **Fonts:** Identify and download `.woff` or `.ttf` files linked in `@font-face` rules.

## 5. Directory Structure for Clone
```
/clone-root
├── /assets
│   ├── /css
│   ├── /js
│   ├── /images
│   │   ├── /ui
│   │   └── /properties
│   └── /fonts
├── /public-pages
│   ├── index.html
│   ├── about.html
│   ├── contact.html
│   └── ...
├── /properties
│   ├── /AD_SLUG_1
│   │   └── index.html
│   └── ...
└── metadata.db (SQLite)
```

## 6. Implementation Steps
### Phase 1: Infrastructure Setup
1. Initialize a dedicated Python environment.
2. Setup Playwright for headless browser interaction.
3. Create the SQLite schema to mirror the `propertybikri.com` property structure.

### Phase 2: Static Page Acquisition
1. Loop through the list of public URLs.
2. For each URL:
   - Load page.
   - Scroll to bottom to trigger lazy-loaded assets.
   - Save raw HTML.
   - Start asset extraction.

### Phase 3: Targeted Property Scraping
1. Visit the `/ads` page.
2. Parse the category list.
3. Apply exclusion logic:
   ```python
   excluded = ["Building Products", "Construction Materials", "Services", "Jobs"]
   if any(x in category_name for x in excluded):
       continue
   ```
4. For valid categories:
   - Get top 3 listing URLs.
   - Visit each URL and scrape full data.
   - Download gallery images to `/assets/images/properties/{slug}/`.

### Phase 4: Localization Engine
1. Run a post-processing script on all saved HTML files.
2. Replace all instances of `https://propertybikri.com/` with relative local paths.
3. Ensure image `src` attributes point to the localized storage.

## 7. Quality Assurance & Verification
- **Visual Check:** Compare the local `index.html` side-by-side with the live site.
- **Link Integrity:** Verify all internal links (e.g., Home to About) work correctly in the offline version.
- **Image Check:** Ensure no broken image icons appear (all assets must be local).
- **Data Accuracy:** Verify that the 3 items per category in the database match the live site's data.

## 8. Deployment and Integration
Once the "as-is" clone is verified:
1. Integrate the extracted property metadata into the `realestate_mvp_v1.db`.
2. Map the localized images to the `app/backend/userdata/properties` folder.
3. Use the HTML structure as a blueprint for the Next.js frontend components to ensure pixel-perfect parity.

## 9. Risk Management
- **Anti-Scraping:** Implement random delays and user-agent rotation.
- **Dynamic Content:** Use browser automation to wait for JavaScript execution before saving HTML.
- **Image Size:** Monitor disk space during mass download of high-res gallery images.

## 10. Conclusion
This plan provides a roadmap for a surgical and high-fidelity extraction of `propertybikri.com`. By focusing on localization and strict exclusion of irrelevant categories, we ensure a clean, proprietary-ready dataset and UI baseline for the Real Estate MVP.
