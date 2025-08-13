from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey
from sqlalchemy.orm import mapped_column, Mapped, relationship
from core.db_models.base import Base

if TYPE_CHECKING:
    from core.db_models import Team


class Member(Base):
    __tablename__ = "members"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column()
    username: Mapped[str] = mapped_column(unique=True, index=True)
    has_joined_team: Mapped[bool]
    has_voted: Mapped[bool]
    token: Mapped[str] = mapped_column(unique=True)

    team_id: Mapped[int] = mapped_column(
        ForeignKey("teams.id"),
        nullable=True,
    )
    team: Mapped[Optional["Team"]] = relationship(
        back_populates="members",
        foreign_keys="Member.team_id",
    )
    vote_id: Mapped[int] = mapped_column(
        ForeignKey("teams.id"),
        nullable=True,
    )
    voted_for: Mapped[Optional["Team"]] = relationship(
        back_populates="voters",
        foreign_keys="Member.vote_id",
    )
