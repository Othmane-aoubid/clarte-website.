from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_db
from app.schemas.contact import ContactMessageCreate, ContactMessageResponse
from app.services.contact_service import create_contact_message
from app.services import email_service

router = APIRouter()


@router.post("", response_model=ContactMessageResponse, status_code=201)
async def send_message(
    data: ContactMessageCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    msg = await create_contact_message(db, data)
    await db.commit()
    # Send auto-reply to customer (non-blocking)
    background_tasks.add_task(email_service.send_contact_confirmation, msg)
    return msg
