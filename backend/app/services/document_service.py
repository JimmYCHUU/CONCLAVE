import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.conclave_document import ConclaveDocument
from app.models.conclave import Conclave
from app.agents.knowledge_graph import extract_and_add_to_graph
from app.agents.llm import call_council_llm
from app.agents.memory import save_memory
from app.models.agent import Agent

async def add_document(db: AsyncSession, conclave_id: str, url: str | None = None, text: str | None = None) -> dict:
    if not url and not text:
        raise ValueError("At least one of url or text is required")

    content = text or ""
    if url and not content:
        content = f"Document from {url}"

    preview = content[:300] if content else ""

    if content:
        entity_count = await extract_and_add_to_graph(conclave_id, content)
    else:
        entity_count = 0

    doc = ConclaveDocument(
        conclave_id=uuid.UUID(conclave_id),
        source_url=url,
        content_preview=preview,
        entity_count=entity_count,
    )
    db.add(doc)
    await db.flush()

    agents_result = await db.execute(select(Agent).where(Agent.conclave_id == uuid.UUID(conclave_id)))
    agents = agents_result.scalars().all()
    for agent in agents:
        await save_memory(str(agent.id), content[:1000], "document_feed", importance=0.8)

    await db.commit()

    return {
        "id": str(doc.id),
        "source_url": doc.source_url,
        "content_preview": doc.content_preview,
        "entity_count": doc.entity_count,
        "created_at": doc.created_at.isoformat() if doc.created_at else None,
    }

async def get_documents(db: AsyncSession, conclave_id: str) -> list:
    result = await db.execute(
        select(ConclaveDocument).where(ConclaveDocument.conclave_id == uuid.UUID(conclave_id))
        .order_by(ConclaveDocument.created_at.desc())
    )
    docs = result.scalars().all()
    return [{
        "id": str(d.id), "source_url": d.source_url,
        "content_preview": d.content_preview,
        "entity_count": d.entity_count,
        "created_at": d.created_at.isoformat() if d.created_at else None,
    } for d in docs]
