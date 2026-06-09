import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, Numeric, ForeignKey, UniqueConstraint, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.base import Base


class PricingPlan(Base):
    __tablename__ = "pricing_plans"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    stripe_price_id: Mapped[str | None] = mapped_column(String(200))
    stripe_product_id: Mapped[str | None] = mapped_column(String(200))
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="EUR")
    billing_interval: Mapped[str | None] = mapped_column(String(20))
    is_popular: Mapped[bool] = mapped_column(Boolean, default=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)

    translations: Mapped[list["PricingPlanTranslation"]] = relationship(back_populates="plan", cascade="all, delete-orphan")


class PricingPlanTranslation(Base):
    __tablename__ = "pricing_plan_translations"
    __table_args__ = (UniqueConstraint("plan_id", "locale"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("pricing_plans.id", ondelete="CASCADE"))
    locale: Mapped[str] = mapped_column(String(5), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    features: Mapped[list | None] = mapped_column(JSONB)

    plan: Mapped["PricingPlan"] = relationship(back_populates="translations")
