from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import mapped_column, Mapped, relationship
from core.db_models.base import Base

if TYPE_CHECKING:
    from core.db_models import Member


class Team(Base):
    __tablename__ = "teams"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(
        String(32),
        unique=True,
    )
    avatar: Mapped[str] = mapped_column(
        nullable=True,
    )
    members: Mapped[list["Member"]] = relationship(
        back_populates="team",
        foreign_keys="Member.team_id",
    )
    voters: Mapped[list["Member"]] = relationship(
        back_populates="voted_for",
        foreign_keys="Member.vote_id",
    )
