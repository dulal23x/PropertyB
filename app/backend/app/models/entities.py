from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


def utcnow() -> datetime:
    return datetime.now(UTC)


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="client", index=True)
    full_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), index=True)
    token: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    used: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class PropertyListing(Base):
    __tablename__ = "property_listings"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    owner_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text)
    listing_purpose: Mapped[str] = mapped_column(String(20), index=True)
    property_type: Mapped[str] = mapped_column(String(30), index=True)
    property_subtype: Mapped[str | None] = mapped_column(String(30), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="draft", index=True)
    price_amount: Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    price_label: Mapped[str | None] = mapped_column(String(120), nullable=True)
    price_visibility: Mapped[str] = mapped_column(String(30), default="show_price")
    currency: Mapped[str] = mapped_column(String(10), default="BDT")
    price_period: Mapped[str | None] = mapped_column(String(30), nullable=True)
    division: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    district: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    city: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    area_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    address_line: Mapped[str | None] = mapped_column(String(255), nullable=True)
    display_address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    bedrooms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    bathrooms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    balconies: Mapped[int | None] = mapped_column(Integer, nullable=True)
    parking_spaces: Mapped[int | None] = mapped_column(Integer, nullable=True)
    floor_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    total_floors: Mapped[int | None] = mapped_column(Integer, nullable=True)
    size_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    size_unit: Mapped[str | None] = mapped_column(String(20), nullable=True)
    land_size_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    land_size_unit: Mapped[str | None] = mapped_column(String(20), nullable=True)
    plot_type: Mapped[str | None] = mapped_column(String(30), nullable=True)
    facing: Mapped[str | None] = mapped_column(String(40), nullable=True)
    handover_status: Mapped[str | None] = mapped_column(String(40), nullable=True)
    handover_date: Mapped[str | None] = mapped_column(String(40), nullable=True)
    furnishing_status: Mapped[str | None] = mapped_column(String(40), nullable=True)
    amenities_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    nearby_places_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    map_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    map_lng: Mapped[float | None] = mapped_column(Float, nullable=True)
    owner_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    admin_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    approved_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    rejected_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    unpublished_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)


class PropertyImage(Base):
    __tablename__ = "property_images"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    listing_id: Mapped[int] = mapped_column(ForeignKey("property_listings.id"), index=True)
    storage_path: Mapped[str] = mapped_column(String(255))
    public_url: Mapped[str] = mapped_column(String(255))
    alt_text: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_cover: Mapped[bool] = mapped_column(Boolean, default=False)
    uploaded_by_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class PropertyInquiry(Base):
    __tablename__ = "property_inquiries"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    listing_id: Mapped[int] = mapped_column(ForeignKey("property_listings.id"), index=True)
    name: Mapped[str] = mapped_column(String(120))
    phone: Mapped[str] = mapped_column(String(40))
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    preferred_contact_method: Mapped[str | None] = mapped_column(String(30), nullable=True)
    source_page: Mapped[str | None] = mapped_column(String(255), nullable=True)
    ip_hash: Mapped[str | None] = mapped_column(String(120), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="new", index=True)
    assigned_admin_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)


class PropertyAuditLog(Base):
    __tablename__ = "property_audit_logs"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    listing_id: Mapped[int] = mapped_column(ForeignKey("property_listings.id"), index=True)
    actor_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    action: Mapped[str] = mapped_column(String(80))
    from_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    to_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class EmailLog(Base):
    __tablename__ = "email_logs"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    sender_type: Mapped[str] = mapped_column(String(30))
    to_email: Mapped[str] = mapped_column(String(255), index=True)
    subject: Mapped[str] = mapped_column(String(255))
    body: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(30), default="sent")
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class EmailAttachment(Base):
    __tablename__ = "email_attachments"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email_log_id: Mapped[int] = mapped_column(ForeignKey("email_logs.id"), index=True)
    filename: Mapped[str] = mapped_column(String(255))
    storage_path: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class EmailTemplate(Base):
    __tablename__ = "email_templates"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    template_key: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    subject: Mapped[str] = mapped_column(String(255))
    body: Mapped[str] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)


class SecurityEvent(Base):
    __tablename__ = "security_events"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    event_type: Mapped[str] = mapped_column(String(120), index=True)
    ip: Mapped[str | None] = mapped_column(String(80), nullable=True)
    detail: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class SiteSettings(Base):
    __tablename__ = "site_settings"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    setting_key: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    setting_value: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)
