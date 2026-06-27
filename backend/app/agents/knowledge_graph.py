import json
import networkx as nx
from pathlib import Path
from app.agents.llm import call_council_llm

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

ENTITY_EXTRACTION_PROMPT = """Extract entities and relationships from this text as a knowledge graph.
Return ONLY valid JSON array. Each item: {{"subject": str, "predicate": str, "object": str}}
Keep predicates as simple verbs: "affects", "owns", "competes_with", "regulates", etc.
Maximum 15 triples. If none found, return [].
Text: {text}"""

async def extract_and_add_to_graph(conclave_id: str, text: str) -> int:
    prompt = ENTITY_EXTRACTION_PROMPT.format(text=text[:3000])
    try:
        response = await call_council_llm(messages=[{"role": "user", "content": prompt}], max_tokens=1000)
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
        triples = json.loads(cleaned)
    except Exception:
        triples = []

    graph = load_graph(conclave_id)
    new_entities = set()
    for triple in triples:
        subj = triple.get("subject", "").strip()
        obj = triple.get("object", "").strip()
        pred = triple.get("predicate", "related_to").strip()
        if subj and obj:
            graph.add_edge(subj, obj, relationship=pred)
            new_entities.add(subj)
            new_entities.add(obj)
    if triples:
        save_graph(conclave_id, graph)
    return len(new_entities)

async def get_topic_context(conclave_id: str, topic: str) -> str:
    graph = load_graph(conclave_id)
    if not graph.nodes:
        return ""

    from app.agents.llm import call_council_llm
    extract_prompt = f"Extract the key entities (nouns, proper nouns) from this topic. Return as JSON array of strings. Topic: {topic}"
    try:
        resp = await call_council_llm(messages=[{"role": "user", "content": extract_prompt}], max_tokens=300)
        cleaned = resp.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
        entities = json.loads(cleaned)
    except Exception:
        entities = []

    context_parts = []
    for entity in entities:
        if entity in graph:
            for neighbor in graph.neighbors(entity):
                edge_data = graph.get_edge_data(entity, neighbor)
                rel = edge_data.get("relationship", "related_to") if edge_data else "related_to"
                context_parts.append(f"{entity} is connected to {neighbor} via {rel}")
            for predecessor in graph.predecessors(entity):
                if predecessor not in entities:
                    edge_data = graph.get_edge_data(predecessor, entity)
                    rel = edge_data.get("relationship", "related_to") if edge_data else "related_to"
                    context_parts.append(f"{predecessor} is connected to {entity} via {rel}")

    if context_parts:
        return "Known context: " + "; ".join(set(context_parts[:20]))
    return ""
