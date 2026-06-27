from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import init_db
from app.agents.scheduler import start_scheduler, stop_scheduler
from app.routers import auth, conclaves, agents, debates, feed, documents
from app.websocket.debate_ws import router as ws_router
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    os.makedirs("data/graphs", exist_ok=True)
    start_scheduler()
    yield
    stop_scheduler()

app = FastAPI(title="CONCLAVE API", version="3.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(conclaves.router, prefix="/api/v1/conclaves", tags=["conclaves"])
app.include_router(agents.router, prefix="/api/v1/conclaves", tags=["agents"])
app.include_router(debates.router, prefix="/api/v1", tags=["debates"])
app.include_router(feed.router, prefix="/api/v1/feed", tags=["feed"])
app.include_router(documents.router, prefix="/api/v1/conclaves", tags=["documents"])
app.include_router(ws_router)

@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "service": "CONCLAVE", "version": "3.0.0"}
