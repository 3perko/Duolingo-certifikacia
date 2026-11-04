"""Business accounts (section 12): an employer sees how prepared their team is."""

from __future__ import annotations

import secrets
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from .auth import require_user
from .db import Org, OrgMember, ProgressRow, User, get_db
from .plans import membership

router = APIRouter(prefix="/api/orgs")

ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def _code() -> str:
    return "".join(secrets.choice(ALPHABET) for _ in range(8))


class OrgCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)


@router.post("")
def create_org(body: OrgCreate, user: User = Depends(require_user), db: Session = Depends(get_db)) -> dict:
    if membership(db, user):
        raise HTTPException(409, "You already belong to an organisation.")
    org = Org(id=str(uuid.uuid4()), name=body.name.strip(), join_code=_code(), owner_id=user.id)
    db.add(org)
    db.add(OrgMember(user_id=user.id, org_id=org.id, role="owner"))
    db.commit()
    return {"id": org.id, "name": org.name, "join_code": org.join_code}


class OrgJoin(BaseModel):
    code: str = Field(..., min_length=4, max_length=16)


@router.post("/join")
def join_org(body: OrgJoin, user: User = Depends(require_user), db: Session = Depends(get_db)) -> dict:
    if membership(db, user):
        raise HTTPException(409, "You already belong to an organisation.")
    org = db.scalar(select(Org).where(Org.join_code == body.code.strip().upper()))
    if org is None:
        raise HTTPException(404, "Unknown code.")
    if org.plan == "business":
        count = len(db.scalars(select(OrgMember).where(OrgMember.org_id == org.id)).all())
        if count >= org.seats:
            raise HTTPException(402, "No free seats in this licence.")
    db.add(OrgMember(user_id=user.id, org_id=org.id, role="member"))
    db.commit()
    return {"id": org.id, "name": org.name}


@router.post("/leave")
def leave_org(user: User = Depends(require_user), db: Session = Depends(get_db)) -> dict:
    mem = membership(db, user)
    if not mem:
        raise HTTPException(404, "Not a member.")
    if mem[1].role == "owner":
        raise HTTPException(409, "The owner cannot leave; delete the organisation instead.")
    db.delete(mem[1])
    db.commit()
    return {"left": True}


def _admin(db: Session, user: User) -> Org:
    mem = membership(db, user)
    if not mem or mem[1].role not in ("owner", "admin"):
        raise HTTPException(403, "Only organisation admins can do this.")
    return mem[0]


@router.get("/dashboard")
def dashboard(user: User = Depends(require_user), db: Session = Depends(get_db)) -> dict:
    """Team readiness. Members agree to sharing their progress when they join."""
    org = _admin(db, user)
    members = db.scalars(select(OrgMember).where(OrgMember.org_id == org.id)).all()
    rows = []
    for m in members:
        u = db.get(User, m.user_id)
        p = db.get(ProgressRow, m.user_id)
        s = p.summary_dict() if p else {}
        rows.append(
            {
                "user_id": m.user_id,
                "name": u.name if u else "?",
                "email": u.email if u else None,
                "role": m.role,
                "xp": s.get("xp", 0),
                "level": s.get("level", 1),
                "streak": s.get("streak", 0),
                "lessons": s.get("lessons", 0),
                "readiness": s.get("readiness", {}),
                "last_study_at": s.get("last_study_at"),
            }
        )
    rows.sort(key=lambda r: -(r["xp"] or 0))
    return {"org": {"id": org.id, "name": org.name, "plan": org.plan, "seats": org.seats, "join_code": org.join_code}, "members": rows}


class RoleChange(BaseModel):
    role: str = Field(..., pattern="^(admin|member)$")


@router.patch("/members/{user_id}")
def change_role(user_id: str, body: RoleChange, user: User = Depends(require_user), db: Session = Depends(get_db)) -> dict:
    org = _admin(db, user)
    m = db.get(OrgMember, user_id)
    if not m or m.org_id != org.id or m.role == "owner":
        raise HTTPException(404, "Member not found.")
    m.role = body.role
    db.commit()
    return {"user_id": user_id, "role": m.role}


@router.delete("/members/{user_id}")
def remove_member(user_id: str, user: User = Depends(require_user), db: Session = Depends(get_db)) -> dict:
    org = _admin(db, user)
    m = db.get(OrgMember, user_id)
    if not m or m.org_id != org.id or m.role == "owner":
        raise HTTPException(404, "Member not found.")
    db.delete(m)
    db.commit()
    return {"removed": user_id}


@router.delete("")
def delete_org(user: User = Depends(require_user), db: Session = Depends(get_db)) -> dict:
    mem = membership(db, user)
    if not mem or mem[1].role != "owner":
        raise HTTPException(403, "Only the owner can delete the organisation.")
    org = mem[0]
    for m in db.scalars(select(OrgMember).where(OrgMember.org_id == org.id)).all():
        db.delete(m)
    db.delete(org)
    db.commit()
    return {"deleted": True}
