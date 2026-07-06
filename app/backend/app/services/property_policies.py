from fastapi import HTTPException

from app.models.entities import PropertyListing

PROPERTY_TYPES = {"apartment", "house", "land", "commercial", "office", "shop", "warehouse", "factory", "other"}
LISTING_PURPOSES = {"sale", "rent"}
PRICE_VISIBILITY = {"show_price", "call_for_price"}


def validate_listing_type_rules(listing_purpose: str, property_type: str, price_visibility: str) -> None:
    if listing_purpose not in LISTING_PURPOSES:
        raise HTTPException(status_code=400, detail="Invalid listing_purpose")
    if property_type not in PROPERTY_TYPES:
        raise HTTPException(status_code=400, detail="Invalid property_type")
    if price_visibility not in PRICE_VISIBILITY:
        raise HTTPException(status_code=400, detail="Invalid price_visibility")


def ensure_publicly_visible(listing: PropertyListing | None) -> PropertyListing:
    if not listing or listing.status != "approved":
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


def can_owner_edit(status: str) -> bool:
    return status in {"draft", "rejected", "unpublished", "approved"}
