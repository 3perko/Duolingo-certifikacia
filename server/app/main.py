"""AI QUEST API: AI tutor and AI prompt grading.

Run locally:
    uvicorn app.main:app --reload --port 8000
"""

from __future__ import annotations

import os
import time
from collections import defaultdict, deque
from functools import lru_cache

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from . import ai
from .schemas import GradePromptRequest, GradePromptResponse, TutorRequest, TutorResponse

app = FastAPI(title="AI QUEST API", version="0.1.0")

origins = [o.strip() for o in os.environ.get("AI_QUEST_CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@lru_cache
def get_completer() -> ai.JSONCompleter:
    return ai.ClaudeCompleter()


class RateLimiter:
    """Per-client sliding window. Stands in for the FREE-plan AI quota of the MVP."""

    def __init__(self, limit: int, window_s: float):
        self.limit = limit
        self.window_s = window_s
        self.hits: dict[str, deque[float]] = defaultdict(deque)

    def check(self, key: str) -> None:
        now = time.monotonic()
        q = self.hits[key]
        while q and now - q[0] > self.window_s:
            q.popleft()
        if len(q) >= self.limit:
            raise HTTPException(429, "AI limit reached for now. Try again later.")
        q.append(now)


limiter = RateLimiter(
    limit=int(os.environ.get("AI_QUEST_RATE_LIMIT", "30")),
    window_s=float(os.environ.get("AI_QUEST_RATE_WINDOW_S", "600")),
)


def rate_limited(request: Request) -> None:
    limiter.check(request.client.host if request.client else "unknown")


@app.get("/api/health")
def health() -> dict:
    configured = bool(os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_AUTH_TOKEN"))
    return {"status": "ok", "ai": configured}


@app.post("/api/tutor/explain", response_model=TutorResponse, dependencies=[Depends(rate_limited)])
async def tutor_explain(req: TutorRequest, completer: ai.JSONCompleter = Depends(get_completer)):
    try:
        return await ai.explain(completer, req)
    except ai.AIError as e:
        raise HTTPException(e.status_code, str(e)) from e
    except ValueError as e:  # pydantic validation of the model output
        raise HTTPException(502, "The AI returned data in an unexpected shape.") from e


@app.post("/api/grade/prompt", response_model=GradePromptResponse, dependencies=[Depends(rate_limited)])
async def grade_prompt(req: GradePromptRequest, completer: ai.JSONCompleter = Depends(get_completer)):
    try:
        return await ai.grade_prompt(completer, req)
    except ai.AIError as e:
        raise HTTPException(e.status_code, str(e)) from e
