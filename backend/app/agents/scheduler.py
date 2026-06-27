from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from app.database import AsyncSessionLocal
from app.models.conclave import Conclave
from app.models.agent import Agent
from app.models.debate import DebateSession
from app.agents.graph import build_debate_graph
from app.agents.scenario_branches import generate_scenario_branches
from sqlalchemy import select
import uuid
from datetime import datetime

scheduler = AsyncIOScheduler()

async def run_debate_cycle(
    conclave_id: str,
    is_morning_brief: bool = False,
    topic_override: str | None = None,
    is_user_inject: bool = False,
) -> str:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Conclave).where(Conclave.id == uuid.UUID(conclave_id)))
        conclave = result.scalar_one_or_none()
        if not conclave:
            raise ValueError(f"Conclave {conclave_id} not found")

        agents_result = await db.execute(select(Agent).where(Agent.conclave_id == uuid.UUID(conclave_id)))
        agents = agents_result.scalars().all()

        if not agents:
            raise ValueError(f"No agents for conclave {conclave_id}")

        topic = topic_override or f"{conclave.domain} market analysis for {datetime.utcnow().strftime('%Y-%m-%d')}"

        session = DebateSession(
            conclave_id=uuid.UUID(conclave_id),
            topic=topic,
            triggered_by="user_inject" if is_user_inject else "scheduled",
            status="running",
            is_morning_brief=is_morning_brief,
        )
        db.add(session)
        await db.commit()
        await db.refresh(session)
        session_id = str(session.id)

    agent_dicts = [
        {"id": str(a.id), "name": a.name, "role": a.role,
         "personality_prompt": a.personality_prompt,
         "bias_description": a.bias_description,
         "accuracy_score": a.accuracy_score}
        for a in agents
    ]

    initial_state = {
        "conclave_id": conclave_id,
        "session_id": session_id,
        "topic": topic,
        "domain": conclave.domain,
        "news_context": "",
        "knowledge_graph_context": "",
        "agents": agent_dicts,
        "swarm_summary": {},
        "debate_history": [],
        "current_round": 0,
        "max_rounds": 3,
        "consensus_reached": False,
        "contrarian_activated": False,
        "contrarian_agent_id": "",
        "summary": "",
        "predictions": [],
        "is_user_inject": is_user_inject,
    }

    graph = build_debate_graph()
    await graph.ainvoke(initial_state)

    if is_user_inject:
        news_ctx = initial_state.get("news_context", "")
        branches = await generate_scenario_branches(session_id, topic, conclave.domain, news_ctx)

    return session_id

async def run_all_conclave_debates(is_morning_brief: bool = False):
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Conclave))
        all_conclaves = result.scalars().all()

    for conclave in all_conclaves:
        try:
            await run_debate_cycle(str(conclave.id), is_morning_brief=is_morning_brief)
        except Exception:
            pass

def start_scheduler() -> None:
    scheduler.add_job(
        run_all_conclave_debates,
        CronTrigger(hour=6, minute=0),
        kwargs={"is_morning_brief": True},
        id="morning_brief",
    )
    for hour in [12, 18, 0]:
        scheduler.add_job(
            run_all_conclave_debates,
            CronTrigger(hour=hour, minute=0),
            kwargs={"is_morning_brief": False},
            id=f"debate_{hour}",
        )
    scheduler.start()

def stop_scheduler() -> None:
    scheduler.shutdown(wait=False)
