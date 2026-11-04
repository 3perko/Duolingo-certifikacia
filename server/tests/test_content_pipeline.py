import json
from types import SimpleNamespace

from tools import content_pipeline as cp

DOC = "Candidates must verify AI outputs against primary sources before use. Human review is required for high-stakes outputs."


def item(q="Q?", correct=(1,), quote="Human review is required for high-stakes outputs."):
    l = lambda s: {"sk": s + " (sk)", "en": s}
    return {"concept": l("Human review"), "question": l(q), "options": [l(f"o{i}") for i in range(4)], "correct": list(correct), "explanation": l("Because."), "source_quote": quote}


class FakeClient:
    def __init__(self, *payloads):
        self.payloads = list(payloads)
        self.calls = []
        self.beta = SimpleNamespace(messages=SimpleNamespace(create=self._create))

    def _create(self, **kw):
        self.calls.append(kw)
        text = json.dumps(self.payloads.pop(0))
        return SimpleNamespace(stop_reason="end_turn", content=[SimpleNamespace(type="text", text=text)])


def test_draft_checks_quotes_and_structure():
    client = FakeClient(
        {"items": [item("Good?"), item("Fake quote?", quote="Not in the doc."), item("Bad index?", correct=(7,))]},
        {"results": [{"index": 0, "status": "ok", "reason": ""}, {"index": 1, "status": "ok", "reason": ""}, {"index": 2, "status": "ok", "reason": ""}]},
    )
    out = cp.draft(client, DOC, "guide.md", "2026-10", "evaluation", "Evaluating outputs", 3, existing=["Old question?"])
    statuses = [d["check"]["status"] for d in out["drafts"]]
    assert statuses == ["ok", "issue", "issue"]
    assert "not found verbatim" in out["drafts"][1]["check"]["reason"]
    first = out["drafts"][0]["item"]
    assert first["meta"] == {"source": "guide.md", "docVersion": "2026-10", "reviewed": False}
    assert first["domain"] == "evaluation" and first["kind"] == "choice"
    assert "Old question?" in client.calls[0]["messages"][0]["content"]
    assert client.calls[0]["output_config"]["format"]["type"] == "json_schema"


def test_approve_only_reviewed_valid_items(tmp_path):
    good = {"id": "gen-eval-1", "kind": "choice", "domain": "evaluation", **{k: v for k, v in item().items() if k != "source_quote"}, "meta": {"source": "g", "docVersion": "2026-10", "reviewed": True}}
    unreviewed = {**good, "id": "gen-eval-2", "meta": {**good["meta"], "reviewed": False}}
    broken = {**good, "id": "gen-eval-3", "correct": [9]}
    q = tmp_path / "20261104-evaluation.json"
    q.write_text(json.dumps({"drafts": [{"item": good}, {"item": unreviewed}, {"item": broken}]}))
    n, skipped = cp.approve(q, tmp_path / "approved")
    assert (n, skipped) == (1, 2)
    saved = json.loads((tmp_path / "approved" / q.name).read_text())
    assert [i["id"] for i in saved] == ["gen-eval-1"]
