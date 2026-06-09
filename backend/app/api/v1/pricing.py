from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_db
from app.schemas.pricing import PricingPlanResponse
from app.services.pricing_service import get_all_plans

router = APIRouter()


@router.get("", response_model=list[PricingPlanResponse])
async def list_plans(locale: str = "fr", db: AsyncSession = Depends(get_db)):
    return await get_all_plans(db, locale)
