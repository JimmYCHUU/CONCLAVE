from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.agent import MessageAgentRequest
from app.services.auth_deps import get_current_user
from app.services.agent_service import message_agent
from app.models.user import User

router = APIRouter()

@router.get("/{conclave_id}/agents")
async def get_agents(conclave_id: str, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    from app.models.agent import Agent
    from sqlalchemy import select
    import uuid
    result = await db.execute(select(Agent).where(Agent.conclave_id == uuid.UUID(conclave_id)))
    agents = result.scalars().all()
    return {"data": [{
        "id": str(a.id), "name": a.name, "role": a.role,
        "bias_description": a.bias_description,
        "accuracy_score": a.accuracy_score,
        "calibration_score": a.calibration_score,
        "total_predictions": a.total_predictions,
        "correct_predictions": a.correct_predictions,
    } for a in agents], "error": None}

@router.get("/{conclave_id}/agents/{agent_id}")
async def get_agent(conclave_id: str, agent_id: str, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    from app.models.agent import Agent
    from sqlalchemy import select
    import uuid
    result = await db.execute(select(Agent).where(
        Agent.id == uuid.UUID(agent_id),
        Agent.conclave_id == uuid.UUID(conclave_id),
    ))
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"data": {
        "id": str(agent.id), "name": agent.name, "role": agent.role,
        "personality_prompt": agent.personality_prompt,
        "bias_description": agent.bias_description,
        "accuracy_score": agent.accuracy_score,
        "calibration_score": agent.calibration_score,
        "total_predictions": agent.total_predictions,
        "correct_predictions": agent.correct_predictions,
    }, "error": None}

@router.post("/{conclave_id}/agents/{agent_id}/message")
async def message_agent_endpoint(
    conclave_id: str, agent_id: str, req: MessageAgentRequest,
    db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user),
):
    result = await message_agent(db, agent_id, conclave_id, req.message)
    if "error" in result:
        raise HTTPException(status_code=503, detail=result["error"])
    return {"data": result, "error": None}
