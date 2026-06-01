"""API router for the onboarding domain."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.domains.onboarding import service
from app.domains.onboarding.schemas import (
    ClauseOut,
    OnboardingCreate,
    OnboardingListItem,
    OnboardingResponse,
    OnboardingUpdate,
    QuestionOut,
)

router = APIRouter()


@router.get("/", response_model=list[OnboardingListItem])
def list_onboardings(db: Session = Depends(get_db)) -> list[OnboardingListItem]:
    """Return all onboardings (lightweight list view)."""
    return service.get_all_onboardings(db)


@router.post("/", response_model=OnboardingResponse, status_code=201)
def create_onboarding(
    data: OnboardingCreate,
    db: Session = Depends(get_db),
) -> OnboardingResponse:
    """Create a new onboarding workflow."""
    return service.create_onboarding(db, data)


# ── Static routes MUST appear before the /{onboarding_id} param route ──


@router.get("/eligibility/questions", response_model=list[QuestionOut])
def get_eligibility_questions(
    db: Session = Depends(get_db),
) -> list[QuestionOut]:
    """Return all eligibility check questions in order."""
    return service.get_eligibility_questions(db)


@router.get("/disclaimer/clauses", response_model=list[ClauseOut])
def get_disclaimer_clauses(
    db: Session = Depends(get_db),
) -> list[ClauseOut]:
    """Return all disclaimer clauses in order."""
    return service.get_disclaimer_clauses(db)


# ── Dynamic routes with path parameter ──


@router.get("/{onboarding_id}", response_model=OnboardingResponse)
def get_onboarding(
    onboarding_id: str,
    db: Session = Depends(get_db),
) -> OnboardingResponse:
    """Return a single onboarding with nested account_details and requirement_assessment."""
    onboarding = service.get_onboarding(db, onboarding_id)
    if onboarding is None:
        raise HTTPException(status_code=404, detail="Onboarding not found")
    return onboarding


@router.put("/{onboarding_id}", response_model=OnboardingResponse)
def update_onboarding(
    onboarding_id: str,
    data: OnboardingUpdate,
    db: Session = Depends(get_db),
) -> OnboardingResponse:
    """Update an existing onboarding's fields."""
    onboarding = service.update_onboarding(db, onboarding_id, data)
    if onboarding is None:
        raise HTTPException(status_code=404, detail="Onboarding not found")
    return onboarding


@router.delete("/{onboarding_id}", status_code=204)
def delete_onboarding(
    onboarding_id: str,
    db: Session = Depends(get_db),
) -> None:
    """Delete an onboarding and all associated data (cascading)."""
    deleted = service.delete_onboarding(db, onboarding_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Onboarding not found")
