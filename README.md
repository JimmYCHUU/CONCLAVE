# CONCLAVE — Your Permanent AI Agent Council

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.2-1C3C3C?logo=langgraph)](https://langchain-ai.github.io/langgraph/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-0.5-FC6E6E)](https://chromadb.com)
[![LiteLLM](https://img.shields.io/badge/LiteLLM-1.52-FF6B35)](https://litellm.ai)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docker.com)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8)](https://web.dev/progressive-web-apps/)

> **The first AI product where your agents are the asset.** CONCLAVE gives every user a permanent society of 5 named AI analyst agents ("The Council") that debate real-world events autonomously every 6 hours, powered by a two-layer intelligence system (MiroFish-inspired Swarm + LangGraph Council). Wake up to a Morning Brief of what your private council argued about overnight.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            CONCLAVE System                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Frontend — React 18 PWA (Vite · Tailwind · Zustand · Framer Motion) │   │
│  │  Dashboard · Chamber · Agent Profiles · Inject · Discover · Landing  │   │
│  └────────────────────────────────┬─────────────────────────────────────┘   │
│                                   │ WebSocket + REST API                     │
│  ┌────────────────────────────────▼─────────────────────────────────────┐   │
│  │  Backend — FastAPI + Uvicorn                                         │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │  LangGraph Debate Pipeline (8 Nodes — 2-Layer Intelligence)     │ │   │
│  │  │                                                                 │ │   │
│  │  │  LAYER 1: Swarm (Groq)                 LAYER 2: Council (Gemini)│ │   │
│  │  │  20 anonymous stakeholder agents       5 named expert agents    │ │   │
│  │  │  simulate crowd reaction               debate what it means     │ │   │
│  │  │  ~30 seconds · high throughput         ~2-3 minutes · deep      │ │   │
│  │  │                                                                 │ │   │
│  │  │  Pipeline: news_fetcher → kg → topic_selector → swarm →        │ │   │
│  │  │  agent_turn (×3 rounds) → moderator → summarizer → predictions │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                      │   │
│  │  Services: Auth · Conclave · Agent · Debate · Document · Feed        │   │
│  │  Scheduler: APScheduler (06/12/18/00 daily)                         │   │
│  │  WebSocket: Redis Pub/Sub → Live Debate Streaming                    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                   │                                          │
│  ┌──────────┐  ┌──────────┐  ┌────▼─────┐  ┌─────────────────────────────┐ │
│  │PostgreSQL│  │  Redis   │  │ ChromaDB │  │ LiteLLM Proxy (port 4000)   │ │
│  │  (async) │  │ Pub/Sub  │  │  Vector  │  │ Gemini · Groq · Ollama      │ │
│  └──────────┘  └──────────┘  └──────────┘  │ Auto-failover chain          │ │
│                                             └─────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Non-Negotiable Rules

- **COUNCIL-1**: Every user receives exactly 5 uniquely generated analyst agents with distinct personalities (optimist, pessimist, contrarian, quantitative, narrative)
- **SWARM-1**: 20 concurrent anonymous stakeholder agents always run first (Groq for speed), then the council (Gemini for quality)
- **DEBATE-1**: Pipeline order fixed: `news → kg → topic → swarm → agent (×3) → moderator → summarizer → predictions`
- **CONTRA-1**: Anti-Herd Contrarian Protocol activates when 4+ agents agree — forces the weakest agent to argue the minority position
- **SCHED-1**: Debates trigger autonomously at 06:00, 12:00, 18:00, 00:00 daily; the 06:00 cycle produces the Morning Brief
- **PRED-1**: Every agent ends each argument with a falsifiable claim + confidence percentage; calibration scoring requires 5+ resolved predictions

## Features

### 🧠 Two-Layer Intelligence Engine

| Layer | Agents | Provider | Purpose | Speed |
|-------|--------|----------|---------|-------|
| **Swarm** | 20 anonymous stakeholders | Groq (llama-3.3-70b) | Crowd sentiment simulation | ~30s |
| **Council** | 5 named experts | Gemini 2.0 Flash | Deep analysis & debate | ~2-3min |

### 👥 Persistent Agent Council
- **5 Unique Personas** — Each agent has a name, role, personality prompt, known biases, and calibration score
- **Permanent Identity** — Agents persist across sessions with growing ChromaDB vector memory
- **Anti-Herd Protocol** — Prevents groupthink by forcing contrarian arguments
- **Direct Messaging** — Chat 1-on-1 with any agent; they respond in character with memory context

### 🗳️ MiroFish-Inspired Swarm
- **20 Concurrent Stakeholders** — Domain-aware persona types (trading, startup, research, general)
- **Real-Time Simulation** — Crowd reaction visible in the Chamber during debates
- **Sentiment Aggregation** — Swarm summary feeds into the council for deeper analysis

### ⚡ LangGraph Debate Pipeline
- **8-Node State Machine** — `news_fetcher → knowledge_graph → topic_selector → swarm → agent_turn (×3) → moderator → summarizer → prediction_extractor`
- **3 Debate Rounds** — Conditional looping with moderator intervention
- **Live Streaming** — Every message relayed via Redis Pub/Sub → WebSocket in real time

### 📊 Morning Brief
- **Daily Intelligence Summary** — Topic, swarm sentiment, council key points, predictions
- **Auto-Generated at 06:00** — First debate cycle of the day produces the brief
- **Historical Briefs** — Paginated brief history accessible anytime

### 🔮 Scenario Branching
- **3 Parallel Futures** — Base Case, Disruption, Black Swan
- **User-Initiated Injection** — Trigger scenario analysis on any topic
- **Mini-Swarm Simulation** — Each branch runs its own swarm for crowd reaction

### 🎯 Prediction Tracking & Calibration
- **Falsifiable Claims** — Every agent ends with a specific prediction + confidence %
- **Resolution System** — Users mark predictions correct/incorrect
- **Calibration Scoring** — Measures how well stated confidence matches actual accuracy (requires 5+ resolved)

### 📚 Persistent Knowledge Graph
- **NetworkX Graphs** — Per-conclave growing knowledge graph stored as JSON
- **Entity Extraction** — Documents fed into the system are entity-extracted via LLM
- **Agent References** — Agents reference graph context during debates

### 🔐 Auth & Social
- **JWT Authentication** — Secure token-based auth with refresh rotation
- **Public Conclaves** — Make your council discoverable; browse and follow others
- **Following Feed** — Sorted by follower count

### 📱 Progressive Web Application
- **Offline-Ready** — Service worker caches app shell
- **Standalone Mode** — PWA manifest with dark theme (#080810)
- **Premium UI** — Asymmetric editorial layouts, spring animations, Bloomberg-terminal density

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- LiteLLM (pip install litellm)
- API keys: Google AI Studio (primary), Groq (secondary)

### Infrastructure

```bash
# 1. Clone the repository
git clone https://github.com/JimmYCHUU/CONCLAVE.git
cd CONCLAVE

# 2. Start infrastructure (Postgres + Redis + ChromaDB)
docker compose up -d

# 3. Start LLM proxy
litellm --config litellm.config.yaml --port 4000
```

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../.env .env  # Configure your API keys
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Tests

```bash
cd backend
pytest tests/ -v --tb=short
cd frontend
npm test
```

## Project Structure

```
CONCLAVE/
├── backend/
│   └── app/
│       ├── agents/            # AI agent engine
│       │   ├── generators/    # LLM persona generator
│       │   ├── graph.py       # LangGraph 8-node pipeline
│       │   ├── swarm.py       # 20-agent stakeholder simulation
│       │   ├── memory.py      # ChromaDB vector memory
│       │   ├── llm.py         # Council + Swarm LLM calls
│       │   ├── scheduler.py   # APScheduler 6h cycles
│       │   ├── news_fetcher.py
│       │   └── scenario_branches.py
│       ├── models/            # 8 SQLAlchemy models
│       ├── routers/           # 6 API route modules
│       ├── services/          # Business logic layer
│       ├── schemas/           # Pydantic request/response
│       └── websocket/         # Redis Pub/Sub → WS
├── frontend/
│   ├── src/
│   │   ├── api/               # Axios client + 6 endpoint modules
│   │   ├── components/        # AgentCard, DebateFeed, MorningBrief, etc.
│   │   ├── pages/             # Landing, Onboarding, Dashboard, Chamber, etc.
│   │   └── store/             # 3 Zustand stores (auth, conclave, debate)
│   └── public/                # PWA manifest + service worker
├── docker-compose.yml         # Postgres + Redis + ChromaDB
├── litellm.config.yaml         # Multi-provider LLM routing
├── CONCLAVE_SRS_v3.0_FINAL.md # Software Requirements Specification
└── CONCLAVE_SDD_v3.0_FINAL.md # Software Design Document
```

## API Endpoints

### Auth

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/v1/auth/register` | — | Register new user |
| POST | `/api/v1/auth/login` | — | Login |

### Conclaves

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/v1/conclaves/` | JWT | Create conclave (generates 5 agents) |
| GET | `/api/v1/conclaves/my` | JWT | Get user's conclave |
| PATCH | `/api/v1/conclaves/{id}` | JWT | Update conclave settings |
| POST | `/api/v1/conclaves/{id}/inject` | JWT | Inject scenario (triggers debate) |
| GET | `/api/v1/conclaves/{id}/brief` | JWT | Latest morning brief |
| GET | `/api/v1/conclaves/{id}/brief/history` | JWT | Paginated brief history |
| POST | `/api/v1/conclaves/{id}/documents` | JWT | Add document feed |
| GET | `/api/v1/conclaves/{id}/documents` | JWT | List documents |

### Agents

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/v1/conclaves/{cid}/agents` | JWT | List council agents |
| GET | `/api/v1/conclaves/{cid}/agents/{id}` | JWT | Agent profile |
| POST | `/api/v1/conclaves/{cid}/agents/{aid}/message` | JWT | Direct agent message |

### Debates

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/v1/debates/{session_id}` | JWT | Full debate transcript |
| GET | `/api/v1/conclaves/{id}/debates` | JWT | Paginated debate list |
| GET | `/api/v1/conclaves/{id}/predictions` | JWT | Paginated predictions |
| PATCH | `/api/v1/predictions/{id}/resolve` | JWT | Resolve prediction |
| GET | `/api/v1/debates/{session_id}/branches` | JWT | Scenario branches |
| WS | `/ws/debates/{session_id}` | JWT | Live debate stream |

### Feed

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/v1/feed` | — | Public conclave feed |
| POST | `/api/v1/feed/{conclave_id}/follow` | JWT | Follow a conclave |

## LLM Provider Strategy

| Model | Provider | Used For | Rate Limit |
|-------|----------|----------|------------|
| `gemini-2.0-flash` | Google AI Studio | Council (quality, deep context) | 1,500 req/day |
| `llama-3.3-70b` | Groq | Swarm (cheap, fast, 20× parallel) | 14,400 req/day |
| `llama3.2:3b` | Ollama (local) | Offline/dev fallback | Unlimited |

Auto-failover chain via LiteLLM: `council-model → swarm-model → fallback-model`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_API_KEY` | Google AI Studio API key | (required) |
| `GROQ_API_KEY` | Groq API key | (required) |
| `GNEWS_API_KEY` | GNews API key | (required) |
| `DATABASE_URL` | PostgreSQL async connection string | `postgresql+asyncpg://conclave_user:conclave_pass@localhost:5432/conclave_db` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `CHROMA_HOST` | ChromaDB host | `localhost` |
| `CHROMA_PORT` | ChromaDB port | `8001` |
| `JWT_SECRET_KEY` | JWT signing secret | (required — change in production) |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `JWT_EXPIRY_HOURS` | Token lifetime | `24` |
| `LITELLM_BASE_URL` | LiteLLM proxy URL | `http://localhost:4000` |
| `ENVIRONMENT` | Runtime environment | `development` |

## License

MIT

## About

🧠 CONCLAVE — A full-stack, PWA that gives every user a permanent society of 5 named AI analyst agents ("The Council") that debate real-world events autonomously every 6 hours. Features a two-layer intelligence system: a MiroFish-inspired 20-agent swarm (Groq) for crowd simulation, and a LangGraph-powered 5-agent council (Gemini) for deep analysis. Wake up to daily Morning Briefs with swarm sentiment, council key points, and falsifiable predictions with calibration scoring.
