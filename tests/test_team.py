from core.config import settings
from fastapi.testclient import TestClient


def test_create_team(client: TestClient) -> None:
    response = client.post(
        "/v1/teams",
        headers={"x-api-key": settings.admin.apikey},
        json={"name": "Winners"},
    )
    assert response.status_code == 201


def test_update_team(client: TestClient) -> None:
    response = client.patch(
        "/v1/teams/1",
        headers={"x-api-key": settings.admin.apikey},
        json={"name": "Losers"},
    )
    assert response.status_code == 200


def test_delete_team(client: TestClient) -> None:
    response = client.delete(
        "/v1/teams/1",
        headers={"x-api-key": settings.admin.apikey},
    )
    assert response.status_code == 204
