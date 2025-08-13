import pytest
from http import HTTPStatus
from fastapi.testclient import TestClient
from core.config import settings
from api.v1.member import TOKENS


@pytest.fixture
def auth_headers():
    return {"x-api-key": settings.admin.apikey}


@pytest.fixture
def sample_member_data():
    return {"name": "John Doe", "username": "johndoe123"}


@pytest.fixture
def create_team(client: TestClient, auth_headers):
    response = client.post(
        "/v1/teams", headers=auth_headers, json={"name": "Test Team"}
    )
    return response.json()


def test_get_token_success(client: TestClient, auth_headers):
    response = client.get("/v1/token", headers=auth_headers)
    assert response.status_code == HTTPStatus.OK
    token = response.json()
    assert isinstance(token, str)
    assert len(token) > 0
    assert token in TOKENS


def test_get_token_unauthorized(client: TestClient):
    response = client.get("/v1/token")
    assert response.status_code == HTTPStatus.UNAUTHORIZED


def test_register_member_success(client: TestClient, auth_headers, sample_member_data):
    # First get a token
    token_response = client.get("/v1/token", headers=auth_headers)
    token = token_response.json()

    # Register with valid token
    response = client.post(f"/v1/register/{token}", json=sample_member_data)

    assert response.status_code == HTTPStatus.CREATED
    assert response.json()["name"] == sample_member_data["name"]
    assert response.json()["username"] == sample_member_data["username"]

    # Verify token was removed from TOKENS
    assert token not in TOKENS

    # Verify cookie was set
    assert "users-token" in response.cookies


def test_register_member_invalid_token(client: TestClient, sample_member_data):
    response = client.post("/v1/register/invalid_token", json=sample_member_data)

    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert response.json()["detail"] == "Invalid token"


def test_current_user_success(client: TestClient, auth_headers, sample_member_data):
    # Register a member first
    token_response = client.get("/v1/token", headers=auth_headers)
    token = token_response.json()

    register_response = client.post(f"/v1/register/{token}", json=sample_member_data)

    # Get current user info
    response = client.get("/v1/users/me", cookies=register_response.cookies)

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["name"] == sample_member_data["name"]
    assert data["username"] == sample_member_data["username"]
    assert data["has_joined_team"] is False
    assert data["has_voted"] is False
    assert data["team_id"] is None


def test_current_user_no_cookie(client: TestClient):
    response = client.get("/v1/users/me")

    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert response.json()["detail"] == "Missing token cookie"


def test_current_user_invalid_cookie(client: TestClient):
    response = client.get("/v1/users/me", cookies={"users-token": "invalid_token"})

    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert response.json()["detail"] == "Invalid token"


def test_update_member_success(client: TestClient, auth_headers, sample_member_data):
    # Register a member first
    token_response = client.get("/v1/token", headers=auth_headers)
    token = token_response.json()

    register_response = client.post(f"/v1/register/{token}", json=sample_member_data)

    # Update member name
    update_data = {"name": "Jane Doe"}
    response = client.patch(
        "/v1/users/me", json=update_data, cookies=register_response.cookies
    )

    assert response.status_code == HTTPStatus.OK
    assert response.json()["name"] == "Jane Doe"
    assert response.json()["username"] == sample_member_data["username"]


def test_update_member_no_changes(client: TestClient, auth_headers, sample_member_data):
    # Register a member first
    token_response = client.get("/v1/token", headers=auth_headers)
    token = token_response.json()

    register_response = client.post(f"/v1/register/{token}", json=sample_member_data)

    # Update with empty data
    response = client.patch("/v1/users/me", json={}, cookies=register_response.cookies)

    assert response.status_code == HTTPStatus.OK
    assert response.json()["name"] == sample_member_data["name"]


def test_delete_member_success(client: TestClient, auth_headers, sample_member_data):
    # Register a member first
    token_response = client.get("/v1/token", headers=auth_headers)
    token = token_response.json()

    register_response = client.post(f"/v1/register/{token}", json=sample_member_data)

    # Delete member
    response = client.delete("/v1/users/me", cookies=register_response.cookies)

    assert response.status_code == HTTPStatus.NO_CONTENT

    # Verify member is deleted
    get_response = client.get("/v1/users/me", cookies=register_response.cookies)
    assert get_response.status_code == HTTPStatus.UNAUTHORIZED


def test_reset_cookie_success(client: TestClient):
    token = "test_token"
    response = client.get(f"/v1/users/reset/{token}")

    assert response.status_code == HTTPStatus.OK
    assert "users-token" in response.cookies
    assert response.cookies["users-token"] == token


def test_join_team_success(
    client: TestClient, auth_headers, sample_member_data, create_team
):
    # Register a member first
    token_response = client.get("/v1/token", headers=auth_headers)
    token = token_response.json()

    register_response = client.post(f"/v1/register/{token}", json=sample_member_data)

    team_id = create_team["id"]

    # Join team
    response = client.post(
        f"/v1/users/join/{team_id}", cookies=register_response.cookies
    )

    assert response.status_code == HTTPStatus.OK

    # Verify member joined team
    member_response = client.get("/v1/users/me", cookies=register_response.cookies)
    assert member_response.json()["has_joined_team"] is True
    assert member_response.json()["team_id"] == team_id


def test_join_team_already_joined(
    client: TestClient, auth_headers, sample_member_data, create_team
):
    # Register a member first
    token_response = client.get("/v1/token", headers=auth_headers)
    token = token_response.json()

    register_response = client.post(f"/v1/register/{token}", json=sample_member_data)

    team_id = create_team["id"]

    # Join team first time
    client.post(f"/v1/users/join/{team_id}", cookies=register_response.cookies)

    # Try to join again
    response = client.post(
        f"/v1/users/join/{team_id}", cookies=register_response.cookies
    )

    assert response.status_code == HTTPStatus.FORBIDDEN
    assert response.json()["detail"] == "You cannot join a team twice"


def test_join_nonexistent_team(client: TestClient, auth_headers, sample_member_data):
    # Register a member first
    token_response = client.get("/v1/token", headers=auth_headers)
    token = token_response.json()

    register_response = client.post(f"/v1/register/{token}", json=sample_member_data)

    # Try to join nonexistent team
    response = client.post("/v1/users/join/9999", cookies=register_response.cookies)

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert response.json()["detail"] == "Team not found"


def test_leave_team_success(
    client: TestClient, auth_headers, sample_member_data, create_team
):
    # Register a member first
    token_response = client.get("/v1/token", headers=auth_headers)
    token = token_response.json()

    register_response = client.post(f"/v1/register/{token}", json=sample_member_data)

    team_id = create_team["id"]

    # Join team first
    client.post(f"/v1/users/join/{team_id}", cookies=register_response.cookies)

    # Leave team
    response = client.post("/v1/users/leave/", cookies=register_response.cookies)

    assert response.status_code == HTTPStatus.OK

    # Verify member left team
    member_response = client.get("/v1/users/me", cookies=register_response.cookies)
    assert member_response.json()["has_joined_team"] is False
    assert member_response.json()["team_id"] is None


def test_leave_team_not_joined(client: TestClient, auth_headers, sample_member_data):
    # Register a member first
    token_response = client.get("/v1/token", headers=auth_headers)
    token = token_response.json()

    register_response = client.post(f"/v1/register/{token}", json=sample_member_data)

    # Try to leave team without joining
    response = client.post("/v1/users/leave/", cookies=register_response.cookies)

    assert response.status_code == HTTPStatus.FORBIDDEN
    assert response.json()["detail"] == "You have not joined a team yet"


def test_member_operations_without_auth(client: TestClient):
    endpoints = [
        ("/v1/users/me", "get"),
        ("/v1/users/me", "patch"),
        ("/v1/users/me", "delete"),
        ("/v1/users/join/1", "post"),
        ("/v1/users/leave/", "post"),
    ]

    for endpoint, method in endpoints:
        response = getattr(client, method)(endpoint, json={})
        assert response.status_code == HTTPStatus.UNAUTHORIZED
