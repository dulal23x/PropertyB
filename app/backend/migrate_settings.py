import asyncio
from app.db.session import engine, SessionLocal
from app.models.base import Base
import app.models.entities as entities
from sqlalchemy import select

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("Created missing tables.")

    async with SessionLocal() as db:
        res = await db.execute(select(entities.SiteSettings).where(entities.SiteSettings.setting_key == 'global_contact_number'))
        setting = res.scalar_one_or_none()
        if not setting:
            new_setting = entities.SiteSettings(
                setting_key="global_contact_number",
                setting_value="+8801957325397",
                description="Default global contact number revealed on public property pages"
            )
            db.add(new_setting)
            await db.commit()
            print("Seeded global_contact_number.")
        else:
            print("global_contact_number already exists.")

if __name__ == "__main__":
    asyncio.run(main())