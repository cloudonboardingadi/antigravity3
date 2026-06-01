"""Pydantic schemas for requirements domain."""

from typing import Optional

from pydantic import BaseModel, ConfigDict


class RequirementCreate(BaseModel):
    """Payload for creating a requirement assessment."""

    solution_type: str = ""
    deployment_environments: list[str] = []
    cloud_providers: list[str] = []
    region: str = ""


class RequirementUpdate(BaseModel):
    """Payload for updating a requirement assessment — all fields optional."""

    solution_type: Optional[str] = None
    deployment_environments: Optional[list[str]] = None
    cloud_providers: Optional[list[str]] = None
    region: Optional[str] = None


class RequirementResponse(BaseModel):
    """Response schema for requirement assessment."""

    id: str
    onboarding_id: str
    solution_type: str
    deployment_environments: list[str]
    cloud_providers: list[str]
    region: str

    model_config = ConfigDict(from_attributes=True)
