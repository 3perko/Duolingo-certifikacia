import json
import time

import stripe

from app import leagues
from app.billing import get_stripe
from app.config import get_settings
from app.db import LeagueMember, User, get_db
from app.main import app, get_completer

from .conftest import login


def test_requires_auth(client):
    assert client.get("/api/me").status_code == 401
    assert client.get("/api/me", headers={"Authorization": "Bearer nope"}).status_code == 401


def test_dev_login_and_me(client):
    h = login(client)
    me = client.get("/api/me", headers=h).json()
    assert me["email"] == "ana@example.com" and me["name"] == "Ana"
    assert me["premium"] is True  # billing disabled => everything open
    assert login(client) == login(client)  # same e-mail -> same account
    r = client.patch("/api/me", headers=h, json={"name": "Anka", "league_opt_in": False})
    assert r.json()["name"] == "Anka" and r.json()["league_opt_in"] is False


def test_dev_login_disabled(client, monkeypatch):
    monkeypatch.setenv("AI_QUEST_DEV_AUTH", "0")
    get_settings.cache_clear()
    assert client.post("/api/auth/dev-login", json={"email": "a@b.cz"}).status_code == 404


def test_progress_sync_with_conflict(client):
    h = login(client)
    assert client.get("/api/progress", headers=h).json() == {"data": None, "updated_at": 0}
    r1 = client.put("/api/progress", headers=h, json={"data": {"xp": 10}, "summary": {"xp": 10}, "base_updated_at": 0})
    assert r1.status_code == 200
    ts1 = r1.json()["updated_at"]
    # second device still thinks the base is 0 -> conflict with server copy
    r2 = client.put("/api/progress", headers=h, json={"data": {"xp": 5}, "base_updated_at": 0})
    assert r2.status_code == 409
    assert r2.json()["detail"]["data"] == {"xp": 10}
    r3 = client.put("/api/progress", headers=h, json={"data": {"xp": 15}, "base_updated_at": ts1})
    assert r3.status_code == 200 and r3.json()["updated_at"] > ts1
    assert client.get("/api/progress", headers=h).json()["data"] == {"xp": 15}


def test_league_groups_and_weekly_xp(client):
    week = leagues.iso_week()
    headers = [login(client, f"u{i}@ex.com", f"U{i}") for i in range(3)]
    for i, h in enumerate(headers):
        client.put("/api/progress", headers=h, json={"data": {}, "summary": {"week": week, "week_xp": (i + 1) * 100}})
    standing = client.get("/api/league", headers=headers[0]).json()
    assert standing["opted_in"] and standing["tier"] == 0
    assert [m["name"] for m in standing["members"]] == ["U2", "U1", "U0"]
    assert standing["members"][2]["me"] is True
    # XP never decreases and other weeks are ignored
    client.put("/api/progress", headers=headers[0], json={"data": {}, "summary": {"week": week, "week_xp": 50}})
    client.put("/api/progress", headers=headers[0], json={"data": {}, "summary": {"week": "1999-W01", "week_xp": 9999}})
    me = next(m for m in client.get("/api/league", headers=headers[0]).json()["members"] if m["me"])
    assert me["xp"] == 100


def test_league_promotion_after_week(client):
    h = login(client, "p@ex.com", "P")
    uid = client.get("/api/me", headers=h).json()["id"]
    session = next(app.dependency_overrides.get(get_db, get_db)())
    session.add(User(id="other", name="O", email=None))
    session.flush()
    session.add(LeagueMember(week="2000-W01", user_id=uid, tier=0, group_no=0, xp=500))
    session.add(LeagueMember(week="2000-W01", user_id="other", tier=0, group_no=0, xp=10))
    session.commit()
    standing = client.get("/api/league", headers=h).json()
    assert standing["tier"] == 1  # finished first in 2000-W01 -> promoted


def test_orgs_dashboard(client):
    boss = login(client, "boss@firma.sk", "Šéf")
    r = client.post("/api/orgs", headers=boss, json={"name": "Firma s.r.o."})
    code = r.json()["join_code"]
    emp = login(client, "emp@firma.sk", "Zamestnanec")
    assert client.post("/api/orgs/join", headers=emp, json={"code": code.lower()}).status_code == 200
    client.put("/api/progress", headers=emp, json={"data": {}, "summary": {"xp": 420, "readiness": {"associate": 37}, "secret": "dropped"}})
    assert client.get("/api/orgs/dashboard", headers=emp).status_code == 403
    dash = client.get("/api/orgs/dashboard", headers=boss).json()
    assert dash["org"]["name"] == "Firma s.r.o."
    top = dash["members"][0]
    assert top["name"] == "Zamestnanec" and top["xp"] == 420 and top["readiness"] == {"associate": 37}
    assert client.post("/api/orgs/join", headers=emp, json={"code": code}).status_code == 409
    assert client.post("/api/orgs/leave", headers=boss).status_code == 409
    assert client.post("/api/orgs/leave", headers=emp).status_code == 200


def _signed(payload: dict, secret: str) -> tuple[bytes, str]:
    body = json.dumps(payload).encode()
    ts = int(time.time())
    sig = stripe.WebhookSignature._compute_signature(f"{ts}.{body.decode()}", secret)
    return body, f"t={ts},v1={sig}"


def test_billing_webhook_upgrades_and_downgrades(client, monkeypatch):
    monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "whsec_test")
    monkeypatch.setenv("AI_QUEST_BILLING", "1")
    get_settings.cache_clear()
    h = login(client)
    uid = client.get("/api/me", headers=h).json()["id"]
    assert client.get("/api/me", headers=h).json()["premium"] is False

    event = {"id": "evt_1", "object": "event", "type": "checkout.session.completed",
             "data": {"object": {"object": "checkout.session", "mode": "subscription", "customer": "cus_1", "metadata": {"user_id": uid, "plan": "premium"}}}}
    body, sig = _signed(event, "whsec_test")
    assert client.post("/api/billing/webhook", content=body, headers={"Stripe-Signature": sig}).status_code == 200
    assert client.get("/api/me", headers=h).json()["premium"] is True

    bad = client.post("/api/billing/webhook", content=body, headers={"Stripe-Signature": "t=1,v1=deadbeef"})
    assert bad.status_code == 400

    event = {"id": "evt_2", "object": "event", "type": "customer.subscription.deleted",
             "data": {"object": {"object": "subscription", "customer": "cus_1", "status": "canceled", "metadata": {"user_id": uid, "plan": "premium"}}}}
    body, sig = _signed(event, "whsec_test")
    client.post("/api/billing/webhook", content=body, headers={"Stripe-Signature": sig})
    assert client.get("/api/me", headers=h).json()["premium"] is False


def test_business_licence_gives_members_premium(client, monkeypatch):
    monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "whsec_test")
    monkeypatch.setenv("AI_QUEST_BILLING", "1")
    get_settings.cache_clear()
    boss = login(client, "b@f.sk", "B")
    org = client.post("/api/orgs", headers=boss, json={"name": "Firma F"}).json()
    event = {"id": "evt_3", "object": "event", "type": "checkout.session.completed",
             "data": {"object": {"object": "checkout.session", "mode": "subscription", "customer": "cus_9", "metadata": {"plan": "business", "org_id": org["id"], "seats": "2", "user_id": "x"}}}}
    body, sig = _signed(event, "whsec_test")
    client.post("/api/billing/webhook", content=body, headers={"Stripe-Signature": sig})
    e1 = login(client, "e1@f.sk", "E1")
    assert client.post("/api/orgs/join", headers=e1, json={"code": org["join_code"]}).status_code == 200
    assert client.get("/api/me", headers=e1).json()["premium"] is True
    e2 = login(client, "e2@f.sk", "E2")
    assert client.post("/api/orgs/join", headers=e2, json={"code": org["join_code"]}).status_code == 402  # 2 seats used


def test_checkout_uses_configured_price(client, monkeypatch):
    monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test_x")
    monkeypatch.setenv("STRIPE_PRICE_PREMIUM", "price_123")
    get_settings.cache_clear()
    calls = []

    class Sessions:
        def create(self, params):
            calls.append(params)
            return type("S", (), {"url": "https://checkout.stripe.test/s"})()

    class Fake:
        class v1:
            class checkout:
                sessions = Sessions()

    app.dependency_overrides[get_stripe] = lambda: Fake()
    h = login(client)
    r = client.post("/api/billing/checkout", headers=h, json={"plan": "premium"})
    assert r.json() == {"url": "https://checkout.stripe.test/s"}
    assert calls[0]["line_items"] == [{"price": "price_123", "quantity": 1}]
    assert calls[0]["customer_email"] == "ana@example.com"
    assert client.post("/api/billing/checkout", headers=h, json={"plan": "business"}).status_code == 409


def test_ai_quota_per_user(client, monkeypatch):
    monkeypatch.setenv("AI_QUEST_BILLING", "1")
    monkeypatch.setenv("AI_QUEST_FREE_DAILY_AI", "2")
    get_settings.cache_clear()

    class Fake:
        async def complete_json(self, **kw):
            return {"explanation": "x", "analogy": None, "check_question": {"question": "q", "options": ["a", "b"], "correct_index": 0, "explanation": "e"}}

    app.dependency_overrides[get_completer] = lambda: Fake()
    h = login(client)
    codes = [client.post("/api/tutor/explain", headers=h, json={"concept": "Tokens"}).status_code for _ in range(3)]
    assert codes == [200, 200, 429]
    assert client.get("/api/me", headers=h).json()["ai"] == {"used": 2, "limit": 2}
    client.post("/api/dev/plan", headers=h, json={"plan": "premium"})
    assert client.post("/api/tutor/explain", headers=h, json={"concept": "Tokens"}).status_code == 200


def test_delete_account(client):
    h = login(client)
    client.put("/api/progress", headers=h, json={"data": {"xp": 1}})
    assert client.delete("/api/me", headers=h).json() == {"deleted": True}
    assert client.get("/api/progress", headers=login(client)).json()["data"] is None


def test_league_xp_is_capped_to_plausible_growth():
    from app.db import LeagueMember

    week = leagues.iso_week()
    start = leagues.week_start_ms(week)
    m = LeagueMember(week=week, user_id="u", tier=0, group_no=0, xp=0, updated_at=start)
    # one hour into the week at most burst + 1 hour of study
    assert leagues.plausible_xp(m, 999_999, start + leagues.HOUR_MS) == leagues.BURST_XP + leagues.MAX_XP_PER_HOUR
    assert leagues.plausible_xp(m, 200, start + leagues.HOUR_MS) == 200
    m.xp, m.updated_at = 1000, start + 10 * leagues.HOUR_MS
    # 6 minutes after the last update only a little more is accepted
    assert leagues.plausible_xp(m, 50_000, m.updated_at + leagues.HOUR_MS // 10) == 1000 + leagues.BURST_XP + leagues.MAX_XP_PER_HOUR // 10
    assert leagues.plausible_xp(m, 10**9, start + 10**12) == leagues.MAX_WEEK_XP


def test_league_accepts_time_zone_neighbour_weeks():
    from datetime import datetime, timezone

    # Sunday 23:00 UTC: learners in UTC+1 are already in the next week
    weeks = leagues.accepted_weeks(datetime(2026, 11, 8, 23, 0, tzinfo=timezone.utc))
    assert weeks == {"2026-W45", "2026-W46"}
