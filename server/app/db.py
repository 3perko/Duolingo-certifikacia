"""Database models (SQLAlchemy 2). SQLite for development, PostgreSQL in production via DATABASE_URL."""

from __future__ import annotations

import json
import time
from collections.abc import Iterator
from typing import Any

from sqlalchemy import BigInteger, Boolean, ForeignKey, Integer, String, Text, create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker
from sqlalchemy.pool import StaticPool

from .config import get_settings


def now_ms() -> int:
    return int(time.time() * 1000)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(128), primary_key=True)  # auth subject
    email: Mapped[str | None] = mapped_column(String(320))
    name: Mapped[str] = mapped_column(String(80))
    plan: Mapped[str] = mapped_column(String(16), default="free")  # free | premium
    stripe_customer_id: Mapped[str | None] = mapped_column(String(64), index=True)
    league_tier: Mapped[int] = mapped_column(Integer, default=0)
    league_opt_in: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[int] = mapped_column(BigInteger, default=now_ms)


class ProgressRow(Base):
    __tablename__ = "progress"
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    data: Mapped[str] = mapped_column(Text)
    summary: Mapped[str] = mapped_column(Text, default="{}")
    updated_at: Mapped[int] = mapped_column(BigInteger)

    def summary_dict(self) -> dict[str, Any]:
        try:
            return json.loads(self.summary or "{}")
        except json.JSONDecodeError:
            return {}


class Org(Base):
    __tablename__ = "orgs"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    join_code: Mapped[str] = mapped_column(String(16), unique=True)
    plan: Mapped[str] = mapped_column(String(16), default="none")  # none | business
    seats: Mapped[int] = mapped_column(Integer, default=0)
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    stripe_customer_id: Mapped[str | None] = mapped_column(String(64), index=True)
    created_at: Mapped[int] = mapped_column(BigInteger, default=now_ms)


class OrgMember(Base):
    __tablename__ = "org_members"
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)  # one org per user
    org_id: Mapped[str] = mapped_column(ForeignKey("orgs.id", ondelete="CASCADE"), index=True)
    role: Mapped[str] = mapped_column(String(16), default="member")  # owner | admin | member
    joined_at: Mapped[int] = mapped_column(BigInteger, default=now_ms)


class LeagueMember(Base):
    __tablename__ = "league_members"
    week: Mapped[str] = mapped_column(String(10), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    tier: Mapped[int] = mapped_column(Integer, index=True)
    group_no: Mapped[int] = mapped_column(Integer, index=True)
    xp: Mapped[int] = mapped_column(Integer, default=0)
    finalized: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[int] = mapped_column(BigInteger, default=now_ms)


class AiUsage(Base):
    __tablename__ = "ai_usage"
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    day: Mapped[str] = mapped_column(String(10), primary_key=True)
    count: Mapped[int] = mapped_column(Integer, default=0)


_engine: Engine | None = None
_Session: sessionmaker[Session] | None = None


def configure(url: str | None = None, reset: bool = False) -> Engine:
    """(Re)creates the engine; tests call it with sqlite:// for an in-memory database.
    `reset` drops all tables first (tests against a real PostgreSQL)."""
    global _engine, _Session
    if _engine is not None:
        _engine.dispose()
    url = url or get_settings().database_url
    kwargs: dict[str, Any] = {}
    if url.startswith("sqlite"):
        kwargs["connect_args"] = {"check_same_thread": False}
        if url in ("sqlite://", "sqlite:///:memory:"):
            kwargs["poolclass"] = StaticPool
    _engine = create_engine(url, **kwargs)
    if url.startswith("sqlite"):
        # Enforce foreign keys like PostgreSQL does, so dev and tests catch the same bugs.
        @event.listens_for(_engine, "connect")
        def _fk_on(conn, _record):  # pragma: no cover - trivial
            conn.execute("PRAGMA foreign_keys=ON")

    _Session = sessionmaker(_engine, expire_on_commit=False)
    if reset:
        Base.metadata.drop_all(_engine)
    if reset:
        Base.metadata.create_all(_engine)
    elif get_settings().auto_create:
        Base.metadata.create_all(_engine)
        _stamp_if_new(_engine)
    return _engine


def _stamp_if_new(engine: Engine) -> None:
    """A database created by create_all (SQLite dev) is marked as being at the latest
    migration, so a later `alembic upgrade head` applies only newer migrations."""
    from pathlib import Path

    from sqlalchemy import inspect

    if inspect(engine).has_table("alembic_version"):
        return
    try:
        from alembic import command
        from alembic.config import Config

        ini = Path(__file__).resolve().parents[1] / "alembic.ini"
        cfg = Config(str(ini))
        cfg.set_main_option("script_location", str(ini.parent / "migrations"))
        with engine.begin() as conn:
            cfg.attributes["connection"] = conn
            command.stamp(cfg, "head")
    except Exception:  # pragma: no cover - stamping is a convenience, never fatal
        pass


def ensure_configured() -> None:
    if _engine is None:
        configure()


def get_db() -> Iterator[Session]:
    if _Session is None:
        configure()
    assert _Session is not None
    with _Session() as session:
        yield session
