"""Weekly leagues (section 9). Learners compete in groups of up to 30 within a tier;
at the end of the ISO week the top 5 move up a tier and the bottom 5 move down.
Results are finalised lazily the first time a learner shows up in a new week."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .db import LeagueMember, User, now_ms

GROUP_SIZE = 30
PROMOTE = 5
DEMOTE = 5
MIN_GROUP_FOR_DEMOTION = 10
TOP_TIER = 4  # 0 Bronze … 4 Diamond

# Plausibility limits. XP is reported by the client, so the server only accepts
# growth a real learner could achieve: about one lesson every 4 minutes, plus a
# burst allowance, and a hard weekly ceiling. Excess is silently capped.
MAX_XP_PER_HOUR = 1200
BURST_XP = 300
MAX_WEEK_XP = 25_000
HOUR_MS = 3_600_000


def iso_week(dt: datetime | None = None) -> str:
    dt = dt or datetime.now(timezone.utc)
    y, w, _ = dt.isocalendar()
    return f"{y}-W{w:02d}"


def week_start_ms(week: str) -> int:
    y, w = week.split("-W")
    monday = datetime.fromisocalendar(int(y), int(w), 1).replace(tzinfo=timezone(timedelta(hours=14)))
    return int(monday.timestamp() * 1000)  # earliest time zone: the week can't have started before this


def accepted_weeks(dt: datetime | None = None) -> set[str]:
    """Weeks a learner somewhere on Earth can currently be in (UTC-12 … UTC+14)."""
    dt = dt or datetime.now(timezone.utc)
    return {iso_week(dt - timedelta(hours=12)), iso_week(dt), iso_week(dt + timedelta(hours=14))}


def week_end(dt: datetime | None = None) -> datetime:
    dt = dt or datetime.now(timezone.utc)
    monday = (dt - timedelta(days=dt.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
    return monday + timedelta(days=7)


def _group(db: Session, week: str, tier: int, group_no: int) -> list[LeagueMember]:
    return list(
        db.scalars(
            select(LeagueMember)
            .where(LeagueMember.week == week, LeagueMember.tier == tier, LeagueMember.group_no == group_no)
            .order_by(LeagueMember.xp.desc(), LeagueMember.user_id)
        )
    )


def _finalize_past(db: Session, user: User, current_week: str) -> None:
    past = db.scalars(
        select(LeagueMember)
        .where(LeagueMember.user_id == user.id, LeagueMember.week < current_week, LeagueMember.finalized.is_(False))
        .order_by(LeagueMember.week)
    ).all()
    for m in past:
        group = _group(db, m.week, m.tier, m.group_no)
        rank = next(i for i, g in enumerate(group) if g.user_id == user.id)
        n = len(group)
        tier = m.tier
        if rank < PROMOTE and m.xp > 0 and tier < TOP_TIER and n > 1:
            tier += 1
        elif tier > 0 and (m.xp == 0 or (n >= MIN_GROUP_FOR_DEMOTION and rank >= n - DEMOTE)):
            tier -= 1
        user.league_tier = tier
        m.finalized = True
    db.commit()


def ensure_member(db: Session, user: User, week: str | None = None) -> LeagueMember | None:
    if not user.league_opt_in:
        return None
    week = week or iso_week()
    m = db.get(LeagueMember, (week, user.id))
    if m:
        return m
    _finalize_past(db, user, week)
    tier = user.league_tier
    counts = db.execute(
        select(LeagueMember.group_no, func.count())
        .where(LeagueMember.week == week, LeagueMember.tier == tier)
        .group_by(LeagueMember.group_no)
        .order_by(LeagueMember.group_no)
    ).all()
    group_no = next((g for g, c in counts if c < GROUP_SIZE), (counts[-1][0] + 1) if counts else 0)
    m = LeagueMember(week=week, user_id=user.id, tier=tier, group_no=group_no, xp=0)
    db.add(m)
    db.commit()
    return m


def plausible_xp(m: LeagueMember, claimed: int, now: int) -> int:
    since = max(m.updated_at or 0, week_start_ms(m.week)) if m.xp else week_start_ms(m.week)
    allowed = m.xp + BURST_XP + max(0, now - since) * MAX_XP_PER_HOUR // HOUR_MS
    return min(claimed, allowed, MAX_WEEK_XP)


def record_week_xp(db: Session, user: User, week: str, xp: int) -> None:
    """Called on progress sync with the learner's XP for that week (never decreases)."""
    if not user.league_opt_in or xp <= 0 or week not in accepted_weeks():
        return
    m = ensure_member(db, user, week)
    if m is None:
        return
    now = now_ms()
    new_xp = plausible_xp(m, xp, now)
    if new_xp > m.xp:
        m.xp = new_xp
        m.updated_at = now
        db.commit()


def standings(db: Session, user: User) -> dict:
    week = iso_week()
    m = ensure_member(db, user, week)
    if m is None:
        return {"week": week, "opted_in": False, "tier": user.league_tier, "members": []}
    group = _group(db, week, m.tier, m.group_no)
    names = {u.id: u.name for u in db.scalars(select(User).where(User.id.in_([g.user_id for g in group])))}
    n = len(group)
    return {
        "week": week,
        "opted_in": True,
        "tier": m.tier,
        "ends_at": week_end().isoformat(),
        "promote": PROMOTE if m.tier < TOP_TIER else 0,
        "demote": DEMOTE if m.tier > 0 and n >= MIN_GROUP_FOR_DEMOTION else 0,
        "members": [
            {"rank": i + 1, "name": names.get(g.user_id, "?"), "xp": g.xp, "me": g.user_id == user.id}
            for i, g in enumerate(group)
        ],
    }
