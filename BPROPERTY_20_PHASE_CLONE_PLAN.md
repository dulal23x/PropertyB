# Bproperty Clone - 20-Phase Implementation Plan

## Overview
This plan details the end-to-end process for cloning the public-facing UI, user dashboard, and data structure of Bproperty.com into our native Next.js/FastAPI stack. 

**Core Constraints:**
- Use a **completely new database** (`bproperty_clone.db`).
- Ignore "Home Loan" and "Blog" sections entirely.
- Limit data acquisition to a maximum of **5 listings per buy/sell/rent page**.
- The signup/auth flow clone MUST be the final phase.
- Download original assets and maintain strict design fidelity.

---

## The 20 Phases

### Phase 1: Environment & New Database Setup
- Update backend configuration to point to a new database: `bproperty_clone.db`.
- Run database initialization scripts to create the fresh schema required for the MVP.

### Phase 2: Targeted Scraping Strategy
- Define the scraping scripts targeting `https://www.bproperty.com/en/bangladesh/properties-for-sale/` and `/properties-for-rent/`.
- Configure the crawler to explicitly ignore blog and loan subdomains.

### Phase 3: Data Acquisition - "Buy" Properties
- Execute scraper on "Buy" categories (Apartment, House, Land, Commercial).
- Enforce the strict limit of 5 listings per page/category. Extract titles, prices, specs, and coordinates.

### Phase 4: Data Acquisition - "Rent" Properties
- Execute scraper on "Rent" categories.
- Enforce the strict limit of 5 listings per page/category. Save raw JSON data to `userdata/seed_data/`.

### Phase 5: Asset Downloading & Media Storage
- Download property images corresponding to the scraped listings.
- Download global site assets: Bproperty logos, SVGs, and category icons into `nextjs-frontend/public/assets/`.

### Phase 6: Next.js Theming & Tailwind Configuration
- Extract primary brand colors, typography, and spacing from the live site CSS.
- Update `nextjs-frontend/tailwind.config.ts` and `globals.css` to enforce the cloned design system.

### Phase 7: Global Layout - Navigation Bar
- Build the main Next.js `<Navbar />`.
- Include links: Buy, Rent, Advertise, About Us, Valuation Tool, Post Property.
- *Strictly exclude* Home Loan and Blog.

### Phase 8: Global Layout - Footer
- Build the `<Footer />` component mimicking Bproperty's multi-column layout.
- Include corporate links, social icons, and language toggles.

### Phase 9: Homepage Clone - Hero & Search
- Implement the Hero image section.
- Build the overlay Search Bar with "For Sale" / "For Rent" tabs, location input, and min/max price dropdowns.

### Phase 10: Homepage Clone - Categories & Featured
- Build the quick-link category grids.
- Implement the "Featured Properties" horizontal scrolling list/grid on the homepage.

### Phase 11: Reusable Property Card Component
- Build the `<PropertyCard />` based on the live site's vertical stack.
- Include: Media Header (image + badge), Category Tag, Bold Price, Title, Location, and Key Specs (beds, baths, sqft).

### Phase 12: Search Results Page - Layout & Sidebar
- Create the `/properties` page shell.
- Implement the multi-filter sidebar matching the live Bproperty search experience (Location, Price, Area, Beds).

### Phase 13: Search Results Page - Grid & Pagination
- Integrate the `<PropertyCard />` into the search results grid.
- Implement pagination controls and sorting dropdowns.

### Phase 14: Property Detail Page - Media Gallery
- Create the `/properties/[slug]` page.
- Implement the main image gallery/slider layout for viewing property photos.

### Phase 15: Property Detail Page - Facts & Description
- Build the property overview table (Type, Purpose, Reference ID, Completion Status).
- Implement the expandable description and amenities checklist.

### Phase 16: Property Detail Page - Contact/Inquiry Sidebar
- Build the sticky right-hand inquiry form.
- *Privacy Guard:* Ensure this form submits to our backend Admin, and the displayed phone number is the business line, not the scraped owner's data.

### Phase 17: User Dashboard - Layout & Navigation
- Build the client dashboard shell (`/dashboard`) mirroring the reference user portal.
- Implement the sidebar navigation (My Properties, Profile, Settings).

### Phase 18: User Dashboard - "My Properties" View
- Implement the list view for users to see their drafted, pending, and published listings.
- Include status badges and action buttons (Edit, Delete).

### Phase 19: User Dashboard - Post Property Wizard
- Implement the "Post Property" form (`/dashboard/listings/new`).
- Build the multi-step form for title, location, specs, and image upload.

### Phase 20: Authentication & Signup Flow Clone
- As the final step, clone the Bproperty Sign In / Sign Up modal and page design.
- Connect this to the FastAPI `/auth/login` and `/auth/register` endpoints.
- Prepare the UI for the manual phone number signup test.

---
*End of Plan. Awaiting approval to begin Phase 1.*