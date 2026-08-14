"""
Verification Suite for Remote Cloudflare Production Deployment
Target: propertybikri-v2.dulalhussain93.workers.dev
"""

import urllib.request
import urllib.error

LIVE_URL = "https://propertybikri.dulalhussain93.workers.dev"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

PATHS = [
    "/health",
    "/",
    "/properties",
    "/properties?purpose=rent",
    "/properties/pb-demo-purbachal-land-02",
    "/flat-for-sale-in-gulshan",
    "/land-for-sale-in-purbachal",
    "/about",
    "/contact",
    "/careers",
    "/advertise",
    "/post-property",
    "/terms",
    "/privacy",
    "/cookies",
    "/auth/login",
    "/auth/register",
    "/auth/reset",
    "/dashboard",
    "/admin",
    "/sitemap.xml",
    "/robots.txt",
    "/assets/propertybikri-logo.png",
    "/assets/abcbangla24-logo.webp",
    "/assets/home/hero/hero-bg.jpg",
    "/assets/home/cities/dhaka.jpg",
    "/favicon.ico",
    "/images/1/cover.jpg"
]

def run():
    print("===============================================================")
    print(f" Verifying Live Remote Cloudflare Worker: {LIVE_URL}")
    print("===============================================================\n")

    passed = 0
    failed = 0

    for p in PATHS:
        req = urllib.request.Request(LIVE_URL + p, headers=HEADERS)
        try:
            with urllib.request.urlopen(req) as r:
                ctype = r.headers.get("Content-Type", "").split(";")[0]
                data = r.read()
                print(f"  ✓ PASS: {p:<40} -> {r.status} ({ctype}, {len(data):,} bytes)")
                passed += 1
        except urllib.error.HTTPError as e:
            print(f"  ✗ FAIL: {p:<40} -> {e.code} ({e.reason})")
            failed += 1
        except Exception as e:
            print(f"  ✗ FAIL: {p:<40} -> {e}")
            failed += 1

    print("\n===============================================================")
    print(f" Results: {passed} passed, {failed} failed.")
    print("===============================================================")

    if failed > 0:
        exit(1)

if __name__ == "__main__":
    run()
