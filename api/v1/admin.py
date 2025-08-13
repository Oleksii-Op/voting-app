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
        "Administrator has create a new user %s",
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
    for field, value in member_in.model_dump(
        exclude_unset=True,
    ).items():
        setattr(member, field, value)
    session.commit()
    logger.warning(
        "Administrator has update user %s",
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
    session.delete(member)
    session.commit()
    logger.warning(
        "Administrator has delete user %s",
        member.username,
    )
