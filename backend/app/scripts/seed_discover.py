import asyncio
import uuid
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.conclave import Conclave
from app.models.agent import Agent
from app.models.user import User
from app.services.auth_service import hash_password

SEED_CONCLAVES = [
    {"name": "Sigma Chamber", "domain": "trading", "follower_count": 1247,
     "brief_topic": "Dollar Reversal: Reading the Fed's Body Language"},
    {"name": "Black Box", "domain": "ai_technology", "follower_count": 891,
     "brief_topic": "GPT-5 Capabilities: What Leaked Benchmarks Tell Us"},
    {"name": "The Forum", "domain": "geopolitics", "follower_count": 2341,
     "brief_topic": "South China Sea Escalation Risk: Probability Assessment"},
    {"name": "Apex Council", "domain": "venture_capital", "follower_count": 634,
     "brief_topic": "Series A Winter Is Over — Or Is It?"},
    {"name": "Meridian", "domain": "biotech_health", "follower_count": 478,
     "brief_topic": "GLP-1 Competitive Dynamics: Who Survives 2027?"},
    {"name": "Iron Logic", "domain": "macro", "follower_count": 1089,
     "brief_topic": "Japan Yield Curve Control: The Dam Is Breaking"},
]

async def seed_discover_conclaves():
    from app.agents.generators.conclave_generator import generate_agents

    async with AsyncSessionLocal() as db:
        existing = await db.execute(select(Conclave).where(Conclave.is_public == True))
        if existing.scalars().first():
            return

        for seed in SEED_CONCLAVES:
            system_user = User(
                id=uuid.uuid4(),
                email=f"system+{seed['name'].lower().replace(' ', '_')}@conclave.internal",
                username=seed['name'].lower().replace(' ', '_'),
                hashed_password=hash_password(uuid.uuid4().hex),
                domain=seed["domain"],
            )
            db.add(system_user)
            await db.flush()

            conclave = Conclave(
                id=uuid.uuid4(),
                user_id=system_user.id,
                name=seed["name"],
                domain=seed["domain"],
                is_public=True,
                follower_count=seed["follower_count"],
            )
            db.add(conclave)
            await db.flush()

            agents = await generate_agents(seed["domain"])
            for a in agents:
                db.add(Agent(
                    id=uuid.uuid4(),
                    conclave_id=conclave.id,
                    name=a["name"], role=a["role"],
                    personality_prompt=a["personality_prompt"],
                    bias_description=a["bias_description"],
                    accuracy_score=a.get("accuracy_score", 0.5),
                ))

        await db.commit()

if __name__ == "__main__":
    asyncio.run(seed_discover_conclaves())
