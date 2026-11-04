import os

import pytest
from fastapi.testclient import TestClient

from app import db
from app.config import get_settings
from app.main import app
from app.plans import ip_limiter

SECRET = "test-secret-" + "x" * 32


@pytest.fixture(autouse=True)
def env(monkeypatch):
    for k in ("SUPABASE_URL", "SUPABASE_JWT_SECRET", "STRIPE_SECRET_KEY", "STRIPE_PRICE_PREMIUM", "STRIPE_PRICE_BUSINESS", "STRIPE_WEBHOOK_SECRET", "AI_QUEST_BILLING"):
        monkeypatch.delenv(k, raising=False)
    monkeypatch.setenv("AI_QUEST_DEV_AUTH", "1")
    monkeypatch.setenv("AI_QUEST_SECRET", SECRET)
    get_settings.cache_clear()
    # Set TEST_DATABASE_URL=postgresql+psycopg://... to run the suite against PostgreSQL.
    db.configure(os.environ.get("TEST_DATABASE_URL", "sqlite://"), reset=True)
    ip_limiter.hits.clear()
    yield
    get_settings.cache_clear()
    app.dependency_overrides.clear()


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def login(client, email="ana@example.com", name="Ana"):
    r = client.post("/api/auth/dev-login", json={"email": email, "name": name})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}
