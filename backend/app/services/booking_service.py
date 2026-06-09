import secrets
import string
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models.booking import Booking
from app.db.models.availability import AvailabilityBlock
from app.schemas.booking import BookingCreate


def _generate_reference() -> str:
    from datetime import datetime
    year = datetime.now().year
    suffix = "".join(secrets.choice(string.digits) for _ in range(4))
    return f"CLT-{year}-{suffix}"


async def create_booking(db: AsyncSession, data: BookingCreate, user_id: str) -> Booking:
    booking = Booking(
        reference=_generate_reference(),
        customer_id=user_id,
        service_id=data.service_id,
        scheduled_date=data.scheduled_date,
        scheduled_time=data.scheduled_time,
        duration_minutes=data.duration_minutes,
        frequency=data.frequency,
        total_price=data.total_price,
        notes=data.notes,
        status="pending",
    )
    db.add(booking)
    await db.flush()
    await db.refresh(booking)
    return booking


async def get_availability(db: AsyncSession, date_str: str) -> dict:
    try:
        target_date = date.fromisoformat(date_str)
    except ValueError:
        return {"date": date_str, "slots": []}

    blocks_result = await db.execute(
        select(AvailabilityBlock).where(AvailabilityBlock.blocked_date == target_date)
    )
    blocks = blocks_result.scalars().all()

    all_slots = [
        "08:00", "09:00", "10:00", "11:00",
        "13:00", "14:00", "15:00", "16:00", "17:00",
    ]

    blocked_times = set()
    for block in blocks:
        if block.start_time is None:
            return {"date": date_str, "slots": []}
        blocked_times.add(block.start_time.strftime("%H:%M"))

    available = [s for s in all_slots if s not in blocked_times]
    return {"date": date_str, "slots": available}
