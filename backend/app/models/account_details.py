"""SQLAlchemy model for account details."""

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.onboarding import Onboarding


class AccountDetails(Base):
    """Project and account metadata linked to an onboarding."""

    __tablename__ = "account_details"

    id: Mapped[str] = mapped_column(primary_key=True)
    onboarding_id: Mapped[str] = mapped_column(
        ForeignKey("onboardings.id", ondelete="CASCADE"),
        unique=True,
    )
    project_name: Mapped[str] = mapped_column(default="")
    isu: Mapped[str] = mapped_column(default="")
    account_name: Mapped[str] = mapped_column(default="")
    owner: Mapped[str] = mapped_column(default="")
    emp_id: Mapped[str] = mapped_column(default="")
    description: Mapped[str] = mapped_column(Text, default="")
    business_unit: Mapped[str] = mapped_column(default="")

    # Back-reference to parent onboarding
    onboarding: Mapped["Onboarding"] = relationship(
        "Onboarding",
        back_populates="account_details",
    )
