from conftest import admin_token, auth_header, register


def test_end_to_end_flow(client):
    owner = register(client, "owner_e2e@example.com")
    created = client.post(
        "/properties",
        headers=auth_header(owner),
        json={
            "title": "E2E Listing",
            "description": "E2E listing description with enough length.",
            "listing_purpose": "rent",
            "property_type": "apartment",
            "city": "Dhaka",
            "division": "Dhaka",
            "district": "Dhaka",
            "area_name": "Dhanmondi",
            "display_address": "Road 12",
            "price_amount": 70000,
        },
    )
    assert created.status_code == 200
    listing_id = created.json()["id"]
    slug = created.json()["slug"]
    client.post(
        f"/properties/me/{listing_id}/images",
        headers=auth_header(owner),
        json={"public_url": "https://img.example.com/e2e.jpg", "is_cover": True, "byte_size": 1024},
    )
    client.post(f"/properties/me/{listing_id}/submit", headers=auth_header(owner))
    admin = admin_token(client)
    appv = client.post(f"/admin/properties/{listing_id}/approve", headers=auth_header(admin))
    assert appv.status_code == 200
    public = client.get(f"/properties/{slug}")
    assert public.status_code == 200
    assert public.json()["business_phone"]
    inquiry = client.post(
        f"/properties/{listing_id}/inquiries",
        json={"name": "Buyer", "phone": "+8801811111111", "email": "buyer@example.com", "message": "Interested"},
    )
    assert inquiry.status_code == 200
    inquiry_id = inquiry.json()["id"]
    mark = client.post(f"/admin/inquiries/{inquiry_id}/mark-contacted", headers=auth_header(admin))
    assert mark.status_code == 200
