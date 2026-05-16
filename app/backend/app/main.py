import uuid
from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.bootstrap import ensure_runtime_schema
from app.db.session import engine
from app.models.base import Base
from app.models.entities import User
from app.routes import admin, auth, health, properties
from app.services.email_service import ensure_default_templates
from app.db.session import SessionLocal
from app.core.security import hash_password
from sqlalchemy import select

logger = logging.getLogger("realestate.backend")


@asynccontextmanager
async def lifespan(_: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await ensure_runtime_schema(engine)
    async with SessionLocal() as db:
        await ensure_default_templates(db)
        admin_exists = await db.execute(select(User).where(User.role == "admin"))
        if not admin_exists.scalar_one_or_none():
            db.add(User(email="admin@realestate.com", password_hash=hash_password("Admin12345!"), role="admin", full_name="Default Admin"))
            await db.commit()
    logger.info("startup_ok db=%s email_provider=%s port=%s", settings.database_url.split("/")[-1], settings.email_provider, settings.port)
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[x.strip() for x in settings.allowed_origins.split(",") if x.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    req_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    response = await call_next(request)
    response.headers["X-Request-ID"] = req_id
    return response


@app.exception_handler(Exception)
async def internal_error_handler(_: Request, exc: Exception):
    logger.exception("unhandled_exception", exc_info=exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


app.include_router(health.router)
app.include_router(auth.router)
app.include_router(properties.router)
app.include_router(admin.router)

# Static file serving for property images
app.mount("/images", StaticFiles(directory="userdata/property-images"), name="images")
