from conftest import admin_token, auth_header, register


def test_admin_users_listing_and_update(client):
    owner = register(client, "owner_users@example.com")
    admin = admin_token(client)

    list_res = client.get("/admin/users", headers=auth_header(admin))
    assert list_res.status_code == 200
    owner_row = next(u for u in list_res.json()["items"] if u["email"] == "owner_users@example.com")

    update = client.patch(
        f"/admin/users/{owner_row['id']}",
        headers=auth_header(admin),
        json={"full_name": "Updated Owner", "is_active": False},
    )
    assert update.status_code == 200
    assert update.json()["full_name"] == "Updated Owner"
    assert update.json()["is_active"] is False
