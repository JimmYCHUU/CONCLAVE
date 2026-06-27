# CONCLAVE — Software Design Document v3.0 FINAL
**Date**: May 2026 | **Methodology**: Superpowers + Taste-Skill + TDD + Context7 + MiroFish Integration

---

## DOCUMENT PURPOSE
Every section is an unambiguous command. Execute phases in strict order. Each phase has a GATE — all tests must be GREEN before proceeding. No exceptions.

---

## 1. COMPLETE PROJECT STRUCTURE

```
conclave/
├── .env                          ← fill from .env.example
├── .env.example                  ← all keys, empty values
├── .gitignore
├── docker-compose.yml
├── litellm.config.yaml           ← multi-provider LLM routing
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── pytest.ini
│   ├── alembic.ini
│   ├── alembic/env.py
│   ├── alembic/versions/
│   │
│   ├── data/
│   │   └── graphs/               ← NetworkX JSON graphs per conclave
│   │
│   └── app/
│       ├── main.py
│       ├── config.py
│       ├── database.py
│       ├── models/               ← user, conclave, agent, debate, prediction, branch, document
│       ├── schemas/              ← auth, conclave, agent, debate, document
│       ├── routers/              ← auth, conclaves, agents, debates, feed, documents
│       ├── services/             ← auth, conclave, agent, debate, document
│       ├── agents/
│       │   ├── graph.py          ← LangGraph: full 2-stage debate pipeline
│       │   ├── swarm.py          ← MiroFish-style 20-agent swarm layer
│       │   ├── memory.py         ← ChromaDB operations
│       │   ├── knowledge_graph.py ← NetworkX graph operations
│       │   ├── scheduler.py      ← APScheduler 6h cycles
│       │   ├── news_fetcher.py
│       │   └── generators/
│       │       └── conclave_generator.py
│       ├── websocket/
│       │   └── debate_ws.py
│       └── tests/
│           ├── conftest.py
│           ├── test_auth.py
│           ├── test_conclaves.py
│           ├── test_agents.py
│           ├── test_debates.py
│           ├── test_swarm.py
│           ├── test_predictions.py
│           ├── test_documents.py
│           ├── test_websocket.py
│           └── test_feed.py
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── public/
    │   ├── manifest.json
    │   └── icons/icon-192.png
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── router.jsx
        ├── api/
        │   ├── client.js
        │   └── endpoints/        ← auth, conclaves, agents, debates, feed, documents
        ├── store/
        │   ├── authStore.js
        │   ├── conclaveStore.js
        │   └── debateStore.js
        ├── components/
        │   ├── AgentCard/        ← AgentCard.jsx + .test.jsx
        │   ├── DebateFeed/       ← DebateFeed.jsx + .test.jsx
        │   ├── SwarmBrief/       ← SwarmBrief.jsx + .test.jsx
        │   ├── MorningBrief/     ← MorningBrief.jsx + .test.jsx
        │   ├── ScenarioBranches/ ← ScenarioBranches.jsx + .test.jsx
        │   ├── CalibrationBadge/ ← CalibrationBadge.jsx + .test.jsx
        │   └── Layout/Layout.jsx
        └── pages/
            ├── Landing.jsx
            ├── Onboarding.jsx
            ├── Dashboard.jsx
            ├── Chamber.jsx
            ├── AgentProfile.jsx
            ├── Inject.jsx
            ├── Documents.jsx
            └── Discover.jsx
```

---

## 2. INFRASTRUCTURE FILES (EXACT CONTENT)

### .gitignore
```
.env
__pycache__/
*.pyc
.pytest_cache/
node_modules/
dist/
.venv/
*.egg-info/
backend/data/graphs/
chroma_data/
postgres_data/
alembic/versions/*.py
!alembic/versions/.gitkeep
```

### docker-compose.yml
```yaml
version: "3.9"
services:
  postgres:
    image: postgres:15-alpine
    container_name: conclave_postgres
    environment:
      POSTGRES_USER: conclave_user
      POSTGRES_PASSWORD: conclave_pass
      POSTGRES_DB: conclave_db
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]
    deploy:
      resources:
        limits:
          memory: 256M

  redis:
    image: redis:7-alpine
    container_name: conclave_redis
    ports: ["6379:6379"]
    deploy:
      resources:
        limits:
          memory: 64M

  chromadb:
    image: chromadb/chroma:0.5.23
    container_name: conclave_chroma
    ports: ["8001:8000"]
    volumes: [chroma_data:/chroma/chroma]
    deploy:
      resources:
        limits:
          memory: 256M

volumes:
  postgres_data:
  chroma_data:
```

---

## 3. BACKEND CORE FILES (EXACT CONTENT)

### app/config.py
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # LiteLLM proxy — use this for ALL LLM calls
    litellm_base_url: str = "http://localhost:4000"
    litellm_api_key: str = "sk-conclave-local"

    # Individual provider keys (used by litellm.config.yaml, not backend directly)
    google_api_key: str = ""
    groq_api_key: str = ""
    ollama_base_url: str = "http://localhost:11434"

    # Database
    database_url: str
    redis_url: str
    chroma_host: str = "localhost"
    chroma_port: int = 8001

    # Auth
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expiry_hours: int = 24

    # News
    gnews_api_key: str = ""

    environment: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()
```

### app/database.py
```python
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

engine = create_async_engine(settings.database_url, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
```

### app/main.py
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import init_db
from app.agents.scheduler import start_scheduler, stop_scheduler
from app.routers import auth, conclaves, agents, debates, feed, documents
from app.websocket.debate_ws import router as ws_router
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    os.makedirs("data/graphs", exist_ok=True)
    start_scheduler()
    yield
    stop_scheduler()

app = FastAPI(title="CONCLAVE API", version="3.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(conclaves.router, prefix="/api/v1/conclaves", tags=["conclaves"])
app.include_router(agents.router, prefix="/api/v1/conclaves", tags=["agents"])
app.include_router(debates.router, prefix="/api/v1", tags=["debates"])
app.include_router(feed.router, prefix="/api/v1/feed", tags=["feed"])
app.include_router(documents.router, prefix="/api/v1/conclaves", tags=["documents"])
app.include_router(ws_router)

@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "service": "CONCLAVE", "version": "3.0.0"}
```

---

## 4. DATABASE MODELS (EXACT CONTENT)

### app/models/debate.py (key additions vs v2)
```python
# debate_sessions additions:
swarm_summary: Mapped[dict | None] = mapped_column(JSON, nullable=True)
contrarian_activated: Mapped[bool] = mapped_column(Boolean, default=False)

# debate_messages additions:
is_swarm: Mapped[bool] = mapped_column(Boolean, default=False)
is_contrarian_round: Mapped[bool] = mapped_column(Boolean, default=False)
agent_id nullable — swarm messages have no persistent agent_id
```

### app/models/scenario_branch.py (NEW)
```python
import uuid
from sqlalchemy import String, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class ScenarioBranch(Base):
    __tablename__ = "scenario_branches"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("debate_sessions.id"))
    branch_type: Mapped[str] = mapped_column(String(20), nullable=False)  # base|disruption|black_swan
    disruption_event: Mapped[str | None] = mapped_column(Text, nullable=True)
    outcome_summary: Mapped[str] = mapped_column(Text, nullable=False)
    key_signal: Mapped[str] = mapped_column(String(300), nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    session: Mapped["DebateSession"] = relationship("DebateSession", back_populates="branches")
```

### app/models/agent.py (key additions)
```python
calibration_score: Mapped[float | None] = mapped_column(Float, nullable=True)
```

### app/models/conclave_document.py (NEW)
```python
class ConclaveDocument(Base):
    __tablename__ = "conclave_documents"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conclave_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("conclaves.id"))
    source_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    content_preview: Mapped[str] = mapped_column(Text, nullable=False)
    entity_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
```

---

## 5. LLM CALL PATTERN (use this exact pattern everywhere)

```python
# ALWAYS use LiteLLM proxy. Never call Google or Groq directly.
# Resolve Context7 docs for litellm Python SDK before implementing.

from litellm import acompletion

async def call_council_llm(messages: list[dict], max_tokens: int = 800) -> str:
    """Route to council-model (Gemini) via LiteLLM proxy."""
    response = await acompletion(
        model="council-model",
        messages=messages,
        max_tokens=max_tokens,
        api_base=settings.litellm_base_url,
        api_key=settings.litellm_api_key,
        timeout=30,
    )
    return response.choices[0].message.content.strip()

async def call_swarm_llm(messages: list[dict], max_tokens: int = 200) -> str:
    """Route to swarm-model (Groq) via LiteLLM proxy. Faster, cheaper."""
    response = await acompletion(
        model="swarm-model",
        messages=messages,
        max_tokens=max_tokens,
        api_base=settings.litellm_base_url,
        api_key=settings.litellm_api_key,
        timeout=15,
    )
    return response.choices[0].message.content.strip()
```

---

## 6. LANGGRAPH DEBATE ENGINE (app/agents/graph.py)

### DebateState TypedDict
```python
from typing import TypedDict, List, Optional, Any

class DebateState(TypedDict):
    conclave_id: str
    session_id: str
    topic: str
    domain: str
    news_context: str
    knowledge_graph_context: str  # entities/relationships from graph relevant to topic
    agents: List[dict]            # [{id, name, role, personality_prompt, bias_description}]
    swarm_summary: dict           # {dominant_view, minority_view, sentiment_split, key_reactions[]}
    debate_history: List[dict]    # [{agent_name, agent_role, content, round_number}]
    current_round: int
    max_rounds: int               # 3
    consensus_reached: bool
    contrarian_activated: bool
    contrarian_agent_id: str      # which agent gets the contrarian override
    summary: str
    predictions: List[dict]
    is_user_inject: bool
```

### Node Specifications

**`news_fetcher_node`**
- Resolve Context7 for `httpx async`
- Call GNews API with domain keyword. Parse 5 headlines.
- Fallback: BBC RSS feed
- Output: `state["news_context"]`

**`knowledge_graph_node`** (NEW — MiroFish integration)
- Load `data/graphs/{conclave_id}.json` using NetworkX
- If file doesn't exist: return empty string
- Extract entities from `state["topic"]` text using LLM (1 call, council-model)
- Find 1-hop neighbors of those entities in the graph
- Format as: "Known context: [entity] is connected to [entity] via [relationship]..."
- Output: `state["knowledge_graph_context"]`

**`swarm_node`** (NEW — MiroFish-style)
- Calls `run_swarm(topic, domain, news_context, n_agents=20)` from `swarm.py`
- Returns `swarm_summary: {dominant_view, minority_view, sentiment_split, key_reactions[]}`
- Output: `state["swarm_summary"]`

**`topic_selector_node`**
- LLM call (council-model) with topic selection prompt
- Output: `state["topic"]`

**`agent_turn_node`**
- Check if `contrarian_activated` and this is the contrarian round
- For each agent: if `agent.id == contrarian_agent_id` and contrarian round active → use `CONTRARIAN_PROMPT`, else `AGENT_DEBATE_PROMPT`
- Swarm summary injected into first round only
- Knowledge graph context injected into every round
- Each message: DB insert, Redis publish, append to history
- Output: updated `state["debate_history"]`

**`moderator_node`**
- Increment round
- Check consensus: call LLM to detect if ≥4 agents share same direction
  - Prompt: "Do 4 or more of these responses agree on the same directional outcome? Answer YES or NO only. Responses: {last_round_messages}"
  - If YES and first time → set `contrarian_activated = True`, pick contrarian agent (lowest accuracy)
- If `current_round >= max_rounds` → `consensus_reached = True`

**`summarizer_node`**
- LLM call (council-model), 3-bullet summary, includes note if contrarian protocol fired
- Output: `state["summary"]`

**`prediction_extractor_node`**
- Same as v2. Returns JSON array, stores to DB.

### Exact Prompts

#### AGENT_DEBATE_PROMPT (copy exactly)
```python
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
```

#### CONTRARIAN_PROMPT (copy exactly)
```python
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
```

#### GENERATOR_PROMPT (copy exactly)
```python
GENERATOR_PROMPT = """Generate exactly 5 analyst personas for a {domain} intelligence conclave.

Return ONLY a valid JSON array. No markdown. No preamble. Each object:
- "name": distinctive, international professional name (avoid: Alex, Sam, Jordan, Max)
- "role": highly specific analytical role for {domain} (e.g. "Macro Flow Strategist", not just "Analyst")
- "personality_prompt": 2 sentences — how they think, what data they prioritize
- "bias_description": 1 sentence — their known blind spot or systematic error

Diversity requirements:
- At minimum: 1 hard optimist, 1 hard pessimist, 1 contrarian, 1 data-driven quantitative thinker, 1 narrative/human-psychology thinker
- Mix genders and cultural backgrounds in names
- Roles must sound like real Wall Street / VC / research firm titles

Domain: {domain}"""
```

### Graph Edge Definition
```
START → news_fetcher_node → knowledge_graph_node → topic_selector_node → swarm_node → agent_turn_node → moderator_node
moderator_node → agent_turn_node     [if current_round < max_rounds AND not consensus_reached]
moderator_node → summarizer_node     [if consensus_reached OR current_round >= max_rounds]
summarizer_node → prediction_extractor_node → END
```

---

## 7. SWARM ENGINE (app/agents/swarm.py) — MiroFish Integration

```python
SWARM_AGENT_TYPES = {
    "trading": ["retail_investor", "hedge_fund_manager", "central_bank_watcher",
                "market_journalist", "retail_options_trader"],
    "startup": ["early_adopter", "skeptical_enterprise_buyer", "vc_associate",
                "competitor_product_manager", "tech_journalist"],
    "research": ["peer_reviewer", "industry_practitioner", "policy_advisor",
                 "academic_skeptic", "science_journalist"],
    "general": ["optimist_citizen", "worried_parent", "small_business_owner",
                "government_employee", "social_media_influencer"],
}

SWARM_PERSONA_PROMPT = """You are a {persona_type} reacting to this news on social media.
Your reaction is SHORT (1-3 sentences). Be authentic to your role.
Express your gut reaction, concern, enthusiasm, or skepticism.
News: {news}
Topic being discussed: {topic}"""

async def run_swarm(
    topic: str,
    domain: str,
    news_context: str,
    n_agents: int = 20
) -> dict:
    """
    Runs n_agents swarm personas concurrently using Groq (fast, cheap).
    Returns swarm_summary: {dominant_view, minority_view, sentiment_split, key_reactions[]}

    Implementation:
    1. Select n_agents personas from SWARM_AGENT_TYPES[domain], allow repeats
    2. For each persona: call call_swarm_llm() concurrently using asyncio.gather()
    3. Collect all responses
    4. Run 1 synthesis call (council-model): analyze all reactions, produce swarm_summary JSON
    5. Return parsed swarm_summary dict
    """
```

Synthesis prompt for swarm:
```python
SWARM_SYNTHESIS_PROMPT = """Analyze these {n} social media reactions from different stakeholders about: {topic}

Reactions:
{all_reactions_formatted}

Return ONLY valid JSON with this exact structure:
{{
  "dominant_view": "1-2 sentence summary of the majority reaction",
  "minority_view": "1-2 sentence summary of the significant minority reaction",
  "sentiment_split": "e.g. 65% concerned, 25% optimistic, 10% neutral",
  "key_reactions": ["memorable reaction 1", "memorable reaction 2", "memorable reaction 3"]
}}"""
```

---

## 8. KNOWLEDGE GRAPH (app/agents/knowledge_graph.py) — MiroFish Integration

```python
import networkx as nx
import json
from pathlib import Path

GRAPH_DIR = Path("data/graphs")

def load_graph(conclave_id: str) -> nx.DiGraph:
    path = GRAPH_DIR / f"{conclave_id}.json"
    if not path.exists():
        return nx.DiGraph()
    data = json.loads(path.read_text())
    return nx.node_link_graph(data)

def save_graph(conclave_id: str, graph: nx.DiGraph) -> None:
    GRAPH_DIR.mkdir(parents=True, exist_ok=True)
    path = GRAPH_DIR / f"{conclave_id}.json"
    path.write_text(json.dumps(nx.node_link_data(graph)))

async def extract_and_add_to_graph(
    conclave_id: str,
    text: str
) -> int:
    """
    1. Call council-model LLM to extract entities and relationships from text.
    2. Prompt returns JSON: [{subject, predicate, object}]
    3. Load existing graph, add nodes and edges, save.
    4. Returns number of new entities added.
    """

async def get_topic_context(
    conclave_id: str,
    topic: str
) -> str:
    """
    1. Load graph
    2. Call council-model LLM to extract key entities from topic (1 call)
    3. Find those entities in graph, get 1-hop neighbors
    4. Format as plain text "Known context: ..."
    5. Return context string (empty if graph empty or no matches)
    """
```

Entity extraction prompt:
```python
ENTITY_EXTRACTION_PROMPT = """Extract entities and relationships from this text as a knowledge graph.
Return ONLY valid JSON array. Each item: {{"subject": str, "predicate": str, "object": str}}
Keep predicates as simple verbs: "affects", "owns", "competes_with", "regulates", etc.
Maximum 15 triples. If none found, return [].
Text: {text}"""
```

---

## 9. SCENARIO BRANCHING (add to graph.py or new file scenario_branches.py)

```python
async def generate_scenario_branches(
    session_id: str,
    topic: str,
    domain: str,
    news_context: str
) -> list[dict]:
    """
    Generates 3 scenario branches concurrently, each with a 1-round swarm of 5 agents.

    Branch generation:
    1. Call council-model to generate disruption_event and black_swan_event for this topic.
       Prompt: "For topic '{topic}', generate: (1) one plausible major disruption event,
       (2) one extreme tail-risk event. Return JSON: {disruption: str, black_swan: str}"

    2. Run 3 mini-swarms concurrently (asyncio.gather):
       - Base: run_swarm(topic, domain, news_context, n_agents=5)
       - Disruption: run_swarm(f"{topic} — {disruption_event}", domain, news_context, n_agents=5)
       - Black swan: run_swarm(f"{topic} — {black_swan_event}", domain, news_context, n_agents=5)

    3. Store each as ScenarioBranch record with appropriate branch_type.
    4. Return list of branch dicts.
    """
```

---

## 10. AGENT MEMORY (app/agents/memory.py)

```python
# Resolve Context7 docs for chromadb HttpClient before implementing

async def save_memory(agent_id: str, content: str, memory_type: str, importance: float = 0.5) -> str:
    """Save to ChromaDB collection agent_{agent_id}. Return chroma_doc_id."""

async def get_relevant_memories(agent_id: str, query: str, n_results: int = 5) -> list[str]:
    """Semantic search in agent's ChromaDB collection. Return content strings."""
```

---

## 11. SCHEDULER (app/agents/scheduler.py)

```python
# Resolve Context7 docs for apscheduler AsyncIOScheduler + CronTrigger before implementing

def start_scheduler() -> None:
    # 06:00 → run_all_conclave_debates(is_morning_brief=True)
    # 12:00, 18:00, 00:00 → run_all_conclave_debates(is_morning_brief=False)

async def run_debate_cycle(
    conclave_id: str,
    is_morning_brief: bool = False,
    topic_override: str | None = None,
    is_user_inject: bool = False
) -> str:
    """
    1. Create DebateSession (status=running)
    2. Load conclave + agents
    3. Build DebateState (is_user_inject flag controls scenario branching)
    4. Compile + run LangGraph graph
    5. If is_user_inject: run generate_scenario_branches() concurrently
    6. Update session status=completed, summary, contrarian_activated
    7. Return session_id
    """
```

---

## 12. CALIBRATION SCORE (in app/services/debate_service.py)

```python
async def recalculate_calibration(db: AsyncSession, agent_id: str) -> float | None:
    """
    Calibration measures how well stated confidence matches actual accuracy.
    Requires minimum 5 resolved predictions to calculate.

    Algorithm:
    1. Fetch all resolved predictions for agent
    2. If < 5: return None
    3. Group into confidence buckets: [0-20), [20-40), [40-60), [60-80), [80-100]
    4. For each non-empty bucket: actual_rate = correct / total_in_bucket
    5. expected_rate = bucket midpoint (10, 30, 50, 70, 90) / 100
    6. calibration_error = abs(expected_rate - actual_rate) per bucket
    7. calibration_score = 1.0 - mean(calibration_errors)
    8. Update agent.calibration_score, return it
    """
```

---

## 13. WEBSOCKET (app/websocket/debate_ws.py)

```python
# Resolve Context7 docs for FastAPI WebSocket + redis asyncio pubsub before implementing

@router.websocket("/ws/debates/{session_id}")
async def debate_websocket(websocket: WebSocket, session_id: str, token: str = Query(...)):
    """
    1. Validate JWT (close 1008 if invalid)
    2. Accept connection
    3. Subscribe to Redis pubsub: f"debate:{session_id}"
    4. Async listen loop → forward each message as JSON to WebSocket
       Message shape: {agent_name, content, round_number, is_swarm, is_contrarian_round, timestamp}
    5. On type "debate_complete" → send it, close
    6. On WebSocketDisconnect → unsubscribe, cleanup
    """
```

---

## 14. FRONTEND DESIGN SYSTEM (Taste-Skill Applied)

### Taste-Skill Parameters for CONCLAVE
```
DESIGN_VARIANCE: 7    → Asymmetric layouts, editorial compositions, bold typography contrast
MOTION_INTENSITY: 5   → Spring animations on mount, smooth hover states, no gimmicks
VISUAL_DENSITY: 6     → Information-dense cards, compact agent feeds, Bloomberg-terminal feel
```

### Design Tokens (Tailwind + framer-motion)
```
Background:         bg-[#080810]           ← deep space black
Surface primary:    bg-[#0f0f1a]           ← dark navy
Surface secondary:  bg-[#14141f]           ← card background
Surface elevated:   bg-[#1a1a2e]           ← hover/active state
Border default:     border-[#1e1e35]
Border accent:      border-[#7c6af7]/30    ← purple with opacity
Primary text:       text-white
Secondary text:     text-[#8b8ba7]         ← muted purple-grey
Muted text:         text-[#4a4a6a]
Accent purple:      text-[#7c6af7]  bg-[#7c6af7]
Accent glow:        shadow-[0_0_20px_rgba(124,106,247,0.15)]
Success:            text-[#22d3a5]          ← teal green
Warning:            text-[#f59e0b]          ← amber
Error:              text-[#ef4444]
Swarm color:        text-[#64748b]          ← slate — visually distinct from council
Council colors:     [#7c6af7, #22d3a5, #f59e0b, #ef4444, #06b6d4]
Font display:       font-mono (agent names, labels, data)
Font body:          font-sans (readable content)
Card radius:        rounded-2xl
Button radius:      rounded-xl
Base spacing:       p-4 mobile → p-6 sm:
Transition:         transition-all duration-200 ease-out
```

### framer-motion Usage (MOTION_INTENSITY: 5)
```javascript
// Agent card entrance animation
const cardVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }
}

// Message appearance in DebateFeed
const messageVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2, ease: "easeOut" } }
}

// Page transition
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } }
}
```

### Agent Color System
```javascript
const AGENT_COLORS = ['#7c6af7', '#22d3a5', '#f59e0b', '#ef4444', '#06b6d4']
// Use agent index (0-4) in conclave.agents[] array
// Swarm stage: use #64748b (neutral slate) for all swarm messages
```

### Component Specifications

**AgentCard.jsx** — props: `{agent, color, onClick, isActive}`
```
Layout: vertical card, bg-[#0f0f1a], border border-[#1e1e35], rounded-2xl p-4
- Avatar: 40px circle, background=color, letter initial in white font-mono font-bold text-lg
- On hover: border-color transitions to color with 30% opacity + subtle shadow glow
- Name: font-mono font-semibold text-white text-sm mt-2
- Role: text-[#8b8ba7] text-xs mt-0.5
- Accuracy bar: full-width, h-1.5, bg-[#1e1e35] rounded-full, fill with color at accuracy%
- Accuracy label: text-[#4a4a6a] text-xs mt-1
- Calibration badge: if calibration_score not null, small pill showing score
- isActive: border pulses with agent color (animate-pulse-border keyframe)
```

**SwarmBrief.jsx** — props: `{swarm_summary}` (NEW — MiroFish)
```
Layout: horizontal card, bg-[#0f0f1a], border-l-4 border-[#64748b], rounded-r-2xl p-4
Header: "CROWD INTELLIGENCE" in text-[#64748b] font-mono text-xs tracking-widest uppercase
Dominant view: text-white text-sm mt-2
Minority view: text-[#8b8ba7] text-xs mt-1 italic
Sentiment split: colored pill badges (green for bullish %, red for bearish %)
Key reactions: 3 small quoted text snippets in text-[#4a4a6a] text-xs mt-2
```

**DebateFeed.jsx** — props: `{messages, agents}`
```
Group by round_number:
- Round header: "ROUND {n}" text-[#4a4a6a] font-mono text-xs uppercase + hr border-[#1e1e35]
- Swarm messages (is_swarm=true): bg-[#0f0f1a]/50, left border slate, "CROWD" label
- Council messages: left border 3px in agent color, animate in with messageVariants
- Agent name: font-mono font-semibold in agent color
- Contrarian round: yellow "⚡ CONTRARIAN PROTOCOL" badge before the round header
- Content: text-[#e2e2f0] text-sm leading-relaxed
```

**ScenarioBranches.jsx** — props: `{branches}` (NEW)
```
Layout: 3-column grid (sm: cols-3, mobile: cols-1), gap-3
Each branch card: bg-[#0f0f1a], rounded-2xl p-4
- Branch A (base): border-[#22d3a5]/30, header "BASE CASE" in teal
- Branch B (disruption): border-[#f59e0b]/30, header "DISRUPTION" in amber
- Branch C (black_swan): border-[#ef4444]/30, header "BLACK SWAN" in red
- disruption_event: italic text-[#8b8ba7] text-xs mb-2 (null for base)
- outcome_summary: text-white text-sm
- key_signal: text-[#4a4a6a] text-xs mt-2 "Signal: {key_signal}"
```

**CalibrationBadge.jsx** — props: `{score}` (NEW)
```
If score is null: return null (not enough data)
score 0.8-1.0: bg-[#22d3a5]/10 text-[#22d3a5] "Well calibrated"
score 0.5-0.8: bg-[#f59e0b]/10 text-[#f59e0b] "Moderately calibrated"
score 0-0.5: bg-[#ef4444]/10 text-[#ef4444] "Poorly calibrated"
Tooltip on hover: "Calibration measures how reliable this agent's confidence percentages are"
```

**MorningBrief.jsx** — props: `{brief}`
```
"MORNING BRIEF {date}" — text-[#4a4a6a] font-mono text-xs uppercase tracking-widest
Topic: text-white text-xl font-semibold mt-2 (or text-2xl sm:)
SwarmBrief component if swarm_summary exists
Council summary: bullets split on "•", each as text-[#c4c4d8] text-sm leading-relaxed
Key predictions: list with CalibrationBadge next to each prediction
```

---

## 15. PAGE SPECIFICATIONS

### Landing.jsx
```
Full-screen: bg-[#080810]
Centered absolutely: 
  - "CONCLAVE" text-[6rem] sm:text-[8rem] font-mono font-black text-white leading-none
  - Subtle glow: text-shadow 0 0 60px rgba(124,106,247,0.4)
  - "Your private intelligence operation." text-[#8b8ba7] font-mono text-sm mt-4 tracking-wide
  - "Working while you sleep." text-[#4a4a6a] font-mono text-xs
  - "Begin" button: bg-[#7c6af7] text-white font-mono text-sm px-8 py-3 rounded-xl mt-10
    hover: bg-[#6c5ae7], spring scale animation on click
Bottom of screen: 3 small stat pills showing "PERSISTENT MEMORY · ANTI-HERD ENGINE · CALIBRATED PREDICTIONS"
  in text-[#4a4a6a] font-mono text-xs
```

### Dashboard.jsx
```
Mobile layout (full-width, stacked):
  Top: MorningBrief card
  Middle: "YOUR COUNCIL" label + horizontal scroll row of 5 AgentCards
  Bottom: Recent debates list (topic + date + agent accuracy summary)
Desktop layout (sm:):
  Left 2/3: MorningBrief + recent debates
  Right 1/3: sticky agent council column
  
"Inject Scenario" floating button: fixed bottom-right on mobile
  bg-[#7c6af7], rounded-full, shadow-[0_0_30px_rgba(124,106,247,0.3)]
```

### Chamber.jsx
```
Header: topic bold white, "Debate #{id}" in text-[#4a4a6a] font-mono text-xs
If session is live: green pulsing dot + "LIVE" badge
If is_user_inject: ScenarioBranches component below header
SwarmBrief component (if swarm_summary exists): collapsible, default collapsed on mobile
DebateFeed: main content, occupies most of screen
Bottom: predictions list (agent name, claim, confidence badge, outcome badge)
```

### AgentProfile.jsx
```
Agent color as left accent throughout
Large avatar (80px circle) + name (font-mono text-2xl) + role (text-[#8b8ba7])
Two stat cards: Accuracy (%) + Calibration (badge)
"Past Predictions" section: paginated, sortable
"Message {name}" button: opens inline message panel at bottom
Message input: dark bg, purple border on focus, send button
Agent response appears with typing indicator (3 animated dots, framer-motion)
```

### Inject.jsx
```
Centered layout, max-w-2xl
"Throw a scenario at your council." — large heading
Textarea: dark bg, border-[#1e1e35] focus:border-[#7c6af7], min-h-32, resizable
Below textarea: "Your council will simulate crowd reaction, then debate 3 futures." — helper text
"Convene Now" button: full-width, bg-[#7c6af7] 
On submit: 3 ScenarioBranch skeleton cards appear, then redirect to Chamber
```

### Discover.jsx
```
"DISCOVER" header + search input
Feed of public Conclaves sorted by follower_count
Each card: conclave name, domain badge, follower count, top agent accuracy, latest brief topic
Follow button: outline style, changes to filled on follow (optimistic update)
```

---

## 16. ZUSTAND STORES

### authStore.js
```javascript
{
  user: null | {user_id, username, email, domain},
  token: null | string,
  isAuthenticated: boolean,
  login: (userData, token) => void,
  logout: () => void,
  loadFromStorage: () => void,  // localStorage on init
}
```

### conclaveStore.js
```javascript
{
  conclave: null | {id, name, domain, agents[], is_public, follower_count},
  brief: null | {topic, swarm_summary, council_summary, key_predictions[], debate_date},
  documents: [],
  setConclave: (c) => void,
  setBrief: (b) => void,
  addDocument: (doc) => void,
  updateAgentAccuracy: (agentId, accuracy, calibration) => void,
}
```

### debateStore.js
```javascript
{
  activeSession: null | {id, topic, status, is_user_inject},
  liveMessages: [],
  branches: [],
  swarmSummary: null,
  isLive: boolean,
  currentStage: 'swarm' | 'council' | 'complete',
  startLiveDebate: (session) => void,
  addMessage: (msg) => void,
  setSwarmSummary: (s) => void,
  setBranches: (b) => void,
  endDebate: (summary) => void,
}
```

---

## 17. API CLIENT (frontend/src/api/client.js)
```javascript
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const client = axios.create({ baseURL: '/api/v1', timeout: 30000 })

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export default client
```

---

## 18. TDD BUILD PHASES

### PHASE 0 — Superpowers + Taste-Skill Setup
```bash
# Install all skills
/plugin install superpowers@claude-plugins-official
/plugin marketplace add Leonxlnx/taste-skill
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill

# Install LiteLLM globally
pip install litellm

# Verify Superpowers
# Ask: "What are my superpowers?" — must see all 7 skills
```

### PHASE 1 — Infrastructure + LiteLLM Setup
**Invoke**: `writing-plans` before starting
```bash
# Create full project structure
mkdir -p conclave && cd conclave
# Create all directories from Section 1

# Start Docker infra
docker compose up -d && docker compose ps

# Setup Python env
cd backend && python3.11 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Create litellm.config.yaml at project root (exact content from SRS Section 9)

# Start LiteLLM proxy (in a separate terminal)
litellm --config ../litellm.config.yaml --port 4000

# Verify LiteLLM
curl http://localhost:4000/health
# Must return: {"status": "healthy"}

# Test a call through LiteLLM
curl -X POST http://localhost:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-conclave-local" \
  -d '{"model": "council-model", "messages": [{"role": "user", "content": "ping"}]}'
# Must return a valid response

# Start backend
uvicorn app.main:app --reload --port 8000
curl http://localhost:8000/health
```
**GATE**: LiteLLM returns healthy. Backend health returns `{"status":"ok","version":"3.0.0"}` ✓

### PHASE 2 — Database Models
**Invoke**: `writing-plans` · `using-git-worktrees`
**Context7**: resolve `sqlalchemy asyncio mapped_column`, `alembic async`
```bash
# Create all model files (Sections 4 + SRS Section 6 data models)
# init alembic, modify env.py
alembic revision --autogenerate -m "initial_v3"
alembic upgrade head
docker exec conclave_postgres psql -U conclave_user -d conclave_db -c "\dt"
```
**GATE**: All 10 tables present in psql ✓

### PHASE 3 — Auth (TDD)
**Invoke**: `test-driven-development` (mandatory, no exceptions)
**Context7**: resolve `fastapi security`, `python-jose jwt`, `passlib bcrypt`

Write `tests/conftest.py` first. Write `tests/test_auth.py` next. Run — confirm RED.
Implement `app/services/auth_service.py` + `app/routers/auth.py`.
Run — confirm GREEN.

**GATE**: All auth tests GREEN ✓

### PHASE 4 — Conclave + Agent Generation (TDD)
**Invoke**: `test-driven-development` · `brainstorming` before generator design
**Context7**: resolve `litellm acompletion`, `chromadb HttpClient`, `networkx`

Write `tests/test_conclaves.py` first. Run RED.
Implement:
- `app/agents/generators/conclave_generator.py` (GENERATOR_PROMPT, parse JSON, fallback 5 hardcoded agents if LLM fails)
- `app/agents/memory.py` (ChromaDB operations)
- `app/agents/knowledge_graph.py` (NetworkX graph, create empty graph on conclave creation)
- `app/services/conclave_service.py`
- `app/routers/conclaves.py`
Run — confirm GREEN.

**GATE**: All conclave tests GREEN ✓

### PHASE 5 — Swarm Engine (TDD — MiroFish Integration)
**Invoke**: `brainstorming` before swarm design · `test-driven-development`
**Context7**: resolve `asyncio.gather`, `litellm acompletion`

Write `tests/test_swarm.py` first:
```python
@pytest.mark.asyncio
async def test_swarm_returns_summary(conclave_fixture):
    from app.agents.swarm import run_swarm
    result = await run_swarm("Federal Reserve rate decision", "trading", "Fed holds rates steady", n_agents=5)
    assert "dominant_view" in result
    assert "minority_view" in result
    assert "sentiment_split" in result
    assert isinstance(result["key_reactions"], list)
    assert len(result["key_reactions"]) >= 1
```
Run RED. Implement `app/agents/swarm.py`. Run GREEN.

**GATE**: Swarm test GREEN ✓

### PHASE 6 — LangGraph Debate Engine (TDD)
**Invoke**: `brainstorming` before graph design · `test-driven-development` · `subagent-driven-development`
**Context7**: resolve `langgraph StateGraph conditionalEdges`, `apscheduler AsyncIOScheduler`, `redis asyncio pubsub`

Write `tests/test_debates.py`:
```python
@pytest.mark.asyncio
async def test_full_debate_cycle(conclave_id_fixture):
    from app.agents.scheduler import run_debate_cycle
    from app.database import AsyncSessionLocal
    from app.models.debate import DebateSession, DebateMessage

    session_id = await run_debate_cycle(conclave_id_fixture)

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(DebateSession).where(DebateSession.id == session_id))
        session = result.scalar_one()
        assert session.status == "completed"
        assert session.summary is not None
        assert session.swarm_summary is not None      # swarm ran
        assert "dominant_view" in session.swarm_summary

        msgs = await db.execute(select(DebateMessage).where(DebateMessage.session_id == session_id))
        all_msgs = msgs.scalars().all()
        swarm_msgs = [m for m in all_msgs if m.is_swarm]
        council_msgs = [m for m in all_msgs if not m.is_swarm]
        assert len(swarm_msgs) >= 5    # swarm produced messages
        assert len(council_msgs) >= 5  # council debated
```
Run RED. Implement all 8 nodes + graph edges + `app/agents/scheduler.py`. Run GREEN.

**GATE**: Both debate tests GREEN ✓

### PHASE 7 — Contrarian Protocol + Calibration + Scenario Branches (TDD)
Write tests:
- `test_contrarian_protocol_activates_on_consensus` — mock 4 agents same direction, verify contrarian fires
- `test_calibration_score_calculated_after_5_predictions` — resolve 5 predictions, check calibration_score not null
- `test_scenario_branches_generated_on_inject` — inject scenario, verify 3 ScenarioBranch records

RED → Implement → GREEN

**GATE**: All 3 tests GREEN ✓

### PHASE 8 — Agent Messaging + Documents (TDD)
**Context7**: resolve `chromadb query`, `networkx shortest_path`

Write tests:
- `test_agent_responds_in_character` 
- `test_document_feed_adds_to_knowledge_graph` — add document, check graph node count increased

RED → Implement → GREEN

### PHASE 9 — WebSocket + Feed (TDD)
Write tests:
- `test_websocket_streams_messages_during_debate`
- `test_public_feed_returns_without_auth`

RED → Implement → GREEN

### PHASE 10 — Full Backend Verification
**Invoke**: `verification-before-completion`
```bash
pytest tests/ -v --tb=short
# ALL tests must be GREEN. If any fail: invoke systematic-debugging immediately.
```
**GATE**: 100% GREEN ✓

### PHASE 11 — Frontend Setup
**Invoke**: `writing-plans`
**Context7**: resolve `vite-plugin-pwa`, `zustand v5 create`, `react-router-dom v7`, `framer-motion`

```bash
cd frontend
npm create vite@latest . -- --template react
npm install react@18.3.1 react-dom@18.3.1
npm install -D vite@5.4.11 @vitejs/plugin-react@4.3.4 tailwindcss@3.4.17 postcss autoprefixer
npm install -D vite-plugin-pwa@0.21.1 vitest@2.1.8
npm install -D @testing-library/react@16.1.0 @testing-library/jest-dom@6.6.3
npm install zustand@5.0.2 @tanstack/react-query@5.62.7
npm install react-router-dom@7.0.2 socket.io-client@4.8.1 axios@1.7.9
npm install framer-motion@11.0.0
npx tailwindcss init -p
npm run dev  # must show localhost:5173
```

Create `vite.config.js` and `tailwind.config.js` (exact content from SRS equivalent sections).

### PHASE 12 — Frontend Core (API + Stores + Components)
**Invoke**: `subagent-driven-development` · `test-driven-development` for components

Build order (strict):
1. `src/api/client.js` + all endpoint files
2. `src/store/` — all 3 stores
3. `src/router.jsx` + `src/App.jsx`
4. `src/components/Layout/Layout.jsx` — bottom nav
5. Write test first, then implement each component:
   - AgentCard → DebateFeed → SwarmBrief → MorningBrief → ScenarioBranches → CalibrationBadge

**GATE**: All component tests GREEN. `npm test` fully passes ✓

### PHASE 13 — Frontend Pages (Taste-Skill Applied)
**Invoke**: `subagent-driven-development`

Before building each page, read the Taste-Skill SKILL.md and apply parameters:
```
DESIGN_VARIANCE: 7, MOTION_INTENSITY: 5, VISUAL_DENSITY: 6
```

Build order: Landing → Onboarding → Dashboard → Chamber → AgentProfile → Inject → Documents → Discover

**For each page**: Taste-Skill generates the visual design first, then implement to match.

**GATE**: All 8 pages render without console errors. Full onboarding flow works end-to-end. ✓

### PHASE 14 — PWA + Final Verification
**Invoke**: `verification-before-completion`

```bash
# Build
cd frontend && npm run build

# Full test suite
cd backend && pytest tests/ -v
cd frontend && npm test

# Manual checks:
# 1. Register → domain → summon agents → see 5 unique agents
# 2. Manual trigger of debate cycle → morning brief appears
# 3. Direct agent message → in-character response
# 4. Inject scenario → 3 branches appear + live WebSocket stream
# 5. Document feed → add a URL → next debate references it
# 6. Chrome DevTools PWA → no errors
# 7. Test on 375px viewport → mobile layout correct
```

**GATE**: All tests GREEN + all 7 manual checks pass ✓

---

## 19. COMPLETE COMMAND REFERENCE

```bash
# Infrastructure
docker compose up -d                               # start Postgres, Redis, ChromaDB
litellm --config litellm.config.yaml --port 4000  # start LLM proxy (separate terminal)
docker compose ps                                  # verify running

# Backend
cd backend && source .venv/bin/activate
uvicorn app.main:app --reload --port 8000          # start dev server
alembic upgrade head                               # apply migrations
pytest tests/ -v --tb=short                        # all tests

# Frontend
cd frontend && npm run dev                         # dev server port 5173
npm test                                           # vitest
npm run build                                      # production build

# LiteLLM health check
curl http://localhost:4000/health
curl http://localhost:8000/health
```

---

*End of SDD v3.0 FINAL*
