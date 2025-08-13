from fastapi import APIRouter
from core.config import settings
from .member import router as member_router
from .team import router as team_router
from .admin import router as admin_router
from .voting import router as voting_router

router = APIRouter(
    prefix=settings.api.v1.prefix,
)
router.include_router(member_router)

router.include_router(team_router)

router.include_router(admin_router)

router.include_router(voting_router)
