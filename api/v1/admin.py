from fastapi import APIRouter, Depends, status, HTTPException
from typing import Annotated

from core.schemas import MemberInAdmin, MemberOut, MemberUpdateAdmin
from api.dependencies import SessionGetter, verify_api_key, get_member_by_id
from core.db_models import Member
from sqlalchemy import select


import logging


logger = logging.getLogger(__name__)

router = APIRouter(
    tags=["Admin-Users"],
    prefix="/admin",
    dependencies=[Depends(verify_api_key)],
)


# Secured endpoint, we dont want the other to see who they voted for
@router.get(
    "/members",
    status_code=status.HTTP_200_OK,
    response_model=list[MemberOut],
)
def get_members(session: SessionGetter):
    """
    Get all registered members in the system.
    
    Args:
        session: Database session
    
    Returns:
        list[MemberOut]: Complete list of all members with their details
    
    Security:
        Requires admin API key authentication
        Secured endpoint to protect member voting privacy
    
    Raises:
        HTTPException(404): If no members exist in the system
    
    Admin Use:
        Monitor registration status and member activity
    """
    stmt = select(Member)
    members = session.execute(stmt).scalars().all()
    if not members:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No members found",
        )
    return members


@router.get(
    "/member/{member_id}",
    status_code=status.HTTP_200_OK,
    response_model=MemberOut,
)
def get_member(
    member: Annotated[
        Member,
        Depends(get_member_by_id),
    ],
):
    """
    Get specific member details by ID.
    
    Args:
        member: Member object (validated to exist by dependency)
    
    Returns:
        MemberOut: Complete member information including team and vote status
    
    Security:
        Requires admin API key authentication
    
    Raises:
        HTTPException(404): If member with given ID doesn't exist
    
    Admin Use:
        Inspect individual member details for troubleshooting
    """
    return member


@router.post(
    "/member",
    response_model=MemberOut,
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    member: MemberInAdmin,
    session: SessionGetter,
):
    """
    Create a new member directly through admin panel.
    
    Args:
        member: Complete member data including team assignment
        session: Database session
    
    Returns:
        MemberOut: Created member with all details
    
    Security:
        Requires admin API key authentication
    
    Business Rules:
        - Username must be unique
        - If has_joined_team is True, team_id must be provided
        - Token must be unique
    
    Raises:
        HTTPException(400): If username already exists
        HTTPException(406): If logical error (joined team but no team_id)
    
    Admin Use:
        Bulk member creation and testing scenarios
    """
    if member.has_joined_team and member.team_id is None:
        raise HTTPException(
            status_code=status.HTTP_406_NOT_ACCEPTABLE,
            detail="Logical error. A member has joined team, but no relationship found",
        )
    member_db = Member(
        name=member.name,
        username=member.username,
        has_voted=False,
        has_joined_team=member.has_joined_team,
        token=member.token,
        team_id=member.team_id,
    )
    stmt = select(Member).where(
        Member.username == member_db.username,
    )
    result = session.execute(stmt).scalar()
    if result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A member with that username already exists",
        )
    session.add(member_db)
    session.commit()
    logger.warning(
        "Administrator has created a new user %s",
        member_db.username,
    )
    return member_db


# FIX
@router.patch(
    "/member/{member_id}",
    response_model=MemberOut,
    status_code=status.HTTP_200_OK,
)
def update_user(
    session: SessionGetter,
    member_in: MemberUpdateAdmin,
    member: Annotated[
        Member,
        Depends(get_member_by_id),
    ],
):
    """
    Update any member's information through admin panel.
    
    Args:
        session: Database session
        member_in: Fields to update (name, username, token)
        member: Target member (validated to exist)
    
    Returns:
        MemberOut: Updated member information
    
    Security:
        Requires admin API key authentication
    
    Admin Capabilities:
        - Change any member field
        - Update usernames, names, and tokens
        - Fix data inconsistencies
    
    Side Effects:
        Logs admin update action for audit trail
    """
    for field, value in member_in.model_dump(
        exclude_unset=True,
    ).items():
        setattr(member, field, value)
    session.add(member)
    session.commit()
    logger.warning(
        "Administrator has updated user %s",
        member.username,
    )
    return member


@router.delete(
    "/member/{member_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_user(
    session: SessionGetter,
    member: Annotated[Member, Depends(get_member_by_id)],
):
    """
    Permanently delete a member from the system.
    
    Args:
        session: Database session
        member: Target member to delete (validated to exist)
    
    Security:
        Requires admin API key authentication
    
    Warning:
        - Irreversible operation
        - Removes all member data including team membership and votes
        - May affect voting statistics
    
    Admin Use:
        Remove spam accounts or handle data privacy requests
    
    Side Effects:
        Logs admin deletion action for audit trail
    """
    session.delete(member)
    session.commit()
    logger.warning(
        "Administrator has deleted user %s",
        member.username,
    )
