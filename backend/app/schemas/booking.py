from pydantic import BaseModel, ConfigDict, EmailStr, field_validator
from uuid import UUID
from decimal import Decimal
from datetime import date, time


class BookingCreate(BaseModel):
    # Not strict — JSON numbers (float/int) need to coerce to Decimal
    model_config = ConfigDict(strict=False)

    # Guest info (required when not authenticated)
    guest_name: str
    guest_email: EmailStr
    guest_phone: str

    service_id: UUID | None = None
    service_slug: str | None = None
    scheduled_date: date
    scheduled_time: str          # "08:00" — stored as string, parsed in service layer
    duration_minutes: int = 120
    frequency: str = "once"
    total_price: Decimal
    notes: str | None = None

    # Address
    street: str
    city: str
    postal_code: str
    area_sqm: int | None = None
    floor: int | None = None
    elevator: bool = False
    access_code: str | None = None

    @field_validator("guest_name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name is required")
        return v.strip()

    @field_validator("guest_phone")
    @classmethod
    def phone_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Phone is required")
        return v.strip()

    @field_validator("street", "city", "postal_code")
    @classmethod
    def address_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Address field is required")
        return v.strip()

    @field_validator("total_price")
    @classmethod
    def price_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("Price must be positive")
        return v

    @field_validator("frequency")
    @classmethod
    def valid_frequency(cls, v: str) -> str:
        allowed = {"once", "weekly", "biweekly", "monthly"}
        if v not in allowed:
            raise ValueError(f"Frequency must be one of {allowed}")
        return v


class BookingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    reference: str
    status: str
    payment_status: str
    total_price: Decimal
    scheduled_date: date
    guest_name: str | None = None
    guest_email: str | None = None


class PaymentIntentCreate(BaseModel):
    model_config = ConfigDict(strict=True)

    amount_cents: int    # e.g. 4900 for 49€
    currency: str = "eur"
    description: str


class PaymentIntentResponse(BaseModel):
    client_secret: str
    payment_intent_id: str
