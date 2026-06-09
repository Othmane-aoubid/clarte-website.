"""
Seed script — populates services and pricing plans in all 3 locales.
Run after migrations: python scripts/seed.py
"""
import asyncio
import uuid
import sys
import os

# Make sure the app module is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import text
from app.db.base import async_engine
from app.db.models.service import Service, ServiceTranslation
from app.db.models.pricing import PricingPlan, PricingPlanTranslation
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

AsyncSessionLocal = sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)

# ── Services data ──────────────────────────────────────────────────────────────
SERVICES = [
    {
        "slug": "menage",
        "icon": "home",
        "base_price": 49.00,
        "duration_minutes": 120,
        "translations": {
            "fr": {
                "name": "Ménage Résidentiel",
                "description": "Nettoyage complet de votre domicile par nos professionnels.",
                "features": ["Aspiration et lavage des sols", "Dépoussiérage", "Nettoyage cuisine & salle de bain", "Vitres intérieures"],
            },
            "ar": {
                "name": "تنظيف منزلي",
                "description": "تنظيف شامل لمنزلك على يد محترفينا.",
                "features": ["شفط وغسيل الأرضيات", "إزالة الغبار", "تنظيف المطبخ والحمام", "نوافذ داخلية"],
            },
            "en": {
                "name": "Residential Cleaning",
                "description": "Complete cleaning of your home by our professionals.",
                "features": ["Vacuuming & floor washing", "Dusting", "Kitchen & bathroom cleaning", "Interior windows"],
            },
        },
    },
    {
        "slug": "bureau",
        "icon": "briefcase",
        "base_price": 79.00,
        "duration_minutes": 180,
        "translations": {
            "fr": {
                "name": "Nettoyage Bureau",
                "description": "Entretien professionnel de vos espaces de travail.",
                "features": ["Bureaux et postes de travail", "Sanitaires", "Espaces communs", "Gestion des déchets"],
            },
            "ar": {
                "name": "تنظيف المكاتب",
                "description": "صيانة احترافية لمساحات العمل الخاصة بك.",
                "features": ["المكاتب ومحطات العمل", "دورات المياه", "المناطق المشتركة", "إدارة النفايات"],
            },
            "en": {
                "name": "Office Cleaning",
                "description": "Professional maintenance of your workspaces.",
                "features": ["Desks & workstations", "Restrooms", "Common areas", "Waste management"],
            },
        },
    },
    {
        "slug": "apres_travaux",
        "icon": "hard-hat",
        "base_price": 129.00,
        "duration_minutes": 300,
        "translations": {
            "fr": {
                "name": "Après Travaux",
                "description": "Nettoyage de chantier et remise en état après rénovation.",
                "features": ["Élimination des gravats", "Nettoyage des vitres", "Dépoussiérage en profondeur", "Lavage des sols"],
            },
            "ar": {
                "name": "تنظيف ما بعد البناء",
                "description": "تنظيف الموقع وإعادة تهيئته بعد التجديد.",
                "features": ["إزالة الحطام", "تنظيف الزجاج", "إزالة الغبار العميق", "غسيل الأرضيات"],
            },
            "en": {
                "name": "Post-Construction Cleaning",
                "description": "Site cleanup and restoration after renovation.",
                "features": ["Debris removal", "Window cleaning", "Deep dusting", "Floor washing"],
            },
        },
    },
    {
        "slug": "vitres",
        "icon": "window",
        "base_price": 59.00,
        "duration_minutes": 90,
        "translations": {
            "fr": {
                "name": "Nettoyage Vitres",
                "description": "Vitres et baies vitrées impeccables, intérieur et extérieur.",
                "features": ["Vitres intérieures et extérieures", "Cadres et rebords", "Baies vitrées", "Miroirs"],
            },
            "ar": {
                "name": "تنظيف الزجاج",
                "description": "نوافذ وأبواب زجاجية لامعة، من الداخل والخارج.",
                "features": ["نوافذ داخلية وخارجية", "الإطارات والعتبات", "الأبواب الزجاجية", "المرايا"],
            },
            "en": {
                "name": "Window Cleaning",
                "description": "Spotless windows and glass doors, inside and out.",
                "features": ["Interior & exterior windows", "Frames & sills", "Glass doors", "Mirrors"],
            },
        },
    },
    {
        "slug": "demenagement",
        "icon": "truck",
        "base_price": 99.00,
        "duration_minutes": 240,
        "translations": {
            "fr": {
                "name": "Nettoyage Déménagement",
                "description": "Remise en état complète avant ou après déménagement.",
                "features": ["Nettoyage de fond", "Cuisine et équipements", "Salle de bain", "Placards et rangements"],
            },
            "ar": {
                "name": "تنظيف الانتقال",
                "description": "إعادة تهيئة كاملة قبل أو بعد الانتقال.",
                "features": ["تنظيف عميق", "المطبخ والمعدات", "الحمام", "الخزائن والتخزين"],
            },
            "en": {
                "name": "Move-In/Out Cleaning",
                "description": "Full restoration before or after moving.",
                "features": ["Deep cleaning", "Kitchen & appliances", "Bathroom", "Closets & storage"],
            },
        },
    },
    {
        "slug": "desinfection",
        "icon": "shield",
        "base_price": 89.00,
        "duration_minutes": 120,
        "translations": {
            "fr": {
                "name": "Désinfection",
                "description": "Désinfection professionnelle certifiée pour tous types de locaux.",
                "features": ["Désinfection totale", "Produits virucides certifiés", "Surfaces de contact", "Rapport d'intervention"],
            },
            "ar": {
                "name": "التعقيم",
                "description": "تعقيم احترافي معتمد لجميع أنواع المحلات.",
                "features": ["تعقيم شامل", "منتجات مضادة للفيروسات معتمدة", "أسطح الاتصال", "تقرير التدخل"],
            },
            "en": {
                "name": "Disinfection",
                "description": "Certified professional disinfection for all premises.",
                "features": ["Full disinfection", "Certified virucidal products", "Contact surfaces", "Intervention report"],
            },
        },
    },
]

# ── Pricing plans ──────────────────────────────────────────────────────────────
PRICING_PLANS = [
    {
        "slug": "ponctuel",
        "price": 49.00,
        "currency": "EUR",
        "billing_interval": None,
        "is_popular": False,
        "translations": {
            "fr": {
                "name": "Ponctuel",
                "description": "Un nettoyage quand vous en avez besoin, sans engagement.",
                "features": ["1 intervention", "Professionnels certifiés", "Matériel inclus", "Garantie satisfaction"],
            },
            "ar": {
                "name": "مرة واحدة",
                "description": "تنظيف عند الحاجة، بدون التزام.",
                "features": ["تدخل واحد", "محترفون معتمدون", "المعدات مشمولة", "ضمان الرضا"],
            },
            "en": {
                "name": "One-Time",
                "description": "A cleaning when you need it, no commitment.",
                "features": ["1 session", "Certified professionals", "Equipment included", "Satisfaction guarantee"],
            },
        },
    },
    {
        "slug": "hebdomadaire",
        "price": 39.00,
        "currency": "EUR",
        "billing_interval": "week",
        "is_popular": True,
        "translations": {
            "fr": {
                "name": "Hebdomadaire",
                "description": "Un nettoyage chaque semaine pour un intérieur toujours impeccable.",
                "features": ["1 × par semaine", "Même équipe dédiée", "Matériel inclus", "Facturation mensuelle", "Pause possible"],
            },
            "ar": {
                "name": "أسبوعي",
                "description": "تنظيف أسبوعي لمنزل نظيف دائماً.",
                "features": ["مرة × في الأسبوع", "نفس الفريق المخصص", "المعدات مشمولة", "فوترة شهرية", "إمكانية التوقف"],
            },
            "en": {
                "name": "Weekly",
                "description": "Weekly cleaning for a consistently spotless home.",
                "features": ["1 × per week", "Same dedicated team", "Equipment included", "Monthly billing", "Pause anytime"],
            },
        },
    },
    {
        "slug": "mensuel",
        "price": 44.00,
        "currency": "EUR",
        "billing_interval": "month",
        "is_popular": False,
        "translations": {
            "fr": {
                "name": "Mensuel",
                "description": "Un grand nettoyage par mois pour maintenir votre intérieur en ordre.",
                "features": ["1 × par mois", "Nettoyage en profondeur", "Matériel inclus", "Facturation mensuelle"],
            },
            "ar": {
                "name": "شهري",
                "description": "تنظيف شهري شامل للحفاظ على ترتيب منزلك.",
                "features": ["مرة × في الشهر", "تنظيف عميق", "المعدات مشمولة", "فوترة شهرية"],
            },
            "en": {
                "name": "Monthly",
                "description": "Deep cleaning once a month to keep your home tidy.",
                "features": ["1 × per month", "Deep cleaning", "Equipment included", "Monthly billing"],
            },
        },
    },
]


async def seed():
    async with AsyncSessionLocal() as session:
        # Check if already seeded
        from sqlalchemy import select
        from app.db.models.service import Service
        result = await session.execute(select(Service).limit(1))
        if result.scalar_one_or_none():
            print("✅ Database already seeded — skipping.")
            return

        print("🌱 Seeding services...")
        for svc_data in SERVICES:
            svc = Service(
                id=uuid.uuid4(),
                slug=svc_data["slug"],
                icon=svc_data["icon"],
                base_price=svc_data["base_price"],
                unit="intervention",
                duration_minutes=svc_data["duration_minutes"],
                active=True,
                sort_order=SERVICES.index(svc_data),
            )
            session.add(svc)
            await session.flush()

            for locale, t in svc_data["translations"].items():
                tr = ServiceTranslation(
                    id=uuid.uuid4(),
                    service_id=svc.id,
                    locale=locale,
                    name=t["name"],
                    description=t["description"],
                    short_description=", ".join(t["features"]),
                )
                session.add(tr)

        print("🌱 Seeding pricing plans...")
        for plan_data in PRICING_PLANS:
            plan = PricingPlan(
                id=uuid.uuid4(),
                slug=plan_data["slug"],
                price=plan_data["price"],
                currency=plan_data["currency"],
                billing_interval=plan_data["billing_interval"],
                is_popular=plan_data["is_popular"],
                active=True,
            )
            session.add(plan)
            await session.flush()

            for locale, t in plan_data["translations"].items():
                tr = PricingPlanTranslation(
                    id=uuid.uuid4(),
                    plan_id=plan.id,
                    locale=locale,
                    name=t["name"],
                    description=t["description"],
                    features=t["features"],
                )
                session.add(tr)

        await session.commit()
        print("✅ Seed complete — 6 services and 3 pricing plans inserted.")


if __name__ == "__main__":
    asyncio.run(seed())
