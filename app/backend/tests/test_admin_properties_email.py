from conftest import admin_token, auth_header, register


def test_admin_property_detail_contract_and_email_logs(client):
    owner = register(client, "owner_admin@example.com")
    created = client.post(
        "/properties",
        headers=auth_header(owner),
        json={
            "title": "Admin Detail Listing",
            "description": "Admin detail listing description with enough length.",
            "listing_purpose": "rent",
            "property_type": "office",
            "city": "Dhaka",
            "division": "Dhaka",
            "district": "Dhaka",
            "area_name": "Motijheel",
            "display_address": "Motijheel C/A",
            "price_amount": 90000,
        },
    )
    listing_id = created.json()["id"]
    client.post(
        f"/properties/me/{listing_id}/images",
        headers=auth_header(owner),
        json={"public_url": "https://img.example.com/admin.jpg", "is_cover": True, "byte_size": 1024},
    )
    client.post(f"/properties/me/{listing_id}/submit", headers=auth_header(owner))

    admin = admin_token(client)
    approve = client.post(f"/admin/properties/{listing_id}/approve", headers=auth_header(admin))
    assert approve.status_code == 200

    detail = client.get(f"/admin/properties/{listing_id}", headers=auth_header(admin))
    assert detail.status_code == 200
    body = detail.json()
    assert {"listing", "owner", "images", "audit_logs"} <= set(body.keys())
    assert {"id", "title", "status", "property_type"} <= set(body["listing"].keys())
    assert {"id", "email"} <= set(body["owner"].keys())

    reject = client.post(f"/admin/properties/{listing_id}/reject", headers=auth_header(admin), json={"note": "Update details"})
    assert reject.status_code == 200

    logs = client.get("/admin/email/logs", headers=auth_header(admin))
    assert logs.status_code == 200
    assert len(logs.json()["items"]) >= 3
