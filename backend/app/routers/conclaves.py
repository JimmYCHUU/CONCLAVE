from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.conclave import CreateConclaveRequest, UpdateConclaveRequest
from app.services.auth_deps import get_current_user
from app.services.conclave_service import create_conclave, get_my_conclave, get_brief, get_brief_history
from app.models.user import User
from app.models.conclave import Conclave
from app.models.agent import Agent
from sqlalchemy import select, update
import uuid

router = APIRouter()

@router.post("/", status_code=201)
async def create(req: CreateConclaveRequest, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    try:
        conclave = await create_conclave(db, str(user.id), req.name, req.domain)
        return {"data": conclave, "error": None}
    except ValueError as e:
        return {"data": None, "error": {"code": str(e), "detail": "Conclave already exists"}}

@router.get("/my")
async def get_my(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    conclave = await get_my_conclave(db, str(user.id))
    if not conclave:
        raise HTTPException(status_code=404, detail="No conclave found")
    return {"data": conclave, "error": None}

@router.get("/{conclave_id}/brief")
async def get_brief_endpoint(conclave_id: str, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    brief = await get_brief(db, conclave_id)
    if not brief:
        return {"data": {"brief": None, "message": "Your Conclave assembles. First briefing at 06:00."}, "error": None}
    return {"data": brief, "error": None}

@router.get("/{conclave_id}/brief/history")
async def get_brief_history_endpoint(
    conclave_id: str,
    page: int = Query(1),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    history = await get_brief_history(db, conclave_id, page)
    return {"data": history, "error": None}

@router.patch("/{conclave_id}")
async def update_conclave(
    conclave_id: str,
    req: UpdateConclaveRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(select(Conclave).where(
        Conclave.id == uuid.UUID(conclave_id),
        Conclave.user_id == user.id,
    ))
    conclave = result.scalar_one_or_none()
    if not conclave:
        raise HTTPException(status_code=404, detail="Conclave not found")
    if req.is_public is not None:
        conclave.is_public = req.is_public
    if req.name is not None:
        conclave.name = req.name
    await db.commit()
    return {"data": {"id": str(conclave.id), "is_public": conclave.is_public, "name": conclave.name}, "error": None}

@router.post("/{conclave_id}/inject", status_code=202)
async def inject_scenario(
    conclave_id: str,
    req: dict,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from app.agents.scheduler import run_debate_cycle
    try:
        session_id = await run_debate_cycle(
            conclave_id,
            is_user_inject=True,
            topic_override=req.get("scenario"),
        )
        return {"data": {"session_id": session_id, "status": "queued"}, "error": None}
    except Exception as e:
        return {"data": None, "error": {"code": "DEBATE_IN_PROGRESS", "detail": str(e)}}
