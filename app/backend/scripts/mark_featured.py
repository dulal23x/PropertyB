import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import update
from app.models.entities import PropertyListing

DATABASE_URL = "sqlite+aiosqlite:///./bproperty_clone.db"
engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def mark_featured():
    async with async_session() as session:
        # Mark IDs 1, 5, 10, 15, 20 as featured
        featured_ids = [1, 5, 10, 15, 20]
        await session.execute(
            update(PropertyListing)
            .where(PropertyListing.id.in_(featured_ids))
            .values(featured=True)
        )
        await session.commit()
        print(f"Marked listings {featured_ids} as featured.")

if __name__ == "__main__":
    asyncio.run(mark_featured())
