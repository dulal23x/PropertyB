"""
Live Full-Stack SSR & Routes Test Suite for PropertyBikri Cloudflare Worker
Validates Part VII (Frontend SSR Migration) and Part VIII (Cutover Rehearsal)
"""

import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8790"

def get_page(path):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, headers={"User-Agent": "AntigravityLiveTester/1.0"})
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode("utf-8")
            return {
                "status": resp.status,
                "headers": dict(resp.headers),
                "body": body
            }
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        return {
            "status": e.code,
            "headers": dict(e.headers),
            "body": body
        }

def run_tests():
    print("==========================================================")
    print("  Testing Live Full-Stack SSR Site on http://127.0.0.1:8790")
    print("==========================================================\n")

    passed = 0
    failed = 0

    def assert_test(cond, test_name):
        nonlocal passed, failed
        if cond:
            print(f"  ✓ PASS: {test_name}")
            passed += 1
        else:
            print(f"  ✗ FAIL: {test_name}")
            failed += 1

    # 1. Homepage
    print("1. Homepage SSR:")
    r_home = get_page("/")
    assert_test(r_home["status"] == 200, "GET / returns 200")
    assert_test("Houses, Lands &amp; Apartments For Sale in Dhaka" in r_home["body"] or "Houses, Lands & Apartments For Sale in Dhaka" in r_home["body"], "Homepage contains primary H1 keyword")
    assert_test("Featured Properties" in r_home["body"], "Homepage renders Featured Properties section")
    assert_test("Browse By City" in r_home["body"], "Homepage renders City section")

    # 2. Public Properties Discovery & Search
    print("\n2. Public Properties Search & Filters:")
    r_props = get_page("/properties")
    assert_test(r_props["status"] == 200, "GET /properties returns 200")
    assert_test("Showing" in r_props["body"] and "verified properties" in r_props["body"], "Search page renders results count")
    assert_test("Filters" in r_props["body"], "Search page renders filter sidebar")

    # 3. Filtered Search
    r_props_filtered = get_page("/properties?area_name=Gulshan&property_type=apartment")
    assert_test(r_props_filtered["status"] == 200, "GET /properties?area_name=Gulshan&property_type=apartment returns 200")

    # 4. Property Detail Page
    print("\n3. Property Detail Page SSR:")
    r_detail = get_page("/properties/pb-demo-purbachal-land-02")
    assert_test(r_detail["status"] == 200, "GET /properties/pb-demo-purbachal-land-02 returns 200")
    assert_test("Overview &amp; Specifications" in r_detail["body"] or "Overview & Specifications" in r_detail["body"], "Detail page renders specs section")
    assert_test("Send Direct Inquiry" in r_detail["body"], "Detail page renders instant inquiry form")
    assert_test("Asking Price" in r_detail["body"], "Detail page renders price card")

    # 5. Programmatic SEO Landing Pages (90 pages)
    print("\n4. Programmatic SEO Landing Pages:")
    r_seo_gulshan = get_page("/flat-for-sale-in-gulshan")
    assert_test(r_seo_gulshan["status"] == 200, "GET /flat-for-sale-in-gulshan returns 200")
    assert_test("Frequently Asked Questions" in r_seo_gulshan["body"], "SEO page renders FAQs accordion")
    assert_test("Gulshan" in r_seo_gulshan["body"], "SEO page renders area specific content")

    r_seo_purbachal = get_page("/land-for-sale-in-purbachal")
    assert_test(r_seo_purbachal["status"] == 200, "GET /land-for-sale-in-purbachal returns 200")

    r_seo_dhanmondi = get_page("/flat-for-sale-in-dhanmondi")
    assert_test(r_seo_dhanmondi["status"] == 200, "GET /flat-for-sale-in-dhanmondi returns 200")

    # 6. Static & Corporate Pages
    print("\n5. Static & Corporate Pages:")
    for path in ["/about", "/contact", "/careers", "/advertise", "/post-property", "/terms", "/privacy", "/cookies"]:
        r_static = get_page(path)
        assert_test(r_static["status"] == 200, f"GET {path} returns 200")

    # 7. Authentication Pages
    print("\n6. Authentication Pages:")
    for path in ["/auth/login", "/auth/register", "/auth/reset"]:
        r_auth = get_page(path)
        assert_test(r_auth["status"] == 200, f"GET {path} returns 200")

    # 8. Dashboard & Admin Shells
    print("\n7. Portals (Client & Admin Shells):")
    r_dash = get_page("/dashboard")
    assert_test(r_dash["status"] == 200, "GET /dashboard returns 200")
    assert_test("Owner Dashboard" in r_dash["body"], "Dashboard renders owner portal header")

    r_adm = get_page("/admin")
    assert_test(r_adm["status"] == 200, "GET /admin returns 200")
    assert_test("Moderation &amp; Site Control" in r_adm["body"] or "Moderation & Site Control" in r_adm["body"], "Admin renders moderation header")

    # 9. Feeds (Sitemap & Robots)
    print("\n8. Crawler Feeds (Sitemap XML & Robots.txt):")
    r_sitemap = get_page("/sitemap.xml")
    assert_test(r_sitemap["status"] == 200, "GET /sitemap.xml returns 200")
    assert_test("application/xml" in r_sitemap["headers"].get("Content-Type", "") or "text/xml" in r_sitemap["headers"].get("Content-Type", ""), "Sitemap has XML content type")
    assert_test("<urlset" in r_sitemap["body"], "Sitemap contains <urlset>")
    assert_test("https://propertybikri.com/properties/pb-demo-purbachal-land-02" in r_sitemap["body"], "Sitemap contains published property URLs")
    assert_test("https://propertybikri.com/flat-for-sale-in-gulshan" in r_sitemap["body"], "Sitemap contains SEO landing URLs")

    r_robots = get_page("/robots.txt")
    assert_test(r_robots["status"] == 200, "GET /robots.txt returns 200")
    assert_test("Disallow: /admin" in r_robots["body"], "Robots disallows admin")
    assert_test("Sitemap: https://propertybikri.com/sitemap.xml" in r_robots["body"], "Robots includes sitemap link")

    # 10. 404 Fallback
    print("\n9. Custom 404 Page:")
    r_404 = get_page("/random-non-existent-page-slug-404")
    assert_test(r_404["status"] == 404, "Unknown page returns 404")
    assert_test("404 - Page Not Found" in r_404["body"], "404 page renders custom branded UI")

    print("\n==========================================================")
    print(f"Results: {passed} passed, {failed} failed.")
    print("==========================================================\n")

    if failed > 0:
        exit(1)

if __name__ == "__main__":
    run_tests()
