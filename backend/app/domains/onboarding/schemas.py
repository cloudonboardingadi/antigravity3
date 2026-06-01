"""Pydantic schemas for the onboarding domain."""

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict

from app.domains.account_details.schemas import AccountDetailsResponse
from app.domains.requirements.schemas import RequirementResponse


class OnboardingCreate(BaseModel):
    """Payload for creating a new onboarding."""

    name: str = "Untitled Onboarding"


class OnboardingUpdate(BaseModel):
    """Payload for updating an existing onboarding — all fields optional."""

    name: Optional[str] = None
    status: Optional[str] = None
    current_step: Optional[int] = None
    remaining_state: Optional[dict[str, Any]] = None


class OnboardingResponse(BaseModel):
    """Full onboarding representation including nested child resources."""

    id: str
    name: str
    status: str
    current_step: int
    created_at: datetime
    updated_at: datetime
    remaining_state: Optional[dict[str, Any]] = None
    account_details: Optional[AccountDetailsResponse] = None
    requirement_assessment: Optional[RequirementResponse] = None

    model_config = ConfigDict(from_attributes=True)


class OnboardingListItem(BaseModel):
    """Lightweight onboarding representation for list views."""

    id: str
    name: str
    status: str
    current_step: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class QuestionOut(BaseModel):
    """Response schema for an eligibility question."""

    section: str
    title: str
    note: Optional[str] = None
    question_type: str
    options: list[str]
    correct_answer: Any  # str for single, list[str] for multi
    fail_message: str
    sort_order: int

    model_config = ConfigDict(from_attributes=True)


class ClauseOut(BaseModel):
    """Response schema for a disclaimer clause."""

    title: str
    text: str
    sort_order: int

    model_config = ConfigDict(from_attributes=True)
