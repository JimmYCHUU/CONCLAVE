import json
import asyncio
import redis.asyncio as redis
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.config import settings
from app.services.auth_service import decode_token

router = APIRouter()

@router.websocket("/ws/debates/{session_id}")
async def debate_websocket(websocket: WebSocket, session_id: str, token: str = Query(...)):
    payload = decode_token(token)
    if payload is None:
        await websocket.close(code=1008)
        return

    await websocket.accept()
    r = redis.from_url(settings.redis_url, decode_responses=True)
    pubsub = r.pubsub()
    await pubsub.subscribe(f"debate:{session_id}")

    try:
        async for message in pubsub.listen():
            if message["type"] == "message":
                data = json.loads(message["data"])
                await websocket.send_json(data)
                if data.get("type") == "debate_complete":
                    break
    except WebSocketDisconnect:
        pass
    finally:
        await pubsub.unsubscribe(f"debate:{session_id}")
        await pubsub.close()
        await r.close()
