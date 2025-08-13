from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
    status,
)
from typing import Annotated
from api.dependencies import (
    get_member_by_cookie,
    get_team_by_id,
    SessionGetter,
)
from core.db_models import Member, Team
from sqlalchemy import select, func

router = APIRouter(
    prefix="/voting",
    tags=["Voting"],
)


@router.post(
    "/{team_id}",
    status_code=status.HTTP_200_OK,
)
def vote_for_team(
    team_id: int,
    member: Annotated[
        Member,
        Depends(get_member_by_cookie),
    ],
    team: Annotated[
        Team,
        Depends(get_team_by_id),
    ],
    session: SessionGetter,
):
    if member.team_id == team_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot vote for your own team.",
        )
    if member.has_voted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already voted",
        )
    team.voters.append(member)
    member.has_voted = True
    session.add_all([team, member])
    session.commit()


@router.post(
    "/rollback/",
    status_code=status.HTTP_204_NO_CONTENT,
)
def rollback_vote(
    member: Annotated[
        Member,
        Depends(get_member_by_cookie),
    ],
    session: SessionGetter,
):
    if not member.has_voted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have not voted",
        )
    member.voted_for = None
    member.has_voted = False
    session.add(member)
    session.commit()


@router.get(
    "/count",
    status_code=status.HTTP_200_OK,
)
def get_teams_votes(session: SessionGetter):
    stmt = (
        select(Team.name, func.count(Member.id).label("votes"))
        .join(Team.voters)
        .group_by(Team.name)
        .order_by(Team.name)
    )
    res = session.execute(stmt)
    return [
        {
            "name": name,
            "stats": {"votes": votes},
        }
        for name, votes in res
    ]
