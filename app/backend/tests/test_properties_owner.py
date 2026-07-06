from conftest import admin_token, auth_header, register


def test_owner_access_and_lifecycle(client):
    owner = register(client, "owner_life@example.com")
    other = register(client, "other_life@example.com")
    created = client.post(
        "/properties",
        headers=auth_header(owner),
        json={
            "title": "Owner Lifecycle Home",
            "description": "Owner lifecycle description with enough length.",
            "listing_purpose": "rent",
            "property_type": "apartment",
            "city": "Dhaka",
            "division": "Dhaka",
            "district": "Dhaka",
            "area_name": "Banani",
            "display_address": "Banani-11",
            "price_amount": 55000,
        },
    )
    assert created.status_code == 200
    listing_id = created.json()["id"]
    slug = created.json()["slug"]

    denied = client.get(f"/properties/me/{listing_id}", headers=auth_header(other))
    assert denied.status_code == 404

    submit_fail = client.post(f"/properties/me/{listing_id}/submit", headers=auth_header(owner))
    assert submit_fail.status_code == 400

    bad_ext = client.post(
        f"/properties/me/{listing_id}/images",
        headers=auth_header(owner),
        json={"public_url": "https://img.example.com/file.gif", "is_cover": True, "byte_size": 1024},
    )
    assert bad_ext.status_code == 400

    ok_image = client.post(
        f"/properties/me/{listing_id}/images",
        headers=auth_header(owner),
        json={"public_url": "https://img.example.com/file.jpg", "is_cover": True, "byte_size": 1024},
    )
    assert ok_image.status_code == 200

    submit_ok = client.post(f"/properties/me/{listing_id}/submit", headers=auth_header(owner))
    assert submit_ok.status_code == 200

    admin = admin_token(client)
    client.post(f"/admin/properties/{listing_id}/approve", headers=auth_header(admin))
    edited = client.put(
        f"/properties/me/{listing_id}",
        headers=auth_header(owner),
        json={
            "title": "Owner Lifecycle Home Updated",
            "description": "Owner lifecycle description with enough length.",
            "listing_purpose": "rent",
            "property_type": "apartment",
            "city": "Dhaka",
            "division": "Dhaka",
            "district": "Dhaka",
            "area_name": "Banani",
            "display_address": "Banani-11",
            "price_amount": 56000,
        },
    )
    assert edited.status_code == 200
    assert edited.json()["status"] == "pending_review"
    hidden = client.get(f"/properties/{slug}")
    assert hidden.status_code == 404
