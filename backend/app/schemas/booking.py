from pydantic import BaseModel, ConfigDict
from uuid import UUID
from decimal import Decimal
from datetime import date, time


class BookingCreate(BaseModel):
    model_config = ConfigDict(strict=True)

    service_id: UUID
    scheduled_date: date
    scheduled_time: time
    duration_minutes: int
    frequency: str = "once"
    total_price: Decimal
    notes: str | None = None
    street: str
    city: str
    postal_code: str
    area_sqm: int | None = None
    floor: int | None = None
    elevator: bool = False
    access_code: str | None = None


class BookingResponse(BaseModel):
    model_config = ConfigDict(strict=True, from_attributes=True)

    id: UUID
    reference: str
    status: str
    total_price: Decimal
    scheduled_date: date
    scheduled_time: time
