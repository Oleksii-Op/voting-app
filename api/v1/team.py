from typing import Annotated

from fastapi import APIRouter, HTTPException, Depends
from core.schemas import (
    TeamIn,
    TeamUpdate,
    TeamOut,
    TeamMembers,
    MemberOutTeam,
)
from api.dependencies import (
    get_team_by_id,
    SessionGetter,
    verify_api_key,
    if_team_name_is_free,
)
from sqlalchemy import select
from starlette import status

from core.db_models import Team, Member

import logging

router = APIRouter(
    tags=["Team"],
)

logger = logging.getLogger(__name__)


@router.get(
    "/teams",
    response_model=list[TeamOut],
)
def list_teams(session: SessionGetter):
    """
    Get all teams in the system.
    
    Args:
        session: Database session
    
    Returns:
        list[TeamOut]: All teams with their basic information (id, name, avatar)
    
    Public Endpoint:
        No authentication required - team list is public
    
    Raises:
        HTTPException(404): If no teams exist in the system
    
    Use Cases:
        - Display available teams for voting
        - Show team selection for joining
        - Public team directory
    """
    stmt = select(Team).order_by(Team.name)
    result = session.execute(stmt).scalars().all()
    if not result:
        raise HTTPException(
            status_code=404,
            detail="No teams found",
        )
    return result


@router.get(
    "/teams/{team_id}/users",
    response_model=TeamMembers,
    status_code=status.HTTP_200_OK,
)
def list_team_users(
    team: Annotated[
        Team,
        Depends(get_team_by_id),
    ],
):
    """
    Get all members of a specific team.
    
    Args:
        team: Team object (validated to exist by dependency)
    
    Returns:
        TeamMembers: Team information with list of member names
    
    Public Endpoint:
        No authentication required - team membership is public
    
    Raises:
        HTTPException(404): If team doesn't exist or has no members
    
    Privacy:
        Only shows member names, not sensitive information like votes
    
    Use Cases:
        - Display team roster
        - Show team composition for voting decisions
    """
    members: list[Member] = team.members
    if not members:
        raise HTTPException(
            status_code=404,
            detail="Empty team",
        )
    members_list = [
        MemberOutTeam(
            name=member.name,
        )
        for member in members
    ]
    response = TeamMembers(
        name=team.name,
        avatar=team.avatar,
        members=members_list,
    )
    return response


@router.post(
    "/teams",
    response_model=TeamIn,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(verify_api_key)],
)
def create_team(
    session: SessionGetter,
    team: TeamIn,
):
    """
    Create a new team in the system.
    
    Args:
        session: Database session
        team: Team data (name and optional avatar URL)
    
    Returns:
        TeamIn: Created team information
    
    Security:
        Requires admin API key authentication
    
    Business Rules:
        - Team name must be unique
        - Avatar URL is optional
    
    Raises:
        HTTPException(400): If team name already exists
    
    Admin Use:
        Set up teams for voting competition
    
    Side Effects:
        Logs team creation for audit trail
    """
    if_team_name_is_free(
        team_name=team.name,
        session=session,
    )
    team_db = Team(
        name=team.name,
        avatar=team.avatar,
    )
    session.add(team_db)
    session.commit()
    logger.info(
        "Created new team %s",
        team.name,
    )
    return team


@router.patch(
    "/teams/{team_id}",
    response_model=TeamOut,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_api_key)],
)
def update_team(
    team_in: TeamUpdate,
    session: SessionGetter,
    team: Annotated[
        Team,
        Depends(get_team_by_id),
    ],
):
    """
    Update existing team information.
    
    Args:
        team_in: Fields to update (name, avatar)
        session: Database session
        team: Target team (validated to exist)
    
    Returns:
        TeamOut: Updated team information
    
    Security:
        Requires admin API key authentication
    
    Business Rules:
        - New team name must be unique if changed
        - Can update name and/or avatar URL
    
    Raises:
        HTTPException(400): If new team name conflicts with existing team
        HTTPException(404): If team doesn't exist
    
    Note:
        Validates name uniqueness even when updating same team
        (this is a known issue that should be fixed)
    """
    if_team_name_is_free(
        team_name=team_in.name,
        session=session,
    )
    for field, value in team_in.model_dump(
        exclude_unset=True,
    ).items():
        setattr(team, field, value)
    session.commit()
    return team


@router.delete(
    "/teams/{team_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(verify_api_key)],
)
def delete_team(
    session: SessionGetter,
    team: Annotated[
        Team,
        Depends(get_team_by_id),
    ],
):
    """
    Permanently delete a team from the system.
    
    Args:
        session: Database session
        team: Target team to delete (validated to exist)
    
    Security:
        Requires admin API key authentication
    
    Warning:
        - Irreversible operation
        - Removes all team data, member relationships, and received votes
        - Members who were in this team will have team_id set to null
        - May significantly affect voting statistics
    
    Admin Use:
        Clean up unused teams or handle data management
    
    Side Effects:
        - Orphans team members (they become teamless)
        - Removes all votes cast for this team
        - May cause referential integrity issues if not handled properly
    """
    session.delete(team)
    session.commit()
