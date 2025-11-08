def test_health_endpoint(test_client):
    res = test_client.get("/api/v1/health")
    assert res.status_code == 200
    assert res.json() == {"status": "healthy"}


def test_root_endpoint(test_client):
    res = test_client.get("/")
    assert res.status_code == 200
    body = res.json()
    assert body.get("status") == "ok"
    assert body.get("message") == "API running"