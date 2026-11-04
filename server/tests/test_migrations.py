from pathlib import Path

from alembic import command
from alembic.autogenerate import compare_metadata
from alembic.config import Config
from alembic.migration import MigrationContext
from sqlalchemy import create_engine

from app.config import get_settings
from app.db import Base

SERVER = Path(__file__).resolve().parents[1]


def test_migrations_match_models(tmp_path, monkeypatch):
    """Fails when app/db.py changes without a new Alembic migration."""
    url = f"sqlite:///{tmp_path / 'm.db'}"
    monkeypatch.setenv("DATABASE_URL", url)
    get_settings.cache_clear()
    cfg = Config(str(SERVER / "alembic.ini"))
    cfg.set_main_option("script_location", str(SERVER / "migrations"))
    command.upgrade(cfg, "head")
    with create_engine(url).connect() as conn:
        diff = compare_metadata(MigrationContext.configure(conn), Base.metadata)
    assert diff == []
    command.downgrade(cfg, "base")


def test_dev_database_is_stamped_so_upgrades_work(tmp_path, monkeypatch):
    """SQLite created by the app on start-up is marked as migrated: `alembic upgrade head` is a no-op."""
    from sqlalchemy import inspect, text

    from app import db

    url = f"sqlite:///{tmp_path / 'dev.db'}"
    monkeypatch.setenv("DATABASE_URL", url)
    monkeypatch.delenv("AI_QUEST_AUTO_CREATE", raising=False)
    get_settings.cache_clear()
    engine = db.configure(url)
    assert inspect(engine).has_table("users")
    with engine.connect() as conn:
        assert conn.execute(text("select version_num from alembic_version")).scalar() == "0001"
    cfg = Config(str(SERVER / "alembic.ini"))
    cfg.set_main_option("script_location", str(SERVER / "migrations"))
    command.upgrade(cfg, "head")  # must not fail with "table already exists"
    engine.dispose()
