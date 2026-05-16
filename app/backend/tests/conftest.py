import os
from pathlib import Path
import asyncio

import pytest
from fastapi.testclient import TestClient

os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test_realestate_mvp_v1.db"
os.environ["EMAIL_PROVIDER"] = "console"
os.environ["REAL_ESTATE_PUBLIC_PHONE"] = "+8801712345678"

from app.main import app  # noqa: E402
from app.db.session import SessionLocal  # noqa: E402
from app.models.entities import (  # noqa: E402
    EmailAttachment,
    EmailLog,
    EmailTemplate,
    PasswordResetToken,
    PropertyAuditLog,
    PropertyImage,
    PropertyInquiry,
    PropertyListing,
    SecurityEvent,
    User,
)


async def _clear_db() -> None:
    async with SessionLocal() as db:
        # Keep templates seed table and clear runtime entities in FK-safe order.
        for model in [EmailAttachment, EmailLog, PropertyAuditLog, PropertyImage, PropertyInquiry, PropertyListing, PasswordResetToken, SecurityEvent]:
            rows = await db.execute(model.__table__.delete())
            _ = rows
        await db.execute(User.__table__.delete().where(User.role != "admin"))
        await db.commit()


@pytest.fixture()
def client():
    db_file = Path("test_realestate_mvp_v1.db")
    if not db_file.exists():
        db_file.touch()
    with TestClient(app) as c:
        asyncio.run(_clear_db())
        yield c


def auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def register(client: TestClient, email: str, password: str = "Pass12345!") -> str:
    r = client.post("/auth/register", json={"email": email, "password": password, "full_name": email.split("@")[0]})
    assert r.status_code == 200
    return r.json()["access_token"]


def admin_token(client: TestClient) -> str:
    login = client.post("/auth/login", json={"email": "admin@realestate.com", "password": "Admin12345!"})
    assert login.status_code == 200
    return login.json()["access_token"]
