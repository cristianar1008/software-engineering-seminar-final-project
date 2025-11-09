import pytest
from app.main import app


def test_root_ok(client):
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data.get("status") == "ok"


def test_health_ok(client):
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data.get("status") == "healthy"


def test_app_title():
    assert app.title == "Seminar Project API"


def test_root_message_present(client):
    resp = client.get("/")
    assert resp.json().get("message") == "API running"