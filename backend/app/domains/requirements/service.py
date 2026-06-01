"""Service layer for the requirements domain."""

import uuid

from sqlalchemy.orm import Session

from app.models.requirements import RequirementAssessment
from app.domains.requirements.schemas import RequirementCreate, RequirementUpdate


def get_by_onboarding(
    db: Session,
    onboarding_id: str,
) -> RequirementAssessment | None:
    """Return the requirement assessment for an onboarding, or None."""
    return (
        db.query(RequirementAssessment)
        .filter(RequirementAssessment.onboarding_id == onboarding_id)
        .first()
    )


def create(
    db: Session,
    onboarding_id: str,
    data: RequirementCreate,
) -> RequirementAssessment:
    """Create a new requirement assessment for an onboarding."""
    requirement = RequirementAssessment(
        id=str(uuid.uuid4()),
        onboarding_id=onboarding_id,
        **data.model_dump(),
    )
    db.add(requirement)
    db.commit()
    db.refresh(requirement)
    return requirement


def update(
    db: Session,
    onboarding_id: str,
    data: RequirementUpdate,
) -> RequirementAssessment | None:
    """Update an existing requirement assessment. Returns None if not found."""
    requirement = get_by_onboarding(db, onboarding_id)
    if requirement is None:
        return None

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(requirement, field, value)

    db.commit()
    db.refresh(requirement)
    return requirement
