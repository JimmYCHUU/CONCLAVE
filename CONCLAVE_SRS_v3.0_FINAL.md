# CONCLAVE — Software Requirements Specification v3.0 FINAL
**Date**: May 2026 | **Status**: Agent-Ready | **Methodology**: Superpowers + Taste-Skill + TDD + Context7

---

## ⚠️ AGENT OPERATING RULES — READ FIRST, NO EXCEPTIONS

### Required Skills Stack
Install ALL before touching any file:
```
/plugin install superpowers@claude-plugins-official
/plugin marketplace add Leonxlnx/taste-skill
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
```

### Superpowers Trigger Map
| Skill | Trigger Condition |
|---|---|
| `brainstorming` | Before designing any new component, service, or graph node |
| `writing-plans` | Before starting each SDD Phase |
| `subagent-driven-development` | Any phase with >2 tasks |
| `test-driven-development` | Before EVERY function, route, component — no exceptions |
| `systematic-debugging` | Any test failure, connection error, or unexpected output |
| `verification-before-completion` | Before marking any phase done |
| `using-git-worktrees` | After project structure is created, before first code |

### Taste-Skill Settings for CONCLAVE
CONCLAVE is a premium dark intelligence dashboard. Apply these parameters globally:
- `DESIGN_VARIANCE: 7` — asymmetric, modern, editorial layouts
- `MOTION_INTENSITY: 5` — smooth hover + transition animations, no gimmicks
- `VISUAL_DENSITY: 6` — information-dense but not cluttered, like a Bloomberg terminal

### Context7 MCP — Mandatory Before Any Library Usage
```
use context7 to resolve: fastapi, sqlalchemy asyncio, langgraph, langchain-google-genai,
langchain-groq, litellm, chromadb, redis-py async, apscheduler, networkx,
react-query v5, zustand v5, react-router-dom v7, vite-plugin-pwa, socket.io-client
```

### Coding Rules (Non-Negotiable)
- TDD: Test FAILS first. Then implement. Then GREEN. Always.
- YAGNI: Only what SRS specifies.
- DRY: No duplicate logic anywhere.
- Async all the way: Every DB, LLM, Redis, and HTTP call is `async/await`.
- Type annotations on every Python function.
- All secrets in `.env` only. Zero hardcoded values.
- Response contract: `{data: ..., error: null}` on success · `{data: null, error: {code, detail}}` on failure.

---

## 1. PRODUCT VISION

**CONCLAVE** is a web-based PWA that gives every user a permanent society of 5 named AI analyst agents. These agents debate real-world events autonomously every 6 hours. Every morning the user receives a Morning Brief — what their private council argued about overnight. Under the hood, each debate is powered by a two-layer intelligence system:

1. **The Swarm** (MiroFish-inspired): 20 anonymous stakeholder agents simulate crowd reaction to the news topic in minutes
2. **The Council**: Your 5 named expert agents read the swarm summary and debate what it means — like real analysts watching market sentiment

The council also has a persistent knowledge graph that grows over time, an anti-herd Contrarian Protocol that fires when agents converge too quickly, per-agent calibration scoring, and scenario branching (3 parallel futures per injection).

**One sentence**: CONCLAVE is the first AI product where your agents are the asset — a permanent, self-improving intelligence operation that works 24/7 and gets smarter every day.

---

## 2. SYSTEM CONSTRAINTS

| Constraint | Value |
|---|---|
| Development machine | Dell laptop, 8GB RAM |
| Local infrastructure | Docker Compose: Postgres + Redis + ChromaDB only |
| Backend + Frontend | Run locally (not in Docker) to preserve RAM |
| **LLM Primary** | **Google AI Studio — Gemini 2.0 Flash (free, 1500 req/day, 1M context)** |
| **LLM Secondary** | **Groq — Llama 3.3 70B (free, 14,400 req/day, fastest inference)** |
| **LLM Tertiary fallback** | **Ollama — llama3.2:3b (local, already installed, zero cost)** |
| **LLM Proxy** | **LiteLLM (open-source, free, handles failover automatically)** |
| OpenRouter | Available but NOT used as primary — too unreliable |
| Total Docker RAM target | ≤ 1.8GB |
| UI Skills | Taste-Skill (Leonxlnx) + ui-ux-pro-max-skill + Superpowers |
| Coding agent | VS Code Copilot Student (Auto mode) |

### LiteLLM Multi-Provider Strategy
LiteLLM runs as a local process (not Docker) on port 4000. It provides a single OpenAI-compatible endpoint. All backend code calls only `http://localhost:4000`. LiteLLM routes internally:

```
Request → LiteLLM (port 4000)
           ├── Try: Google AI Studio (gemini/gemini-2.0-flash) → 1,500 req/day
           ├── Fallback 1: Groq (groq/llama-3.3-70b-versatile) → 14,400 req/day
           └── Fallback 2: Ollama (ollama/llama3.2:3b) → unlimited local
```

**Swarm agents** (cheap, fast, many) route to Groq specifically.
**Council agents** (quality, context-heavy) route to Gemini.
**Offline/dev mode** uses Ollama only.

---

## 3. FUNCTIONAL REQUIREMENTS

---

### FR-001 — User Registration
**AC-001-1**: `POST /api/v1/auth/register` with `{email, username, password, domain}` → `201` with `{data: {user_id, username, email, access_token}}`
**AC-001-2**: Duplicate email → `409 {error: {code: "EMAIL_EXISTS"}}`
**AC-001-3**: Duplicate username → `409 {error: {code: "USERNAME_TAKEN"}}`
**AC-001-4**: Password stored as bcrypt hash. Never plaintext.
**AC-001-5**: JWT token, 24h expiry, signed with `JWT_SECRET_KEY`.

---

### FR-002 — User Login
**AC-002-1**: `POST /api/v1/auth/login` → `200 {data: {access_token, user_id, username}}`
**AC-002-2**: Wrong credentials → `401 {error: {code: "INVALID_CREDENTIALS"}}`

---

### FR-003 — Conclave Creation (LLM Agent Generation)
**AC-003-1**: `POST /api/v1/conclaves/` → `201` with conclave + 5 agents
**AC-003-2**: Each agent has: `{id, name, role, bias_description, accuracy_score: 0.5, calibration_score: null, total_predictions: 0, correct_predictions: 0}`
**AC-003-3**: Agents generated by LLM using `GENERATOR_PROMPT` (defined in SDD)
**AC-003-4**: Second conclave → `409 {error: {code: "CONCLAVE_EXISTS"}}`
**AC-003-5**: Each agent's identity embedded into ChromaDB collection `agent_{id}` with `memory_type = "identity"`
**AC-003-6**: Empty knowledge graph JSON file created at `data/graphs/{conclave_id}.json`

---

### FR-004 — Scheduled Debate Cycle (2-Layer: Swarm + Council)
**AC-004-1**: APScheduler fires at 06:00, 12:00, 18:00, 00:00 daily for every conclave
**AC-004-2**: Each cycle runs a 2-stage pipeline: **Stage 1 Swarm** then **Stage 2 Council**
**AC-004-3**: Stage 1 — Swarm (20 anonymous agents, Groq-powered):
  - Auto-generates 20 stakeholder personas relevant to topic and domain
  - Runs 2 simulation rounds on a simulated feed
  - Produces `swarm_summary`: {dominant_view, minority_view, sentiment_split, key_reactions[]}
**AC-004-4**: Stage 2 — Council (5 named agents, Gemini-powered):
  - Each agent receives the swarm_summary before debating
  - Runs 3 debate rounds
  - Contrarian Protocol activates if ≥4 agents converge (see FR-014)
**AC-004-5**: All debate messages stored in `debate_messages` table, published to Redis `debate:{session_id}`
**AC-004-6**: Session `status` → `"completed"`, `summary` stored after graph finishes
**AC-004-7**: Predictions extracted and stored with `outcome = "pending"`
**AC-004-8**: 06:00 cycle sets `is_morning_brief = True` on the session

---

### FR-005 — Morning Brief
**AC-005-1**: `GET /api/v1/conclaves/{id}/brief` → latest session with `is_morning_brief=True` and `status="completed"`. Includes `{topic, swarm_summary, council_summary, key_predictions[], debate_date}`
**AC-005-2**: No brief yet → `{data: {brief: null, message: "Your Conclave assembles. First briefing at 06:00."}}`
**AC-005-3**: `GET /api/v1/conclaves/{id}/brief/history?page=1` → paginated, 10/page, newest first

---

### FR-006 — Full Debate Transcript
**AC-006-1**: `GET /api/v1/debates/{session_id}` → `{session_id, topic, swarm_summary, messages[], summary, predictions[]}` ordered `round_number ASC, created_at ASC`
**AC-006-2**: Own or public conclave only. Others → `403`
**AC-006-3**: `GET /api/v1/conclaves/{id}/debates?page=1` → paginated, 10/page

---

### FR-007 — Live Debate WebSocket
**AC-007-1**: `WS /ws/debates/{session_id}?token=<jwt>` — authenticated connection
**AC-007-2**: Each new message DB insert → Redis publish → WebSocket client receives `{agent_name, content, round_number, is_swarm, timestamp}`
**AC-007-3**: `is_swarm: true` on swarm stage messages, `false` on council stage
**AC-007-4**: Completion → `{type: "debate_complete", summary: "..."}` → close

---

### FR-008 — Direct Agent Messaging
**AC-008-1**: `POST /api/v1/conclaves/{cid}/agents/{aid}/message` → `200 {data: {agent_name, response, timestamp}}`
**AC-008-2**: Response uses agent persona + top 5 ChromaDB memories + knowledge graph context for the topic + user message
**AC-008-3**: Both messages stored in `agent_memories` with `memory_type = "direct_message"`
**AC-008-4**: LLM timeout 12s → `503 {error: {code: "AGENT_BUSY"}}`
**AC-008-5**: Agent never breaks character. Never calls itself AI. Enforced in system prompt.

---

### FR-009 — Scenario Injection
**AC-009-1**: `POST /api/v1/conclaves/{id}/inject` → `202 {data: {session_id, status: "queued"}}`
**AC-009-2**: Full 2-stage pipeline (Swarm + Council) runs as background task
**AC-009-3**: Scenario injection automatically generates 3 parallel scenario branches (see FR-015)
**AC-009-4**: Active debate running → `409 {error: {code: "DEBATE_IN_PROGRESS"}}`
**AC-009-5**: User connects `WS /ws/debates/{session_id}` to watch live

---

### FR-010 — Prediction Tracking + Calibration
**AC-010-1**: `GET /api/v1/conclaves/{id}/predictions?outcome=pending&page=1` → paginated, 20/page
**AC-010-2**: `PATCH /api/v1/predictions/{id}/resolve` with `{outcome: "correct"|"incorrect"}` → updates outcome + recalculates accuracy + recalculates calibration score
**AC-010-3**: Calibration score formula: for each confidence bucket (0-20%, 20-40%, etc.), `|stated_confidence - actual_accuracy_in_bucket|`. Perfect = 0. Stored as float 0.0–1.0 (lower = better).
**AC-010-4**: Agent profile endpoint returns both `accuracy_score` and `calibration_score`

---

### FR-011 — Public Conclave Feed
**AC-011-1**: `PATCH /api/v1/conclaves/{id}` with `{is_public: true}` → makes discoverable
**AC-011-2**: `GET /api/v1/feed?page=1` → public conclaves with `{name, domain, follower_count, latest_brief_summary, top_agent_accuracy, top_agent_calibration}`, sorted `follower_count DESC`. No auth required.
**AC-011-3**: `POST /api/v1/feed/{cid}/follow` → adds follower, increments count. Auth required.

---

### FR-012 — PWA
**AC-012-1**: `manifest.json` with `name: "CONCLAVE"`, `display: "standalone"`, `background_color: "#080810"`, `theme_color: "#7c6af7"`
**AC-012-2**: Service worker caches app shell via `vite-plugin-pwa`
**AC-012-3**: Chrome DevTools → Application → Manifest: no errors. Service Workers: active.

---

### FR-013 — Document Feed (MiroFish Knowledge Injection)
**AC-013-1**: `POST /api/v1/conclaves/{id}/documents` accepts `{url?: str, text?: str}` — at least one required
**AC-013-2**: System extracts entities and relationships via LLM (GraphRAG-lite). Saves to `data/graphs/{conclave_id}.json` using NetworkX JSON format.
**AC-013-3**: Extracted entities are also embedded into each agent's ChromaDB collection with `memory_type = "document_feed"` and `importance_score = 0.8`
**AC-013-4**: Document is summarized and shown in a "Documents" tab on Dashboard
**AC-013-5**: Agents reference document knowledge in the next debate cycle automatically

---

### FR-014 — Anti-Herd Contrarian Protocol
**AC-014-1**: After each round in the Council stage, the moderator node checks consensus: if ≥4 agents express the same directional position (detected via LLM sentiment check), Contrarian Protocol activates
**AC-014-2**: The agent with lowest current accuracy_score is assigned `role_override = "contrarian"` for 1 additional round
**AC-014-3**: Contrarian agent's system prompt is modified to argue the strongest possible case for the minority position, regardless of their persona bias
**AC-014-4**: In the transcript, this round is marked `is_contrarian_round: true`
**AC-014-5**: `debate_sessions.contrarian_activated: bool` is stored for user visibility

---

### FR-015 — Scenario Branching (3 Futures)
**AC-015-1**: On user injection (FR-009), system automatically generates 3 scenario variants:
  - **Branch A — Base**: Topic as-is. Current trajectory continues.
  - **Branch B — Disruption**: One major unexpected event injected (auto-generated by LLM)
  - **Branch C — Black Swan**: Tail risk scenario (auto-generated)
**AC-015-2**: Each branch runs a 1-round swarm simulation (5 agents, Groq-powered, fast)
**AC-015-3**: All 3 branch outcomes stored in `scenario_branches` table linked to the parent session
**AC-015-4**: `GET /api/v1/debates/{session_id}/branches` → `{branches: [{type, outcome_summary, key_signal}]}`
**AC-015-5**: Displayed in Chamber page as a 3-column "Future Branches" section

---

## 4. NON-FUNCTIONAL REQUIREMENTS

| ID | Requirement |
|---|---|
| NFR-001 | `docker compose up -d` starts all infra. `litellm --config litellm.config.yaml` starts proxy. |
| NFR-002 | Docker RAM ≤ 1.8GB |
| NFR-003 | All secrets in `.env`. Zero hardcoded values. |
| NFR-004 | All endpoints except register, login, GET /feed require JWT auth |
| NFR-005 | CORS: `http://localhost:5173` in dev |
| NFR-006 | All DB calls async SQLAlchemy. No sync. |
| NFR-007 | All LLM calls: 30s timeout, 1 retry. LiteLLM handles failover. |
| NFR-008 | Mobile-first. 375px base, scales up with `sm:` |
| NFR-009 | Tailwind only. No Bootstrap, MUI, Chakra. |
| NFR-010 | Response contract: `{data, error}` always. |
| NFR-011 | Every Python function has type annotations |
| NFR-012 | Every React component is functional with hooks |
| NFR-013 | Taste-Skill applied to every frontend component and page |

---

## 5. UX FLOWS

### Onboarding
1. Landing: black bg, "CONCLAVE" centered in font-mono. "Your private intelligence operation." "Begin" button.
2. Register: email, username, password. No friction.
3. Domain: 4 large tap-friendly cards (Trading · Startup · Research · General)
4. Name: "Name your Conclave" — e.g. "Alpha Chamber"
5. Summoning: pulsing animation, "Convening your council..." LLM generates agents.
6. Reveal: 5 agent cards appear sequentially with name, role, bias in 1 line.
7. First Dashboard: "Your council is assembled. First briefing at 06:00."

### Morning Return
1. Dashboard: Morning Brief card at top (topic bold, 3-bullet council summary, swarm sentiment badge)
2. Below brief: 5 Agent Cards showing latest position + accuracy + calibration badge
3. "Read full debate" → Chamber (transcript + swarm stage + council stage visually separated)

### Injection
1. Inject tab → text area "Throw a scenario at your council"
2. Submit → 3 Future Branches appear as cards while debate loads
3. Live WebSocket: swarm stage messages appear first (fast, labeled "CROWD"), then council (labeled with agent names)
4. After completion: summary + calibration update banner

---

## 6. DATA MODELS

```
users:              id, email, username, hashed_password, domain, created_at
conclaves:          id, user_id, name, domain, is_public, follower_count, created_at
agents:             id, conclave_id, name, role, personality_prompt, bias_description,
                    accuracy_score(float,0.5), calibration_score(float,null),
                    total_predictions(int,0), correct_predictions(int,0), created_at
debate_sessions:    id, conclave_id, topic, triggered_by, status, swarm_summary(json),
                    summary, is_morning_brief(bool), contrarian_activated(bool), created_at, completed_at
debate_messages:    id, session_id, agent_id(nullable for swarm), content, round_number,
                    is_swarm(bool), is_contrarian_round(bool), created_at
agent_memories:     id, agent_id, memory_type, content, importance_score, chroma_doc_id, created_at
predictions:        id, session_id, agent_id, claim, confidence, outcome, resolved_at, created_at
scenario_branches:  id, session_id, branch_type(base|disruption|black_swan),
                    disruption_event(nullable), outcome_summary, key_signal, created_at
conclave_followers: id, follower_user_id, conclave_id, followed_at
conclave_documents: id, conclave_id, source_url(nullable), content_preview, entity_count, created_at
```

---

## 7. TECH STACK (EXACT VERSIONS)

### Python Backend
```
python==3.11
fastapi==0.115.6            uvicorn[standard]==0.32.1
sqlalchemy[asyncio]==2.0.36  asyncpg==0.30.0
alembic==1.14.0             pydantic==2.10.4
pydantic-settings==2.7.0    python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4      python-multipart==0.0.20
langgraph==0.2.60           langchain-google-genai==2.0.7
langchain-groq==0.2.3       langchain-community==0.3.14
litellm==1.52.0             chromadb==0.5.23
redis==5.2.1                apscheduler==3.10.4
networkx==3.4.2             httpx==0.28.1
pytest==8.3.4               pytest-asyncio==0.25.0
```

### Node/React Frontend
```
react@18.3.1                react-dom@18.3.1
vite@5.4.11                @vitejs/plugin-react@4.3.4
tailwindcss@3.4.17          vite-plugin-pwa@0.21.1
zustand@5.0.2              @tanstack/react-query@5.62.7
react-router-dom@7.0.2     socket.io-client@4.8.1
axios@1.7.9                vitest@2.1.8
@testing-library/react@16.1.0  @testing-library/jest-dom@6.6.3
framer-motion@11.0.0
```

Note: `framer-motion` for Taste-Skill's motion system (MOTION_INTENSITY: 5 requires spring animations).

---

## 8. ENVIRONMENT VARIABLES (.env)

```bash
# LiteLLM proxy (always use this — never call LLM providers directly)
LITELLM_BASE_URL=http://localhost:4000
LITELLM_API_KEY=sk-conclave-local

# Google AI Studio (primary LLM — free tier, 1500 req/day)
GOOGLE_API_KEY=your_google_ai_studio_key_here
GEMINI_MODEL=gemini/gemini-2.0-flash

# Groq (secondary LLM — swarm agents, 14400 req/day)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=groq/llama-3.3-70b-versatile

# Ollama (tertiary fallback — local, no limit)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=ollama/llama3.2:3b

# Database
DATABASE_URL=postgresql+asyncpg://conclave_user:conclave_pass@localhost:5432/conclave_db

# Redis
REDIS_URL=redis://localhost:6379

# ChromaDB
CHROMA_HOST=localhost
CHROMA_PORT=8001

# Auth
JWT_SECRET_KEY=replace_with_random_32_char_string
JWT_ALGORITHM=HS256
JWT_EXPIRY_HOURS=24

# News
GNEWS_API_KEY=your_gnews_key_here

# App
ENVIRONMENT=development
```

---

## 9. LiteLLM CONFIG (litellm.config.yaml — project root)

```yaml
model_list:
  # Council agents use Gemini (quality, large context)
  - model_name: council-model
    litellm_params:
      model: gemini/gemini-2.0-flash
      api_key: os.environ/GOOGLE_API_KEY
      timeout: 30
      num_retries: 1

  # Swarm agents use Groq (speed, high volume)
  - model_name: swarm-model
    litellm_params:
      model: groq/llama-3.3-70b-versatile
      api_key: os.environ/GROQ_API_KEY
      timeout: 15
      num_retries: 1

  # Offline fallback
  - model_name: fallback-model
    litellm_params:
      model: ollama/llama3.2:3b
      api_base: http://localhost:11434
      timeout: 60

router_settings:
  routing_strategy: fallback
  fallbacks:
    - council-model: [swarm-model, fallback-model]
    - swarm-model: [council-model, fallback-model]
```

---

*End of SRS v3.0 FINAL*
