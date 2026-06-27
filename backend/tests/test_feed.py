import pytest

@pytest.mark.asyncio
async def test_public_feed_returns_without_auth(client):
    r = await client.get("/api/v1/feed/")
    assert r.status_code == 200
    assert isinstance(r.json()["data"], list)

@pytest.mark.asyncio
async def test_follow_increments_count(auth_client, conclave_id_fixture):
    r = await auth_client.post(f"/api/v1/feed/{conclave_id_fixture}/follow")
    assert r.status_code == 200
    assert r.json()["data"]["followed"] is True
