"""Service layer for admin eligibility question management."""

import uuid

from sqlalchemy.orm import Session

from app.models.onboarding import EligibilityQuestion
from app.admin.eligibility.schemas import (
    EligibilityQuestionCreate,
    EligibilityQuestionUpdate,
)


def get_all(db: Session) -> list[EligibilityQuestion]:
    """Return all eligibility questions ordered by sort_order."""
    return (
        db.query(EligibilityQuestion)
        .order_by(EligibilityQuestion.sort_order)
        .all()
    )


def get_by_id(db: Session, question_id: str) -> EligibilityQuestion | None:
    """Return a single question by ID."""
    return db.query(EligibilityQuestion).filter(
        EligibilityQuestion.id == question_id
    ).first()


def create(db: Session, data: EligibilityQuestionCreate) -> EligibilityQuestion:
    """Create a new eligibility question."""
    question = EligibilityQuestion(
        id=str(uuid.uuid4()),
        **data.model_dump(),
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


def bulk_create(
    db: Session, items: list[EligibilityQuestionCreate]
) -> list[EligibilityQuestion]:
    """Create multiple eligibility questions at once."""
    questions = [
        EligibilityQuestion(id=str(uuid.uuid4()), **item.model_dump())
        for item in items
    ]
    db.add_all(questions)
    db.commit()
    for q in questions:
        db.refresh(q)
    return questions


def update(
    db: Session, question_id: str, data: EligibilityQuestionUpdate
) -> EligibilityQuestion | None:
    """Update an existing eligibility question. Returns None if not found."""
    question = get_by_id(db, question_id)
    if question is None:
        return None

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(question, field, value)

    db.commit()
    db.refresh(question)
    return question


def delete(db: Session, question_id: str) -> bool:
    """Delete an eligibility question. Returns True if deleted."""
    question = get_by_id(db, question_id)
    if question is None:
        return False

    db.delete(question)
    db.commit()
    return True


def delete_all(db: Session) -> int:
    """Delete all eligibility questions. Returns the count deleted."""
    count = db.query(EligibilityQuestion).delete()
    db.commit()
    return count
