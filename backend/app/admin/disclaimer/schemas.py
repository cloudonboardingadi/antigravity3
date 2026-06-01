"""Pydantic schemas for admin disclaimer endpoints."""

from typing import Optional

from pydantic import BaseModel, ConfigDict


class DisclaimerClauseCreate(BaseModel):
    """Payload for creating a disclaimer clause."""

    title: str
    text: str
    sort_order: int


class DisclaimerClauseUpdate(BaseModel):
    """Payload for updating a disclaimer clause — all fields optional."""

    title: Optional[str] = None
    text: Optional[str] = None
    sort_order: Optional[int] = None


class DisclaimerClauseResponse(BaseModel):
    """Response schema for a disclaimer clause (admin view includes ID)."""

    id: str
    title: str
    text: str
    sort_order: int

    model_config = ConfigDict(from_attributes=True)
