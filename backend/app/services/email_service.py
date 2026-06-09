"""
Email notifications via Resend.
All user-facing messages are hardcoded — never expose exception details.
"""
import logging
from app.core.config import settings
from app.db.models.booking import Booking
from app.db.models.contact import ContactMessage

logger = logging.getLogger(__name__)

_resend_available = bool(settings.RESEND_API_KEY)

if _resend_available:
    try:
        import resend
        resend.api_key = settings.RESEND_API_KEY
    except ImportError:
        _resend_available = False
        logger.warning("resend package not installed — email notifications disabled")


FROM_EMAIL = "Clarté <noreply@clarte.fr>"
ADMIN_EMAIL = "contact@clarte.fr"


def _send(*, to: list[str], subject: str, html: str) -> bool:
    """Send an email. Returns True on success, False on failure (never raises)."""
    if not _resend_available:
        logger.info("Email skipped (RESEND_API_KEY not set): %s → %s", subject, to)
        return False
    try:
        import resend
        resend.Emails.send({"from": FROM_EMAIL, "to": to, "subject": subject, "html": html})
        return True
    except Exception:
        # Never leak exception details — just log and continue
        logger.exception("Failed to send email '%s'", subject)
        return False


def send_booking_confirmation(booking: Booking) -> bool:
    """Send booking confirmation to the customer."""
    if not booking.guest_email:
        return False

    name = booking.guest_name or "Client"
    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;background:#f8fafc">
      <div style="background:#fff;border-radius:12px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,.08)">
        <h1 style="color:#0f6e4c;margin-top:0">✅ Réservation confirmée</h1>
        <p>Bonjour <strong>{name}</strong>,</p>
        <p>Votre réservation a bien été enregistrée. Voici le récapitulatif :</p>

        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <tr>
            <td style="padding:8px 0;color:#6b7280;width:40%">Référence</td>
            <td style="padding:8px 0;font-weight:600;color:#111">{booking.reference}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280">Service</td>
            <td style="padding:8px 0;font-weight:600;color:#111">{booking.service_slug or 'Nettoyage'}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280">Date</td>
            <td style="padding:8px 0;font-weight:600;color:#111">{booking.scheduled_date.strftime('%A %d %B %Y')}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280">Heure</td>
            <td style="padding:8px 0;font-weight:600;color:#111">{booking.scheduled_time.strftime('%H:%M')}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280">Adresse</td>
            <td style="padding:8px 0;font-weight:600;color:#111">{booking.street}, {booking.postal_code} {booking.city}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280">Montant</td>
            <td style="padding:8px 0;font-weight:600;color:#0f6e4c;font-size:18px">{booking.total_price} €</td>
          </tr>
        </table>

        <p style="color:#6b7280;font-size:14px">Notre équipe vous contactera 24h avant l'intervention pour confirmer les détails.</p>
        <p style="color:#6b7280;font-size:14px">Pour toute question : <a href="mailto:contact@clarte.fr" style="color:#0f6e4c">contact@clarte.fr</a></p>

        <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb">
          <p style="color:#9ca3af;font-size:12px;margin:0">© Clarté — Services de Nettoyage Professionnels</p>
        </div>
      </div>
    </div>
    """
    return _send(
        to=[booking.guest_email],
        subject=f"✅ Réservation confirmée — {booking.reference}",
        html=html,
    )


def send_booking_admin_alert(booking: Booking) -> bool:
    """Notify admin of a new booking."""
    html = f"""
    <div style="font-family:sans-serif;padding:24px">
      <h2>🔔 Nouvelle réservation</h2>
      <ul>
        <li><strong>Référence :</strong> {booking.reference}</li>
        <li><strong>Client :</strong> {booking.guest_name} ({booking.guest_email})</li>
        <li><strong>Téléphone :</strong> {booking.guest_phone}</li>
        <li><strong>Service :</strong> {booking.service_slug}</li>
        <li><strong>Date :</strong> {booking.scheduled_date} à {booking.scheduled_time}</li>
        <li><strong>Adresse :</strong> {booking.street}, {booking.postal_code} {booking.city}</li>
        <li><strong>Montant :</strong> {booking.total_price} €</li>
        <li><strong>Fréquence :</strong> {booking.frequency}</li>
        {'<li><strong>Notes :</strong> ' + str(booking.notes) + '</li>' if booking.notes else ''}
      </ul>
    </div>
    """
    return _send(
        to=[ADMIN_EMAIL],
        subject=f"[Clarté] Nouvelle réservation — {booking.reference}",
        html=html,
    )


def send_contact_confirmation(msg: ContactMessage) -> bool:
    """Confirm receipt of a contact message."""
    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
      <h2 style="color:#0f6e4c">Merci pour votre message !</h2>
      <p>Bonjour <strong>{msg.name}</strong>,</p>
      <p>Nous avons bien reçu votre message et nous vous répondrons sous 24h.</p>
      <blockquote style="border-left:4px solid #e5e7eb;padding:12px 16px;color:#6b7280;margin:20px 0">
        {msg.message}
      </blockquote>
      <p style="color:#6b7280;font-size:14px">© Clarté — Services de Nettoyage Professionnels</p>
    </div>
    """
    return _send(
        to=[msg.email],
        subject="Nous avons reçu votre message — Clarté",
        html=html,
    )
