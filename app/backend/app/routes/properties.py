import hashlib
import re
from datetime import UTC, datetime
from decimal import Decimal
from pathlib import Path
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, Query, Request, File, UploadFile
from sqlalchemy import and_, asc, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.entities import PropertyAuditLog, PropertyImage, PropertyInquiry, PropertyListing, User, SiteSettings
from app.schemas.properties import ImageCreate, InquiryCreate, PropertyCreate, PropertyUpdate
from app.services.property_policies import can_owner_edit, ensure_publicly_visible, validate_listing_type_rules
from app.services.email_service import (
    send_inquiry_confirmation_visitor,
    send_inquiry_received_admin,
    send_listing_submitted_admin,
    send_listing_submitted_owner,
)

router = APIRouter(prefix="/properties", tags=["properties"])


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def _ext_from_url(url: str) -> str:
    path = urlparse(url).path.lower()
    if "." not in path:
        return ""
    return path.rsplit(".", 1)[-1]


def public_shape(l: PropertyListing) -> dict:
    return {
        "id": l.id,
        "slug": l.slug,
        "title": l.title,
        "description": l.description,
        "listing_purpose": l.listing_purpose,
        "property_type": l.property_type,
        "status": l.status,
        "division": l.division,
        "district": l.district,
        "city": l.city,
        "area_name": l.area_name,
        "display_address": l.display_address,
        "price_amount": l.price_amount,
        "price_label": l.price_label,
        "price_visibility": l.price_visibility,
        "currency": l.currency,
        "price_period": l.price_period,
        "bedrooms": l.bedrooms,
        "bathrooms": l.bathrooms,
        "size_value": l.size_value,
        "size_unit": l.size_unit,
        "land_size_value": l.land_size_value,
        "land_size_unit": l.land_size_unit,
        "featured": l.featured,
        "business_phone": settings.real_estate_public_phone,
        "business_email": settings.real_estate_public_email,
    }


def owner_shape(l: PropertyListing) -> dict:
    return {
        **public_shape(l),
        "owner_note": l.owner_note,
        "admin_note": l.admin_note,
        "updated_at": l.updated_at,
        "created_at": l.created_at,
    }


def _next_action(status: str) -> str:
    return {
        "draft": "submit_for_review",
        "pending_review": "wait_for_admin_review",
        "approved": "view_public_or_edit_and_resubmit",
        "rejected": "fix_and_resubmit",
        "unpublished": "edit_and_resubmit",
        "archived": "view_only",
    }.get(status, "review")


def _validate_listing_payload(payload: PropertyCreate) -> None:
    validate_listing_type_rules(payload.listing_purpose, payload.property_type, payload.price_visibility)


async def _require_submission_ready(db: AsyncSession, listing: PropertyListing) -> None:
    if not listing.title or not listing.description:
        raise HTTPException(status_code=400, detail="Listing title and description are required")
    if not listing.city or not listing.area_name or not listing.display_address:
        raise HTTPException(status_code=400, detail="City, area_name, and display_address are required")
    if listing.price_visibility != "call_for_price" and listing.price_amount is None:
        raise HTTPException(status_code=400, detail="price_amount is required unless call_for_price")
    if listing.property_type == "land" and listing.land_size_value is None:
        raise HTTPException(status_code=400, detail="land_size_value is required for land listings")
    if settings.require_image_for_approval:
        count_res = await db.execute(select(func.count()).select_from(PropertyImage).where(PropertyImage.listing_id == listing.id))
        if count_res.scalar_one() < 1:
            raise HTTPException(status_code=400, detail="At least one image is required before submission")


@router.get("")
async def list_public(
    keyword: str | None = None,
    purpose: str | None = None,
    listing_purpose: str | None = None,
    property_type: str | None = None,
    type: str | None = None,
    division: str | None = None,
    district: str | None = None,
    city: str | None = None,
    area_name: str | None = None,
    min_price: Decimal | None = None,
    max_price: Decimal | None = None,
    bedrooms: int | None = None,
    bathrooms: int | None = None,
    min_size: float | None = None,
    max_size: float | None = None,
    size_unit: str | None = None,
    land_size_min: float | None = None,
    land_size_max: float | None = None,
    land_size_unit: str | None = None,
    price_visibility: str | None = None,
    sort: str = "newest",
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    filters = [PropertyListing.status == "approved"]
    
    # Handle purpose alias
    effective_purpose = listing_purpose or purpose

    if keyword:
        filters.append(or_(PropertyListing.title.ilike(f"%{keyword}%"), PropertyListing.description.ilike(f"%{keyword}%")))
    if effective_purpose:
        filters.append(PropertyListing.listing_purpose == effective_purpose)
    effective_property_type = property_type or type
    if effective_property_type:
        filters.append(PropertyListing.property_type == effective_property_type)
    if division:
        filters.append(PropertyListing.division == division)
    if district:
        filters.append(PropertyListing.district == district)
    if city:
        filters.append(PropertyListing.city == city)
    if area_name:
        filters.append(PropertyListing.area_name == area_name)
    if min_price is not None:
        filters.append(PropertyListing.price_amount >= min_price)
    if max_price is not None:
        filters.append(PropertyListing.price_amount <= max_price)
    if bedrooms is not None:
        filters.append(PropertyListing.bedrooms == bedrooms)
    if bathrooms is not None:
        filters.append(PropertyListing.bathrooms == bathrooms)
    if min_size is not None:
        filters.append(PropertyListing.size_value >= min_size)
    if max_size is not None:
        filters.append(PropertyListing.size_value <= max_size)
    if size_unit:
        filters.append(PropertyListing.size_unit == size_unit)
    if land_size_min is not None:
        filters.append(PropertyListing.land_size_value >= land_size_min)
    if land_size_max is not None:
        filters.append(PropertyListing.land_size_value <= land_size_max)
    if land_size_unit:
        filters.append(PropertyListing.land_size_unit == land_size_unit)
    if price_visibility:
        filters.append(PropertyListing.price_visibility == price_visibility)

    order_clause = desc(PropertyListing.created_at)
    if sort == "price_asc":
        order_clause = asc(PropertyListing.price_amount)
    elif sort == "price_desc":
        order_clause = desc(PropertyListing.price_amount)
    elif sort == "size_desc":
        order_clause = desc(PropertyListing.size_value)
    elif sort == "featured_first":
        order_clause = desc(PropertyListing.featured)

    total_q = await db.execute(select(func.count()).select_from(PropertyListing).where(and_(*filters)))
    total = total_q.scalar_one()
    offset = (page - 1) * page_size
    
    # Fetch properties with their cover images
    rows = await db.execute(
        select(PropertyListing)
        .where(and_(*filters))
        .order_by(order_clause, desc(PropertyListing.created_at))
        .offset(offset)
        .limit(page_size)
    )
    
    items = []
    for l in rows.scalars().all():
        data = public_shape(l)
        # Find cover image
        img_res = await db.execute(
            select(PropertyImage)
            .where(PropertyImage.listing_id == l.id)
            .order_by(desc(PropertyImage.is_cover), asc(PropertyImage.sort_order))
            .limit(1)
        )
        cover = img_res.scalar_one_or_none()
        data["cover_image_url"] = cover.public_url if cover else None
        
        # Count all images
        count_res = await db.execute(select(func.count()).select_from(PropertyImage).where(PropertyImage.listing_id == l.id))
        data["image_count"] = count_res.scalar_one()
        
        items.append(data)

    return {"items": items, "page": page, "page_size": page_size, "total": total}


@router.get("/me")
async def my_listings(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PropertyListing).where(PropertyListing.owner_user_id == current_user.id).order_by(PropertyListing.updated_at.desc()))
    items = []
    for row in result.scalars().all():
        item = owner_shape(row)
        item["next_action"] = _next_action(row.status)
        items.append(item)
    return {"items": items}


@router.post("")
async def create_listing(payload: PropertyCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    _validate_listing_payload(payload)
    slug = f"{slugify(payload.title)}-{int(datetime.now(UTC).timestamp())}"
    listing = PropertyListing(owner_user_id=current_user.id, slug=slug, **payload.model_dump())
    db.add(listing)
    await db.commit()
    await db.refresh(listing)
    db.add(PropertyAuditLog(listing_id=listing.id, actor_user_id=current_user.id, action="created", from_status=None, to_status="draft"))
    await db.commit()
    return owner_shape(listing)


@router.get("/me/{listing_id}")
async def my_listing_detail(listing_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PropertyListing).where(PropertyListing.id == listing_id, PropertyListing.owner_user_id == current_user.id))
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    payload = owner_shape(listing)
    payload["next_action"] = _next_action(listing.status)
    return payload


@router.put("/me/{listing_id}")
async def update_my_listing(listing_id: int, payload: PropertyUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    _validate_listing_payload(payload)
    result = await db.execute(select(PropertyListing).where(PropertyListing.id == listing_id, PropertyListing.owner_user_id == current_user.id))
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if not can_owner_edit(listing.status):
        raise HTTPException(status_code=400, detail="Listing cannot be edited in current status")
    old_status = listing.status
    for k, v in payload.model_dump().items():
        setattr(listing, k, v)
    if old_status == "approved":
        listing.status = "pending_review"
    db.add(PropertyAuditLog(listing_id=listing.id, actor_user_id=current_user.id, action="updated", from_status=old_status, to_status=listing.status))
    await db.commit()
    await db.refresh(listing)
    return owner_shape(listing)


@router.post("/me/{listing_id}/submit")
async def submit_listing(listing_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PropertyListing).where(PropertyListing.id == listing_id, PropertyListing.owner_user_id == current_user.id))
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    await _require_submission_ready(db, listing)
    old_status = listing.status
    listing.status = "pending_review"
    db.add(PropertyAuditLog(listing_id=listing.id, actor_user_id=current_user.id, action="submitted", from_status=old_status, to_status="pending_review"))
    await db.commit()
    await send_listing_submitted_owner(db, current_user.email, listing.title)
    await send_listing_submitted_admin(db, settings.real_estate_admin_alert_email, listing.title, listing.id)
    return {"id": listing.id, "status": listing.status}


@router.post("/me/{listing_id}/images")
async def add_image(listing_id: int, payload: ImageCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(PropertyListing).where(PropertyListing.id == listing_id, PropertyListing.owner_user_id == current_user.id))
    listing = res.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    ext = _ext_from_url(payload.public_url)
    allowed_exts = {x.strip().lower() for x in settings.property_image_allowed_extensions.split(",") if x.strip()}
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"Unsupported image extension: {ext or 'none'}")
    if payload.byte_size is not None and payload.byte_size > settings.property_image_max_bytes:
        raise HTTPException(status_code=400, detail="Image exceeds max allowed size")
    count_res = await db.execute(select(func.count()).select_from(PropertyImage).where(PropertyImage.listing_id == listing.id))
    if count_res.scalar_one() >= settings.property_image_max_count:
        raise HTTPException(status_code=400, detail="Image limit reached for this listing")
    if payload.is_cover:
        existing = await db.execute(select(PropertyImage).where(PropertyImage.listing_id == listing.id, PropertyImage.is_cover.is_(True)))
        for item in existing.scalars().all():
            item.is_cover = False
    image = PropertyImage(
        listing_id=listing.id,
        storage_path=f"userdata/property-images/{listing.id}/{int(datetime.now(UTC).timestamp())}.{ext}",
        public_url=payload.public_url,
        alt_text=payload.alt_text,
        is_cover=payload.is_cover,
        uploaded_by_user_id=current_user.id,
    )
    db.add(image)
    db.add(PropertyAuditLog(listing_id=listing.id, actor_user_id=current_user.id, action="image_added", from_status=listing.status, to_status=listing.status))
    await db.commit()
    await db.refresh(image)
    return {"id": image.id, "listing_id": image.listing_id, "public_url": image.public_url, "alt_text": image.alt_text, "is_cover": image.is_cover}


@router.get("/me/{listing_id}/images")
async def get_listing_images(listing_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(PropertyListing).where(PropertyListing.id == listing_id, PropertyListing.owner_user_id == current_user.id))
    listing = res.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    images = await db.execute(
        select(PropertyImage).where(PropertyImage.listing_id == listing_id).order_by(desc(PropertyImage.is_cover), asc(PropertyImage.sort_order), desc(PropertyImage.created_at))
    )
    return [{"id": x.id, "public_url": x.public_url, "alt_text": x.alt_text, "is_cover": x.is_cover} for x in images.scalars().all()]


@router.post("/me/{listing_id}/upload-image")
async def upload_image(
    listing_id: int,
    file: UploadFile = File(...),
    is_cover: bool = Query(default=False),
    alt_text: str | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(PropertyListing).where(PropertyListing.id == listing_id, PropertyListing.owner_user_id == current_user.id))
    listing = res.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Check limits
    count_res = await db.execute(select(func.count()).select_from(PropertyImage).where(PropertyImage.listing_id == listing.id))
    if count_res.scalar_one() >= settings.property_image_max_count:
        raise HTTPException(status_code=400, detail="Image limit reached")

    # Extension check
    ext = file.filename.split(".")[-1].lower() if file.filename and "." in file.filename else ""
    allowed_exts = {x.strip().lower() for x in settings.property_image_allowed_extensions.split(",") if x.strip()}
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail="Unsupported image extension")

    # Storage path
    image_id = int(datetime.now(UTC).timestamp())
    filename = f"{image_id}.{ext}"
    rel_path = f"{listing.id}/{filename}"
    abs_dir = PROPERTY_IMAGE_DIR / str(listing.id)
    abs_dir.mkdir(parents=True, exist_ok=True)
    abs_path = abs_dir / filename

    content = await file.read()
    if len(content) > settings.property_image_max_bytes:
        raise HTTPException(status_code=400, detail="File too large")

    with open(abs_path, "wb") as f:
        f.write(content)

    public_url = f"/images/{rel_path}"

    if is_cover:
        # Unset previous covers
        await db.execute(
            PropertyImage.__table__.update()
            .where(PropertyImage.listing_id == listing.id)
            .values(is_cover=False)
        )

    image = PropertyImage(
        listing_id=listing.id,
        storage_path=f"userdata/property-images/{rel_path}",
        public_url=public_url,
        alt_text=alt_text,
        is_cover=is_cover,
        uploaded_by_user_id=current_user.id,
    )
    db.add(image)
    db.add(PropertyAuditLog(listing_id=listing.id, actor_user_id=current_user.id, action="image_added"))
    await db.commit()
    await db.refresh(image)
    return {"id": image.id, "public_url": image.public_url, "is_cover": image.is_cover}


@router.delete("/me/{listing_id}/images/{image_id}")
async def delete_image(listing_id: int, image_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(PropertyListing).where(PropertyListing.id == listing_id, PropertyListing.owner_user_id == current_user.id))
    listing = res.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    image_res = await db.execute(select(PropertyImage).where(PropertyImage.id == image_id, PropertyImage.listing_id == listing_id))
    image = image_res.scalar_one_or_none()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    await db.delete(image)
    db.add(PropertyAuditLog(listing_id=listing.id, actor_user_id=current_user.id, action="image_removed", from_status=listing.status, to_status=listing.status))
    await db.commit()
    return {"deleted": True}


@router.delete("/me/{listing_id}")
async def delete_listing(listing_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(PropertyListing).where(PropertyListing.id == listing_id, PropertyListing.owner_user_id == current_user.id))
    listing = res.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.status in {"draft", "rejected"}:
        await db.delete(listing)
        await db.commit()
        return {"deleted": True}
    if listing.status in {"approved", "unpublished"}:
        old = listing.status
        listing.status = "archived"
        db.add(PropertyAuditLog(listing_id=listing.id, actor_user_id=current_user.id, action="archived", from_status=old, to_status="archived"))
        await db.commit()
        return {"deleted": False, "archived": True}
    raise HTTPException(status_code=400, detail="Listing cannot be deleted in current status")


@router.get("/global-contact")
async def get_global_contact(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(SiteSettings).where(SiteSettings.setting_key == "global_contact_number"))
    setting = res.scalar_one_or_none()
    number = setting.setting_value if setting else settings.real_estate_public_phone
    return {"contact_number": number}


@router.get("/{slug}")
async def detail_public(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PropertyListing).where(PropertyListing.slug == slug, PropertyListing.status == "approved"))
    listing = ensure_publicly_visible(result.scalar_one_or_none())
    images = await db.execute(
        select(PropertyImage).where(PropertyImage.listing_id == listing.id).order_by(desc(PropertyImage.is_cover), asc(PropertyImage.sort_order), desc(PropertyImage.created_at))
    )
    return {**public_shape(listing), "images": [{"id": x.id, "public_url": x.public_url, "alt_text": x.alt_text, "is_cover": x.is_cover} for x in images.scalars().all()]}


@router.post("/{listing_id}/inquiries")
async def create_inquiry(listing_id: int, payload: InquiryCreate, request: Request, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(PropertyListing).where(PropertyListing.id == listing_id, PropertyListing.status == "approved"))
    listing = res.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not available")
    ip = request.client.host if request.client else "unknown"
    inquiry = PropertyInquiry(
        listing_id=listing.id,
        name=payload.name,
        phone=payload.phone,
        email=payload.email,
        message=payload.message,
        preferred_contact_method=payload.preferred_contact_method or "phone",
        source_page=str(request.url),
        ip_hash=hashlib.sha256(ip.encode()).hexdigest(),
        user_agent=request.headers.get("user-agent"),
    )
    db.add(inquiry)
    await db.commit()
    await db.refresh(inquiry)
    await send_inquiry_received_admin(db, settings.real_estate_admin_alert_email, listing.title, inquiry.id)
    if payload.email:
        await send_inquiry_confirmation_visitor(db, payload.email, listing.title)
    return {"id": inquiry.id, "status": inquiry.status, "message": "Inquiry submitted"}


@router.get("/global-contact")
async def get_global_contact(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(SiteSettings).where(SiteSettings.setting_key == "global_contact_number"))
    setting = res.scalar_one_or_none()
    number = setting.setting_value if setting else settings.real_estate_public_phone
    return {"contact_number": number}

