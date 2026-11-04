"""Plans (FREE / PREMIUM / BUSINESS) and the AI usage quota."""

from __future__ import annotations

import time
from collections import defaultdict, deque
from datetime import datetime, timezone

from fastapi import Depends, HTTPException, Request
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
        q = self.hits[key]
        while q and now - q[0] > window_s:
            q.popleft()
        if len(q) >= limit:
            raise HTTPException(429, "AI limit reached for now. Try again later.")
        q.append(now)


ip_limiter = IpLimiter()


def ai_quota(request: Request, user: User | None = Depends(optional_user), db: Session = Depends(get_db)) -> None:
    """Counts one AI call against the user's daily quota (or the anonymous IP limit)."""
    s = get_settings()
    if user is None:
        ip_limiter.check(request.client.host if request.client else "unknown", s.anon_rate_limit, s.anon_rate_window_s)
        return
    limit = ai_limit(db, user)
    row = db.get(AiUsage, (user.id, today()))
    if row is None:
        row = AiUsage(user_id=user.id, day=today(), count=0)
        db.add(row)
    if row.count >= limit:
        raise HTTPException(429, "Daily AI limit reached. Upgrade to Premium for more." if not is_premium(db, user) else "Daily AI limit reached.")
    row.count += 1
    db.commit()
