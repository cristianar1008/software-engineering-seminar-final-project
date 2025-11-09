def test_cors_header_for_allowed_origin(client):
    resp = client.get("/", headers={"Origin": "http://localhost:4200"})
    assert resp.headers.get("access-control-allow-origin") == "http://localhost:4200"


def test_cors_header_for_secondary_origin(client):
    resp = client.get("/", headers={"Origin": "http://127.0.0.1:4201"})
    assert resp.headers.get("access-control-allow-origin") == "http://127.0.0.1:4201"