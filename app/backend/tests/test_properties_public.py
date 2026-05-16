from conftest import admin_token, auth_header, register


def _create_listing(client, token: str):
    return client.post(
        "/properties",
        headers=auth_header(token),
        json={
            "title": "Contract Apartment",
            "description": "Contract listing description with enough length.",
            "listing_purpose": "rent",
            "property_type": "apartment",
            "city": "Dhaka",
            "division": "Dhaka",
            "district": "Dhaka",
            "area_name": "Gulshan",
            "display_address": "Gulshan-2",
            "price_amount": 45000,
        },
    )


def _add_image(client, token: str, listing_id: int):
    return client.post(
        f"/properties/me/{listing_id}/images",
        headers=auth_header(token),
        json={"public_url": f"https://img.example.com/{listing_id}.jpg", "is_cover": True, "byte_size": 1024},
    )


def test_public_contract_snapshot(client):
    owner = register(client, "owner_public@example.com")
    created = _create_listing(client, owner)
    listing_id = created.json()["id"]
    slug = created.json()["slug"]
    _add_image(client, owner, listing_id)
    client.post(f"/properties/me/{listing_id}/submit", headers=auth_header(owner))
    admin = admin_token(client)
    client.post(f"/admin/properties/{listing_id}/approve", headers=auth_header(admin))

    res = client.get("/properties")
    assert res.status_code == 200
    payload = res.json()
    assert {"items", "page", "page_size", "total"} <= set(payload.keys())
    item = payload["items"][0]
    assert {"id", "slug", "title", "listing_purpose", "property_type", "business_phone", "business_email"} <= set(item.keys())
    assert "owner_user_id" not in item
    assert "admin_note" not in item

    detail = client.get(f"/properties/{slug}")
    assert detail.status_code == 200
    d = detail.json()
    assert {"id", "slug", "title", "images", "business_phone"} <= set(d.keys())
    assert "owner_user_id" not in d
