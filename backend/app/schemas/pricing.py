from pydantic import BaseModel, ConfigDict
from uuid import UUID
from decimal import Decimal
from typing import Any


class PricingPlanResponse(BaseModel):
    model_config = ConfigDict(strict=True, from_attributes=True)

    id: UUID
    slug: str
    price: Decimal
    currency: str
    billing_interval: str | None
    is_popular: bool
    active: bool
    name: str = ""
    description: str = ""
    features: list[Any] = []
