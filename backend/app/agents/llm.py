from litellm import acompletion
from app.config import settings

async def call_council_llm(messages: list[dict], max_tokens: int = 800) -> str:
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
    response = await acompletion(
        model="swarm-model",
        messages=messages,
        max_tokens=max_tokens,
        api_base=settings.litellm_base_url,
        api_key=settings.litellm_api_key,
        timeout=15,
    )
    return response.choices[0].message.content.strip()
