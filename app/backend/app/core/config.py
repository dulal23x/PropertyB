from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "RealEstateSite Backend"
    port: int = 8090
    frontend_url: str = "http://localhost:3010"
    allowed_origins: str = "http://localhost:3010,http://127.0.0.1:3010,http://localhost:3000,http://127.0.0.1:3000"
    database_url: str = "sqlite+aiosqlite:///./realestate_mvp_v1.db"
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    email_provider: str = "console"
    email_log_dir: str = "./userdata/logs/emails"
    real_estate_public_phone: str = "+8801000000000"
    real_estate_public_email: str = "info@example.com"
    real_estate_support_email: str = "support@example.com"
    real_estate_admin_alert_email: str = "admin@example.com"
    property_image_max_count: int = Field(default=10, ge=1)
    property_image_max_bytes: int = Field(default=5 * 1024 * 1024, ge=1024)
    property_image_allowed_extensions: str = "jpg,jpeg,png,webp"
    require_image_for_approval: bool = True

    admin_write_hourly_limit: int = Field(default=200, ge=1)
    register_ip_limit_per_hour: int = Field(default=20, ge=1)
    login_max_failed_attempts: int = Field(default=10, ge=1)


settings = Settings()


def validate_database_url(database_url: str) -> None:
    lower = database_url.lower()
    if "clearlyhired_v2.db" in lower:
        raise RuntimeError("Unsafe DATABASE_URL: clearlyhired_v2.db is forbidden.")
    if "clearlyhired" in lower:
        raise RuntimeError("Unsafe DATABASE_URL: ClearlyHired paths are forbidden.")
    if "test_realestate_mvp_v1.db" in lower:
        return
    if "bproperty_clone.db" in lower:
        return
    if "realestate_mvp_v1.db" not in lower:
        raise RuntimeError("Unsafe DATABASE_URL: must target realestate_mvp_v1.db, bproperty_clone.db or approved test DB.")


validate_database_url(settings.database_url)
