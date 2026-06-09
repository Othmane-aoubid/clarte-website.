"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-06-09 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── services ───────────────────────────────────────────────────────────────
    op.create_table(
        "services",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("slug", sa.String(100), nullable=False),
        sa.Column("icon", sa.String(50), nullable=True),
        sa.Column("base_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("unit", sa.String(20), nullable=False, server_default="hour"),
        sa.Column("duration_minutes", sa.Integer(), nullable=True),
        sa.Column("active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )

    op.create_table(
        "service_translations",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("service_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("locale", sa.String(5), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("short_description", sa.String(500), nullable=True),
        sa.ForeignKeyConstraint(["service_id"], ["services.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("service_id", "locale"),
    )

    # ── pricing plans ──────────────────────────────────────────────────────────
    op.create_table(
        "pricing_plans",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("slug", sa.String(100), nullable=False),
        sa.Column("stripe_price_id", sa.String(200), nullable=True),
        sa.Column("stripe_product_id", sa.String(200), nullable=True),
        sa.Column("price", sa.Numeric(10, 2), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False, server_default="EUR"),
        sa.Column("billing_interval", sa.String(20), nullable=True),
        sa.Column("is_popular", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )

    op.create_table(
        "pricing_plan_translations",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("plan_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("locale", sa.String(5), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("features", postgresql.JSONB(), nullable=True),
        sa.ForeignKeyConstraint(["plan_id"], ["pricing_plans.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("plan_id", "locale"),
    )

    # ── bookings ───────────────────────────────────────────────────────────────
    op.create_table(
        "bookings",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("reference", sa.String(20), nullable=False),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("guest_name", sa.String(200), nullable=True),
        sa.Column("guest_email", sa.String(320), nullable=True),
        sa.Column("guest_phone", sa.String(30), nullable=True),
        sa.Column("service_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("service_slug", sa.String(100), nullable=True),
        sa.Column("scheduled_date", sa.Date(), nullable=False),
        sa.Column("scheduled_time", sa.Time(), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=False),
        sa.Column("frequency", sa.String(20), nullable=False, server_default="once"),
        sa.Column("status", sa.String(30), nullable=False, server_default="pending"),
        sa.Column("total_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("admin_notes", sa.Text(), nullable=True),
        # Address
        sa.Column("street", sa.String(500), nullable=False),
        sa.Column("city", sa.String(200), nullable=False),
        sa.Column("postal_code", sa.String(20), nullable=False),
        sa.Column("area_sqm", sa.Integer(), nullable=True),
        sa.Column("floor", sa.Integer(), nullable=True),
        sa.Column("elevator", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("access_code", sa.String(100), nullable=True),
        # Payment
        sa.Column("stripe_payment_intent_id", sa.String(200), nullable=True),
        sa.Column("payment_status", sa.String(30), nullable=False, server_default="unpaid"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["service_id"], ["services.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("reference"),
    )

    # ── contact messages ───────────────────────────────────────────────────────
    op.create_table(
        "contact_messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("email", sa.String(320), nullable=False),
        sa.Column("phone", sa.String(30), nullable=True),
        sa.Column("subject", sa.String(300), nullable=True),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("locale", sa.String(5), nullable=False, server_default="fr"),
        sa.Column("status", sa.String(20), nullable=False, server_default="unread"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )

    # ── availability blocks ────────────────────────────────────────────────────
    op.create_table(
        "availability_blocks",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("blocked_date", sa.Date(), nullable=False),
        sa.Column("start_time", sa.Time(), nullable=True),
        sa.Column("end_time", sa.Time(), nullable=True),
        sa.Column("reason", sa.String(200), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )

    # ── indexes ────────────────────────────────────────────────────────────────
    op.create_index("ix_bookings_reference", "bookings", ["reference"])
    op.create_index("ix_bookings_guest_email", "bookings", ["guest_email"])
    op.create_index("ix_bookings_scheduled_date", "bookings", ["scheduled_date"])
    op.create_index("ix_bookings_status", "bookings", ["status"])
    op.create_index("ix_contact_messages_status", "contact_messages", ["status"])
    op.create_index("ix_availability_blocks_date", "availability_blocks", ["blocked_date"])


def downgrade() -> None:
    op.drop_table("availability_blocks")
    op.drop_table("contact_messages")
    op.drop_table("bookings")
    op.drop_table("pricing_plan_translations")
    op.drop_table("pricing_plans")
    op.drop_table("service_translations")
    op.drop_table("services")
