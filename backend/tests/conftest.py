import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import engine, Base

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(autouse=True)
async def reset_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c

@pytest.fixture
async def auth_client(client: AsyncClient) -> AsyncClient:
    resp = await client.post("/api/v1/auth/register", json={
        "email": "test@conclave.io", "username": "testuser",
        "password": "securepass123", "domain": "trading"
    })
    token = resp.json()["data"]["access_token"]
    client.headers["Authorization"] = f"Bearer {token}"
    return client

@pytest.fixture
async def conclave_id_fixture(auth_client: AsyncClient) -> str:
    r = await auth_client.post("/api/v1/conclaves/", json={
        "name": "Test Chamber", "domain": "trading"
    })
    return str(r.json()["data"]["id"])
