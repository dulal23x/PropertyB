from fastapi import APIRouter

from app.core.config import settings

router = APIRouter(tags=["health"])


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.get("/health/email")
async def health_email():
    return {"provider": settings.email_provider, "status": "ok"}
