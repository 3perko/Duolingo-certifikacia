"""Plans (FREE / PREMIUM / BUSINESS) and the AI usage quota."""

from __future__ import annotations

import time
from collections import defaultdict, deque
from datetime import datetime, timezone

from fastapi import Depends, HTTPException, Request
from sqlalchemy import update
from sqlalchemy.orm import Session

from .auth import optional_user
from .config import get_settings
from .db import AiUsage, Org, OrgMember, User, get_db


def membership(db: Session, user: User) -> tuple[Org, OrgMember] | None:
    m = db.get(OrgMember, user.id)
    if m is None:
        return None
    org = db.get(Org, m.org_id)
    return (org, m) if org else None


def is_premium(db: Session, user: User | None) -> bool:
    """Premium if billing is off, the user pays, or their organisation has a business licence."""
    if not get_settings().billing_enabled:
        return True
    if user is None:
        return False
    if user.plan == "premium":
        return True
    mem = membership(db, user)
    return bool(mem and mem[0].plan == "business")


def ai_limit(db: Session, user: User) -> int:
    s = get_settings()
    return s.premium_daily_ai if is_premium(db, user) else s.free_daily_ai


def today() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def ai_used(db: Session, user: User) -> int:
    row = db.get(AiUsage, (user.id, today()))
    return row.count if row else 0


class IpLimiter:
    """Sliding-window limit for anonymous AI use."""

    def __init__(self) -> None:
        self.hits: dict[str, deque[float]] = defaultdict(deque)

    def check(self, key: str, limit: int, window_s: float) -> None:
        now = time.monotonic()
        if len(self.hits) > 10_000:  # forget idle clients so memory stays bounded
            for k in [k for k, q in self.hits.items() if not q or now - q[-1] > window_s]:
                del self.hits[k]
        q = self.hits[key]
        while q and now - q[0] > window_s:
            q.popleft()
        if len(q) >= limit:
            raise HTTPException(429, "AI limit reached for now. Try again later.")
        q.append(now)


ip_limiter = IpLimiter()


class Quota:
    """Checked before an AI call; charged only after the call succeeded, so failures
    (AI unavailable, refusal, invalid output) don't use up the learner's daily limit."""

    def __init__(self, db: Session | None = None, user: User | None = None):
        self.db, self.user = db, user

    def charge(self) -> None:
        if self.db is None or self.user is None:
            return
        day = today()
        updated = self.db.execute(
            update(AiUsage).where(AiUsage.user_id == self.user.id, AiUsage.day == day).values(count=AiUsage.count + 1)
        ).rowcount
        if not updated:
            self.db.add(AiUsage(user_id=self.user.id, day=day, count=1))
        self.db.commit()


def ai_quota(request: Request, user: User | None = Depends(optional_user), db: Session = Depends(get_db)) -> Quota:
    """Rejects the call when the user's daily AI quota (or the anonymous IP limit) is used up."""
    s = get_settings()
    if user is None:
        ip_limiter.check(request.client.host if request.client else "unknown", s.anon_rate_limit, s.anon_rate_window_s)
        return Quota()
    if ai_used(db, user) >= ai_limit(db, user):
        raise HTTPException(429, "Daily AI limit reached. Upgrade to Premium for more." if not is_premium(db, user) else "Daily AI limit reached.")
    return Quota(db, user)
