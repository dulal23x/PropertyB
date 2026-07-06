import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.entities import PasswordResetToken, User
from app.schemas.auth import (
    LoginRequest,
    PasswordResetConfirm,
    PasswordResetRequest,
    PasswordResetValidate,
    RegisterRequest,
    TokenResponse,
    UserResponse,
    UserUpdateRequest,
)
from app.services.email_service import send_password_reset_email, send_welcome_email

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == payload.email.lower()))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already exists")
    user = User(email=payload.email.lower(), password_hash=hash_password(payload.password), full_name=payload.full_name, role="client")
    db.add(user)
    await db.commit()
    await db.refresh(user)
    await send_welcome_email(db, user.email)
    return TokenResponse(access_token=create_access_token(str(user.id)))


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email.lower()))
    user = result.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return TokenResponse(access_token=create_access_token(str(user.id)))


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return UserResponse(id=current_user.id, email=current_user.email, role=current_user.role, full_name=current_user.full_name)


@router.patch("/me", response_model=UserResponse)
async def update_me(payload: UserUpdateRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    await db.commit()
    await db.refresh(current_user)
    return UserResponse(id=current_user.id, email=current_user.email, role=current_user.role, full_name=current_user.full_name)


@router.post("/password-reset/request")
async def password_reset_request(payload: PasswordResetRequest, db: AsyncSession = Depends(get_db)):
    token = secrets.token_urlsafe(24)
    db.add(
        PasswordResetToken(
            email=payload.email.lower(),
            token=token,
            expires_at=datetime.utcnow() + timedelta(hours=1),
        )
    )
    await db.commit()
    await send_password_reset_email(db, payload.email.lower(), token)
    return {"message": "If account exists, reset instructions were sent."}


@router.get("/password-reset/validate")
async def password_reset_validate(payload: PasswordResetValidate = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PasswordResetToken).where(PasswordResetToken.token == payload.token, PasswordResetToken.used.is_(False)))
    token = result.scalar_one_or_none()
    valid = bool(token and token.expires_at > datetime.utcnow())
    return {"valid": valid}


@router.post("/password-reset/confirm")
async def password_reset_confirm(payload: PasswordResetConfirm, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PasswordResetToken).where(PasswordResetToken.token == payload.token, PasswordResetToken.used.is_(False)))
    token = result.scalar_one_or_none()
    if not token or token.expires_at <= datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    user_res = await db.execute(select(User).where(User.email == token.email))
    user = user_res.scalar_one_or_none()
    if user:
        user.password_hash = hash_password(payload.new_password)
    token.used = True
    await db.commit()
    return {"message": "Password updated"}
