from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models.pricing import PricingPlan, PricingPlanTranslation


async def get_all_plans(db: AsyncSession, locale: str = "fr") -> list[dict]:
    result = await db.execute(
        select(PricingPlan, PricingPlanTranslation)
        .outerjoin(
            PricingPlanTranslation,
            (PricingPlanTranslation.plan_id == PricingPlan.id) & (PricingPlanTranslation.locale == locale),
        )
        .where(PricingPlan.active == True)
    )
    rows = result.all()

    plans = []
    for plan, translation in rows:
        item = {
            "id": plan.id,
            "slug": plan.slug,
            "price": plan.price,
            "currency": plan.currency,
            "billing_interval": plan.billing_interval,
            "is_popular": plan.is_popular,
            "active": plan.active,
            "name": translation.name if translation else plan.slug,
            "description": translation.description if translation else "",
            "features": translation.features if translation else [],
        }
        plans.append(item)
    return plans
