"""PREMIUM and BUSINESS subscriptions through Stripe Checkout (section 12).

The browser never sees prices or keys: it asks for a Checkout URL and Stripe
reports the outcome to /api/billing/webhook, whose signature we verify.
"""

from __future__ import annotations

import json
from typing import Any

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from .auth import require_user
from .config import get_settings
from .db import Org, User, get_db
from .plans import membership

router = APIRouter(prefix="/api")


def get_stripe() -> stripe.StripeClient:
    s = get_settings()
    if not s.stripe_enabled:
        raise HTTPException(503, "Payments are not configured.")
    return stripe.StripeClient(s.stripe_secret_key)


class CheckoutRequest(BaseModel):
    plan: str = Field(..., pattern="^(premium|business)$")
    seats: int = Field(5, ge=1, le=10_000)


@router.post("/billing/checkout")
def checkout(body: CheckoutRequest, user: User = Depends(require_user), db: Session = Depends(get_db), client: stripe.StripeClient = Depends(get_stripe)) -> dict:
    s = get_settings()
    metadata: dict[str, str] = {"user_id": user.id, "plan": body.plan}
    if body.plan == "premium":
        price, quantity = s.stripe_price_premium, 1
    else:
        mem = membership(db, user)
        if not mem or mem[1].role != "owner":
            raise HTTPException(409, "Create an organisation first; only its owner can buy a licence.")
        if not s.stripe_price_business:
            raise HTTPException(503, "Business licences are not configured.")
        price, quantity = s.stripe_price_business, body.seats
        metadata.update(org_id=mem[0].id, seats=str(body.seats))
    params: dict[str, Any] = {
        "mode": "subscription",
        "line_items": [{"price": price, "quantity": quantity}],
        "client_reference_id": user.id,
        "metadata": metadata,
        "subscription_data": {"metadata": metadata},
        "success_url": f"{s.public_url}/?checkout=success",
        "cancel_url": f"{s.public_url}/?checkout=cancel",
        "allow_promotion_codes": True,
    }
    if user.stripe_customer_id:
        params["customer"] = user.stripe_customer_id
    elif user.email:
        params["customer_email"] = user.email
    session = client.v1.checkout.sessions.create(params=params)
    return {"url": session.url}


@router.post("/billing/portal")
def portal(user: User = Depends(require_user), db: Session = Depends(get_db), client: stripe.StripeClient = Depends(get_stripe)) -> dict:
    customer = user.stripe_customer_id
    mem = membership(db, user)
    if not customer and mem and mem[1].role == "owner":
        customer = mem[0].stripe_customer_id
    if not customer:
        raise HTTPException(404, "No subscription to manage.")
    session = client.v1.billing_portal.sessions.create(params={"customer": customer, "return_url": f"{get_settings().public_url}/"})
    return {"url": session.url}


INACTIVE = {"canceled", "unpaid", "incomplete_expired"}


def _apply_subscription(db: Session, meta: dict[str, Any], customer: str | None, active: bool) -> None:
    plan = meta.get("plan")
    if plan == "business" and meta.get("org_id"):
        org = db.get(Org, meta["org_id"])
        if org:
            org.plan = "business" if active else "none"
            if active:
                org.seats = int(meta.get("seats") or org.seats or 1)
            org.stripe_customer_id = customer or org.stripe_customer_id
    elif meta.get("user_id"):
        user = db.get(User, meta["user_id"])
        if user:
            user.plan = "premium" if active else "free"
            user.stripe_customer_id = customer or user.stripe_customer_id
    elif customer:
        # Fallback when metadata is missing: match by customer id.
        user = db.scalar(select(User).where(User.stripe_customer_id == customer))
        if user:
            user.plan = "premium" if active else "free"
        org = db.scalar(select(Org).where(Org.stripe_customer_id == customer))
        if org:
            org.plan = "business" if active else "none"
    db.commit()


@router.post("/billing/webhook")
async def webhook(request: Request, db: Session = Depends(get_db)) -> dict:
    secret = get_settings().stripe_webhook_secret
    if not secret:
        raise HTTPException(503, "Webhook secret is not configured.")
    payload = await request.body()
    try:
        stripe.Webhook.construct_event(payload, request.headers.get("Stripe-Signature"), secret)
        event = json.loads(payload)  # signature verified; work with plain dicts
    except (ValueError, stripe.SignatureVerificationError) as e:
        raise HTTPException(400, "Invalid signature.") from e

    obj = event["data"]["object"]
    meta = dict(obj.get("metadata") or {})
    customer = obj.get("customer")
    kind = event["type"]
    if kind == "checkout.session.completed" and obj.get("mode") == "subscription":
        _apply_subscription(db, meta, customer, active=True)
    elif kind == "customer.subscription.updated":
        _apply_subscription(db, meta, customer, active=obj.get("status") not in INACTIVE)
    elif kind == "customer.subscription.deleted":
        _apply_subscription(db, meta, customer, active=False)
    return {"received": True}


class DevPlan(BaseModel):
    plan: str = Field(..., pattern="^(free|premium)$")


@router.post("/dev/plan")
def dev_plan(body: DevPlan, user: User = Depends(require_user), db: Session = Depends(get_db)) -> dict:
    """Switch your own plan without paying. Only with AI_QUEST_DEV_AUTH=1."""
    if not get_settings().dev_auth:
        raise HTTPException(404, "Not found.")
    user.plan = body.plan
    db.commit()
    return {"plan": user.plan}
