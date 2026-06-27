import uuid
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.agent import Agent
from app.models.conclave import Conclave
from app.agents.llm import call_council_llm
from app.agents.memory import get_relevant_memories, save_memory
from app.agents.knowledge_graph import get_topic_context

async def message_agent(db: AsyncSession, agent_id: str, conclave_id: str, message: str) -> dict:
    result = await db.execute(select(Agent).where(
        Agent.id == uuid.UUID(agent_id),
        Agent.conclave_id == uuid.UUID(conclave_id),
    ))
    agent = result.scalar_one_or_none()
    if not agent:
        return {"error": "Agent not found"}

    memories = await get_relevant_memories(agent_id, message)
    kg_context = await get_topic_context(conclave_id, message)
    memories_str = "\n".join(memories[:5]) if memories else "No relevant memories."

    prompt = f"""You are {agent.name}, a {agent.role}.

Your analytical identity: {agent.personality_prompt}
Your known bias: {agent.bias_description}

Relevant memories: {memories_str}
Knowledge context: {kg_context}

User message: {message}

Respond in character as {agent.name}. Be concise (under 150 words).
Never call yourself an AI. Stay in your persona."""

    try:
        response = await call_council_llm(messages=[
            {"role": "system", "content": f"You are {agent.name}, a {agent.role}. Stay in character."},
            {"role": "user", "content": prompt},
        ])
    except Exception:
        response = f"As {agent.role}, I'd need to analyze this further before providing a definitive assessment."

    await save_memory(agent_id, f"User: {message}", "direct_message", 0.7)
    await save_memory(agent_id, f"{agent.name}: {response}", "direct_message", 0.7)

    return {
        "agent_name": agent.name,
        "response": response,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
