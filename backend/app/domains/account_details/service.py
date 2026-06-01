"""Service layer for the account details domain."""

import uuid

from sqlalchemy.orm import Session

from app.models.account_details import AccountDetails
from app.domains.account_details.schemas import (
    AccountDetailsCreate,
    AccountDetailsUpdate,
)


def get_by_onboarding(db: Session, onboarding_id: str) -> AccountDetails | None:
    """Return account details for the given onboarding, or None."""
    return (
        db.query(AccountDetails)
        .filter(AccountDetails.onboarding_id == onboarding_id)
        .first()
    )


def create(
    db: Session,
    onboarding_id: str,
    data: AccountDetailsCreate,
) -> AccountDetails:
    """Create a new account details record for an onboarding."""
    account_details = AccountDetails(
        id=str(uuid.uuid4()),
        onboarding_id=onboarding_id,
        **data.model_dump(),
    )
    db.add(account_details)
    db.commit()
    db.refresh(account_details)
    return account_details


def update(
    db: Session,
    onboarding_id: str,
    data: AccountDetailsUpdate,
) -> AccountDetails | None:
    """Update existing account details. Returns None if not found."""
    account_details = get_by_onboarding(db, onboarding_id)
    if account_details is None:
        return None

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(account_details, field, value)

    db.commit()
    db.refresh(account_details)
    return account_details
