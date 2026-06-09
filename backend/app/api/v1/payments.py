"""
Stripe payment endpoints.
- POST /payments/create-intent  → creates a Stripe PaymentIntent, returns client_secret
- POST /payments/webhook        → handles Stripe webhook events (payment_intent.succeeded)
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_db
from app.schemas.booking import PaymentIntentCreate, PaymentIntentResponse
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

# Lazy import so the app starts even without STRIPE_SECRET_KEY in dev
def _stripe():
    try:
        import stripe as _s
        _s.api_key = settings.STRIPE_SECRET_KEY
        return _s
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment service unavailable",
        )


@router.post("/create-intent", response_model=PaymentIntentResponse)
async def create_payment_intent(data: PaymentIntentCreate):
    """
    Create a Stripe PaymentIntent.
    The frontend uses the returned client_secret to confirm payment via Stripe.js.
    """
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment service unavailable",
        )

    stripe = _stripe()
    try:
        intent = stripe.PaymentIntent.create(
            amount=data.amount_cents,
            currency=data.currency,
            automatic_payment_methods={"enabled": True},
            description=data.description,
            metadata={"source": "clarte_website"},
        )
        return PaymentIntentResponse(
            client_secret=intent.client_secret,
            payment_intent_id=intent.id,
        )
    except Exception:
        # Never expose Stripe internal errors to the client
        logger.exception("Stripe PaymentIntent creation failed")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not initialise payment",
        )


@router.post("/webhook", status_code=200)
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Handle Stripe webhook events.
    Verifies the Stripe-Signature header before processing.
    """
    if not settings.STRIPE_WEBHOOK_SECRET:
        logger.warning("Stripe webhook secret not configured — ignoring webhook")
        return {"status": "ignored"}

    stripe = _stripe()
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError:
        logger.warning("Invalid Stripe webhook signature")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature")
    except Exception:
        logger.exception("Stripe webhook parsing failed")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Webhook error")

    if event["type"] == "payment_intent.succeeded":
        pi = event["data"]["object"]
        logger.info("PaymentIntent succeeded: %s", pi["id"])
        # In a production system, update booking payment_status here.
        # We use booking reference stored in metadata if available.

    elif event["type"] == "payment_intent.payment_failed":
        pi = event["data"]["object"]
        logger.warning("PaymentIntent failed: %s", pi["id"])

    return {"status": "ok"}
