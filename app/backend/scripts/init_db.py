import asyncio

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import SessionLocal, engine
from app.models.base import Base
from app.models.entities import User
from app.services.email_service import ensure_default_templates


async def run():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with SessionLocal() as db:
        await ensure_default_templates(db)
        res = await db.execute(select(User).where(User.role == "admin"))
        if not res.scalar_one_or_none():
            db.add(User(email="admin@realestate.com", password_hash=hash_password("Admin12345!"), role="admin", full_name="Default Admin"))
            await db.commit()


if __name__ == "__main__":
    asyncio.run(run())
