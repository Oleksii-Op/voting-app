from typing import TYPE_CHECKING

from pydantic import BaseModel, ConfigDict


class TeamIn(BaseModel):
    name: str
    avatar: str | None = None
    model_config = ConfigDict(
        from_attributes=True,
    )


class TeamOut(TeamIn):
    id: int


class TeamUpdate(BaseModel):
    name: str | None = None
    avatar: str | None = None
