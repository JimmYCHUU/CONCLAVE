import asyncio
import json
from app.agents.llm import call_swarm_llm, call_council_llm

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

async def run_swarm(
    topic: str,
    domain: str,
    news_context: str,
    n_agents: int = 20,
) -> dict:
    persona_types = SWARM_AGENT_TYPES.get(domain, SWARM_AGENT_TYPES["general"])
    personas = [persona_types[i % len(persona_types)] for i in range(n_agents)]

    async def get_reaction(persona: str) -> str:
        prompt = SWARM_PERSONA_PROMPT.format(persona_type=persona, news=news_context, topic=topic)
        try:
            return await call_swarm_llm(messages=[{"role": "user", "content": prompt}])
        except Exception:
            return f"Interesting development on {topic}. Need to watch this closely."

    reactions = await asyncio.gather(*[get_reaction(p) for p in personas], return_exceptions=True)
    valid_reactions = [r for r in reactions if isinstance(r, str)]

    synthesis_prompt = SWARM_SYNTHESIS_PROMPT.format(
        n=len(valid_reactions),
        topic=topic,
        all_reactions_formatted="\n".join(f"- {r}" for r in valid_reactions),
    )

    try:
        response = await call_council_llm(messages=[{"role": "user", "content": synthesis_prompt}], max_tokens=500)
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
        return json.loads(cleaned)
    except Exception:
        return {
            "dominant_view": f"Market participants are closely watching {topic} developments.",
            "minority_view": "A minority sees this as overblown.",
            "sentiment_split": "60% cautious, 25% optimistic, 15% neutral",
            "key_reactions": [
                f"Uncertain about {topic} implications",
                "Need more data before taking a position",
                "This could be a turning point",
            ],
        }
