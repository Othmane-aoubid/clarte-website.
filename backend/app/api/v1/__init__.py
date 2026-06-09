from fastapi import APIRouter
from app.api.v1 import services, pricing, bookings, contact, payments

router = APIRouter()
router.include_router(services.router,  prefix="/services",  tags=["services"])
router.include_router(pricing.router,   prefix="/pricing",   tags=["pricing"])
router.include_router(bookings.router,  prefix="/bookings",  tags=["bookings"])
router.include_router(contact.router,   prefix="/contact",   tags=["contact"])
router.include_router(payments.router,  prefix="/payments",  tags=["payments"])
