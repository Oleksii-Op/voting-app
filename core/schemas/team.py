from pydantic import BaseModel, ConfigDict
from core.schemas import MemberOutTeam


class TeamIn(BaseModel):
    name: str
    avatar: str | None = None
    model_config = ConfigDict(
        from_attributes=True,
    )


class TeamMembers(BaseModel):
    name: str
    members: list[MemberOutTeam]
    avatar: str


class TeamOut(TeamIn):
    id: int


class TeamUpdate(BaseModel):
    name: str | None = None
    avatar: str | None = None
