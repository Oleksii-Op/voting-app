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
    """
    Insert a new member into the database.
    
    Args:
        session: Database session for transactions
        member: Member data containing name and username
        token: Unique token for member authentication
    
    Note:
        Sets has_voted=False and has_joined_team=False by default
    """
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
    """
    Generate a new registration token for member signup.
    
    Returns:
        str: Unique token that can be used for member registration
    
    Security:
        Requires admin API key authentication
    
    Note:
        Token is stored in memory and consumed upon successful registration
    """
    token = generate_token()
    TOKENS[token] = token
    return token


@router.post(
    "/register/{token}",
    status_code=status.HTTP_201_CREATED,
    response_model=MemberIn,
)
def create_member(
    token: str,
    response: Response,
    member: MemberIn,
    session: SessionGetter,
):
    """
    Register a new member using a valid token.
    
    Args:
        token: Registration token obtained from admin
        response: HTTP response object for setting cookies
        member: Member registration data (name, username)
        session: Database session
    
    Returns:
        MemberIn: Created member data
    
    Raises:
        HTTPException(401): If token is invalid or expired
    
    Side Effects:
        - Sets 'users-token' cookie for authentication
        - Removes token from available tokens pool
        - Logs member registration
    """
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
    """
    Get current authenticated member's profile information.
    
    Args:
        member: Current member from cookie authentication
    
    Returns:
        MemberOut: Complete member profile including team and voting status
    
    Security:
        Requires valid 'users-token' cookie
    
    Raises:
        HTTPException(401): If cookie is missing or invalid
    """
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
    """
    Update current member's profile information.
    
    Args:
        member: Current member from cookie authentication
        member_in: Fields to update (only name is updatable by members)
        session: Database session
    
    Returns:
        MemberOut: Updated member profile
    
    Security:
        Requires valid 'users-token' cookie
    
    Note:
        Only allows updating name field, other fields require admin access
    """
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
    """
    Delete current member's account permanently.
    
    Args:
        member: Current member from cookie authentication
        session: Database session
    
    Security:
        Requires valid 'users-token' cookie
    
    Warning:
        This operation is irreversible and removes all member data
        including team membership and voting records
    """
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
    """
    Reset user authentication cookie with a new token.
    
    Args:
        token: New authentication token
        response: HTTP response object for setting cookies
    
    Purpose:
        Allows users to recover access if they lost their cookie
        or need to switch devices
    
    Note:
        Does not validate token - assumes token is provided by admin
    """
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
    """
    Join a team as the current member.
    
    Args:
        team: Target team to join (validated to exist)
        session: Database session
        member: Current member from cookie authentication
    
    Security:
        Requires valid 'users-token' cookie
    
    Business Rules:
        - Members can only join one team
        - Must not have already joined a team
    
    Raises:
        HTTPException(403): If member has already joined a team
        HTTPException(404): If team doesn't exist
    
    Side Effects:
        - Updates member's team relationship
        - Sets has_joined_team flag to True
        - Logs team join action
    """
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
    """
    Leave current team membership.
    
    Args:
        session: Database session
        member: Current member from cookie authentication
    
    Security:
        Requires valid 'users-token' cookie
    
    Business Rules:
        - Member must have joined a team to leave
        - Preserves voting status (can still vote after leaving team)
    
    Raises:
        HTTPException(403): If member hasn't joined a team
    
    Side Effects:
        - Removes team relationship
        - Sets has_joined_team flag to False
        - Logs team leave action
    """
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
