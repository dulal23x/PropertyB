from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.bootstrap import find_legacy_candidate_tables, get_v2_drift_counts
from app.core.deps import require_admin
from app.db.session import engine, get_db
from app.models.entities import EmailLog, EmailTemplate, PropertyAuditLog, PropertyImage, PropertyInquiry, PropertyListing, User
from app.schemas.email import EmailSendRequest, EmailTemplateUpdate
from app.schemas.admin import AdminUserUpdate, BulkActionRequest
from app.schemas.properties import AdminNoteRequest, InquiryStatusPatch
from app.services.email_service import (
    email_server_stats,
    send_email,
    send_listing_approved_owner,
    send_listing_rejected_owner,
    send_listing_unpublished_owner,
)

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


def add_audit(db: AsyncSession, listing_id: int, actor_user_id: int, action: str, from_status: str | None, to_status: str | None, note: str | None = None):
    db.add(PropertyAuditLog(listing_id=listing_id, actor_user_id=actor_user_id, action=action, from_status=from_status, to_status=to_status, note=note))


def listing_shape(
    l: PropertyListing,
    owner_email: str | None = None,
    cover_image_url: str | None = None,
    image_count: int | None = None,
) -> dict:
    return {
        "id": l.id,
        "owner_user_id": l.owner_user_id,
        "owner_email": owner_email,
        "title": l.title,
        "slug": l.slug,
        "description": l.description,
        "status": l.status,
        "listing_purpose": l.listing_purpose,
        "property_type": l.property_type,
        "property_subtype": l.property_subtype,
        "division": l.division,
        "district": l.district,
        "city": l.city,
        "area_name": l.area_name,
        "display_address": l.display_address,
        "address_line": l.address_line,
        "price_amount": l.price_amount,
        "price_label": l.price_label,
        "price_visibility": l.price_visibility,
        "currency": l.currency,
        "price_period": l.price_period,
        "bedrooms": l.bedrooms,
        "bathrooms": l.bathrooms,
        "balconies": l.balconies,
        "parking_spaces": l.parking_spaces,
        "floor_number": l.floor_number,
        "total_floors": l.total_floors,
        "size_value": l.size_value,
        "size_unit": l.size_unit,
        "land_size_value": l.land_size_value,
        "land_size_unit": l.land_size_unit,
        "featured": l.featured,
        "admin_note": l.admin_note,
        "cover_image_url": cover_image_url,
        "image_count": image_count,
        "created_at": l.created_at,
        "updated_at": l.updated_at,
    }


def inquiry_shape(i: PropertyInquiry, listing_title: str | None = None, listing_slug: str | None = None) -> dict:
    return {
        "id": i.id,
        "listing_id": i.listing_id,
        "listing_title": listing_title,
        "listing_slug": listing_slug,
        "name": i.name,
        "phone": i.phone,
        "email": i.email,
        "message": i.message,
        "preferred_contact_method": i.preferred_contact_method,
        "status": i.status,
        "created_at": i.created_at,
        "updated_at": i.updated_at,
    }


@router.get("/properties")
async def admin_properties(
    status: str | None = None,
    property_type: str | None = None,
    listing_purpose: str | None = None,
    city: str | None = None,
    area_name: str | None = None,
    owner_email: str | None = None,
    keyword: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    filters = []
    if status:
        filters.append(PropertyListing.status == status)
    if property_type:
        filters.append(PropertyListing.property_type == property_type)
    if listing_purpose:
        filters.append(PropertyListing.listing_purpose == listing_purpose)
    if city:
        filters.append(PropertyListing.city == city)
    if area_name:
        filters.append(PropertyListing.area_name == area_name)
    if keyword:
        filters.append(or_(PropertyListing.title.ilike(f"%{keyword}%"), PropertyListing.description.ilike(f"%{keyword}%")))
    if owner_email:
        owner_rows = await db.execute(select(User.id).where(User.email == owner_email.lower()))
        owner_ids = list(owner_rows.scalars().all()) or [-1]
        filters.append(PropertyListing.owner_user_id.in_(owner_ids))
    where = and_(*filters) if filters else True
    total_q = await db.execute(select(func.count()).select_from(PropertyListing).where(where))
    total = total_q.scalar_one()
    rows = await db.execute(
        select(PropertyListing).where(where).order_by(desc(PropertyListing.updated_at)).offset((page - 1) * page_size).limit(page_size)
    )
    items = []
    for listing in rows.scalars().all():
        owner_res = await db.execute(select(User.email).where(User.id == listing.owner_user_id))
        image_res = await db.execute(
            select(PropertyImage)
            .where(PropertyImage.listing_id == listing.id)
            .order_by(desc(PropertyImage.is_cover), desc(PropertyImage.created_at))
            .limit(1)
        )
        count_res = await db.execute(select(func.count()).select_from(PropertyImage).where(PropertyImage.listing_id == listing.id))
        cover = image_res.scalar_one_or_none()
        items.append(
            listing_shape(
                listing,
                owner_email=owner_res.scalar_one_or_none(),
                cover_image_url=cover.public_url if cover else None,
                image_count=count_res.scalar_one(),
            )
        )
    return {"items": items, "page": page, "page_size": page_size, "total": total}


@router.get("/users")
async def admin_users(db: AsyncSession = Depends(get_db)):
    rows = await db.execute(select(User).order_by(desc(User.created_at)))
    return {
        "items": [
            {"id": u.id, "email": u.email, "role": u.role, "full_name": u.full_name, "is_active": u.is_active, "created_at": u.created_at}
            for u in rows.scalars().all()
        ]
    }


@router.patch("/users/{user_id}")
async def admin_update_user(user_id: int, payload: AdminUserUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.role is not None:
        if payload.role not in {"client", "admin"}:
            raise HTTPException(status_code=400, detail="Invalid role")
        user.role = payload.role
    if payload.is_active is not None:
        user.is_active = payload.is_active
    await db.commit()
    return {"id": user.id, "email": user.email, "role": user.role, "full_name": user.full_name, "is_active": user.is_active, "created_at": user.created_at}


@router.get("/properties/stats")
async def admin_property_stats(db: AsyncSession = Depends(get_db)):
    counts = {}
    for s in ["pending_review", "approved", "rejected", "unpublished", "archived", "draft"]:
        q = await db.execute(select(func.count()).select_from(PropertyListing).where(PropertyListing.status == s))
        counts[s] = q.scalar_one()
    inq = await db.execute(select(func.count()).select_from(PropertyInquiry).where(PropertyInquiry.status == "new"))
    users = await db.execute(select(func.count()).select_from(User))
    today_start = datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0)
    emails = await db.execute(select(func.count()).select_from(EmailLog).where(EmailLog.created_at >= today_start))
    counts["new_inquiries"] = inq.scalar_one()
    counts["total_users"] = users.scalar_one()
    counts["emails_sent_today"] = emails.scalar_one()
    return counts


@router.get("/properties/{listing_id}")
async def admin_property_detail(listing_id: int, db: AsyncSession = Depends(get_db)):
    listing_res = await db.execute(select(PropertyListing).where(PropertyListing.id == listing_id))
    listing = listing_res.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    owner_res = await db.execute(select(User).where(User.id == listing.owner_user_id))
    owner = owner_res.scalar_one_or_none()
    image_res = await db.execute(select(PropertyImage).where(PropertyImage.listing_id == listing.id).order_by(desc(PropertyImage.is_cover), desc(PropertyImage.created_at)))
    audit_res = await db.execute(select(PropertyAuditLog).where(PropertyAuditLog.listing_id == listing.id).order_by(desc(PropertyAuditLog.created_at)))
    images = image_res.scalars().all()
    cover = images[0] if images else None
    return {
        "listing": listing_shape(
            listing,
            owner_email=owner.email if owner else None,
            cover_image_url=cover.public_url if cover else None,
            image_count=len(images),
        ),
        "owner": {"id": owner.id, "email": owner.email, "full_name": owner.full_name} if owner else None,
        "images": [{"id": x.id, "public_url": x.public_url, "is_cover": x.is_cover} for x in images],
        "audit_logs": [{"id": x.id, "action": x.action, "from_status": x.from_status, "to_status": x.to_status, "note": x.note, "created_at": x.created_at} for x in audit_res.scalars().all()],
    }


@router.patch("/properties/{listing_id}")
async def admin_patch_listing(listing_id: int, payload: AdminNoteRequest, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PropertyListing).where(PropertyListing.id == listing_id))
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    listing.admin_note = payload.note
    add_audit(db, listing.id, admin.id, "admin_edited", listing.status, listing.status, payload.note)
    await db.commit()
    return listing_shape(listing)


@router.post("/properties/{listing_id}/approve")
async def admin_approve(listing_id: int, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    if not settings.real_estate_public_phone.strip():
        raise HTTPException(status_code=400, detail="REAL_ESTATE_PUBLIC_PHONE is required before approval")
    listing_res = await db.execute(select(PropertyListing).where(PropertyListing.id == listing_id))
    listing = listing_res.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if settings.require_image_for_approval:
        image_count_q = await db.execute(select(func.count()).select_from(PropertyImage).where(PropertyImage.listing_id == listing.id))
        if image_count_q.scalar_one() < 1:
            raise HTTPException(status_code=400, detail="At least one image is required before approval")
    old = listing.status
    listing.status = "approved"
    listing.approved_by_user_id = admin.id
    listing.approved_at = datetime.now(UTC)
    listing.published_at = datetime.now(UTC)
    add_audit(db, listing.id, admin.id, "approved", old, "approved")
    await db.commit()
    owner_res = await db.execute(select(User).where(User.id == listing.owner_user_id))
    owner = owner_res.scalar_one_or_none()
    if owner:
        await send_listing_approved_owner(db, owner.email, listing.title)
    return {"id": listing.id, "status": listing.status}


@router.post("/properties/{listing_id}/reject")
async def admin_reject(listing_id: int, payload: AdminNoteRequest, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    if not payload.note:
        raise HTTPException(status_code=400, detail="Rejection note required")
    result = await db.execute(select(PropertyListing).where(PropertyListing.id == listing_id))
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    old = listing.status
    listing.status = "rejected"
    listing.admin_note = payload.note
    listing.rejected_at = datetime.now(UTC)
    add_audit(db, listing.id, admin.id, "rejected", old, "rejected", payload.note)
    await db.commit()
    owner_res = await db.execute(select(User).where(User.id == listing.owner_user_id))
    owner = owner_res.scalar_one_or_none()
    if owner:
        await send_listing_rejected_owner(db, owner.email, listing.title, payload.note)
    return {"id": listing.id, "status": listing.status}


@router.post("/properties/{listing_id}/unpublish")
async def admin_unpublish(listing_id: int, payload: AdminNoteRequest, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PropertyListing).where(PropertyListing.id == listing_id))
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    old = listing.status
    listing.status = "unpublished"
    listing.unpublished_at = datetime.now(UTC)
    if payload.note:
        listing.admin_note = payload.note
    add_audit(db, listing.id, admin.id, "unpublished", old, "unpublished", payload.note)
    await db.commit()
    owner_res = await db.execute(select(User).where(User.id == listing.owner_user_id))
    owner = owner_res.scalar_one_or_none()
    if owner:
        await send_listing_unpublished_owner(db, owner.email, listing.title, payload.note)
    return {"id": listing.id, "status": listing.status}


@router.post("/properties/{listing_id}/archive")
async def admin_archive(listing_id: int, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PropertyListing).where(PropertyListing.id == listing_id))
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    old = listing.status
    listing.status = "archived"
    add_audit(db, listing.id, admin.id, "archived", old, "archived")
    await db.commit()
    return {"id": listing.id, "status": listing.status}


@router.post("/properties/bulk-approve")
async def admin_bulk_approve(payload: BulkActionRequest, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    if not settings.real_estate_public_phone.strip():
        raise HTTPException(status_code=400, detail="REAL_ESTATE_PUBLIC_PHONE required")
    count = 0
    for listing_id in payload.ids:
        listing_res = await db.execute(select(PropertyListing).where(PropertyListing.id == listing_id))
        listing = listing_res.scalar_one_or_none()
        if not listing or listing.status == "approved":
            continue
        if settings.require_image_for_approval:
            image_count_q = await db.execute(select(func.count()).select_from(PropertyImage).where(PropertyImage.listing_id == listing.id))
            if image_count_q.scalar_one() < 1:
                continue
        old = listing.status
        listing.status = "approved"
        listing.approved_by_user_id = admin.id
        listing.approved_at = datetime.now(UTC)
        listing.published_at = datetime.now(UTC)
        add_audit(db, listing.id, admin.id, "bulk_approved", old, "approved")
        count += 1
        owner_res = await db.execute(select(User).where(User.id == listing.owner_user_id))
        owner = owner_res.scalar_one_or_none()
        if owner:
            await send_listing_approved_owner(db, owner.email, listing.title)
    await db.commit()
    return {"count": count}


@router.post("/properties/bulk-reject")
async def admin_bulk_reject(payload: BulkActionRequest, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    if not payload.note:
        raise HTTPException(status_code=400, detail="Rejection note required")
    count = 0
    for listing_id in payload.ids:
        listing_res = await db.execute(select(PropertyListing).where(PropertyListing.id == listing_id))
        listing = listing_res.scalar_one_or_none()
        if not listing or listing.status == "rejected":
            continue
        old = listing.status
        listing.status = "rejected"
        listing.admin_note = payload.note
        listing.rejected_at = datetime.now(UTC)
        add_audit(db, listing.id, admin.id, "bulk_rejected", old, "rejected", payload.note)
        count += 1
        owner_res = await db.execute(select(User).where(User.id == listing.owner_user_id))
        owner = owner_res.scalar_one_or_none()
        if owner:
            await send_listing_rejected_owner(db, owner.email, listing.title, payload.note)
    await db.commit()
    return {"count": count}


@router.post("/properties/bulk-unpublish")
async def admin_bulk_unpublish(payload: BulkActionRequest, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    count = 0
    for listing_id in payload.ids:
        listing_res = await db.execute(select(PropertyListing).where(PropertyListing.id == listing_id))
        listing = listing_res.scalar_one_or_none()
        if not listing or listing.status == "unpublished":
            continue
        old = listing.status
        listing.status = "unpublished"
        listing.unpublished_at = datetime.now(UTC)
        if payload.note:
            listing.admin_note = payload.note
        add_audit(db, listing.id, admin.id, "bulk_unpublished", old, "unpublished", payload.note)
        count += 1
        owner_res = await db.execute(select(User).where(User.id == listing.owner_user_id))
        owner = owner_res.scalar_one_or_none()
        if owner:
            await send_listing_unpublished_owner(db, owner.email, listing.title, payload.note)
    await db.commit()
    return {"count": count}


@router.post("/properties/bulk-archive")
async def admin_bulk_archive(payload: BulkActionRequest, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    count = 0
    for listing_id in payload.ids:
        listing_res = await db.execute(select(PropertyListing).where(PropertyListing.id == listing_id))
        listing = listing_res.scalar_one_or_none()
        if not listing or listing.status == "archived":
            continue
        old = listing.status
        listing.status = "archived"
        add_audit(db, listing.id, admin.id, "bulk_archived", old, "archived")
        count += 1
    await db.commit()
    return {"count": count}


@router.get("/properties/audit-logs/recent")
async def admin_recent_audit_logs(db: AsyncSession = Depends(get_db)):
    since = datetime.now(UTC) - timedelta(hours=24)
    result = await db.execute(
        select(PropertyAuditLog, User.email, PropertyListing.title)
        .join(User, User.id == PropertyAuditLog.actor_user_id)
        .join(PropertyListing, PropertyListing.id == PropertyAuditLog.listing_id)
        .where(PropertyAuditLog.created_at >= since)
        .order_by(desc(PropertyAuditLog.created_at))
        .limit(50)
    )
    return [
        {
            "id": log.id,
            "action": log.action,
            "listing_id": log.listing_id,
            "listing_title": title,
            "actor_email": email,
            "from_status": log.from_status,
            "to_status": log.to_status,
            "note": log.note,
            "created_at": log.created_at
        }
        for log, email, title in result.all()
    ]


@router.get("/inquiries")
async def admin_inquiries(
    status: str | None = None,
    listing_id: int | None = None,
    phone: str | None = None,
    email: str | None = None,
    keyword: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    filters = []
    if status:
        filters.append(PropertyInquiry.status == status)
    if listing_id is not None:
        filters.append(PropertyInquiry.listing_id == listing_id)
    if phone:
        filters.append(PropertyInquiry.phone.ilike(f"%{phone}%"))
    if email:
        filters.append(PropertyInquiry.email.ilike(f"%{email}%"))
    if keyword:
        filters.append(or_(PropertyInquiry.name.ilike(f"%{keyword}%"), PropertyInquiry.message.ilike(f"%{keyword}%")))
    where = and_(*filters) if filters else True
    total_q = await db.execute(select(func.count()).select_from(PropertyInquiry).where(where))
    total = total_q.scalar_one()
    rows = await db.execute(
        select(PropertyInquiry, PropertyListing.title, PropertyListing.slug)
        .outerjoin(PropertyListing, PropertyListing.id == PropertyInquiry.listing_id)
        .where(where)
        .order_by(desc(PropertyInquiry.updated_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    items = [inquiry_shape(inquiry, title, slug) for inquiry, title, slug in rows.all()]
    return {"items": items, "page": page, "page_size": page_size, "total": total}


@router.get("/inquiries/{inquiry_id}")
async def admin_inquiry_detail(inquiry_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PropertyInquiry).where(PropertyInquiry.id == inquiry_id))
    inquiry = result.scalar_one_or_none()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    row = await db.execute(
        select(PropertyInquiry, PropertyListing.title, PropertyListing.slug)
        .outerjoin(PropertyListing, PropertyListing.id == PropertyInquiry.listing_id)
        .where(PropertyInquiry.id == inquiry.id)
    )
    inquiry_row, title, slug = row.one()
    return inquiry_shape(inquiry_row, title, slug)


@router.patch("/inquiries/{inquiry_id}")
async def admin_inquiry_patch(inquiry_id: int, payload: InquiryStatusPatch, db: AsyncSession = Depends(get_db)):
    if payload.status not in {"new", "contacted", "closed", "spam"}:
        raise HTTPException(status_code=400, detail="Invalid status")
    result = await db.execute(select(PropertyInquiry).where(PropertyInquiry.id == inquiry_id))
    inquiry = result.scalar_one_or_none()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    inquiry.status = payload.status
    await db.commit()
    row = await db.execute(
        select(PropertyInquiry, PropertyListing.title, PropertyListing.slug)
        .outerjoin(PropertyListing, PropertyListing.id == PropertyInquiry.listing_id)
        .where(PropertyInquiry.id == inquiry.id)
    )
    inquiry_row, title, slug = row.one()
    return inquiry_shape(inquiry_row, title, slug)


@router.post("/inquiries/{inquiry_id}/mark-contacted")
async def mark_contacted(inquiry_id: int, db: AsyncSession = Depends(get_db)):
    return await admin_inquiry_patch(inquiry_id, InquiryStatusPatch(status="contacted"), db)


@router.post("/inquiries/{inquiry_id}/mark-closed")
async def mark_closed(inquiry_id: int, db: AsyncSession = Depends(get_db)):
    return await admin_inquiry_patch(inquiry_id, InquiryStatusPatch(status="closed"), db)


@router.post("/inquiries/{inquiry_id}/mark-spam")
async def mark_spam(inquiry_id: int, db: AsyncSession = Depends(get_db)):
    return await admin_inquiry_patch(inquiry_id, InquiryStatusPatch(status="spam"), db)


@router.get("/email/logs")
async def email_logs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(EmailLog).order_by(desc(EmailLog.created_at)))
    return {"items": [{"id": x.id, "to_email": x.to_email, "subject": x.subject, "status": x.status, "sender_type": x.sender_type, "created_at": x.created_at} for x in result.scalars().all()]}


@router.get("/email/logs/{log_id}/content")
async def email_log_content(log_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(EmailLog).where(EmailLog.id == log_id))
    log = result.scalar_one_or_none()
    if not log:
        raise HTTPException(status_code=404, detail="Email log not found")
    return {"subject": log.subject, "body": log.body}


@router.get("/email/user/{email}/history")
async def email_user_history(email: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(EmailLog).where(EmailLog.to_email == email).order_by(desc(EmailLog.created_at)))
    return {"items": [{"id": x.id, "to_email": x.to_email, "subject": x.subject, "status": x.status, "sender_type": x.sender_type, "created_at": x.created_at} for x in result.scalars().all()]}


@router.post("/email/send")
async def admin_send_email(payload: EmailSendRequest, db: AsyncSession = Depends(get_db)):
    log = await send_email(db, payload.to_email, payload.subject, payload.body, payload.sender_type)
    return {"id": log.id, "status": log.status}


@router.get("/email/server-stats")
async def admin_email_server_stats(db: AsyncSession = Depends(get_db)):
    return await email_server_stats(db)


@router.get("/email/templates")
async def email_templates(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(EmailTemplate).order_by(EmailTemplate.template_key.asc()))
    return {"items": [{"id": x.id, "template_key": x.template_key, "subject": x.subject, "body": x.body, "updated_at": x.updated_at} for x in result.scalars().all()]}


@router.put("/email/templates/{template_id}")
async def email_template_update(template_id: int, payload: EmailTemplateUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(EmailTemplate).where(EmailTemplate.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    template.subject = payload.subject
    template.body = payload.body
    await db.commit()
    return {"id": template.id, "template_key": template.template_key, "subject": template.subject, "body": template.body, "updated_at": template.updated_at}


@router.get("/migration/v2-status")
async def migration_v2_status():
    return {"drift": await get_v2_drift_counts(engine)}


@router.get("/migration/legacy-candidates")
async def legacy_candidates():
    return {"tables": await find_legacy_candidate_tables(engine)}
