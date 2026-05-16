from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: str
    full_name: str | None = None


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetValidate(BaseModel):
    token: str


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(min_length=8)
