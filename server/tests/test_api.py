from typing import Any

from app import ai
from app.main import app, get_completer
from app.plans import ip_limiter


class FakeCompleter:
    def __init__(self, data: dict[str, Any] | Exception):
        self.data = data
        self.calls: list[dict[str, Any]] = []

    async def complete_json(self, *, system, user, schema, effort):
        self.calls.append({"system": system, "user": user, "schema": schema, "effort": effort})
        if isinstance(self.data, Exception):
            raise self.data
        return self.data


def use(fake: FakeCompleter) -> FakeCompleter:
    app.dependency_overrides[get_completer] = lambda: fake
    return fake


RUBRIC = [
    {"id": "task", "label": "Úloha", "description": "Jasne definovaná úloha", "weight": 2},
    {"id": "audience", "label": "Publikum", "description": "Pre koho je text", "weight": 1},
    {"id": "format", "label": "Formát", "description": "Požadovaný formát", "weight": 1},
]

GRADE_REQ = {
    "goal": "Vysvetlenie generatívnej AI pre začiatočníka",
    "broken_prompt": "Napíš mi niečo o umelej inteligencii.",
    "user_prompt": "Vysvetli generatívnu AI začiatočníkovi, max 300 slov.",
    "rubric": RUBRIC,
    "lang": "sk",
}


def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_grade_prompt_scores_from_statuses(client):
    fake = use(
        FakeCompleter(
            {
                "criteria": [
                    {"id": "task", "status": "met", "comment": "ok"},
                    {"id": "audience", "status": "met", "comment": "ok"},
                    {"id": "format", "status": "partial", "comment": "chýba štruktúra"},
                ],
                "tips": ["a", "b", "c", "d"],
                "improved_prompt": "Lepší prompt",
            }
        )
    )
    r = client.post("/api/grade/prompt", json=GRADE_REQ)
    assert r.status_code == 200, r.text
    body = r.json()
    # (2*1 + 1*1 + 1*0.5) / 4 = 87.5 -> 88
    assert body["score"] == 88
    assert [c["status"] for c in body["criteria"]] == ["met", "met", "partial"]
    assert body["criteria"][0]["label"] == "Úloha"
    assert len(body["tips"]) == 3
    # learner text is fenced as data
    assert "<learner_prompt>Vysvetli generatívnu AI" in fake.calls[0]["user"]
    assert fake.calls[0]["schema"]["additionalProperties"] is False


def test_grade_prompt_missing_and_invalid_criteria_count_as_missing(client):
    use(
        FakeCompleter(
            {
                "criteria": [{"id": "task", "status": "excellent", "comment": "?"}],
                "tips": [],
                "improved_prompt": "",
            }
        )
    )
    r = client.post("/api/grade/prompt", json=GRADE_REQ)
    assert r.status_code == 200
    assert r.json()["score"] == 0
    assert all(c["status"] == "missing" for c in r.json()["criteria"])


def test_tutor_explain(client):
    fake = use(
        FakeCompleter(
            {
                "explanation": "Context window je pracovná pamäť modelu.",
                "analogy": "Ako stôl, na ktorý sa zmestí len určitý počet papierov.",
                "check_question": {
                    "question": "Čo sa stane, keď konverzácia presiahne context window?",
                    "options": ["Model si nepamätá najstaršie časti", "Model sa zrýchli"],
                    "correct_index": 0,
                    "explanation": "Starší obsah sa už nevojde do kontextu.",
                },
            }
        )
    )
    r = client.post(
        "/api/tutor/explain",
        json={"concept": "Context window", "mode": "simpler", "lang": "sk", "learner": {"level": 3, "weak_concepts": ["MCP"]}},
    )
    assert r.status_code == 200, r.text
    assert r.json()["check_question"]["correct_index"] == 0
    prompt = fake.calls[0]["user"]
    assert "much more simply" in prompt and "MCP" in prompt and "Slovak" in prompt
    assert fake.calls[0]["effort"] == "low"


def test_tutor_rejects_out_of_range_answer(client):
    use(
        FakeCompleter(
            {
                "explanation": "x",
                "analogy": None,
                "check_question": {"question": "q", "options": ["a", "b"], "correct_index": 5, "explanation": "e"},
            }
        )
    )
    r = client.post("/api/tutor/explain", json={"concept": "Tokens"})
    assert r.status_code == 502


def test_ai_errors_map_to_http(client):
    use(FakeCompleter(ai.AIError("declined", 422)))
    r = client.post("/api/tutor/explain", json={"concept": "Tokens"})
    assert r.status_code == 422


def test_missing_credentials_is_503(client, monkeypatch):
    class NoAuthMessages:
        async def create(self, **kwargs):
            raise TypeError("Could not resolve authentication method.")

    class NoAuthClient:
        class beta:
            messages = NoAuthMessages()

    app.dependency_overrides[get_completer] = lambda: ai.ClaudeCompleter(client=NoAuthClient(), model="m")
    r = client.post("/api/tutor/explain", json={"concept": "Tokens"})
    assert r.status_code == 503


def test_refusal_is_422(client):
    class Resp:
        stop_reason = "refusal"
        content = []

    class Messages:
        async def create(self, **kwargs):
            assert kwargs["fallbacks"] == "default"
            assert kwargs["output_config"]["format"]["type"] == "json_schema"
            return Resp()

    class Client:
        class beta:
            messages = Messages()

    app.dependency_overrides[get_completer] = lambda: ai.ClaudeCompleter(client=Client(), model="m")
    r = client.post("/api/tutor/explain", json={"concept": "Tokens"})
    assert r.status_code == 422


def test_request_validation(client):
    use(FakeCompleter({}))
    r = client.post("/api/grade/prompt", json={**GRADE_REQ, "rubric": []})
    assert r.status_code == 422


def test_rate_limit(client, monkeypatch):
    use(FakeCompleter(ai.AIError("x", 502)))
    monkeypatch.setenv("AI_QUEST_RATE_LIMIT", "2")
    from app.config import get_settings
    get_settings.cache_clear()
    ip_limiter.hits.clear()
    codes = [client.post("/api/tutor/explain", json={"concept": "Tokens"}).status_code for _ in range(3)]
    assert codes == [502, 502, 429]


def test_variant_validates_and_fences_original(client):
    fake = use(FakeCompleter({"question": "Nová otázka?", "options": ["a", "b", "c", "d"], "correct": [2], "explanation": "e"}))
    body = {"concept": "Few-shot", "question": "Čo je few-shot?", "options": ["x", "y", "z", "w"], "correct": [1], "explanation": "ex", "lang": "sk"}
    r = client.post("/api/questions/variant", json=body)
    assert r.status_code == 200, r.text
    assert r.json()["correct"] == [2]
    assert "<original>" in fake.calls[0]["user"] and "exactly 1 correct" in fake.calls[0]["user"]


def test_variant_rejects_wrong_answer_count(client):
    use(FakeCompleter({"question": "Q?", "options": ["a", "b", "c", "d"], "correct": [0, 1], "explanation": "e"}))
    body = {"concept": "c", "question": "Old?", "options": ["x", "y", "z", "w"], "correct": [1], "explanation": "ex"}
    assert client.post("/api/questions/variant", json=body).status_code == 502


def test_health_reports_modes(client):
    body = client.get("/api/health").json()
    assert body["auth"] == "dev" and body["billing"] is False
