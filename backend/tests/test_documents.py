import pytest

@pytest.mark.asyncio
async def test_add_document_text(auth_client, conclave_id_fixture):
    r = await auth_client.post(
        f"/api/v1/conclaves/{conclave_id_fixture}/documents",
        json={"text": "The Federal Reserve announced a new monetary policy framework focusing on average inflation targeting."}
    )
    assert r.status_code == 201
    assert r.json()["data"]["content_preview"] is not None

@pytest.mark.asyncio
async def test_get_documents(auth_client, conclave_id_fixture):
    r = await auth_client.get(f"/api/v1/conclaves/{conclave_id_fixture}/documents")
    assert r.status_code == 200
    assert isinstance(r.json()["data"], list)
