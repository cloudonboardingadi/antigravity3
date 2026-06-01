"""API router for the account details domain."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.domains.account_details import service
from app.domains.account_details.schemas import (
    AccountDetailsCreate,
    AccountDetailsResponse,
    AccountDetailsUpdate,
)

router = APIRouter()


@router.get("/{onboarding_id}", response_model=AccountDetailsResponse)
def get_account_details(
    onboarding_id: str,
    db: Session = Depends(get_db),
) -> AccountDetailsResponse:
    """Retrieve account details for a specific onboarding."""
    details = service.get_by_onboarding(db, onboarding_id)
    if details is None:
        raise HTTPException(status_code=404, detail="Account details not found")
    return details


@router.post(
    "/{onboarding_id}",
    response_model=AccountDetailsResponse,
    status_code=201,
)
def create_account_details(
    onboarding_id: str,
    data: AccountDetailsCreate,
    db: Session = Depends(get_db),
) -> AccountDetailsResponse:
    """Create account details for an onboarding."""
    existing = service.get_by_onboarding(db, onboarding_id)
    if existing is not None:
        raise HTTPException(
            status_code=409,
            detail="Account details already exist for this onboarding",
        )
    return service.create(db, onboarding_id, data)


@router.put("/{onboarding_id}", response_model=AccountDetailsResponse)
def update_account_details(
    onboarding_id: str,
    data: AccountDetailsUpdate,
    db: Session = Depends(get_db),
) -> AccountDetailsResponse:
    """Update account details (upsert: creates if not exists)."""
    updated = service.update(db, onboarding_id, data)
    if updated is not None:
        return updated

    # Upsert — create with provided fields
    create_data = AccountDetailsCreate(**data.model_dump(exclude_unset=True))
    return service.create(db, onboarding_id, create_data)
