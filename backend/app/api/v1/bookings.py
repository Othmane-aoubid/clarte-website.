from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_db
from app.schemas.booking import BookingCreate, BookingResponse
from app.services.booking_service import create_booking, get_availability
from app.core.deps import get_current_user

router = APIRouter()


@router.post("", response_model=BookingResponse, status_code=201)
async def new_booking(
    data: BookingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await create_booking(db, data, current_user["sub"])


@router.get("/availability")
async def check_availability(date: str, db: AsyncSession = Depends(get_db)):
    return await get_availability(db, date)
