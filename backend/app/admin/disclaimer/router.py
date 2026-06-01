"""Admin API router for disclaimer clause management."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.admin.disclaimer import service
from app.admin.disclaimer.schemas import (
    DisclaimerClauseCreate,
    DisclaimerClauseResponse,
    DisclaimerClauseUpdate,
)

router = APIRouter()


@router.get("/", response_model=list[DisclaimerClauseResponse])
def list_clauses(db: Session = Depends(get_db)) -> list[DisclaimerClauseResponse]:
    """List all disclaimer clauses (ordered by sort_order)."""
    return service.get_all(db)


@router.post("/", response_model=DisclaimerClauseResponse, status_code=201)
def create_clause(
    data: DisclaimerClauseCreate,
    db: Session = Depends(get_db),
) -> DisclaimerClauseResponse:
    """Create a single disclaimer clause."""
    return service.create(db, data)


@router.post(
    "/bulk",
    response_model=list[DisclaimerClauseResponse],
    status_code=201,
)
def bulk_create_clauses(
    items: list[DisclaimerClauseCreate],
    db: Session = Depends(get_db),
) -> list[DisclaimerClauseResponse]:
    """Create multiple disclaimer clauses in one request."""
    return service.bulk_create(db, items)


@router.get("/{clause_id}", response_model=DisclaimerClauseResponse)
def get_clause(
    clause_id: str,
    db: Session = Depends(get_db),
) -> DisclaimerClauseResponse:
    """Get a single disclaimer clause by ID."""
    clause = service.get_by_id(db, clause_id)
    if clause is None:
        raise HTTPException(status_code=404, detail="Clause not found")
    return clause


@router.put("/{clause_id}", response_model=DisclaimerClauseResponse)
def update_clause(
    clause_id: str,
    data: DisclaimerClauseUpdate,
    db: Session = Depends(get_db),
) -> DisclaimerClauseResponse:
    """Update a disclaimer clause."""
    clause = service.update(db, clause_id, data)
    if clause is None:
        raise HTTPException(status_code=404, detail="Clause not found")
    return clause


@router.delete("/{clause_id}", status_code=204)
def delete_clause(
    clause_id: str,
    db: Session = Depends(get_db),
) -> None:
    """Delete a disclaimer clause."""
    deleted = service.delete(db, clause_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Clause not found")


@router.delete("/", status_code=204)
def delete_all_clauses(db: Session = Depends(get_db)) -> None:
    """Delete all disclaimer clauses."""
    service.delete_all(db)
