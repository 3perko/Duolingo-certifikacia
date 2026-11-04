"""Accounts, progress sync and leagues."""

from __future__ import annotations

import json
import re
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import delete as sa_delete
from sqlalchemy.orm import Session

from . import leagues
from .auth import issue_dev_token, require_user
from .db import AiUsage, LeagueMember, OrgMember, ProgressRow, User, get_db, now_ms
from .plans import ai_limit, ai_used, is_premium, membership

router = APIRouter(prefix="/api")

MAX_PROGRESS_BYTES = 1_000_000


class DevLogin(BaseModel):
    email: str = Field(..., min_length=3, max_length=320)
    name: str | None = Field(None, max_length=80)


@router.post("/auth/dev-login")
def dev_login(body: DevLogin) -> dict:
    email = body.email.strip().lower()
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        raise HTTPException(422, "Invalid e-mail.")
    sub = "dev-" + uuid.uuid5(uuid.NAMESPACE_URL, f"aiquest:{email}").hex
    return {"access_token": issue_dev_token(sub, email, body.name)}


def me_payload(db: Session, user: User) -> dict[str, Any]:
    mem = membership(db, user)
    org = None
    if mem:
        o, m = mem
        org = {"id": o.id, "name": o.name, "role": m.role, "plan": o.plan, "seats": o.seats}
        if m.role in ("owner", "admin"):
            org["join_code"] = o.join_code
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "plan": user.plan,
        "premium": is_premium(db, user),
        "league_opt_in": user.league_opt_in,
        "league_tier": user.league_tier,
        "org": org,
        "ai": {"used": ai_used(db, user), "limit": ai_limit(db, user)},
    }


@router.get("/me")
def me(user: User = Depends(require_user), db: Session = Depends(get_db)) -> dict:
    return me_payload(db, user)


class MePatch(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=80)
    league_opt_in: bool | None = None


@router.patch("/me")
def update_me(body: MePatch, user: User = Depends(require_user), db: Session = Depends(get_db)) -> dict:
    if body.name is not None:
        user.name = body.name.strip()
    if body.league_opt_in is not None:
        user.league_opt_in = body.league_opt_in
    db.commit()
    return me_payload(db, user)


@router.delete("/me")
def delete_me(user: User = Depends(require_user), db: Session = Depends(get_db)) -> dict:
    """Deletes the account and all stored data (GDPR right to erasure)."""
    mem = membership(db, user)
    if mem and mem[1].role == "owner":
        raise HTTPException(409, "Transfer or delete your organisation first.")
    for model in (ProgressRow, OrgMember, LeagueMember, AiUsage):
        db.execute(sa_delete(model).where(model.user_id == user.id))
    db.delete(user)
    db.commit()
    return {"deleted": True}


# ------------------------------------------------------------------ progress sync


class ProgressPut(BaseModel):
    data: dict[str, Any]
    summary: dict[str, Any] = Field(default_factory=dict)
    base_updated_at: int | None = None


@router.get("/progress")
def get_progress(user: User = Depends(require_user), db: Session = Depends(get_db)) -> dict:
    row = db.get(ProgressRow, user.id)
    if row is None:
        return {"data": None, "updated_at": 0}
    return {"data": json.loads(row.data), "updated_at": row.updated_at}


@router.put("/progress")
def put_progress(body: ProgressPut, user: User = Depends(require_user), db: Session = Depends(get_db)) -> dict:
    """Optimistic concurrency: if another device saved since `base_updated_at`,
    respond 409 with the stored data so the client can merge and retry."""
    raw = json.dumps(body.data, separators=(",", ":"))
    if len(raw) > MAX_PROGRESS_BYTES:
        raise HTTPException(413, "Progress too large.")
    summary = {k: body.summary[k] for k in ("level", "xp", "streak", "lessons", "readiness", "last_study_at", "week", "week_xp", "track") if k in body.summary}
    row = db.get(ProgressRow, user.id)
    if row is not None and body.base_updated_at is not None and row.updated_at > body.base_updated_at:
        raise HTTPException(409, {"data": json.loads(row.data), "updated_at": row.updated_at})
    ts = max(now_ms(), (row.updated_at + 1) if row else 0)
    if row is None:
        row = ProgressRow(user_id=user.id, data=raw, summary=json.dumps(summary), updated_at=ts)
        db.add(row)
    else:
        row.data, row.summary, row.updated_at = raw, json.dumps(summary), ts
    db.commit()
    week, week_xp = summary.get("week"), summary.get("week_xp")
    if isinstance(week, str) and isinstance(week_xp, int):
        leagues.record_week_xp(db, user, week, week_xp)
    return {"updated_at": ts}


@router.get("/league")
def league(user: User = Depends(require_user), db: Session = Depends(get_db)) -> dict:
    return leagues.standings(db, user)
