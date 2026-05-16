from conftest import admin_token, auth_header, register


def test_v2_dual_write_drift_and_legacy_scan(client):
    owner = register(client, "owner_v2@example.com")
    created = client.post(
        "/properties",
        headers=auth_header(owner),
        json={
            "title": "V2 Listing",
            "description": "V2 listing description with enough length.",
            "listing_purpose": "rent",
            "property_type": "apartment",
            "city": "Dhaka",
            "division": "Dhaka",
            "district": "Dhaka",
            "area_name": "Mirpur",
            "display_address": "Mirpur 10",
            "price_amount": 50000,
        },
    )
    listing_id = created.json()["id"]
    client.post(
        f"/properties/me/{listing_id}/images",
        headers=auth_header(owner),
        json={"public_url": "https://img.example.com/v2.jpg", "is_cover": True, "byte_size": 1024},
    )
    client.post(f"/properties/me/{listing_id}/submit", headers=auth_header(owner))
    admin = admin_token(client)
    client.post(f"/admin/properties/{listing_id}/approve", headers=auth_header(admin))
    client.post(
        f"/properties/{listing_id}/inquiries",
        json={"name": "Buyer V2", "phone": "+8801811111111", "email": "buyer_v2@example.com", "message": "Interested"},
    )

    drift = client.get("/admin/migration/v2-status", headers=auth_header(admin))
    assert drift.status_code == 200
    drift_data = drift.json()["drift"]
    assert drift_data["property_listings"]["delta"] >= 0
    assert drift_data["property_images"]["delta"] >= 0
    assert drift_data["property_inquiries"]["delta"] >= 0
    assert drift_data["email_logs"]["delta"] >= 0

    legacy = client.get("/admin/migration/legacy-candidates", headers=auth_header(admin))
    assert legacy.status_code == 200
    assert legacy.json()["tables"] == []
