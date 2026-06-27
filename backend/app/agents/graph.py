from typing import TypedDict, List
from langgraph.graph import StateGraph, END
from app.agents.llm import call_council_llm
from app.agents.swarm import run_swarm
from app.agents.news_fetcher import fetch_news
from app.agents.knowledge_graph import get_topic_context
from app.database import AsyncSessionLocal
from app.models.debate import DebateMessage, DebateSession
from app.models.agent import Agent
from app.models.prediction import Prediction
import json
import uuid
from datetime import datetime
from sqlalchemy import select

class DebateState(TypedDict):
    conclave_id: str
    session_id: str
    topic: str
    domain: str
    news_context: str
    knowledge_graph_context: str
    agents: List[dict]
    swarm_summary: dict
    debate_history: List[dict]
    current_round: int
    max_rounds: int
    consensus_reached: bool
    contrarian_activated: bool
    contrarian_agent_id: str
    summary: str
    predictions: List[dict]
    is_user_inject: bool

AGENT_DEBATE_PROMPT = """You are {agent_name}, a {agent_role} in a private intelligence conclave.

Your analytical identity: {personality_prompt}
Your known bias: {bias_description}

TOPIC: {topic}

TODAY'S INTELLIGENCE:
{news_context}

KNOWN CONTEXT FROM YOUR KNOWLEDGE BASE:
{knowledge_graph_context}

CROWD INTELLIGENCE (from swarm simulation of {stakeholder_types}):
{swarm_summary_formatted}

PREVIOUS DEBATE ROUNDS:
{debate_history_formatted}

INSTRUCTIONS:
1. If previous rounds exist, directly respond to at least one other analyst.
2. Apply your unique analytical lens. Disagree when you actually disagree.
3. Reference the crowd intelligence when relevant — agree or disagree with it.
4. End with: PREDICTION: [specific falsifiable claim] | CONFIDENCE: [0-100]%
5. Under 200 words. Stay in character. Never call yourself an AI.

Your response:"""

CONTRARIAN_PROMPT = """You are {agent_name}, a {agent_role}.

CONTRARIAN PROTOCOL ACTIVE. The conclave has reached premature consensus. Your role this round is to stress-test that consensus.

Normal bias: {bias_description}
Current consensus being challenged: {consensus_position}

Your task: Make the STRONGEST POSSIBLE CASE for why the consensus is wrong or incomplete.
Draw on your knowledge of historical precedents where similar consensus views proved incorrect.
You are not changing your permanent views — you are performing intellectual due diligence for the conclave.

Cite specific counterarguments, overlooked risks, or ignored data.
End with: PREDICTION: [specific falsifiable counter-prediction] | CONFIDENCE: [0-100]%
Under 200 words."""

async def news_fetcher_node(state: DebateState) -> DebateState:
    if not state.get("news_context"):
        news = await fetch_news(state["topic"], state["domain"])
        state["news_context"] = news
    return state

async def knowledge_graph_node(state: DebateState) -> DebateState:
    context = await get_topic_context(state["conclave_id"], state["topic"])
    state["knowledge_graph_context"] = context
    return state

async def topic_selector_node(state: DebateState) -> DebateState:
    prompt = f"Given the news context, what is the most relevant debate topic for a {state['domain']} conclave? News: {state['news_context'][:500]}"
    try:
        response = await call_council_llm(messages=[{"role": "user", "content": prompt}], max_tokens=100)
        state["topic"] = response[:200]
    except Exception:
        pass
    return state

async def swarm_node(state: DebateState) -> DebateState:
    summary = await run_swarm(
        topic=state["topic"],
        domain=state["domain"],
        news_context=state["news_context"],
        n_agents=20,
    )
    state["swarm_summary"] = summary
    await _store_swarm_messages(state["session_id"], summary)
    return state

async def _store_swarm_messages(session_id: str, swarm_summary: dict):
    async with AsyncSessionLocal() as db:
        for reaction in swarm_summary.get("key_reactions", []):
            msg = DebateMessage(
                session_id=uuid.UUID(session_id),
                content=reaction,
                round_number=0,
                is_swarm=True,
            )
            db.add(msg)
        await db.commit()

async def agent_turn_node(state: DebateState) -> DebateState:
    round_num = state["current_round"]
    is_contrarian_round = state["contrarian_activated"] and state.get("contrarian_agent_id")

    for agent in state["agents"]:
        if is_contrarian_round and agent["id"] == state["contrarian_agent_id"]:
            consensus_position = _detect_consensus_position(state["debate_history"])
            prompt = CONTRARIAN_PROMPT.format(
                agent_name=agent["name"],
                agent_role=agent["role"],
                bias_description=agent["bias_description"],
                consensus_position=consensus_position,
            )
        else:
            swarm_str = json.dumps(state["swarm_summary"], indent=2) if state.get("swarm_summary") else "No swarm data"
            history_str = "\n".join(
                f"{m['agent_name']} ({m['agent_role']}): {m['content']}"
                for m in state["debate_history"][-6:]
            ) or "No previous rounds."
            prompt = AGENT_DEBATE_PROMPT.format(
                agent_name=agent["name"],
                agent_role=agent["role"],
                personality_prompt=agent["personality_prompt"],
                bias_description=agent["bias_description"],
                topic=state["topic"],
                news_context=state["news_context"][:1000],
                knowledge_graph_context=state.get("knowledge_graph_context", ""),
                stakeholder_types=state["domain"],
                swarm_summary_formatted=swarm_str,
                debate_history_formatted=history_str,
            )

        try:
            response = await call_council_llm(messages=[{"role": "user", "content": prompt}])
        except Exception:
            response = f"Interesting point. Let me analyze {state['topic']} from my perspective as {agent['role']}."

        msg_entry = {
            "agent_name": agent["name"],
            "agent_role": agent["role"],
            "agent_id": agent["id"],
            "content": response,
            "round_number": round_num,
            "is_swarm": False,
            "is_contrarian_round": is_contrarian_round and agent["id"] == state["contrarian_agent_id"],
        }
        state["debate_history"].append(msg_entry)

        async with AsyncSessionLocal() as db:
            db_msg = DebateMessage(
                session_id=uuid.UUID(state["session_id"]),
                agent_id=uuid.UUID(agent["id"]),
                content=response,
                round_number=round_num,
                is_swarm=False,
                is_contrarian_round=msg_entry["is_contrarian_round"],
            )
            db.add(db_msg)
            await db.commit()

    return state

def _detect_consensus_position(history: list) -> str:
    for m in reversed(history):
        if not m.get("is_swarm") and not m.get("is_contrarian_round"):
            content = m["content"]
            if "PREDICTION:" in content:
                return content
    return "The consensus position among analysts"

async def moderator_node(state: DebateState) -> DebateState:
    state["current_round"] += 1

    if len(state["debate_history"]) >= 4 * state["max_rounds"]:
        last_round_msgs = [m for m in state["debate_history"] if m["round_number"] == state["current_round"] - 1]
        if len(last_round_msgs) >= 4 and not state["contrarian_activated"]:
            check_prompt = f"Do 4 or more of these responses agree on the same directional outcome? Answer YES or NO only. Responses: {[m['content'][:200] for m in last_round_msgs]}"
            try:
                consensus_check = await call_council_llm(messages=[{"role": "user", "content": check_prompt}], max_tokens=10)
                if "YES" in consensus_check.upper():
                    state["contrarian_activated"] = True
                    sorted_agents = sorted(state["agents"], key=lambda a: a.get("accuracy_score", 0.5))
                    state["contrarian_agent_id"] = sorted_agents[0]["id"] if sorted_agents else ""
            except Exception:
                pass

    if state["current_round"] >= state["max_rounds"] or len(state["debate_history"]) >= 4 * state["max_rounds"]:
        state["consensus_reached"] = True

    return state

async def summarizer_node(state: DebateState) -> DebateState:
    history_str = "\n".join(
        f"{m['agent_name']}: {m['content'][:200]}"
        for m in state["debate_history"]
    )
    contrarian_note = " The Contrarian Protocol was activated to challenge premature consensus." if state["contrarian_activated"] else ""
    prompt = f"Summarize this debate in 3 bullet points. Each bullet starts with •.{contrarian_note}\n\n{history_str}"
    try:
        response = await call_council_llm(messages=[{"role": "user", "content": prompt}])
        state["summary"] = response
    except Exception:
        state["summary"] = f"• Debate concluded on {state['topic']} with {len(state['agents'])} analysts{contrarian_note}"

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(DebateSession).where(DebateSession.id == uuid.UUID(state["session_id"])))
        session = result.scalar_one_or_none()
        if session:
            session.summary = state["summary"]
            session.swarm_summary = state.get("swarm_summary")
            session.contrarian_activated = state["contrarian_activated"]
            session.status = "completed"
            session.completed_at = datetime.utcnow()
            await db.commit()

    return state

async def prediction_extractor_node(state: DebateState) -> DebateState:
    for msg in state["debate_history"]:
        if "PREDICTION:" in msg["content"] and "CONFIDENCE:" in msg["content"]:
            content = msg["content"]
            claim_part = content.split("PREDICTION:")[-1].split("CONFIDENCE:")[0].strip()
            confidence_str = content.split("CONFIDENCE:")[-1].split("%")[0].strip()
            try:
                confidence = float(confidence_str) / 100.0
            except ValueError:
                confidence = 0.5

            async with AsyncSessionLocal() as db:
                pred = Prediction(
                    session_id=uuid.UUID(state["session_id"]),
                    agent_id=uuid.UUID(msg["agent_id"]),
                    claim=claim_part[:500],
                    confidence=confidence,
                    outcome="pending",
                )
                db.add(pred)
                await db.commit()

    return state

def build_debate_graph():
    workflow = StateGraph(DebateState)

    workflow.add_node("news_fetcher_node", news_fetcher_node)
    workflow.add_node("knowledge_graph_node", knowledge_graph_node)
    workflow.add_node("topic_selector_node", topic_selector_node)
    workflow.add_node("swarm_node", swarm_node)
    workflow.add_node("agent_turn_node", agent_turn_node)
    workflow.add_node("moderator_node", moderator_node)
    workflow.add_node("summarizer_node", summarizer_node)
    workflow.add_node("prediction_extractor_node", prediction_extractor_node)

    workflow.set_entry_point("news_fetcher_node")
    workflow.add_edge("news_fetcher_node", "knowledge_graph_node")
    workflow.add_edge("knowledge_graph_node", "topic_selector_node")
    workflow.add_edge("topic_selector_node", "swarm_node")
    workflow.add_edge("swarm_node", "agent_turn_node")
    workflow.add_edge("agent_turn_node", "moderator_node")

    def should_continue(state: DebateState) -> str:
        if state["consensus_reached"] or state["current_round"] >= state.get("max_rounds", 3):
            return "summarizer_node"
        return "agent_turn_node"

    workflow.add_conditional_edges("moderator_node", should_continue, {
        "summarizer_node": "summarizer_node",
        "agent_turn_node": "agent_turn_node",
    })

    workflow.add_edge("summarizer_node", "prediction_extractor_node")
    workflow.add_edge("prediction_extractor_node", END)

    return workflow.compile()
