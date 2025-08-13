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
    """
    Cast a vote for a specific team.
    
    Args:
        team_id: ID of the team to vote for
        member: Current member from cookie authentication
        team: Target team (validated to exist)
        session: Database session
    
    Security:
        Requires valid 'users-token' cookie
    
    Business Rules:
        - Members cannot vote for their own team
        - Members can only vote once
        - Members can vote even if not on a team
    
    Raises:
        HTTPException(400): If trying to vote for own team or already voted
        HTTPException(404): If team doesn't exist
    
    Side Effects:
        - Creates voting relationship between member and team
        - Sets member's has_voted flag to True
    """
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
    """
    Remove member's current vote, allowing them to vote again.
    
    Args:
        member: Current member from cookie authentication
        session: Database session
    
    Security:
        Requires valid 'users-token' cookie
    
    Business Rules:
        - Member must have voted previously
        - Completely removes vote relationship
    
    Raises:
        HTTPException(400): If member has not voted yet
    
    Side Effects:
        - Removes voting relationship
        - Sets member's has_voted flag to False
        - Allows member to vote for a different team
    """
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
    """
    Get voting statistics for all teams.
    
    Args:
        session: Database session
    
    Returns:
        list: Teams with their vote counts in format:
              [{'name': 'Team Name', 'stats': {'votes': count}}]
    
    Public Endpoint:
        No authentication required - voting results are public
    
    Note:
        Only shows teams that have received at least one vote
        Results are ordered by team name alphabetically
    """
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
