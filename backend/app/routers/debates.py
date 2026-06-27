from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.debate import ResolvePredictionRequest
from app.services.auth_deps import get_current_user
from app.services.debate_service import get_debate, get_debates_for_conclave, resolve_prediction, get_branches, get_predictions
from app.models.user import User
import uuid

router = APIRouter()

@router.get("/debates/{session_id}")
async def get_debate_endpoint(session_id: str, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    debate = await get_debate(db, session_id)
    if not debate:
        raise HTTPException(status_code=404, detail="Debate not found")
    return {"data": debate, "error": None}

@router.get("/conclaves/{conclave_id}/debates")
async def get_conclave_debates(
    conclave_id: str, page: int = Query(1),
    db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user),
):
    debates = await get_debates_for_conclave(db, conclave_id, page)
    return {"data": debates, "error": None}

@router.get("/conclaves/{conclave_id}/predictions")
async def get_predictions_endpoint(
    conclave_id: str, outcome: str | None = Query(None), page: int = Query(1),
    db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user),
):
    preds = await get_predictions(db, conclave_id, outcome, page)
    return {"data": preds, "error": None}

@router.patch("/predictions/{prediction_id}/resolve")
async def resolve_prediction_endpoint(
    prediction_id: str, req: ResolvePredictionRequest,
    db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user),
):
    try:
        result = await resolve_prediction(db, prediction_id, req.outcome)
        return {"data": result, "error": None}
    except ValueError as e:
        return {"data": None, "error": {"code": str(e), "detail": "Prediction not found"}}

@router.get("/debates/{session_id}/branches")
async def get_debate_branches(session_id: str, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    branches = await get_branches(db, session_id)
    return {"data": {"branches": branches}, "error": None}
