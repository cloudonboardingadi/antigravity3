"""SQLAlchemy models for onboarding, eligibility, and disclaimer."""

from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import JSON, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.account_details import AccountDetails
    from app.models.requirements import RequirementAssessment


class Onboarding(Base):
    """Represents a single onboarding workflow instance."""

    __tablename__ = "onboardings"

    id: Mapped[str] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(default="Untitled Onboarding")
    status: Mapped[str] = mapped_column(default="Draft")
    current_step: Mapped[int] = mapped_column(default=1)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(),
        onupdate=func.now(),
    )
    remaining_state: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # One-to-one relationships
    account_details: Mapped[Optional["AccountDetails"]] = relationship(
        "AccountDetails",
        back_populates="onboarding",
        uselist=False,
        cascade="all, delete-orphan",
    )
    requirement_assessment: Mapped[Optional["RequirementAssessment"]] = relationship(
        "RequirementAssessment",
        back_populates="onboarding",
        uselist=False,
        cascade="all, delete-orphan",
    )


class EligibilityQuestion(Base):
    """A single eligibility-check question shown before onboarding begins."""

    __tablename__ = "eligibility_questions"

    id: Mapped[str] = mapped_column(primary_key=True)
    section: Mapped[str] = mapped_column()
    title: Mapped[str] = mapped_column(Text)
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    question_type: Mapped[str] = mapped_column()  # "single" or "multi"
    options: Mapped[list] = mapped_column(JSON)
    correct_answer: Mapped[list | str] = mapped_column(JSON)
    fail_message: Mapped[str] = mapped_column(Text)
    sort_order: Mapped[int] = mapped_column()


class DisclaimerClause(Base):
    """A disclaimer clause the user must acknowledge."""

    __tablename__ = "disclaimer_clauses"

    id: Mapped[str] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column()
    text: Mapped[str] = mapped_column(Text)
    sort_order: Mapped[int] = mapped_column()
