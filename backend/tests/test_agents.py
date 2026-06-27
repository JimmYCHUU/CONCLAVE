import pytest

@pytest.mark.asyncio
async def test_get_agents_returns_list(auth_client, conclave_id_fixture):
    r = await auth_client.get(f"/api/v1/conclaves/{conclave_id_fixture}/agents")
    assert r.status_code == 200
    data = r.json()["data"]
    assert isinstance(data, list)
    assert len(data) == 5

@pytest.mark.asyncio
async def test_get_agent_by_id(auth_client, conclave_id_fixture):
    r = await auth_client.get(f"/api/v1/conclaves/{conclave_id_fixture}/agents")
    agent_id = r.json()["data"][0]["id"]
    r2 = await auth_client.get(f"/api/v1/conclaves/{conclave_id_fixture}/agents/{agent_id}")
    assert r2.status_code == 200
    assert r2.json()["data"]["id"] == agent_id

@pytest.mark.asyncio
async def test_message_agent_returns_503_without_llm(auth_client, conclave_id_fixture):
    r = await auth_client.get(f"/api/v1/conclaves/{conclave_id_fixture}/agents")
    agent_id = r.json()["data"][0]["id"]
    r2 = await auth_client.post(
        f"/api/v1/conclaves/{conclave_id_fixture}/agents/{agent_id}/message",
        json={"message": "What do you think about the market?"}
    )
    assert r2.status_code in (200, 503)
