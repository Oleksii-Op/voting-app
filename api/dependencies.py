from typing import Annotated

from fastapi import (
    Depends,
    HTTPException,
    Cookie,
    status,
    Request,
    Header,
)
from sqlalchemy.orm import Session
from sqlalchemy import select

from core.db_models import Team, Member
from core.get_db import get_db

SessionGetter = Annotated[
    Session,
    Depends(get_db.session_getter),
]

import logging
from core.config import settings

logger = logging.getLogger(__name__)

API_KEY = settings.admin.apikey


def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API Key",
        )


def get_team_by_id(
    session: SessionGetter,
    team_id: int,
):
    team: Team | None = session.get(
        Team,
        team_id,
    )
    if not team:
        raise HTTPException(
            status_code=404,
            detail="Team not found",
        )
    return team


def get_member_by_id(
    session: SessionGetter,
    member_id: int,
):
    member: Member | None = session.get(
        Member,
        member_id,
    )
    if not member:
        raise HTTPException(
            status_code=404,
            detail="Member not found",
        )
    return member


def get_member_by_cookie(
    users_token: Annotated[
        str | None,
        Cookie(alias="users-token"),
    ],
    request: Request,
    session: SessionGetter,
) -> Member:
    if users_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing token cookie",
        )

    stmt = select(Member).where(Member.token == users_token)
    member = session.execute(stmt).scalar_one_or_none()

    if member is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    return member


def if_team_name_is_free(
    team_name: str,
    session: SessionGetter,
):
    stmt = select(Team).where(
        Team.name == team_name,
    )
    result = session.scalar(stmt)
    if result:
        raise HTTPException(
            status_code=400,
            detail="Team already exists",
        )
