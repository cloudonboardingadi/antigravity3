"""Pydantic schemas for account details domain."""

from typing import Optional

from pydantic import BaseModel, ConfigDict


class AccountDetailsCreate(BaseModel):
    """Payload for creating account details."""

    project_name: str = ""
    isu: str = ""
    account_name: str = ""
    owner: str = ""
    emp_id: str = ""
    description: str = ""
    business_unit: str = ""


class AccountDetailsUpdate(BaseModel):
    """Payload for updating account details — all fields optional."""

    project_name: Optional[str] = None
    isu: Optional[str] = None
    account_name: Optional[str] = None
    owner: Optional[str] = None
    emp_id: Optional[str] = None
    description: Optional[str] = None
    business_unit: Optional[str] = None


class AccountDetailsResponse(BaseModel):
    """Response schema for account details."""

    id: str
    onboarding_id: str
    project_name: str
    isu: str
    account_name: str
    owner: str
    emp_id: str
    description: str
    business_unit: str

    model_config = ConfigDict(from_attributes=True)
