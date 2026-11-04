"""Runtime configuration, read from environment variables."""

from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache


def _bool(name: str) -> bool:
    return os.environ.get(name, "").strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    database_url: str
    secret: str
    dev_auth: bool
    supabase_url: str
    supabase_jwt_secret: str
    stripe_secret_key: str
    stripe_webhook_secret: str
    stripe_price_premium: str
    stripe_price_business: str
    billing_forced: bool
    public_url: str
    free_daily_ai: int
    premium_daily_ai: int
    anon_rate_limit: int
    anon_rate_window_s: float

    @property
    def auth_mode(self) -> str:
        if self.supabase_url or self.supabase_jwt_secret:
            return "supabase"
        return "dev" if self.dev_auth else "none"

    @property
    def stripe_enabled(self) -> bool:
        return bool(self.stripe_secret_key and self.stripe_price_premium)

    @property
    def billing_enabled(self) -> bool:
        """When false (self-hosted / dev), every feature is open to everyone."""
        return self.stripe_enabled or self.billing_forced


@lru_cache
def get_settings() -> Settings:
    dev_auth = _bool("AI_QUEST_DEV_AUTH")
    secret = os.environ.get("AI_QUEST_SECRET", "")
    if dev_auth and len(secret) < 32:
        raise RuntimeError("AI_QUEST_DEV_AUTH requires AI_QUEST_SECRET with at least 32 characters.")
    return Settings(
        database_url=os.environ.get("DATABASE_URL", "sqlite:///./aiquest.db"),
        secret=secret,
        dev_auth=dev_auth,
        supabase_url=os.environ.get("SUPABASE_URL", "").rstrip("/"),
        supabase_jwt_secret=os.environ.get("SUPABASE_JWT_SECRET", ""),
        stripe_secret_key=os.environ.get("STRIPE_SECRET_KEY", ""),
        stripe_webhook_secret=os.environ.get("STRIPE_WEBHOOK_SECRET", ""),
        stripe_price_premium=os.environ.get("STRIPE_PRICE_PREMIUM", ""),
        stripe_price_business=os.environ.get("STRIPE_PRICE_BUSINESS", ""),
        billing_forced=_bool("AI_QUEST_BILLING"),
        public_url=os.environ.get("AI_QUEST_PUBLIC_URL", "http://localhost:5173").rstrip("/"),
        free_daily_ai=int(os.environ.get("AI_QUEST_FREE_DAILY_AI", "10")),
        premium_daily_ai=int(os.environ.get("AI_QUEST_PREMIUM_DAILY_AI", "200")),
        anon_rate_limit=int(os.environ.get("AI_QUEST_RATE_LIMIT", "30")),
        anon_rate_window_s=float(os.environ.get("AI_QUEST_RATE_WINDOW_S", "600")),
    )
