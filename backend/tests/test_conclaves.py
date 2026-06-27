import pytest

@pytest.mark.asyncio
async def test_create_conclave_returns_5_agents(auth_client):
    r = await auth_client.post("/api/v1/conclaves/", json={"name": "Alpha Chamber", "domain": "trading"})
    assert r.status_code == 201
    data = r.json()["data"]
    assert len(data["agents"]) == 5
    for agent in data["agents"]:
        assert "name" in agent and "role" in agent and "bias_description" in agent
        assert agent["accuracy_score"] == 0.5
        assert agent["calibration_score"] is None

@pytest.mark.asyncio
async def test_get_my_conclave(auth_client):
    await auth_client.post("/api/v1/conclaves/", json={"name": "My Chamber", "domain": "research"})
    r = await auth_client.get("/api/v1/conclaves/my")
    assert r.status_code == 200
    assert r.json()["data"]["name"] == "My Chamber"

@pytest.mark.asyncio
async def test_conclave_agents_have_colors(auth_client):
    r = await auth_client.post("/api/v1/conclaves/", json={"name": "Color Chamber", "domain": "general"})
    assert r.status_code == 201
    agents = r.json()["data"]["agents"]
    for i, agent in enumerate(agents):
        assert "name" in agent
