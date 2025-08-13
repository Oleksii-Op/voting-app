import pytest
from http import HTTPStatus
from fastapi.testclient import TestClient
from core.config import settings


@pytest.fixture
def auth_headers():
    # Adjust to match your verify_api_key implementation
    return {"x-api-key": settings.admin.apikey}


def test_get_members_empty(client: TestClient, auth_headers):
    response = client.get("/v1/admin/members", headers=auth_headers)
    assert response.status_code == 404


def test_create_user_success(client: TestClient, auth_headers):
    payload = {
        "name": "John",
        "username": "john123",
        "has_joined_team": False,
        "token": "tok123",
        "team_id": None,
    }
    resp = client.post("/v1/admin/member", json=payload, headers=auth_headers)
    assert resp.status_code == 201
    body = resp.json()
    assert body["username"] == "john123"
    assert body["has_joined_team"] is False


def test_create_user_duplicate_username(client: TestClient, auth_headers):
    base_payload = {
        "name": "Jane",
        "username": "john123",
        "has_joined_team": False,
        "token": "tok456",
        "team_id": None,
    }
    resp = client.post("/v1/admin/member", json=base_payload, headers=auth_headers)
    assert resp.status_code == 400


def test_create_user_logical_error(client: TestClient, auth_headers):
    base_payload = {
        "name": "John",
        "username": "john123",
        "has_joined_team": True,
        "token": "tok123",
        "team_id": None,
    }
    resp = client.post(
        "/v1/admin/member",
        json=base_payload,
        headers=auth_headers,
    )
    assert resp.status_code == 406


def test_update_user_success(client: TestClient, auth_headers):
    create_resp = client.post(
        "/v1/admin/member",
        json={
            "name": "Mark",
            "username": "mark123",
            "has_joined_team": False,
            "token": "tok000",
            "team_id": None,
        },
        headers=auth_headers,
    )
    member_id = create_resp.json()["id"]

    update_resp = client.patch(
        f"/v1/admin/member/{member_id}",
        json={"name": "MarkUpdated"},
        headers=auth_headers,
    )

    assert update_resp.status_code == HTTPStatus.OK
    assert update_resp.json()["name"] == "MarkUpdated"


def test_update_user_no_changes(client: TestClient, auth_headers):
    create_resp = client.post(
        "/v1/admin/member",
        json={
            "name": "NoChange",
            "username": "nochange123",
            "has_joined_team": False,
            "token": "tok_nochange",
            "team_id": None,
        },
        headers=auth_headers,
    )
    member_id = create_resp.json()["id"]

    # Sending empty PATCH should still succeed and return current state
    resp = client.patch(f"/v1/admin/member/{member_id}", json={}, headers=auth_headers)
    assert resp.status_code == HTTPStatus.OK
    assert resp.json()["username"] == "nochange123"


def test_delete_user_success(client: TestClient, auth_headers):
    create_resp = client.post(
        "/v1/admin/member",
        json={
            "name": "DeleteMe",
            "username": "delete123",
            "has_joined_team": False,
            "token": "tokdel",
            "team_id": None,
        },
        headers=auth_headers,
    )
    member_id = create_resp.json()["id"]

    delete_resp = client.delete(
        f"/v1/admin/member/{member_id}",
        headers=auth_headers,
    )
    assert delete_resp.status_code == HTTPStatus.NO_CONTENT

    # Verify deletion
    resp = client.get(
        f"/v1/admin/member/{member_id}",
        headers=auth_headers,
    )
    assert resp.status_code == 404


def test_delete_non_existent_user(client: TestClient, auth_headers):
    resp = client.delete(
        "/v1/admin/member/9999",
        headers=auth_headers,
    )
    assert resp.status_code == HTTPStatus.NOT_FOUND


def test_create_user_with_long_username(client: TestClient, auth_headers):
    long_username = "x" * 30  # max allowed in schema
    payload = {
        "name": "MaxLen",
        "username": long_username,
        "has_joined_team": False,
        "token": "toklong",
        "team_id": None,
    }
    resp = client.post(
        "/v1/admin/member",
        json=payload,
        headers=auth_headers,
    )
    assert resp.status_code == HTTPStatus.CREATED
    assert resp.json()["username"] == long_username


def test_create_user_with_min_name_length(client: TestClient, auth_headers):
    payload = {
        "name": "A",  # min allowed
        "username": "minname",
        "has_joined_team": False,
        "token": "tokmin",
        "team_id": None,
    }
    resp = client.post(
        "/v1/admin/member",
        json=payload,
        headers=auth_headers,
    )
    assert resp.status_code == HTTPStatus.CREATED
    assert resp.json()["name"] == "A"
