"""API router for the requirements domain."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.domains.requirements import service
from app.domains.requirements.schemas import (
    RequirementCreate,
    RequirementResponse,
    RequirementUpdate,
)

router = APIRouter()


@router.get("/{onboarding_id}", response_model=RequirementResponse)
def get_requirement(
    onboarding_id: str,
    db: Session = Depends(get_db),
) -> RequirementResponse:
    """Retrieve the requirement assessment for a specific onboarding."""
    requirement = service.get_by_onboarding(db, onboarding_id)
    if requirement is None:
        raise HTTPException(
            status_code=404,
            detail="Requirement assessment not found",
        )
    return requirement


@router.post(
    "/{onboarding_id}",
    response_model=RequirementResponse,
    status_code=201,
)
def create_requirement(
    onboarding_id: str,
    data: RequirementCreate,
    db: Session = Depends(get_db),
) -> RequirementResponse:
    """Create a requirement assessment for an onboarding."""
    existing = service.get_by_onboarding(db, onboarding_id)
    if existing is not None:
        raise HTTPException(
            status_code=409,
            detail="Requirement assessment already exists for this onboarding",
        )
    return service.create(db, onboarding_id, data)


@router.put("/{onboarding_id}", response_model=RequirementResponse)
def update_requirement(
    onboarding_id: str,
    data: RequirementUpdate,
    db: Session = Depends(get_db),
) -> RequirementResponse:
    """Update a requirement assessment (upsert: creates if not exists)."""
    updated = service.update(db, onboarding_id, data)
    if updated is not None:
        return updated

    # Upsert — create with provided fields
    create_data = RequirementCreate(**data.model_dump(exclude_unset=True))
    return service.create(db, onboarding_id, create_data)
