"""Service layer for the onboarding domain."""

import secrets

from sqlalchemy.orm import Session

from app.models.onboarding import (
    DisclaimerClause,
    EligibilityQuestion,
    Onboarding,
)
from app.domains.onboarding.schemas import OnboardingCreate, OnboardingUpdate


def get_all_onboardings(db: Session) -> list[Onboarding]:
    """Return every onboarding, most-recently-created first."""
    return db.query(Onboarding).order_by(Onboarding.created_at.desc()).all()


def get_onboarding(db: Session, onboarding_id: str) -> Onboarding | None:
    """Return a single onboarding by ID, or None."""
    return db.query(Onboarding).filter(Onboarding.id == onboarding_id).first()


def create_onboarding(db: Session, data: OnboardingCreate) -> Onboarding:
    """Create a new onboarding with an auto-generated 'onb_' prefixed ID."""
    onboarding = Onboarding(
        id=f"onb_{secrets.token_hex(4)}",
        name=data.name,
    )
    db.add(onboarding)
    db.commit()
    db.refresh(onboarding)
    return onboarding


def update_onboarding(
    db: Session,
    onboarding_id: str,
    data: OnboardingUpdate,
) -> Onboarding | None:
    """Update mutable fields on an existing onboarding. Returns None if not found."""
    onboarding = get_onboarding(db, onboarding_id)
    if onboarding is None:
        return None

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(onboarding, field, value)

    db.commit()
    db.refresh(onboarding)
    return onboarding


def delete_onboarding(db: Session, onboarding_id: str) -> bool:
    """Delete an onboarding by ID. Returns True if deleted, False if not found."""
    onboarding = get_onboarding(db, onboarding_id)
    if onboarding is None:
        return False

    db.delete(onboarding)
    db.commit()
    return True


# ---------------------------------------------------------------------------
# Eligibility & disclaimer read-only helpers (end-user facing)
# ---------------------------------------------------------------------------


def get_eligibility_questions(db: Session) -> list[EligibilityQuestion]:
    """Return all eligibility questions ordered by sort_order."""
    return (
        db.query(EligibilityQuestion)
        .order_by(EligibilityQuestion.sort_order)
        .all()
    )


def get_disclaimer_clauses(db: Session) -> list[DisclaimerClause]:
    """Return all disclaimer clauses ordered by sort_order."""
    return (
        db.query(DisclaimerClause)
        .order_by(DisclaimerClause.sort_order)
        .all()
    )
