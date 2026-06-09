from pydantic import BaseModel, ConfigDict
from uuid import UUID
from decimal import Decimal


class ServiceResponse(BaseModel):
    model_config = ConfigDict(strict=True, from_attributes=True)

    id: UUID
    slug: str
    icon: str | None
    base_price: Decimal
    unit: str
    duration_minutes: int | None
    active: bool
    sort_order: int
    name: str = ""
    description: str = ""
    short_description: str = ""
