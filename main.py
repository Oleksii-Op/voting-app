from fastapi import FastAPI
import uvicorn
from core.config import settings
from api.v1 import router as api_v1
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.get_db import get_db

import logging

logger = logging.getLogger(__name__)


def configure_logger(
    level: int = logging.INFO,
) -> None:
    logging.basicConfig(
        level=level,
        datefmt="%Y-%m-%d %H:%M:%S",
        format="[%(asctime)s,%(msecs)03d] - %(module)s - %(levelname)s: %(message)s.",
    )


@asynccontextmanager
async def lifespan(app_instance: FastAPI):  # type: ignore
    logger.info("Creating database")
    get_db.create_database()
    yield
    logger.info("Deleting database")
    get_db.dispose_database()


app = FastAPI(
    title="Voting Application",
    lifespan=lifespan,
)
app.include_router(api_v1)

app.add_middleware(
    CORSMiddleware,  # type: ignore
    ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    configure_logger(level=logging.INFO)
    logger.info("Starting server")
    uvicorn.run(
        "main:app",
        host=settings.runtime.host,
        port=settings.runtime.port,
        reload=settings.runtime.reload,
    )
    logger.info("Shutting down server")
