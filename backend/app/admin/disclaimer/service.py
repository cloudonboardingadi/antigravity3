"""Service layer for admin disclaimer clause management."""

import uuid

from sqlalchemy.orm import Session

from app.models.onboarding import DisclaimerClause
from app.admin.disclaimer.schemas import (
    DisclaimerClauseCreate,
    DisclaimerClauseUpdate,
)


def get_all(db: Session) -> list[DisclaimerClause]:
    """Return all disclaimer clauses ordered by sort_order."""
    return (
        db.query(DisclaimerClause)
        .order_by(DisclaimerClause.sort_order)
        .all()
    )


def get_by_id(db: Session, clause_id: str) -> DisclaimerClause | None:
    """Return a single clause by ID."""
    return db.query(DisclaimerClause).filter(
        DisclaimerClause.id == clause_id
    ).first()


def create(db: Session, data: DisclaimerClauseCreate) -> DisclaimerClause:
    """Create a new disclaimer clause."""
    clause = DisclaimerClause(
        id=str(uuid.uuid4()),
        **data.model_dump(),
    )
    db.add(clause)
    db.commit()
    db.refresh(clause)
    return clause


def bulk_create(
    db: Session, items: list[DisclaimerClauseCreate]
) -> list[DisclaimerClause]:
    """Create multiple disclaimer clauses at once."""
    clauses = [
        DisclaimerClause(id=str(uuid.uuid4()), **item.model_dump())
        for item in items
    ]
    db.add_all(clauses)
    db.commit()
    for c in clauses:
        db.refresh(c)
    return clauses


def update(
    db: Session, clause_id: str, data: DisclaimerClauseUpdate
) -> DisclaimerClause | None:
    """Update an existing disclaimer clause. Returns None if not found."""
    clause = get_by_id(db, clause_id)
    if clause is None:
        return None

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(clause, field, value)

    db.commit()
    db.refresh(clause)
    return clause


def delete(db: Session, clause_id: str) -> bool:
    """Delete a disclaimer clause. Returns True if deleted."""
    clause = get_by_id(db, clause_id)
    if clause is None:
        return False

    db.delete(clause)
    db.commit()
    return True


def delete_all(db: Session) -> int:
    """Delete all disclaimer clauses. Returns the count deleted."""
    count = db.query(DisclaimerClause).delete()
    db.commit()
    return count
