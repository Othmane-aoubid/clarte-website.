from pydantic import BaseModel, ConfigDict, EmailStr
from uuid import UUID


class ContactMessageCreate(BaseModel):
    model_config = ConfigDict(strict=True)

    name: str
    email: EmailStr
    phone: str | None = None
    subject: str | None = None
    message: str
    locale: str = "fr"


class ContactMessageResponse(BaseModel):
    model_config = ConfigDict(strict=True, from_attributes=True)

    id: UUID
    status: str
