/**
 * Base HTML Template for Server-Side Rendering (SSR)
 * Injects SEO tags, OpenGraph metadata, structured JSON-LD, Tailwind CSS, and client scripts.
 */

export interface PageMeta {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  noIndex?: boolean;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

export function renderHtmlDocument({
  meta,
  content,
  scripts = "",
  styles = "",
}: {
  meta: PageMeta;
  content: string;
  scripts?: string;
  styles?: string;
}): string {
  const canonicalUrl = meta.canonical
    ? (meta.canonical.startsWith("http") ? meta.canonical : `https://propertybikri.com${meta.canonical}`)
    : "https://propertybikri.com";

  const ogImage = meta.ogImage || "https://propertybikri.com/assets/default-site-banner.png";
  const ogType = meta.ogType || "website";

  const jsonLdScript = meta.jsonLd
    ? `<script type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script>`
    : "";

  return `<!DOCTYPE html>
<html lang="en" class="h-full bg-white text-brand-dark antialiased">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeHtml(meta.description)}" />
  ${meta.noIndex ? '<meta name="robots" content="noindex, follow" />' : '<meta name="robots" content="index, follow" />'}
  <link rel="canonical" href="${canonicalUrl}" />

  <!-- OpenGraph / Facebook -->
  <meta property="og:type" content="${ogType}" />
  <meta property="og:title" content="${escapeHtml(meta.title)}" />
  <meta property="og:description" content="${escapeHtml(meta.description)}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:site_name" content="PropertyBikri" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
  <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
  <meta name="twitter:image" content="${ogImage}" />

  <!-- Favicon & Icons -->
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" href="/assets/site-icon-32.png" type="image/png" sizes="32x32" />
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              green: '#00a160',
              greenHover: '#008f55',
              greenLight: '#e6f6f0',
              dark: '#1a1a1a',
              light: '#f7f7f7',
              border: '#e5e7eb',
              featured: '#ffd700',
              textSecondary: '#6b7280',
            }
          },
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
          }
        }
      }
    }
  </script>

  <style>
    body { font-family: 'Inter', sans-serif; }
    .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    ${styles}
  </style>

  ${jsonLdScript}
</head>
<body class="flex min-h-full flex-col bg-white">
  ${renderNavbarHtml()}
  <main class="flex-grow">
    ${content}
  </main>
  ${renderFooterHtml()}

  <!-- Global Client App Script -->
  <script>
    // Global Authentication Session Helper
    (function() {
      const token = localStorage.getItem('realestate_token');
      if (token) {
        fetch('/api/auth/me', {
          headers: { 'Authorization': 'Bearer ' + token }
        }).then(r => r.ok ? r.json() : null).then(user => {
          if (user) {
            const accLabel = document.querySelectorAll('.nav-account-label');
            const accLink = document.querySelectorAll('.nav-account-link');
            const postBtn = document.querySelectorAll('.nav-post-property');
            
            const isAdm = user.role === 'admin';
            const targetHref = isAdm ? '/admin' : '/dashboard';
            const postHref = isAdm ? '/admin/properties' : '/dashboard/listings/new';

            accLabel.forEach(el => el.textContent = isAdm ? 'Admin Panel' : 'My Dashboard');
            accLink.forEach(el => el.setAttribute('href', targetHref));
            postBtn.forEach(el => el.setAttribute('href', postHref));
          } else {
            localStorage.removeItem('realestate_token');
          }
        }).catch(() => {});
      }
    })();

    // Mobile Navigation Drawer Toggle
    function toggleMobileMenu() {
      const drawer = document.getElementById('mobile-menu-drawer');
      if (drawer) {
        drawer.classList.toggle('hidden');
      }
    }
  </script>
  ${scripts}
</body>
</html>`;
}

export function escapeHtml(str: string | undefined | null): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderNavbarHtml(): string {
  const menuItems = [
    { label: "Buy Apartments", href: "/apartment-for-sale-in-dhaka" },
    { label: "Buy House", href: "/house-for-sale-in-dhaka" },
    { label: "Buy Land", href: "/land-for-sale-in-dhaka" },
    { label: "Commercial", href: "/commercial-property-for-sale-in-dhaka" },
    { label: "Advertise", href: "/advertise" },
    { label: "About", href: "/about" },
  ];

  return `
  <header class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between gap-2">
        <div class="flex min-w-0 items-center">
          <a href="/" aria-label="PropertyBikri home" class="flex-shrink-0 flex items-center">
            <img 
              src="/assets/propertybikri-logo.png" 
              alt="PropertyBikri logo" 
              class="h-auto w-[152px] object-contain sm:w-[176px] xl:w-[190px]"
            />
          </a>
          <nav class="hidden xl:ml-6 xl:flex xl:items-center xl:gap-2">
            ${menuItems
              .map(
                (item) => `
              <a href="${item.href}" class="whitespace-nowrap px-2 py-2 text-[12px] font-black uppercase tracking-normal text-brand-dark transition-colors hover:text-brand-green">
                ${item.label}
              </a>`
              )
              .join("")}
          </nav>
        </div>

        <div class="flex shrink-0 items-center gap-2 sm:gap-3">
          <a href="/post-property" class="nav-post-property hidden h-9 items-center justify-center whitespace-nowrap rounded bg-brand-green px-4 text-[11px] font-black uppercase tracking-wider text-white shadow-md shadow-brand-green/20 transition-all hover:bg-brand-greenHover sm:inline-flex">
            Post Property
          </a>

          <a href="/auth/login" class="nav-account-link flex items-center gap-2 text-brand-dark hover:text-brand-green transition-colors group">
            <div class="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 group-hover:border-brand-green">
              <svg class="h-4 w-4 text-gray-500 group-hover:text-brand-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <span class="nav-account-label hidden whitespace-nowrap text-[11px] font-black uppercase tracking-wider xl:inline">Sign In / Sign Up</span>
          </a>

          <button
            type="button"
            onclick="toggleMobileMenu()"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-brand-dark transition-colors hover:border-brand-green hover:text-brand-green xl:hidden"
            aria-label="Toggle navigation menu"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Drawer Menu -->
    <div id="mobile-menu-drawer" class="hidden fixed inset-0 z-50 xl:hidden">
      <div class="fixed inset-0 bg-black/40" onclick="toggleMobileMenu()"></div>
      <div class="fixed right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl z-50 flex flex-col">
        <div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <span class="text-sm font-black uppercase tracking-widest text-brand-dark">Menu</span>
          <button type="button" onclick="toggleMobileMenu()" class="p-2 text-gray-500 hover:text-black">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div class="flex flex-col gap-2 p-5 overflow-y-auto">
          ${menuItems
            .map(
              (item) => `
            <a href="${item.href}" class="rounded-xl border border-gray-100 px-4 py-3 text-sm font-bold uppercase tracking-wider text-brand-dark hover:border-brand-green hover:text-brand-green">
              ${item.label}
            </a>`
            )
            .join("")}
          <a href="/post-property" class="nav-post-property mt-2 rounded-xl bg-brand-green px-4 py-3 text-sm font-black uppercase tracking-wider text-white text-center">
            Post Property
          </a>
          <a href="/auth/login" class="nav-account-link rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold uppercase tracking-wider text-brand-dark text-center">
            <span class="nav-account-label">Sign In / Sign Up</span>
          </a>
        </div>
      </div>
    </div>
  </header>`;
}

export function renderFooterHtml(): string {
  return `
  <footer class="bg-[#f8f6f0] pb-8 pt-12 text-black md:pt-16 border-t border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-6 lg:gap-8">
        <div class="order-last flex flex-col items-center text-center md:order-none md:col-span-2 md:items-start md:text-left lg:col-span-1">
          <a href="/" aria-label="PropertyBikri home" class="inline-flex">
            <img src="/assets/propertybikri-logo.png" alt="PropertyBikri logo" class="h-auto w-[190px] object-contain" />
          </a>
          <a href="https://abcbangla24.com/" target="_blank" rel="noopener noreferrer" class="mt-5 inline-flex">
            <img src="/assets/abcbangla24-logo.webp" alt="ABCBangla24 logo" class="h-auto w-[160px] object-contain" />
          </a>
        </div>
        <div class="text-left">
          <h3 class="mb-4 inline-block border-b border-gray-300 pb-2 text-[14px] font-black uppercase tracking-wider">Popular for Sale</h3>
          <ul class="space-y-2.5 text-sm font-medium text-gray-800">
            <li><a href="/properties?purpose=sale&area_name=Gulshan" class="hover:text-brand-green transition-colors">Apartments in Gulshan</a></li>
            <li><a href="/properties?purpose=sale&area_name=Banani" class="hover:text-brand-green transition-colors">Apartments in Banani</a></li>
            <li><a href="/properties?purpose=sale&area_name=Dhanmondi" class="hover:text-brand-green transition-colors">Apartments in Dhanmondi</a></li>
            <li><a href="/properties?purpose=sale&area_name=Uttara" class="hover:text-brand-green transition-colors">Apartments in Uttara</a></li>
            <li><a href="/properties?purpose=sale&area_name=Bashundhara" class="hover:text-brand-green transition-colors">Apartments in Bashundhara</a></li>
          </ul>
        </div>
        <div class="text-left">
          <h3 class="mb-4 inline-block border-b border-gray-300 pb-2 text-[14px] font-black uppercase tracking-wider">Land for Sale</h3>
          <ul class="space-y-2.5 text-sm font-medium text-gray-800">
            <li><a href="/properties?purpose=sale&property_type=land&area_name=Purbachal" class="hover:text-brand-green transition-colors">Land in Purbachal</a></li>
            <li><a href="/properties?purpose=sale&property_type=land&area_name=Bashundhara" class="hover:text-brand-green transition-colors">Land in Bashundhara</a></li>
            <li><a href="/properties?purpose=sale&property_type=land&area_name=Uttara" class="hover:text-brand-green transition-colors">Land in Uttara</a></li>
            <li><a href="/properties?purpose=sale&property_type=land&area_name=Baridhara" class="hover:text-brand-green transition-colors">Land in Baridhara</a></li>
          </ul>
        </div>
        <div class="text-left">
          <h3 class="mb-4 inline-block border-b border-gray-300 pb-2 text-[14px] font-black uppercase tracking-wider">House for Sale</h3>
          <ul class="space-y-2.5 text-sm font-medium text-gray-800">
            <li><a href="/properties?purpose=sale&property_type=house&area_name=Gulshan" class="hover:text-brand-green transition-colors">House in Gulshan</a></li>
            <li><a href="/properties?purpose=sale&property_type=house&area_name=Banani" class="hover:text-brand-green transition-colors">House in Banani</a></li>
            <li><a href="/properties?purpose=sale&property_type=house&area_name=Dhanmondi" class="hover:text-brand-green transition-colors">House in Dhanmondi</a></li>
            <li><a href="/properties?purpose=sale&property_type=house&area_name=Uttara" class="hover:text-brand-green transition-colors">House in Uttara</a></li>
          </ul>
        </div>
        <div class="text-left">
          <h3 class="mb-4 inline-block border-b border-gray-300 pb-2 text-[14px] font-black uppercase tracking-wider">Corporate</h3>
          <ul class="space-y-2.5 text-sm font-medium text-gray-800">
            <li><a href="/about" class="hover:text-brand-green transition-colors">About Us</a></li>
            <li><a href="/contact" class="hover:text-brand-green transition-colors">Contact Us</a></li>
            <li><a href="/careers" class="hover:text-brand-green transition-colors">Careers</a></li>
            <li><a href="/terms" class="hover:text-brand-green transition-colors">Terms & Conditions</a></li>
            <li><a href="/privacy" class="hover:text-brand-green transition-colors">Privacy Policy</a></li>
            <li><a href="/advertise" class="hover:text-brand-green transition-colors">Advertise with Us</a></li>
          </ul>
        </div>
        <div class="text-left">
          <h3 class="mb-4 inline-block border-b border-gray-300 pb-2 text-[14px] font-black uppercase tracking-wider">Contact Us</h3>
          <div class="space-y-3 text-sm font-semibold text-gray-800">
            <a href="https://wa.me/8801717849009" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 hover:text-brand-green transition-colors">
              <span class="text-brand-green">WhatsApp:</span> +8801717-849009
            </a>
            <p class="text-xs text-gray-600 leading-relaxed">
              Level 5, Navana HR Tower-1, Gulshan Link Road, 1208, Dhaka, Bangladesh
            </p>
          </div>
        </div>
      </div>

      <div class="flex flex-col items-center justify-between gap-4 border-t border-gray-300 pt-6 text-center text-xs font-bold uppercase tracking-widest text-gray-600 md:flex-row md:text-left">
        <p>
          &copy; ${new Date().getFullYear()} <a href="/" class="hover:text-brand-green">PropertyBikri</a>, a concern of 
          <a href="https://abcbangla24.com/" target="_blank" rel="noopener noreferrer" class="hover:text-brand-green">ABCBangla24 Group</a>. All rights reserved.
        </p>
        <div class="flex flex-wrap justify-center gap-4 md:justify-start md:gap-6">
          <a href="/sitemap.xml" class="hover:text-brand-green">Sitemap</a>
          <a href="/cookies" class="hover:text-brand-green">Cookie Policy</a>
        </div>
      </div>
    </div>
  </footer>`;
}
