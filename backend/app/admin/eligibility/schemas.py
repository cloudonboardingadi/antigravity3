"""Pydantic schemas for admin eligibility endpoints."""

from typing import Any, Optional

from pydantic import BaseModel, ConfigDict


class EligibilityQuestionCreate(BaseModel):
    """Payload for creating an eligibility question."""

    section: str
    title: str
    note: Optional[str] = None
    question_type: str  # "single" or "multi"
    options: list[str]
    correct_answer: Any  # str for single, list[str] for multi
    fail_message: str
    sort_order: int


class EligibilityQuestionUpdate(BaseModel):
    """Payload for updating an eligibility question — all fields optional."""

    section: Optional[str] = None
    title: Optional[str] = None
    note: Optional[str] = None
    question_type: Optional[str] = None
    options: Optional[list[str]] = None
    correct_answer: Optional[Any] = None
    fail_message: Optional[str] = None
    sort_order: Optional[int] = None


class EligibilityQuestionResponse(BaseModel):
    """Response schema for an eligibility question (admin view includes ID)."""

    id: str
    section: str
    title: str
    note: Optional[str] = None
    question_type: str
    options: list[str]
    correct_answer: Any
    fail_message: str
    sort_order: int

    model_config = ConfigDict(from_attributes=True)
