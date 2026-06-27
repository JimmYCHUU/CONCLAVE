import pytest

@pytest.mark.asyncio
async def test_ws_requires_auth(client):
    from fastapi.testclient import TestClient
    from app.main import app
    with TestClient(app) as tc:
        with tc.websocket_connect("/ws/debates/test-session?token=invalid") as ws:
            pytest.fail("Should have closed")
