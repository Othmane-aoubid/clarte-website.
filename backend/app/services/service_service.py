from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models.service import Service, ServiceTranslation


async def get_all_services(db: AsyncSession, locale: str = "fr") -> list[dict]:
    result = await db.execute(
        select(Service, ServiceTranslation)
        .outerjoin(ServiceTranslation, (ServiceTranslation.service_id == Service.id) & (ServiceTranslation.locale == locale))
        .where(Service.active == True)
        .order_by(Service.sort_order)
    )
    rows = result.all()

    services = []
    for service, translation in rows:
        item = {
            "id": service.id,
            "slug": service.slug,
            "icon": service.icon,
            "base_price": service.base_price,
            "unit": service.unit,
            "duration_minutes": service.duration_minutes,
            "active": service.active,
            "sort_order": service.sort_order,
            "name": translation.name if translation else service.slug,
            "description": translation.description if translation else "",
            "short_description": translation.short_description if translation else "",
        }
        services.append(item)
    return services
