from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.contact import ContactMessage
from app.schemas.contact import ContactMessageCreate


async def create_contact_message(db: AsyncSession, data: ContactMessageCreate) -> ContactMessage:
    msg = ContactMessage(
        name=data.name,
        email=data.email,
        phone=data.phone,
        subject=data.subject,
        message=data.message,
        locale=data.locale,
        status="unread",
    )
    db.add(msg)
    await db.flush()
    await db.refresh(msg)
    return msg
