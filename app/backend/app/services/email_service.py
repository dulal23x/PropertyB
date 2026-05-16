from datetime import UTC, datetime
from pathlib import Path

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.entities import EmailLog, EmailTemplate

DEFAULT_TEMPLATES = {
    "welcome_email": ("Welcome to RealEstateSite", "Welcome, {{name}}"),
    "password_reset": ("Password Reset", "Reset token: {{token}}"),
    "listing_submitted_owner": ("Listing Submitted", "We received your listing."),
    "listing_submitted_admin": ("New Listing Pending Review", "A new listing is waiting."),
    "listing_approved_owner": ("Listing Approved", "Your listing is now approved."),
    "listing_rejected_owner": ("Listing Rejected", "Reason: {{reason}}"),
    "listing_unpublished_owner": ("Listing Unpublished", "Your listing was unpublished."),
    "inquiry_received_admin": ("New Inquiry", "A listing inquiry has arrived."),
    "inquiry_confirmation_visitor": ("Inquiry Received", "Thanks for contacting us."),
    "admin_custom_email": ("Custom Message", "{{body}}"),
}


async def ensure_default_templates(db: AsyncSession) -> None:
    for key, (subject, body) in DEFAULT_TEMPLATES.items():
        existing = await db.execute(select(EmailTemplate).where(EmailTemplate.template_key == key))
        if not existing.scalar_one_or_none():
            db.add(EmailTemplate(template_key=key, subject=subject, body=body))
    await db.commit()


async def send_email(db: AsyncSession, to_email: str, subject: str, body: str, sender_type: str = "admin") -> EmailLog:
    status = "sent"
    error = None
    if settings.email_provider == "console":
        Path(settings.email_log_dir).mkdir(parents=True, exist_ok=True)
        stamp = datetime.now(UTC).strftime("%Y%m%d-%H%M%S")
        Path(settings.email_log_dir, f"{stamp}-{to_email.replace('@', '_')}.txt").write_text(
            f"TO: {to_email}\nSUBJECT: {subject}\n\n{body}", encoding="utf-8"
        )
    log = EmailLog(sender_type=sender_type, to_email=to_email, subject=subject, body=body, status=status, error=error)
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log


async def email_server_stats(db: AsyncSession) -> dict:
    today = datetime.now(UTC).date()
    count_q = await db.execute(
        select(func.count()).select_from(EmailLog).where(func.date(EmailLog.created_at) == str(today))
    )
    sent_today = count_q.scalar_one()
    return {"provider": settings.email_provider, "emails_sent_today": sent_today}


async def send_welcome_email(db: AsyncSession, to_email: str) -> EmailLog:
    return await send_email(db, to_email, "Welcome to RealEstateSite", "Your account was created.", "support")


async def send_password_reset_email(db: AsyncSession, to_email: str, token: str) -> EmailLog:
    return await send_email(db, to_email, "Password Reset", f"Reset token: {token}", "security")


async def send_listing_submitted_owner(db: AsyncSession, to_email: str, listing_title: str) -> EmailLog:
    return await send_email(db, to_email, "Listing Submitted", f"We received your listing: {listing_title}", "listings")


async def send_listing_submitted_admin(db: AsyncSession, to_email: str, listing_title: str, listing_id: int) -> EmailLog:
    return await send_email(db, to_email, "New Listing Pending Review", f"Listing #{listing_id}: {listing_title}", "listings")


async def send_listing_approved_owner(db: AsyncSession, to_email: str, listing_title: str) -> EmailLog:
    return await send_email(db, to_email, "Listing Approved", f"Your listing is approved: {listing_title}", "listings")


async def send_listing_rejected_owner(db: AsyncSession, to_email: str, listing_title: str, reason: str) -> EmailLog:
    return await send_email(db, to_email, "Listing Rejected", f"Listing '{listing_title}' was rejected. Reason: {reason}", "listings")


async def send_listing_unpublished_owner(db: AsyncSession, to_email: str, listing_title: str, note: str | None) -> EmailLog:
    body = f"Listing '{listing_title}' was unpublished."
    if note:
        body += f" Note: {note}"
    return await send_email(db, to_email, "Listing Unpublished", body, "listings")


async def send_inquiry_received_admin(db: AsyncSession, to_email: str, listing_title: str, inquiry_id: int) -> EmailLog:
    return await send_email(db, to_email, "New Inquiry", f"Inquiry #{inquiry_id} received for {listing_title}", "inquiries")


async def send_inquiry_confirmation_visitor(db: AsyncSession, to_email: str, listing_title: str) -> EmailLog:
    return await send_email(db, to_email, "Inquiry Received", f"Thanks for your interest in {listing_title}.", "inquiries")
