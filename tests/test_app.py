import copy

import pytest
from fastapi.testclient import TestClient

from src.app import activities, app


@pytest.fixture(autouse=True)
def restore_activities():
    """Reset the in-memory activities between tests."""
    snapshot = copy.deepcopy(activities)
    yield
    activities.clear()
    activities.update(copy.deepcopy(snapshot))


@pytest.fixture
def client():
    return TestClient(app)


def test_get_activities_lists_all(client):
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()

    assert "Chess Club" in data
    assert isinstance(data["Chess Club"]["participants"], list)


def test_signup_adds_participant(client):
    email = "new_student@mergington.edu"
    response = client.post(f"/activities/Chess Club/signup?email={email}")

    assert response.status_code == 200
    assert email in activities["Chess Club"]["participants"]


def test_signup_rejects_duplicates(client):
    existing_email = activities["Chess Club"]["participants"][0]
    response = client.post(f"/activities/Chess Club/signup?email={existing_email}")

    assert response.status_code == 400
    assert "already signed up" in response.json()["detail"]


def test_delete_removes_participant(client):
    email_to_remove = activities["Chess Club"]["participants"][0]

    response = client.delete(
        f"/activities/Chess Club/signup?email={email_to_remove}"
    )

    assert response.status_code == 200
    assert email_to_remove not in activities["Chess Club"]["participants"]


def test_delete_nonexistent_participant_returns_404(client):
    response = client.delete(
        "/activities/Chess Club/signup?email=missing@mergington.edu"
    )

    assert response.status_code == 404
    assert "not registered" in response.json()["detail"]
