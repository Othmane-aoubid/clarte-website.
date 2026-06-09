import uuid
from datetime import datetime, date, time
from decimal import Decimal
from sqlalchemy import String, Numeric, ForeignKey, Text, Boolean, Integer, Date, Time
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reference: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    # Supabase Auth user id (nullable — guest bookings allowed)
    customer_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    # Guest info (used when customer_id is None)
    guest_name: Mapped[str | None] = mapped_column(String(200))
    guest_email: Mapped[str | None] = mapped_column(String(320))
    guest_phone: Mapped[str | None] = mapped_column(String(30))
    service_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("services.id"))
    service_slug: Mapped[str | None] = mapped_column(String(100))
    scheduled_date: Mapped[date] = mapped_column(Date, nullable=False)
    scheduled_time: Mapped[time] = mapped_column(Time, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    frequency: Mapped[str] = mapped_column(String(20), default="once")
    status: Mapped[str] = mapped_column(String(30), default="pending")
    total_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)
    admin_notes: Mapped[str | None] = mapped_column(Text)
    # Address fields
    street: Mapped[str] = mapped_column(String(500), nullable=False)
    city: Mapped[str] = mapped_column(String(200), nullable=False)
    postal_code: Mapped[str] = mapped_column(String(20), nullable=False)
    area_sqm: Mapped[int | None] = mapped_column(Integer)
    floor: Mapped[int | None] = mapped_column(Integer)
    elevator: Mapped[bool] = mapped_column(Boolean, default=False)
    access_code: Mapped[str | None] = mapped_column(String(100))
    # Payment
    stripe_payment_intent_id: Mapped[str | None] = mapped_column(String(200))
    payment_status: Mapped[str] = mapped_column(String(30), default="unpaid")
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)
