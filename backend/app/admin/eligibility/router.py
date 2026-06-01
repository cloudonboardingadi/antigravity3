"""Admin API router for eligibility question management."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.admin.eligibility import service
from app.admin.eligibility.schemas import (
    EligibilityQuestionCreate,
    EligibilityQuestionResponse,
    EligibilityQuestionUpdate,
)

router = APIRouter()


@router.get("/", response_model=list[EligibilityQuestionResponse])
def list_questions(db: Session = Depends(get_db)) -> list[EligibilityQuestionResponse]:
    """List all eligibility questions (ordered by sort_order)."""
    return service.get_all(db)


@router.post("/", response_model=EligibilityQuestionResponse, status_code=201)
def create_question(
    data: EligibilityQuestionCreate,
    db: Session = Depends(get_db),
) -> EligibilityQuestionResponse:
    """Create a single eligibility question."""
    return service.create(db, data)


@router.post(
    "/bulk",
    response_model=list[EligibilityQuestionResponse],
    status_code=201,
)
def bulk_create_questions(
    items: list[EligibilityQuestionCreate],
    db: Session = Depends(get_db),
) -> list[EligibilityQuestionResponse]:
    """Create multiple eligibility questions in one request."""
    return service.bulk_create(db, items)


@router.get("/{question_id}", response_model=EligibilityQuestionResponse)
def get_question(
    question_id: str,
    db: Session = Depends(get_db),
) -> EligibilityQuestionResponse:
    """Get a single eligibility question by ID."""
    question = service.get_by_id(db, question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


@router.put("/{question_id}", response_model=EligibilityQuestionResponse)
def update_question(
    question_id: str,
    data: EligibilityQuestionUpdate,
    db: Session = Depends(get_db),
) -> EligibilityQuestionResponse:
    """Update an eligibility question."""
    question = service.update(db, question_id, data)
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


@router.delete("/{question_id}", status_code=204)
def delete_question(
    question_id: str,
    db: Session = Depends(get_db),
) -> None:
    """Delete an eligibility question."""
    deleted = service.delete(db, question_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Question not found")


@router.delete("/", status_code=204)
def delete_all_questions(db: Session = Depends(get_db)) -> None:
    """Delete all eligibility questions."""
    service.delete_all(db)
