from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class PropertyCreate(BaseModel):
    title: str = Field(min_length=5)
    description: str = Field(min_length=10)
    listing_purpose: str
    property_type: str
    division: str | None = None
    district: str | None = None
    city: str | None = None
    area_name: str | None = None
    display_address: str | None = None
    price_amount: Decimal | None = None
    price_label: str | None = None
    price_visibility: str = "show_price"
    price_period: str | None = None
    bedrooms: int | None = None
    bathrooms: int | None = None
    balconies: int | None = None
    parking_spaces: int | None = None
    floor_number: int | None = None
    total_floors: int | None = None
    size_value: float | None = None
    size_unit: str | None = None
    land_size_value: float | None = None
    land_size_unit: str | None = None
    plot_type: str | None = None
    facing: str | None = None
    handover_status: str | None = None
    handover_date: str | None = None
    furnishing_status: str | None = None
    amenities_json: str | None = None
    nearby_places_json: str | None = None
    map_lat: float | None = None
    map_lng: float | None = None


class PropertyUpdate(PropertyCreate):
    owner_note: str | None = None


class PropertyOut(BaseModel):
    id: int
    slug: str
    title: str
    description: str
    listing_purpose: str
    property_type: str
    status: str
    division: str | None = None
    district: str | None = None
    city: str | None = None
    area_name: str | None = None
    display_address: str | None = None
    price_amount: Decimal | None = None
    bedrooms: int | None = None
    bathrooms: int | None = None
    size_value: float | None = None
    size_unit: str | None = None
    admin_note: str | None = None
    created_at: datetime
    updated_at: datetime


class InquiryCreate(BaseModel):
    name: str
    phone: str
    email: str | None = None
    message: str | None = None
    preferred_contact_method: str | None = None


class ImageCreate(BaseModel):
    public_url: str
    alt_text: str | None = None
    is_cover: bool = False
    byte_size: int | None = None


class AdminNoteRequest(BaseModel):
    note: str | None = None


class InquiryStatusPatch(BaseModel):
    status: str
