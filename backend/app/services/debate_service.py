import uuid
from datetime import datetime, timezone
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.debate import DebateSession, DebateMessage
from app.models.prediction import Prediction
from app.models.scenario_branch import ScenarioBranch
from app.models.agent import Agent

async def get_debate(db: AsyncSession, session_id: str) -> dict | None:
    result = await db.execute(select(DebateSession).where(DebateSession.id == uuid.UUID(session_id)))
    session = result.scalar_one_or_none()
    if not session:
        return None

    msgs_result = await db.execute(
        select(DebateMessage, Agent.name).outerjoin(Agent, DebateMessage.agent_id == Agent.id)
        .where(DebateMessage.session_id == uuid.UUID(session_id))
        .order_by(DebateMessage.round_number, DebateMessage.created_at)
    )
    rows = msgs_result.all()

    preds_result = await db.execute(select(Prediction).where(Prediction.session_id == uuid.UUID(session_id)))
    predictions = preds_result.scalars().all()

    return {
        "session_id": str(session.id),
        "topic": session.topic,
        "swarm_summary": session.swarm_summary,
        "summary": session.summary,
        "status": session.status,
        "triggered_by": session.triggered_by,
        "is_user_inject": session.triggered_by == "user_inject",
        "contrarian_activated": session.contrarian_activated,
        "messages": [{
            "agent_name": name, "content": msg.content, "agent_id": str(msg.agent_id) if msg.agent_id else None,
            "round_number": msg.round_number, "is_swarm": msg.is_swarm,
            "is_contrarian_round": msg.is_contrarian_round,
            "timestamp": msg.created_at.isoformat() if msg.created_at else None,
        } for msg, name in rows],
        "predictions": [{
            "id": str(p.id), "agent_id": str(p.agent_id),
            "claim": p.claim, "confidence": p.confidence,
            "outcome": p.outcome,
        } for p in predictions],
    }

async def get_debates_for_conclave(db: AsyncSession, conclave_id: str, page: int = 1) -> list:
    per_page = 10
    result = await db.execute(
        select(DebateSession).where(DebateSession.conclave_id == uuid.UUID(conclave_id))
        .order_by(DebateSession.created_at.desc())
        .offset((page - 1) * per_page).limit(per_page)
    )
    sessions = result.scalars().all()
    return [{
        "session_id": str(s.id), "topic": s.topic,
        "status": s.status, "is_morning_brief": s.is_morning_brief,
        "created_at": s.created_at.isoformat() if s.created_at else None,
    } for s in sessions]

async def resolve_prediction(db: AsyncSession, prediction_id: str, outcome: str) -> dict:
    result = await db.execute(select(Prediction).where(Prediction.id == uuid.UUID(prediction_id)))
    prediction = result.scalar_one_or_none()
    if not prediction:
        raise ValueError("PREDICTION_NOT_FOUND")

    prediction.outcome = outcome
    prediction.resolved_at = func.now()
    await db.commit()

    agent_result = await db.execute(select(Agent).where(Agent.id == prediction.agent_id))
    agent = agent_result.scalar_one_or_none()
    if agent:
        agent.total_predictions += 1
        if outcome == "correct":
            agent.correct_predictions += 1
        agent.accuracy_score = agent.correct_predictions / max(agent.total_predictions, 1)
        calibration = await recalculate_calibration(db, str(agent.id))
        agent.calibration_score = calibration
        await db.commit()

    return {"id": str(prediction.id), "outcome": outcome}

async def recalculate_calibration(db: AsyncSession, agent_id: str) -> float | None:
    result = await db.execute(
        select(Prediction).where(
            Prediction.agent_id == uuid.UUID(agent_id),
            Prediction.outcome.isnot(None),
            Prediction.outcome != "pending",
        )
    )
    predictions = result.scalars().all()
    if len(predictions) < 5:
        return None

    buckets = {"0-20": [], "20-40": [], "40-60": [], "60-80": [], "80-100": []}
    bucket_midpoints = {"0-20": 0.1, "20-40": 0.3, "40-60": 0.5, "60-80": 0.7, "80-100": 0.9}

    for p in predictions:
        conf_pct = p.confidence * 100
        if conf_pct < 20:
            buckets["0-20"].append(p)
        elif conf_pct < 40:
            buckets["20-40"].append(p)
        elif conf_pct < 60:
            buckets["40-60"].append(p)
        elif conf_pct < 80:
            buckets["60-80"].append(p)
        else:
            buckets["80-100"].append(p)

    errors = []
    for bucket_name, bucket_preds in buckets.items():
        if not bucket_preds:
            continue
        correct = sum(1 for p in bucket_preds if p.outcome == "correct")
        actual_rate = correct / len(bucket_preds)
        expected_rate = bucket_midpoints[bucket_name]
        errors.append(abs(expected_rate - actual_rate))

    if not errors:
        return None
    calibration_score = 1.0 - (sum(errors) / len(errors))
    return round(calibration_score, 4)

async def get_branches(db: AsyncSession, session_id: str):
    result = await db.execute(
        select(ScenarioBranch).where(ScenarioBranch.session_id == uuid.UUID(session_id))
    )
    branches = result.scalars().all()
    return [{
        "type": b.branch_type, "disruption_event": b.disruption_event,
        "outcome_summary": b.outcome_summary, "key_signal": b.key_signal,
    } for b in branches]

async def get_predictions(db: AsyncSession, conclave_id: str, outcome: str | None = None, page: int = 1):
    per_page = 20
    query = select(Prediction).join(DebateSession).where(
        DebateSession.conclave_id == uuid.UUID(conclave_id),
    )
    if outcome:
        query = query.where(Prediction.outcome == outcome)
    query = query.order_by(Prediction.created_at.desc()).offset((page - 1) * per_page).limit(per_page)

    result = await db.execute(query)
    predictions = result.scalars().all()
    return [{
        "id": str(p.id), "agent_id": str(p.agent_id),
        "claim": p.claim, "confidence": p.confidence,
        "outcome": p.outcome, "created_at": p.created_at.isoformat() if p.created_at else None,
    } for p in predictions]
