"""
Live API Test against Remote Cloudflare Deployment
"""

import urllib.request
import urllib.error
import json
import time

LIVE_URL = "https://propertybikri.dulalhussain93.workers.dev"

def api_call(method, path, body=None, token=None):
    url = f"{LIVE_URL}{path}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json"
    }
    data = None
    if body is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(body).encode("utf-8")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read().decode("utf-8")
            return resp.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8")
        try:
            return e.code, json.loads(raw)
        except:
            return e.code, {"raw": raw}

def test_api():
    print("Testing Live Remote Cloudflare API...")
    
    # 1. Health
    s, d = api_call("GET", "/health")
    assert s == 200 and d.get("status") == "healthy", f"Health failed: {s} {d}"
    print("  ✓ Remote /health: healthy")

    # 2. Register
    rand_email = f"remote_user_{int(time.time())}@propertybikri.test"
    s, d = api_call("POST", "/auth/register", {
        "email": rand_email,
        "password": "Password123!",
        "full_name": "Remote Live User"
    })
    assert s == 201 and "access_token" in d, f"Register failed: {s} {d}"
    token = d["access_token"]
    print(f"  ✓ Remote registration: {rand_email}")

    # 3. Profile /auth/me
    s, d = api_call("GET", "/auth/me", token=token)
    assert s == 200 and d.get("email") == rand_email, f"Get /auth/me failed: {s} {d}"
    print("  ✓ Remote /auth/me profile verified")

    # 4. Create Listing Draft
    s, d = api_call("POST", "/properties", {
        "title": "Stunning Luxury Flat in Banani Live Test",
        "description": "Live production verification listing created on remote D1.",
        "listing_purpose": "sale",
        "property_type": "apartment",
        "price_amount": 25000000,
        "currency": "BDT",
        "price_visibility": "show_price",
        "city": "Dhaka",
        "area_name": "Banani",
        "display_address": "Road 11, Block D, Banani, Dhaka",
        "bedrooms": 3,
        "bathrooms": 3,
        "size_value": 2100,
        "size_unit": "sqft"
    }, token=token)
    assert s == 201 and d.get("slug"), f"Listing creation failed: {s} {d}"
    print(f"  ✓ Remote listing draft created: {d.get('slug')}")

    print("\nAll Remote Cloudflare API flows PASSED successfully!")

if __name__ == "__main__":
    test_api()
