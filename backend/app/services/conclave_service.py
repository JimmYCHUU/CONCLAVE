import uuid
import json
import networkx as nx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.conclave import Conclave
from app.models.agent import Agent
from app.models.debate import DebateSession
from app.agents.generators.conclave_generator import generate_agents
from app.agents.memory import save_memory
from pathlib import Path

async def create_conclave(db: AsyncSession, user_id: str, name: str, domain: str) -> dict:
    result = await db.execute(select(Conclave).where(Conclave.user_id == uuid.UUID(user_id)))
    if result.scalar_one_or_none():
        raise ValueError("CONCLAVE_EXISTS")

    conclave = Conclave(user_id=uuid.UUID(user_id), name=name, domain=domain)
    db.add(conclave)
    await db.commit()
    await db.refresh(conclave)

    agents_data = await generate_agents(domain)
    agent_objs = []
    for a in agents_data:
        agent = Agent(
            conclave_id=conclave.id,
            name=a["name"],
            role=a["role"],
            personality_prompt=a["personality_prompt"],
            bias_description=a["bias_description"],
            accuracy_score=a.get("accuracy_score", 0.5),
            calibration_score=a.get("calibration_score"),
            total_predictions=a.get("total_predictions", 0),
            correct_predictions=a.get("correct_predictions", 0),
        )
        db.add(agent)
        await db.flush()
        await save_memory(str(agent.id), f"I am {a['name']}, a {a['role']}. {a['personality_prompt']}", "identity")
        agent_objs.append({
            "id": str(agent.id),
            "name": agent.name,
            "role": agent.role,
            "bias_description": agent.bias_description,
            "accuracy_score": agent.accuracy_score,
            "calibration_score": agent.calibration_score,
            "total_predictions": agent.total_predictions,
            "correct_predictions": agent.correct_predictions,
        })
    await db.commit()

    graph_dir = Path("data/graphs")
    graph_dir.mkdir(parents=True, exist_ok=True)
    graph_path = graph_dir / f"{conclave.id}.json"
    if not graph_path.exists():
        graph_path.write_text(json.dumps(nx.node_link_data(nx.DiGraph())))

    return {
        "id": str(conclave.id),
        "name": conclave.name,
        "domain": conclave.domain,
        "is_public": conclave.is_public,
        "follower_count": conclave.follower_count,
        "agents": agent_objs,
    }

async def get_my_conclave(db: AsyncSession, user_id: str) -> dict | None:
    result = await db.execute(select(Conclave).where(Conclave.user_id == uuid.UUID(user_id)))
    conclave = result.scalar_one_or_none()
    if not conclave:
        return None

    agents_result = await db.execute(select(Agent).where(Agent.conclave_id == conclave.id))
    agents = agents_result.scalars().all()

    return {
        "id": str(conclave.id),
        "name": conclave.name,
        "domain": conclave.domain,
        "is_public": conclave.is_public,
        "follower_count": conclave.follower_count,
        "agents": [{
            "id": str(a.id), "name": a.name, "role": a.role,
            "bias_description": a.bias_description,
            "accuracy_score": a.accuracy_score,
            "calibration_score": a.calibration_score,
            "total_predictions": a.total_predictions,
            "correct_predictions": a.correct_predictions,
        } for a in agents],
    }

async def get_brief(db: AsyncSession, conclave_id: str) -> dict | None:
    result = await db.execute(
        select(DebateSession).where(
            DebateSession.conclave_id == uuid.UUID(conclave_id),
            DebateSession.is_morning_brief == True,
            DebateSession.status == "completed",
        ).order_by(DebateSession.created_at.desc()).limit(1)
    )
    session = result.scalar_one_or_none()
    if not session:
        return None
    return {
        "topic": session.topic,
        "swarm_summary": session.swarm_summary,
        "council_summary": session.summary,
        "debate_date": session.created_at.isoformat() if session.created_at else None,
    }

async def get_brief_history(db: AsyncSession, conclave_id: str, page: int = 1) -> list:
    per_page = 10
    result = await db.execute(
        select(DebateSession).where(
            DebateSession.conclave_id == uuid.UUID(conclave_id),
            DebateSession.is_morning_brief == True,
            DebateSession.status == "completed",
        ).order_by(DebateSession.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    )
    sessions = result.scalars().all()
    return [{
        "topic": s.topic, "swarm_summary": s.swarm_summary,
        "council_summary": s.summary,
        "debate_date": s.created_at.isoformat() if s.created_at else None,
    } for s in sessions]
