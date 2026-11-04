"""Request/response models for the AI QUEST API.

The JSON schemas passed to Claude (structured outputs) are written by hand in
``ai.py`` so they always carry ``additionalProperties: false``; the pydantic
models here validate both the incoming requests and what the model returned.
"""

from typing import Literal

from pydantic import BaseModel, Field

Lang = Literal["sk", "en"]


# ---------------------------------------------------------------- tutor


class LearnerProfile(BaseModel):
    level: int = Field(1, ge=1, le=999)
    completed_lessons: int = Field(0, ge=0)
    weak_concepts: list[str] = Field(default_factory=list, max_length=20)
    days_since_last_study: int | None = Field(None, ge=0)


class TutorRequest(BaseModel):
    concept: str = Field(..., min_length=1, max_length=200)
    question_context: str | None = Field(None, max_length=2000)
    mode: Literal["explain", "simpler"] = "explain"
    lang: Lang = "sk"
    learner: LearnerProfile = Field(default_factory=LearnerProfile)


class CheckQuestion(BaseModel):
    question: str
    options: list[str] = Field(..., min_length=2, max_length=5)
    correct_index: int = Field(..., ge=0)
    explanation: str


class TutorResponse(BaseModel):
    explanation: str
    analogy: str | None = None
    check_question: CheckQuestion


# ---------------------------------------------------------------- prompt grading


class RubricCriterion(BaseModel):
    id: str = Field(..., min_length=1, max_length=40)
    label: str = Field(..., min_length=1, max_length=120)
    description: str = Field(..., min_length=1, max_length=400)
    weight: float = Field(1.0, gt=0, le=10)


class GradePromptRequest(BaseModel):
    goal: str = Field(..., min_length=1, max_length=1000)
    broken_prompt: str = Field(..., min_length=1, max_length=2000)
    user_prompt: str = Field(..., min_length=1, max_length=4000)
    rubric: list[RubricCriterion] = Field(..., min_length=1, max_length=10)
    lang: Lang = "sk"


Status = Literal["met", "partial", "missing"]


class CriterionResult(BaseModel):
    id: str
    label: str
    status: Status
    comment: str


class GradePromptResponse(BaseModel):
    score: int = Field(..., ge=0, le=100)
    criteria: list[CriterionResult]
    tips: list[str]
    improved_prompt: str
    source: Literal["ai"] = "ai"


# ---------------------------------------------------------------- question variants


class VariantRequest(BaseModel):
    concept: str = Field(..., min_length=1, max_length=200)
    question: str = Field(..., min_length=1, max_length=2000)
    options: list[str] = Field(..., min_length=2, max_length=6)
    correct: list[int] = Field(..., min_length=1, max_length=5)
    explanation: str = Field(..., min_length=1, max_length=2000)
    lang: Lang = "sk"


class VariantResponse(BaseModel):
    question: str
    options: list[str]
    correct: list[int]
    explanation: str
