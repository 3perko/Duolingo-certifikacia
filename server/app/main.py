"""AI QUEST API: AI tutor, prompt grading, question variants, accounts, leagues,
billing and business accounts.

Run locally:
    uvicorn app.main:app --reload --port 8000
"""

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from functools import lru_cache

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from . import account, ai, billing, db, orgs
from .config import get_settings
from .plans import ai_quota
from .schemas import (
    GradePromptRequest,
    GradePromptResponse,
    TutorRequest,
    TutorResponse,
    VariantRequest,
    VariantResponse,
)


@asynccontextmanager
async def lifespan(_: FastAPI):
    db.ensure_configured()
    yield


app = FastAPI(title="AI QUEST API", version="0.2.0", lifespan=lifespan)

origins = [o.strip() for o in os.environ.get("AI_QUEST_CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(account.router)
app.include_router(orgs.router)
app.include_router(billing.router)


@lru_cache
def get_completer() -> ai.JSONCompleter:
    return ai.ClaudeCompleter()


@app.get("/api/health")
def health() -> dict:
    s = get_settings()
    configured = bool(os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_AUTH_TOKEN"))
    return {
        "status": "ok",
        "ai": configured,
        "auth": s.auth_mode,
        "supabase_url": s.supabase_url or None,
        "billing": s.billing_enabled,
        "payments": s.stripe_enabled,
    }


async def _run(coro):
    try:
        return await coro
    except ai.AIError as e:
        raise HTTPException(e.status_code, str(e)) from e
    except ValueError as e:  # pydantic validation of the model output
        raise HTTPException(502, "The AI returned data in an unexpected shape.") from e


@app.post("/api/tutor/explain", response_model=TutorResponse, dependencies=[Depends(ai_quota)])
async def tutor_explain(req: TutorRequest, completer: ai.JSONCompleter = Depends(get_completer)):
    return await _run(ai.explain(completer, req))


@app.post("/api/grade/prompt", response_model=GradePromptResponse, dependencies=[Depends(ai_quota)])
async def grade_prompt(req: GradePromptRequest, completer: ai.JSONCompleter = Depends(get_completer)):
    return await _run(ai.grade_prompt(completer, req))


@app.post("/api/questions/variant", response_model=VariantResponse, dependencies=[Depends(ai_quota)])
async def question_variant(req: VariantRequest, completer: ai.JSONCompleter = Depends(get_completer)):
    return await _run(ai.make_variant(completer, req))
