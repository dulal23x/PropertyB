from conftest import admin_token, auth_header, register


def test_admin_inquiry_contract_and_status_updates(client):
    owner = register(client, "owner_inq@example.com")
    created = client.post(
        "/properties",
        headers=auth_header(owner),
        json={
            "title": "Inquiry Listing",
            "description": "Inquiry listing description with enough length.",
            "listing_purpose": "sale",
            "property_type": "house",
            "city": "Dhaka",
            "division": "Dhaka",
            "district": "Dhaka",
            "area_name": "Uttara",
            "display_address": "Sector 7",
            "price_amount": 12000000,
        },
    )
    listing_id = created.json()["id"]
    slug = created.json()["slug"]
    client.post(
        f"/properties/me/{listing_id}/images",
        headers=auth_header(owner),
        json={"public_url": "https://img.example.com/inq.jpg", "is_cover": True, "byte_size": 1024},
    )
    client.post(f"/properties/me/{listing_id}/submit", headers=auth_header(owner))
    admin = admin_token(client)
    client.post(f"/admin/properties/{listing_id}/approve", headers=auth_header(admin))

    inq = client.post(
        f"/properties/{listing_id}/inquiries",
        json={"name": "Buyer A", "phone": "+8801811111111", "email": "buyer@example.com", "message": "Interested"},
    )
    assert inq.status_code == 200
    inquiry_id = inq.json()["id"]

    list_res = client.get("/admin/inquiries", headers=auth_header(admin))
    assert list_res.status_code == 200
    payload = list_res.json()
    assert {"items", "page", "page_size", "total"} <= set(payload.keys())
    row = next(x for x in payload["items"] if x["id"] == inquiry_id)
    assert row["listing_slug"] == slug
    assert {"name", "phone", "email", "message", "preferred_contact_method", "status"} <= set(row.keys())

    contacted = client.post(f"/admin/inquiries/{inquiry_id}/mark-contacted", headers=auth_header(admin))
    assert contacted.status_code == 200
    assert contacted.json()["status"] == "contacted"
