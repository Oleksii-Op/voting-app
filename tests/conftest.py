from sqlalchemy import StaticPool

from core.get_db import DatabaseHelper, get_db
from main import app
from fastapi.testclient import TestClient
import pytest
from typing import Generator

from core.config import settings


# in memory sqlite3 database
db_testing = DatabaseHelper(
    url="sqlite:///:memory:",
    connect_args={
        "check_same_thread": False,
    },
    poolclass=StaticPool,
    echo_pool=True,
    echo=True,
)


@pytest.fixture(scope="session", autouse=True)
def setup_and_teardown() -> Generator[None, None, None]:
    """Fixture to create and drop tables for each test"""
    db_testing.create_database()
    yield


app.dependency_overrides[get_db.session_getter] = db_testing.session_getter  # type: ignore


@pytest.fixture(scope="session")
def client() -> Generator[TestClient, None, None]:
    """
    Fixture to yield a test client for each test
    :return: client: TestClient
    """
    with TestClient(
        app=app, base_url=f"http://{settings.runtime.host}:{settings.runtime.port}"
    ) as client:
        yield client
