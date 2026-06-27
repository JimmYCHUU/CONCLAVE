import pytest

@pytest.mark.asyncio
async def test_inject_scenario_returns_202(auth_client, conclave_id_fixture):
    r = await auth_client.post(
        f"/api/v1/conclaves/{conclave_id_fixture}/inject",
        json={"scenario": "What if the Fed cuts rates by 100bps tomorrow?"}
    )
    assert r.status_code == 202
    assert r.json()["data"]["status"] == "queued"
    assert "session_id" in r.json()["data"]

@pytest.mark.asyncio
async def test_get_debate_branches_empty(auth_client, conclave_id_fixture):
    r = await auth_client.get(f"/api/v1/conclaves/{conclave_id_fixture}/debates?page=1")
    assert r.status_code == 200
    assert isinstance(r.json()["data"], list)
