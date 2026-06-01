"""SQLAlchemy model for requirement assessments."""

from typing import TYPE_CHECKING

from sqlalchemy import JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.onboarding import Onboarding


class RequirementAssessment(Base):
    """Infrastructure and deployment requirements for an onboarding."""

    __tablename__ = "requirement_assessments"

    id: Mapped[str] = mapped_column(primary_key=True)
    onboarding_id: Mapped[str] = mapped_column(
        ForeignKey("onboardings.id", ondelete="CASCADE"),
        unique=True,
    )
    solution_type: Mapped[str] = mapped_column(default="")
    deployment_environments: Mapped[list] = mapped_column(JSON, default=list)
    cloud_providers: Mapped[list] = mapped_column(JSON, default=list)
    region: Mapped[str] = mapped_column(default="")

    # Back-reference to parent onboarding
    onboarding: Mapped["Onboarding"] = relationship(
        "Onboarding",
        back_populates="requirement_assessment",
    )
