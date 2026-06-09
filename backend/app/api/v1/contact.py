from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_db
from app.schemas.contact import ContactMessageCreate, ContactMessageResponse
from app.services.contact_service import create_contact_message

router = APIRouter()


@router.post("", response_model=ContactMessageResponse, status_code=201)
async def send_message(data: ContactMessageCreate, db: AsyncSession = Depends(get_db)):
    return await create_contact_message(db, data)
