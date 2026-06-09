import logging
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_db
from app.schemas.booking import BookingCreate, BookingResponse
from app.services.booking_service import create_booking, get_availability
from app.services import email_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("", response_model=BookingResponse, status_code=201)
async def new_booking(
    data: BookingCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Create a booking. No authentication required — guest bookings supported."""
    booking = await create_booking(db, data)
    await db.commit()

    # Fire emails in background — never block the response
    background_tasks.add_task(email_service.send_booking_confirmation, booking)
    background_tasks.add_task(email_service.send_booking_admin_alert, booking)

    return booking


@router.get("/availability")
async def check_availability(date: str, db: AsyncSession = Depends(get_db)):
    return await get_availability(db, date)
