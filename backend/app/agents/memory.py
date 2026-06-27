import uuid
from chromadb import HttpClient
from app.config import settings

def _get_collection(agent_id: str):
    client = HttpClient(host=settings.chroma_host, port=settings.chroma_port)
    return client.get_or_create_collection(name=f"agent_{agent_id}")

async def save_memory(agent_id: str, content: str, memory_type: str, importance: float = 0.5) -> str:
    doc_id = str(uuid.uuid4())
    collection = _get_collection(agent_id)
    collection.add(
        documents=[content],
        metadatas=[{"memory_type": memory_type, "importance": importance}],
        ids=[doc_id],
    )
    return doc_id

async def get_relevant_memories(agent_id: str, query: str, n_results: int = 5) -> list[str]:
    try:
        collection = _get_collection(agent_id)
        results = collection.query(query_texts=[query], n_results=n_results)
        if results and results["documents"]:
            return results["documents"][0]
    except Exception:
        pass
    return []
