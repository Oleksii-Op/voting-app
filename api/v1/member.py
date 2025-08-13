from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    status,
    HTTPException,
    Response,
    Request,
)
from sqlalchemy.orm import Session

from api.dependencies import (
    get_team_by_id,
    get_member_by_cookie,
    SessionGetter,
    verify_api_key,
)

from core.db_models import Member, Team
from core.schemas import MemberIn, MemberOut, MemberUpdate
from data import generate_token

import logging

logger = logging.getLogger(__name__)

TOKENS: dict[str, str] = {}


router = APIRouter()


def insert_member(
    session: Session,
    member: MemberIn,
    token: str,
):
    db_model = Member(
        name=member.name,
        username=member.username,
        has_voted=False,
        has_joined_team=False,
        token=token,
    )
    session.add(db_model)
    session.commit()


@router.get(
    "/token",
    dependencies=[Depends(verify_api_key)],
    status_code=status.HTTP_200_OK,
)
def get_token() -> str:
    token = generate_token()
    TOKENS[token] = token
    return token


@router.post(
    "/register/{token}",
    status_code=status.HTTP_201_CREATED,
    response_model=MemberIn,
)
def create_member(
    token,
    response: Response,
    member: MemberIn,
    session: SessionGetter,
):
    if TOKENS.get(token, None) is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    insert_member(session, member, token=token)
    TOKENS.pop(token)
    response.set_cookie(
        key="users-token",
        value=token,
        httponly=True,
        max_age=60 * 60 * 24 * 1,  # 1 day
    )
    logger.warning(
        "New member registered %s",
        member.username,
    )
    return member


@router.get(
    "/users/me",
    response_model=MemberOut,
    status_code=status.HTTP_200_OK,
)
def current_user(
    member: Annotated[
        Member,
        Depends(get_member_by_cookie),
    ],
):
    return member


@router.patch(
    "/users/me",
    response_model=MemberOut,
    status_code=status.HTTP_200_OK,
)
def update_member(
    member: Annotated[
        Member,
        Depends(get_member_by_cookie),
    ],
    member_in: MemberUpdate,
    session: SessionGetter,
):
    for field, value in member_in.model_dump(
        exclude_unset=True,
    ).items():
        setattr(member, field, value)
    session.add(member)
    session.commit()
    return member


@router.delete(
    "/users/me",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_member(
    member: Annotated[
        Member,
        Depends(get_member_by_cookie),
    ],
    session: SessionGetter,
):
    session.delete(member)
    session.commit()


@router.get(
    "/users/reset/{token}",
    status_code=status.HTTP_200_OK,
)
def reset_cookie(
    token: str,
    response: Response,
):
    response.set_cookie(
        key="users-token",
        value=token,
        httponly=True,
        max_age=60 * 60 * 24 * 1,
    )


@router.post(
    "/users/join/{team_id}",
    status_code=status.HTTP_200_OK,
)
def join_team(
    team: Annotated[
        Team,
        Depends(get_team_by_id),
    ],
    session: SessionGetter,
    member: Annotated[
        Member,
        Depends(get_member_by_cookie),
    ],
) -> None:
    if member.has_joined_team:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot join a team twice",
        )
    team_name, member_username = team.name, member.username
    team.members.append(member)
    member.has_joined_team = True
    session.add(team)
    session.commit()
    logger.warning(
        "A member %s joined %s",
        member_username,
        team_name,
    )


@router.post(
    "/users/leave/",
    status_code=status.HTTP_200_OK,
)
def leave_team(
    session: SessionGetter,
    member: Annotated[
        Member,
        Depends(get_member_by_cookie),
    ],
):
    if not member.has_joined_team:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have not joined a team yet",
        )
    member.team = None
    member.has_joined_team = False
    session.add(member)
    session.commit()
    logger.warning(
        "A member %s left the group",
        member.username,
    )
