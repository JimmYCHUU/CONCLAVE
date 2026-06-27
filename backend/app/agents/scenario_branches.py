import asyncio
import json
import uuid
from app.agents.llm import call_council_llm
from app.agents.swarm import run_swarm
from app.database import AsyncSessionLocal
from app.models.scenario_branch import ScenarioBranch

async def generate_scenario_branches(
    session_id: str,
    topic: str,
    domain: str,
    news_context: str,
) -> list[dict]:
    gen_prompt = f"For topic '{topic}', generate: (1) one plausible major disruption event, (2) one extreme tail-risk event. Return JSON: {{disruption: str, black_swan: str}}"
    disruption_event = ""
    black_swan_event = ""

    try:
        response = await call_council_llm(messages=[{"role": "user", "content": gen_prompt}], max_tokens=300)
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
        events = json.loads(cleaned)
        disruption_event = events.get("disruption", "")
        black_swan_event = events.get("black_swan", "")
    except Exception:
        disruption_event = f"Major regulatory shift affecting {topic}"
        black_swan_event = f"Systemic crisis impacting {topic} sector"

    base_summary = await run_swarm(topic, domain, news_context, n_agents=5)
    disruption_topic = f"{topic} — {disruption_event}" if disruption_event else topic
    disruption_summary = await run_swarm(disruption_topic, domain, news_context, n_agents=5)
    black_swan_topic = f"{topic} — {black_swan_event}" if black_swan_event else topic
    black_swan_summary = await run_swarm(black_swan_topic, domain, news_context, n_agents=5)

    branches_data = [
        {"type": "base", "disruption_event": None, "summary": base_summary},
        {"type": "disruption", "disruption_event": disruption_event, "summary": disruption_summary},
        {"type": "black_swan", "disruption_event": black_swan_event, "summary": black_swan_summary},
    ]

    saved_branches = []
    async with AsyncSessionLocal() as db:
        for b in branches_data:
            branch = ScenarioBranch(
                session_id=uuid.UUID(session_id),
                branch_type=b["type"],
                disruption_event=b["disruption_event"],
                outcome_summary=b["summary"].get("dominant_view", ""),
                key_signal=b["summary"].get("minority_view", "")[:300],
            )
            db.add(branch)
            await db.flush()
            saved_branches.append({
                "type": b["type"],
                "disruption_event": b["disruption_event"],
                "outcome_summary": b["summary"].get("dominant_view", ""),
                "key_signal": b["summary"].get("minority_view", "")[:300],
            })
        await db.commit()

    return saved_branches
