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
    session.delete(team)
    session.commit()
