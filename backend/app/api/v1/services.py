from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_db
from app.schemas.service import ServiceResponse
from app.services.service_service import get_all_services

router = APIRouter()


@router.get("", response_model=list[ServiceResponse])
async def list_services(locale: str = "fr", db: AsyncSession = Depends(get_db)):
    return await get_all_services(db, locale)
