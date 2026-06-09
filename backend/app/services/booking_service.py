import secrets
import string
from datetime import date, time as time_type
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models.booking import Booking
from app.db.models.availability import AvailabilityBlock
from app.schemas.booking import BookingCreate


def _generate_reference() -> str:
    from datetime import datetime
    year = datetime.now().year
    suffix = "".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
    return f"CLT-{year}-{suffix}"


async def create_booking(
    db: AsyncSession,
    data: BookingCreate,
    user_id: str | None = None,
) -> Booking:
    """Create a booking. Works for both authenticated users and guests."""
    # Parse scheduled_time from "HH:MM" string
    try:
        h, m = data.scheduled_time.split(":")
        sched_time = time_type(int(h), int(m))
    except (ValueError, AttributeError):
        sched_time = time_type(8, 0)

    booking = Booking(
        reference=_generate_reference(),
        customer_id=user_id,
        guest_name=data.guest_name,
        guest_email=str(data.guest_email),
        guest_phone=data.guest_phone,
        service_id=data.service_id,
        service_slug=data.service_slug,
        scheduled_date=data.scheduled_date,
        scheduled_time=sched_time,
        duration_minutes=data.duration_minutes,
        frequency=data.frequency,
        total_price=data.total_price,
        notes=data.notes,
        street=data.street,
        city=data.city,
        postal_code=data.postal_code,
        area_sqm=data.area_sqm,
        floor=data.floor,
        elevator=data.elevator,
        access_code=data.access_code,
        status="pending",
        payment_status="unpaid",
    )
    db.add(booking)
    await db.flush()
    await db.refresh(booking)
    return booking


async def update_booking_payment(
    db: AsyncSession,
    booking_id: str,
    stripe_payment_intent_id: str,
    payment_status: str = "paid",
) -> Booking | None:
    result = await db.execute(
        select(Booking).where(Booking.id == booking_id)
    )
    booking = result.scalar_one_or_none()
    if booking:
        booking.stripe_payment_intent_id = stripe_payment_intent_id
        booking.payment_status = payment_status
        if payment_status == "paid":
            booking.status = "confirmed"
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
