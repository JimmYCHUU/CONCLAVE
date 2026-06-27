# CONCLAVE — VS Code Copilot Master Prompt v3.0
# ═══════════════════════════════════════════════════════════════════
# HOW TO USE THIS:
# 1. Open VS Code Copilot Agent chat
# 2. Attach CONCLAVE_SRS_v3.0_FINAL.md as context
# 3. Attach CONCLAVE_SDD_v3.0_FINAL.md as context
# 4. Copy EVERYTHING below this header and paste into the chat
# 5. Hit send. Follow phase gates as they complete.
# ═══════════════════════════════════════════════════════════════════

You are building CONCLAVE — a full-stack AI-powered web application. I have attached two context documents as your single source of truth: SRS v3.0 FINAL (requirements) and SDD v3.0 FINAL (build manual). Do not deviate from them. Do not add features not in the SRS. Do not skip phases.

---

## STEP 0 — INSTALL ALL SKILLS BEFORE ANYTHING ELSE

Run these plugin installs now. Do not proceed until all are confirmed:

```
/plugin install superpowers@claude-plugins-official
/plugin marketplace add Leonxlnx/taste-skill
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
```

Confirm installation by asking yourself: "What are my superpowers?" and "What does Taste-Skill do?"

You must see these Superpowers skills:
- brainstorming
- test-driven-development
- subagent-driven-development
- writing-plans
- systematic-debugging
- verification-before-completion
- using-git-worktrees

You must see Taste-Skill with its 3 parameters: DESIGN_VARIANCE, MOTION_INTENSITY, VISUAL_DENSITY.

**Do not proceed until all skills are confirmed installed.**

---

## STEP 1 — CONTEXT7 MCP SETUP

Before writing any code that uses a library, resolve its current documentation via Context7. Do this now for all libraries used in CONCLAVE:

```
use context7 to resolve docs for: fastapi, sqlalchemy asyncio, alembic async,
langgraph StateGraph, litellm acompletion, langchain-google-genai, langchain-groq,
chromadb HttpClient, redis-py async pubsub, apscheduler AsyncIOScheduler CronTrigger,
networkx, react-query v5, zustand v5 create, react-router-dom v7,
vite-plugin-pwa, framer-motion, socket.io-client
```

Reference these results whenever using any of these libraries. Never guess at API signatures.

---

## STEP 2 — YOUR OPERATING RULES (NON-NEGOTIABLE FOR EVERY TASK)

### Superpowers Trigger Rules:
- **`brainstorming`**: invoke before designing any new component, LangGraph node, or service
- **`writing-plans`**: invoke before starting any SDD Phase
- **`subagent-driven-development`**: invoke for any phase with more than 2 tasks
- **`test-driven-development`**: invoke before implementing ANY function, route, or component — no exceptions
- **`systematic-debugging`**: invoke IMMEDIATELY on any test failure, service connection error, or unexpected output
- **`verification-before-completion`**: invoke before declaring any phase done
- **`using-git-worktrees`**: invoke after project structure exists, before first code file

### Taste-Skill Rules:
Apply these parameters to every frontend component and page:
- `DESIGN_VARIANCE: 7` — asymmetric, editorial layouts
- `MOTION_INTENSITY: 5` — spring animations on mount, smooth hover states
- `VISUAL_DENSITY: 6` — information-dense, Bloomberg-terminal aesthetic

Never generate a generic looking UI. Every component must follow the exact design tokens in SDD Section 14.

### TDD Rules (Iron Law):
1. Write the test file FIRST
2. Run it — confirm it FAILS (RED) — explicitly state "Tests are RED"
3. Write implementation
4. Run again — confirm it PASSES (GREEN) — explicitly state "Tests are GREEN"
5. NEVER write implementation before the test. No exceptions. Ever.

### Code Quality Rules:
- YAGNI: only what the SRS specifies
- DRY: extract any logic written more than once
- All Python functions have type annotations
- All async operations use async/await
- All secrets via `.env` + `app/config.py` only — zero hardcoded values
- All API responses: `{data: ..., error: null}` on success · `{data: null, error: {code, detail}}` on error
- All LLM calls through LiteLLM proxy only — never call Google or Groq directly

### LLM Usage Rules:
- Council agents (quality): use `model="council-model"` via `call_council_llm()`
- Swarm agents (speed/volume): use `model="swarm-model"` via `call_swarm_llm()`
- Never call Google AI Studio or Groq APIs directly — always go through LiteLLM on port 4000

---

## STEP 3 — EXECUTE PHASES IN STRICT ORDER

After each phase, explicitly tell me the GATE result before proceeding.

---

### PHASE 0 — Superpowers + Taste-Skill confirmed (done in STEP 0 above)

---

### PHASE 1 — Infrastructure + LiteLLM
Invoke `writing-plans` now.

Tasks:
1. Create complete directory structure as specified in SDD Section 1
2. Create `.gitignore` (SDD Section 2)
3. Create `docker-compose.yml` (SDD Section 2)
4. Create `backend/requirements.txt` with exact package versions from SRS Section 7
5. Create `backend/pytest.ini`:
   ```ini
   [pytest]
   asyncio_mode = auto
   testpaths = tests
   ```
6. Create `.env.example` with all keys from SRS Section 8 (empty values)
7. Create `.env` with development values (use `postgresql+asyncpg://conclave_user:conclave_pass@localhost:5432/conclave_db` for DATABASE_URL)
8. Create `litellm.config.yaml` with exact content from SRS Section 9
9. Run: `docker compose up -d` — confirm all 3 services running
10. Setup Python venv and install requirements
11. Install LiteLLM: `pip install litellm`
12. Start LiteLLM: `litellm --config litellm.config.yaml --port 4000`
13. Test LiteLLM: `curl http://localhost:4000/health`
14. Create `app/config.py`, `app/database.py`, `app/main.py` (exact content SDD Section 3)
15. Create all `__init__.py` files
16. Start backend: `uvicorn app.main:app --reload --port 8000`
17. Test: `curl http://localhost:8000/health`

**GATE: Paste output of both curl commands. Both must return valid JSON responses.**

---

### PHASE 2 — Database Models + Migrations
Invoke `writing-plans`. Invoke `using-git-worktrees` to create isolated branch.
Resolve Context7 for `sqlalchemy asyncio mapped_column Mapped` before starting.

Tasks:
1. Create all model files (SDD Section 4 + SRS Section 6 data models):
   - `app/models/user.py`, `conclave.py`, `agent.py`, `debate.py`, `prediction.py`
   - `app/models/scenario_branch.py` (NEW — exact content SDD Section 4)
   - `app/models/conclave_document.py` (NEW — exact content SDD Section 4)
2. Run: `alembic init alembic`
3. Modify `alembic/env.py` — import Base and all models, use async engine pattern
4. Update `alembic.ini` sqlalchemy.url
5. Run: `alembic revision --autogenerate -m "conclave_v3_initial"`
6. Run: `alembic upgrade head`
7. Verify: `docker exec conclave_postgres psql -U conclave_user -d conclave_db -c "\dt"`

**GATE: Paste the \dt output. Must show all 10 tables.**

---

### PHASE 3 — Auth (TDD — RED then GREEN)
Invoke `test-driven-development` now (mandatory).
Resolve Context7 for `fastapi Security HTTPBearer`, `python-jose jwt encode decode`, `passlib CryptContext`.

Step 1 — Write `tests/conftest.py`:
```python
import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import engine, Base

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(autouse=True)
async def reset_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c

@pytest.fixture
async def auth_client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        resp = await c.post("/api/v1/auth/register", json={
            "email": "test@conclave.io", "username": "testuser",
            "password": "securepass123", "domain": "trading"
        })
        token = resp.json()["data"]["access_token"]
        c.headers["Authorization"] = f"Bearer {token}"
        yield c
```

Step 2 — Write `tests/test_auth.py`:
```python
import pytest

@pytest.mark.asyncio
async def test_register_returns_201_with_token(client):
    r = await client.post("/api/v1/auth/register", json={
        "email": "new@test.com", "username": "newuser",
        "password": "password123", "domain": "trading"
    })
    assert r.status_code == 201
    assert r.json()["data"]["access_token"] is not None
    assert r.json()["error"] is None

@pytest.mark.asyncio
async def test_duplicate_email_returns_409(client):
    p = {"email": "dup@test.com", "username": "u1", "password": "p", "domain": "trading"}
    await client.post("/api/v1/auth/register", json=p)
    p["username"] = "u2"
    r = await client.post("/api/v1/auth/register", json=p)
    assert r.status_code == 409
    assert r.json()["error"]["code"] == "EMAIL_EXISTS"

@pytest.mark.asyncio
async def test_login_valid_returns_200(client):
    await client.post("/api/v1/auth/register", json={
        "email": "login@test.com", "username": "loginuser",
        "password": "mypassword", "domain": "startup"
    })
    r = await client.post("/api/v1/auth/login", json={
        "email": "login@test.com", "password": "mypassword"
    })
    assert r.status_code == 200
    assert "access_token" in r.json()["data"]

@pytest.mark.asyncio
async def test_login_wrong_password_returns_401(client):
    r = await client.post("/api/v1/auth/login", json={
        "email": "login@test.com", "password": "wrongpassword"
    })
    assert r.status_code == 401
    assert r.json()["error"]["code"] == "INVALID_CREDENTIALS"
```

Step 3 — Run: `pytest tests/test_auth.py -v` — confirm RED, state "Tests are RED"
Step 4 — Implement `app/schemas/auth.py`, `app/services/auth_service.py`, `app/routers/auth.py`
Step 5 — Run: `pytest tests/test_auth.py -v` — confirm GREEN

**GATE: Paste pytest output showing 4 tests PASSED.**

---

### PHASE 4 — Conclave Creation (TDD)
Invoke `brainstorming` before designing the generator. Invoke `test-driven-development`.
Resolve Context7 for `litellm acompletion`, `chromadb HttpClient get_or_create_collection`, `networkx DiGraph`.

Step 1 — Write `tests/test_conclaves.py`:
```python
@pytest.mark.asyncio
async def test_create_conclave_returns_5_agents(auth_client):
    r = await auth_client.post("/api/v1/conclaves/", json={"name": "Alpha Chamber", "domain": "trading"})
    assert r.status_code == 201
    data = r.json()["data"]
    assert len(data["agents"]) == 5
    for agent in data["agents"]:
        assert "name" in agent and "role" in agent and "bias_description" in agent
        assert agent["accuracy_score"] == 0.5
        assert agent["calibration_score"] is None

@pytest.mark.asyncio
async def test_second_conclave_returns_409(auth_client):
    await auth_client.post("/api/v1/conclaves/", json={"name": "C1", "domain": "trading"})
    r = await auth_client.post("/api/v1/conclaves/", json={"name": "C2", "domain": "startup"})
    assert r.status_code == 409
    assert r.json()["error"]["code"] == "CONCLAVE_EXISTS"

@pytest.mark.asyncio
async def test_get_my_conclave(auth_client):
    await auth_client.post("/api/v1/conclaves/", json={"name": "My Chamber", "domain": "research"})
    r = await auth_client.get("/api/v1/conclaves/my")
    assert r.status_code == 200
    assert r.json()["data"]["name"] == "My Chamber"
```

Step 2 — Run RED. State "Tests are RED"
Step 3 — Implement:
  - `app/agents/generators/conclave_generator.py` — GENERATOR_PROMPT (exact from SDD Section 6), call `call_council_llm()`, parse JSON, fallback to 5 hardcoded agents if LLM unavailable
  - `app/agents/memory.py` — save_memory, get_relevant_memories
  - `app/agents/knowledge_graph.py` — load_graph, save_graph, extract_and_add_to_graph, get_topic_context
  - `app/schemas/conclave.py`, `app/schemas/agent.py`
  - `app/services/conclave_service.py` — creates conclave + agents + ChromaDB identity embeddings + empty graph file
  - `app/routers/conclaves.py` — all endpoints from SRS FR-003 to FR-005, FR-009, FR-010
Step 4 — Run GREEN.

**GATE: Paste pytest output showing 3 tests PASSED.**

---

### PHASE 5 — Swarm Engine (TDD — MiroFish Integration)
Invoke `brainstorming` to design the swarm architecture. Invoke `test-driven-development`.
Resolve Context7 for `asyncio.gather`.

Step 1 — Write `tests/test_swarm.py`:
```python
@pytest.mark.asyncio
async def test_swarm_returns_valid_summary():
    from app.agents.swarm import run_swarm
    result = await run_swarm(
        topic="Federal Reserve raises rates by 75 basis points",
        domain="trading",
        news_context="Fed announced surprise rate hike at emergency meeting",
        n_agents=5  # use 5 for speed in tests
    )
    assert isinstance(result, dict)
    assert "dominant_view" in result
    assert "minority_view" in result
    assert "sentiment_split" in result
    assert isinstance(result["key_reactions"], list)
    assert len(result["dominant_view"]) > 10  # not empty

@pytest.mark.asyncio
async def test_swarm_completes_under_30s():
    import time
    from app.agents.swarm import run_swarm
    start = time.time()
    await run_swarm("AI regulation bill passes", "startup", "Congress passes sweeping AI law", n_agents=5)
    elapsed = time.time() - start
    assert elapsed < 30
```

Step 2 — Run RED. State "Tests are RED"
Step 3 — Implement `app/agents/swarm.py`:
  - SWARM_AGENT_TYPES dict (exact from SDD Section 7)
  - SWARM_PERSONA_PROMPT (exact from SDD Section 7)
  - SWARM_SYNTHESIS_PROMPT (exact from SDD Section 7)
  - `run_swarm()` function using asyncio.gather() for concurrent persona calls, then synthesis
Step 4 — Run GREEN.

**GATE: Paste pytest output showing 2 swarm tests PASSED.**

---

### PHASE 6 — LangGraph Debate Engine (TDD)
Invoke `brainstorming` to design graph architecture. Invoke `test-driven-development`. Invoke `subagent-driven-development` for implementation.
Resolve Context7 for `langgraph StateGraph add_conditional_edges`, `apscheduler AsyncIOScheduler add_job CronTrigger`.

Step 1 — Add `conclave_id_fixture` to conftest.py:
```python
@pytest.fixture
async def conclave_id_fixture(auth_client):
    r = await auth_client.post("/api/v1/conclaves/", json={"name": "Test Chamber", "domain": "trading"})
    return str(r.json()["data"]["id"])
```

Step 2 — Write `tests/test_debates.py`:
```python
@pytest.mark.asyncio
async def test_full_debate_cycle_completes(conclave_id_fixture):
    from app.agents.scheduler import run_debate_cycle
    from app.database import AsyncSessionLocal
    from app.models.debate import DebateSession, DebateMessage
    from sqlalchemy import select

    session_id = await run_debate_cycle(conclave_id_fixture)

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(DebateSession).where(DebateSession.id == session_id))
        session = result.scalar_one()
        assert session.status == "completed"
        assert session.summary is not None and len(session.summary) > 20
        assert session.swarm_summary is not None
        assert "dominant_view" in session.swarm_summary

        msgs = await db.execute(select(DebateMessage).where(DebateMessage.session_id == session_id))
        all_msgs = msgs.scalars().all()
        assert len([m for m in all_msgs if m.is_swarm]) >= 5
        assert len([m for m in all_msgs if not m.is_swarm]) >= 5

@pytest.mark.asyncio
async def test_inject_scenario_returns_202(auth_client, conclave_id_fixture):
    r = await auth_client.post(
        f"/api/v1/conclaves/{conclave_id_fixture}/inject",
        json={"scenario": "What if the Fed cuts rates by 100bps tomorrow?"}
    )
    assert r.status_code == 202
    assert r.json()["data"]["status"] == "queued"
    assert "session_id" in r.json()["data"]
```

Step 3 — Run RED.
Step 4 — Implement (in order, using subagent-driven-development for each):
  a. `app/agents/news_fetcher.py` — GNews API + BBC RSS fallback
  b. `app/agents/graph.py` — DebateState, all 8 nodes (exact prompts from SDD Section 6), graph edges
  c. `app/agents/scheduler.py` — start_scheduler, stop_scheduler, run_all_conclave_debates, run_debate_cycle
  d. `app/schemas/debate.py`
  e. `app/services/debate_service.py`
  f. `app/routers/debates.py` — all debate endpoints
Step 5 — Run GREEN.

**GATE: Both debate tests GREEN. Paste pytest output.**

---

### PHASE 7 — Contrarian Protocol + Calibration + Scenario Branches (TDD)
Invoke `test-driven-development`.

Write tests for all 3 features. For contrarian: mock the moderator consensus check. For calibration: create 5 predictions and resolve them. For branches: call inject endpoint and check DB.

RED → Implement:
  - Contrarian Protocol in `moderator_node` in `graph.py`
  - `recalculate_calibration()` in `app/services/debate_service.py`
  - `generate_scenario_branches()` in `app/agents/graph.py` or new file
  - `app/models/scenario_branch.py` (already created in Phase 2)
  - `GET /api/v1/debates/{session_id}/branches` endpoint
→ GREEN.

**GATE: All 3 tests GREEN.**

---

### PHASE 8 — Agent Messaging + Documents (TDD)
Invoke `test-driven-development`.

Write:
- `tests/test_agents.py` — agent messaging returns in-character response
- `tests/test_documents.py` — document feed adds entities to knowledge graph

RED → Implement:
  - `app/services/agent_service.py`
  - `app/routers/agents.py` (all agent endpoints)
  - `app/services/document_service.py` — accepts URL or text, extracts entities, updates graph, embeds to ChromaDB, saves ConclaveDocument record
  - `app/routers/documents.py`
→ GREEN.

**GATE: All agent and document tests GREEN.**

---

### PHASE 9 — WebSocket + Feed (TDD)
Invoke `test-driven-development`.
Resolve Context7 for `fastapi WebSocket accept close`, `redis asyncio pubsub subscribe get_message`.

Write:
- `tests/test_websocket.py` — inject debate, connect WS, receive at least 1 message
- `tests/test_feed.py` — public feed returns 200 without auth; follow increments count

RED → Implement:
  - `app/websocket/debate_ws.py` (exact spec SDD Section 13)
  - `app/routers/feed.py`
→ GREEN.

**GATE: All WS and feed tests GREEN.**

---

### PHASE 10 — Full Backend Verification
Invoke `verification-before-completion` now.

```bash
pytest tests/ -v --tb=short
```

**If ANY test fails**: immediately invoke `systematic-debugging`. Do not attempt to fix by guessing. Follow the 4-phase root cause process. Fix the root cause, not the symptom. Re-run after each fix.

**GATE: 100% GREEN. Paste the full pytest summary line (e.g., "25 passed, 0 failed").**

---

### PHASE 11 — Frontend Setup
Invoke `writing-plans`.
Resolve Context7 for `vite-plugin-pwa workbox`, `framer-motion motion div variants`.

```bash
cd conclave/frontend
npm create vite@latest . -- --template react
npm install react@18.3.1 react-dom@18.3.1
npm install -D vite@5.4.11 @vitejs/plugin-react@4.3.4
npm install -D tailwindcss@3.4.17 postcss autoprefixer
npm install -D vite-plugin-pwa@0.21.1
npm install -D vitest@2.1.8 @testing-library/react@16.1.0 @testing-library/jest-dom@6.6.3
npm install zustand@5.0.2 @tanstack/react-query@5.62.7
npm install react-router-dom@7.0.2 socket.io-client@4.8.1 axios@1.7.9
npm install framer-motion@11.0.0
npx tailwindcss init -p
```

Create exact files:
1. `vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'CONCLAVE', short_name: 'CONCLAVE',
        theme_color: '#7c6af7', background_color: '#080810',
        display: 'standalone', start_url: '/',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }]
      },
      workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg}'] }
    })
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
      '/ws': { target: 'ws://localhost:8000', ws: true }
    }
  },
  test: { globals: true, environment: 'jsdom', setupFiles: './src/setupTests.js' }
})
```

2. `tailwind.config.js`:
```javascript
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'] },
      colors: {
        conclave: {
          bg: '#080810', surface: '#0f0f1a', card: '#14141f', elevated: '#1a1a2e',
          border: '#1e1e35', accent: '#7c6af7', success: '#22d3a5',
          warning: '#f59e0b', error: '#ef4444', muted: '#8b8ba7', faint: '#4a4a6a'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-border': 'pulseBorder 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseBorder: { '0%, 100%': { borderColor: 'rgba(124,106,247,0.3)' }, '50%': { borderColor: 'rgba(124,106,247,0.8)' } }
      }
    }
  },
  plugins: []
}
```

3. `public/manifest.json` (exact from SRS FR-012)

4. `src/setupTests.js`: `import '@testing-library/jest-dom'`

5. Run `npm run dev` — confirm localhost:5173 loads.

**GATE: npm run dev shows the Vite welcome page at localhost:5173.**

---

### PHASE 12 — Frontend Core (API + Stores + Components)
Invoke `subagent-driven-development`. Invoke `test-driven-development` before each component.
Resolve Context7 for `zustand v5 create`, `react-query v5 useQuery useMutation`.

Build in strict order:

**Step A: API Layer**
1. `src/api/client.js` — exact content from SDD Section 17
2. `src/api/endpoints/auth.js` — register, login, getMe
3. `src/api/endpoints/conclaves.js` — createConclave, getMyConclave, getBrief, getBriefHistory, injectScenario, updateConclave
4. `src/api/endpoints/agents.js` — getAgents, getAgent, messageAgent
5. `src/api/endpoints/debates.js` — getDebate, getDebates, getBranches, resolvePrediction
6. `src/api/endpoints/documents.js` — addDocument, getDocuments
7. `src/api/endpoints/feed.js` — getFeed, followConclave

**Step B: Stores**
8. `src/store/authStore.js` (exact spec SDD Section 16)
9. `src/store/conclaveStore.js`
10. `src/store/debateStore.js`

**Step C: Router + App**
11. `src/router.jsx` — all routes with auth guard (protected routes redirect to '/' if not authenticated)
12. `src/App.jsx` — wrap with QueryClientProvider + AnimatePresence from framer-motion + router

**Step D: Components (write test FIRST each time)**

For each component: write `.test.jsx` file → run RED → implement → run GREEN.

13. `Layout/Layout.jsx` — bottom nav: Dashboard, Chamber, Inject, Discover icons. Active tab highlight with accent color.

14. `AgentCard/AgentCard.jsx` + test:
```javascript
// AgentCard.test.jsx
test('renders name, role, and accuracy', () => {
  const agent = { id: '1', name: 'Yuna', role: 'Macro Flow Strategist',
    accuracy_score: 0.72, calibration_score: 0.85, total_predictions: 10 }
  render(<AgentCard agent={agent} color="#7c6af7" onClick={() => {}} />)
  expect(screen.getByText('Yuna')).toBeInTheDocument()
  expect(screen.getByText('Macro Flow Strategist')).toBeInTheDocument()
})
```
Implement following exact spec in SDD Section 14.

15. `SwarmBrief/SwarmBrief.jsx` + test (renders dominant_view and sentiment_split)
16. `MorningBrief/MorningBrief.jsx` + test (renders topic and summary bullets)
17. `DebateFeed/DebateFeed.jsx` + test (renders swarm messages with slate color, council messages with agent color)
18. `ScenarioBranches/ScenarioBranches.jsx` + test (renders 3 cards with correct branch type labels)
19. `CalibrationBadge/CalibrationBadge.jsx` + test (renders null if score is null; correct label for each range)

**GATE: `npm test` — all component tests GREEN. Paste test output.**

---

### PHASE 13 — Frontend Pages (Taste-Skill Applied)
Invoke `subagent-driven-development`.

**Before building each page**: Read the Taste-Skill SKILL.md and apply parameters `DESIGN_VARIANCE: 7, MOTION_INTENSITY: 5, VISUAL_DENSITY: 6`. Every page must follow the exact color tokens and component specs in SDD Sections 14 and 15. Do NOT use default Vite/Tailwind styles.

Build in order:

1. **`Landing.jsx`** — follow SDD Section 15 exactly. Large CONCLAVE heading with purple glow. 3 feature pills at bottom. framer-motion fade-in on mount.

2. **`Onboarding.jsx`** — 3-step flow with animated transitions between steps. Step 1: register form. Step 2: domain cards (tap to select, selected card gets purple border). Step 3: name input + submit → loading animation → agent reveal (cards animate in with stagger delay 0.1s each using framer-motion).

3. **`Dashboard.jsx`** — Morning Brief at top. Horizontal scroll of 5 AgentCards. Recent debates list. Floating inject button on mobile.

4. **`Chamber.jsx`** — Loads debate session. Shows SwarmBrief (collapsible). Shows ScenarioBranches if is_user_inject. DebateFeed is main content. Live WebSocket integration: connect to `WS /ws/debates/{session_id}?token={token}`, stream messages into debateStore, DebateFeed re-renders reactively. Shows LIVE indicator with green pulse while active.

5. **`AgentProfile.jsx`** — Agent stats card. Accuracy + CalibrationBadge. Predictions list. Inline message chat panel with typing indicator (3 animated dots).

6. **`Inject.jsx`** — Centered layout. Large textarea. "Convene Now" button. After submit: shows 3 skeleton ScenarioBranch cards while redirecting.

7. **`Documents.jsx`** — List of added documents. "Add Intelligence" button opens modal with URL input + text paste area. Entity count badge per document.

8. **`Discover.jsx`** — Feed of public Conclaves. Search input. Follow button with optimistic update.

**GATE: All 8 pages render without errors. Walk through full onboarding flow manually from register to first dashboard view.**

---

### PHASE 14 — Final Verification
Invoke `verification-before-completion` now.

Run all checks:

**Automated:**
```bash
# Backend
cd backend && pytest tests/ -v --tb=short

# Frontend
cd frontend && npm test

# PWA build
npm run build && npm run preview
```

**Manual checklist (check each one, report result):**
- [ ] Register → Trading domain → "Alpha Chamber" → 5 distinct named agents appear with stagger animation
- [ ] Dashboard loads with "warming up" message (no brief yet)
- [ ] Manual trigger: POST /api/v1/conclaves/{id}/inject with test scenario → verify session_id returned
- [ ] Navigate to Chamber → see swarm messages (slate) then council messages (colored)
- [ ] See 3 ScenarioBranches cards (Base, Disruption, Black Swan)
- [ ] Click agent card → profile page → send message → in-character response appears
- [ ] Add a document URL → entity count shows on card
- [ ] Chrome DevTools → Application tab → Manifest: no errors, Service Workers: active
- [ ] Resize browser to 375px → mobile layout correct, bottom nav visible
- [ ] Floating inject button visible on mobile dashboard

**If any automated test fails**: invoke `systematic-debugging` immediately. Report the failure, root cause, and fix before continuing.

**GATE: All automated tests GREEN + all 10 manual checks pass. Report each check result.**

---

## STEP 4 — WHEN THINGS BREAK

**Test failure**: Invoke `systematic-debugging`. 4 phases: (1) reproduce reliably, (2) identify root cause, (3) fix root cause not symptom, (4) verify fix didn't break other tests.

**LiteLLM not responding**: Run `curl http://localhost:4000/health`. If down, restart: `litellm --config litellm.config.yaml --port 4000`. If Gemini quota hit: LiteLLM auto-falls to Groq. If Groq rate limited: LiteLLM falls to Ollama. Check logs: `litellm --config litellm.config.yaml --port 4000 --debug`.

**Docker service down**: `docker compose ps`. `docker compose logs [service-name]`. Restart with `docker compose restart [service-name]`.

**Library API mismatch**: Re-resolve via Context7 for that specific library. Use the Context7 result, not your training memory. Tell me what was different.

**Swarm taking too long**: Reduce `n_agents` to 5 in tests. 20 agents are for production — in tests always use 5.

---

## STEP 5 — FREE API SETUP GUIDE (do this before Phase 1 if not done)

**Google AI Studio** (primary — 1,500 req/day free forever):
1. Go to: https://aistudio.google.com
2. Sign in with Google
3. Click "Get API key" → Create API key
4. Copy to `.env` as `GOOGLE_API_KEY`

**Groq** (secondary — 14,400 req/day free forever):
1. Go to: https://console.groq.com
2. Sign up with email (no credit card)
3. API Keys → Create API Key
4. Copy to `.env` as `GROQ_API_KEY`

**GNews** (news feed — 100 req/day free):
1. Go to: https://gnews.io
2. Register free account
3. Copy API key to `.env` as `GNEWS_API_KEY`

Both Google and Groq free tiers never expire and require no credit card. LiteLLM handles failover automatically — if one is rate limited, it falls to the next provider without any code change.

---

## BEGIN

You have everything:
- SRS v3.0 FINAL (attached)
- SDD v3.0 FINAL (attached)
- This master prompt

Start with STEP 0 (confirm all skills installed).
Report back after each GATE.
Do not proceed past a GATE until you confirm it passes.

Go.
