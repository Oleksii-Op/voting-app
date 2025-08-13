from pydantic import BaseModel, ConfigDict, Field


class MemberUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        max_length=20,
        min_length=1,
    )


class MemberIn(MemberUpdate):
    username: str = Field(
        max_length=30,
        min_length=1,
    )


class MemberInAdmin(MemberIn):
    has_joined_team: bool = False
    token: str
    team_id: int | None = None


class MemberUpdateAdmin(BaseModel):
    name: str | None = None
    username: str | None = None
    token: str | None = None


class MemberOutTeam(BaseModel):
    name: str

    model_config = ConfigDict(
        from_attributes=True,
    )


class MemberOut(BaseModel):
    id: int
    name: str
    username: str
    has_joined_team: bool
    has_voted: bool
    team_id: int | None
    vote_id: int | None

    model_config = ConfigDict(
        from_attributes=True,
    )


class MemberList(BaseModel):
    name: str
