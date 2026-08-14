"""
Live HTTP Test Suite for PropertyBikri Cloudflare Worker API
Follows Chapters 88-90 (Backend Preview Gate) of
PROPERTYBIKRI_100_CHAPTER_TANSTACK_CLOUDFLARE_MIGRATION_MASTER_PLAN.md
"""

import json
import urllib.error
import urllib.request

BASE_URL = "http://127.0.0.1:8790"


def request(method, path, body=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Accept": "application/json"}
    data = None

    if body is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(body).encode("utf-8")

    if token:
        headers["Authorization"] = f"Bearer {token}"

    req = urllib.request.Request(
        url, data=data, headers=headers, method=method
    )
    try:
        with urllib.request.urlopen(req) as resp:
            resp_data = resp.read().decode("utf-8")
            return {
                "status": resp.status,
                "headers": dict(resp.headers),
                "data": json.loads(resp_data) if resp_data else None,
            }
    except urllib.error.HTTPError as e:
        resp_data = e.read().decode("utf-8")
        try:
            parsed = json.loads(resp_data)
        except Exception:
            parsed = resp_data
        return {
            "status": e.code,
            "headers": dict(e.headers),
            "data": parsed,
        }


def run_tests():
    print("==========================================================")
    print("  Testing Live Cloudflare Worker API on http://127.0.0.1:8787")
    print("==========================================================\n")

    passed = 0
    failed = 0

    def assert_eq(actual, expected, test_name):
        nonlocal passed, failed
        if actual == expected:
            print(f"  ✓ PASS: {test_name}")
            passed += 1
        else:
            print(
                f"  ✗ FAIL: {test_name} (Expected: {expected}, Got: {actual})"
            )
            failed += 1

    # 1. Health Endpoints
    print("1. Health Endpoints:")
    r = request("GET", "/health")
    assert_eq(r["status"], 200, "GET /health status is 200")
    assert_eq(r["data"].get("status"), "healthy", "GET /health body is healthy")
    assert_eq(
        "x-request-id" in [k.lower() for k in r["headers"]],
        True,
        "X-Request-ID header attached",
    )

    r_email = request("GET", "/health/email")
    assert_eq(r_email["status"], 200, "GET /health/email status is 200")

    # 2. Global Contact
    print("\n2. Global Contact:")
    r_contact = request("GET", "/properties/global-contact")
    assert_eq(
        r_contact["status"], 200, "GET /properties/global-contact status is 200"
    )
    assert_eq(
        "contact_number" in r_contact["data"],
        True,
        "Global contact contains contact_number",
    )

    # 3. Public Properties Search
    print("\n3. Public Properties Search & Filters:")
    r_props = request("GET", "/properties")
    assert_eq(r_props["status"], 200, "GET /properties status is 200")
    assert_eq(r_props["data"].get("total"), 112, "Total listing count is 112")
    sample_item = r_props["data"]["items"][0]
    assert_eq(
        "cover_image_url" in sample_item,
        True,
        "Listings include cover_image_url",
    )
    assert_eq(
        "business_contact_phone" in sample_item,
        True,
        "Listings include business_contact_phone",
    )
    assert_eq(
        "owner_email" not in sample_item,
        True,
        "Privacy Invariant: owner_email is NOT exposed publicly",
    )

    # Filter test
    r_filtered = request("GET", "/properties?property_type=apartment&city=Dhaka")
    assert_eq(
        r_filtered["status"], 200, "Filtered search /properties returns 200"
    )
    assert_eq(
        len(r_filtered["data"]["items"]) > 0,
        True,
        "Filtered search returns apartments",
    )

    # 4. Public Property Detail
    print("\n4. Public Property Detail:")
    first_slug = sample_item["slug"]
    r_detail = request("GET", f"/properties/{first_slug}")
    assert_eq(
        r_detail["status"],
        200,
        f"GET /properties/{first_slug} detail returns 200",
    )
    assert_eq(
        isinstance(r_detail["data"].get("images"), list),
        True,
        "Detail payload includes images array",
    )

    r_404 = request("GET", "/properties/non-existent-random-slug-404")
    assert_eq(r_404["status"], 404, "Unknown slug returns 404")

    # 5. Auth: Incompatible user reset required
    print("\n5. Authentication & Incompatible Account Handling:")
    r_incompatible = request(
        "POST",
        "/auth/login",
        {"email": "demo-owner@propertybikri.com", "password": "password123"},
    )
    assert_eq(
        r_incompatible["status"],
        400,
        "Incompatible account login rejected (status 400)",
    )
    assert_eq(
        r_incompatible["data"].get("detail"),
        "Password reset required for this account",
        "Incompatible account gets reset-required message",
    )

    # 6. Auth: Registration & Authenticated Profile
    print("\n6. User Registration & Profile:")
    new_user_email = (
        f"testuser_{int(urllib.request.time.time())}@propertybikri.test"
    )
    r_reg = request(
        "POST",
        "/auth/register",
        {
            "email": new_user_email,
            "password": "SecurePassword@1234",
            "full_name": "Antigravity Automated Test User",
        },
    )
    assert_eq(r_reg["status"], 201, "POST /auth/register returns 201 created")
    token = r_reg["data"].get("access_token")
    assert_eq(bool(token), True, "Access token received on registration")

    # 7. Owner Profile & Summary
    print("\n7. Authenticated Owner Endpoints:")
    r_me = request("GET", "/auth/me", token=token)
    assert_eq(r_me["status"], 200, "GET /auth/me returns 200")
    assert_eq(
        r_me["data"].get("email"),
        new_user_email,
        "User profile matches registered email",
    )

    r_summary = request("GET", "/properties/me-summary", token=token)
    assert_eq(
        r_summary["status"],
        200,
        "GET /properties/me-summary returns 200 for owner",
    )
    assert_eq(
        r_summary["data"].get("total_listings"),
        0,
        "New user has 0 total listings initially",
    )

    # 8. Owner Listing Creation
    print("\n8. Listing Lifecycle (Draft Creation):")
    r_create = request(
        "POST",
        "/properties",
        {
            "title": "Automated Luxury Flat in Gulshan 2",
            "listing_purpose": "sale",
            "property_type": "apartment",
            "city": "Dhaka",
            "area_name": "Gulshan",
            "display_address": "Road 45, Gulshan 2, Dhaka",
            "price_amount": 35000000,
            "bedrooms": 4,
            "bathrooms": 4,
            "size_value": 2800,
        },
        token=token,
    )
    assert_eq(r_create["status"], 201, "Owner can create new listing draft")
    listing_id = r_create["data"].get("id")
    assert_eq(
        r_create["data"].get("status"),
        "draft",
        "New listing initialized in 'draft' status",
    )

    # 9. Role-Based Access Control (Client forbidden from admin routes)
    print("\n9. Role-Based Access Control (RBAC):")
    r_admin_forbidden = request("GET", "/admin/users", token=token)
    assert_eq(
        r_admin_forbidden["status"],
        403,
        "Client user receives 403 Forbidden on /admin/*",
    )

    print("\n==========================================================")
    print(f"Results: {passed} passed, {failed} failed.")
    print("==========================================================\n")

    if failed > 0:
        exit(1)


if __name__ == "__main__":
    run_tests()
