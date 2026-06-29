import asyncio
from app.config import settings

async def _call_gemini(messages: list[dict], max_tokens: int, timeout: int) -> str | None:
    try:
        from google import genai
        client = genai.Client(api_key=settings.google_api_key)
        model = settings.gemini_model.replace("gemini/", "")
        contents = "\n".join(m["content"] for m in messages)
        response = await asyncio.wait_for(
            asyncio.to_thread(
                lambda: client.models.generate_content(model=model, contents=contents,
                    config={"max_output_tokens": max_tokens}),
            ),
            timeout=timeout,
        )
        return response.text.strip()
    except Exception:
        return None

async def _call_groq(messages: list[dict], max_tokens: int, timeout: int) -> str | None:
    try:
        from groq import AsyncGroq
        client = AsyncGroq(api_key=settings.groq_api_key)
        model = settings.groq_model.replace("groq/", "")
        response = await asyncio.wait_for(
            client.chat.completions.create(
                model=model, messages=messages,
                max_tokens=max_tokens,
            ),
            timeout=timeout,
        )
        return response.choices[0].message.content.strip()
    except Exception:
        return None

async def _call_ollama(messages: list[dict], max_tokens: int, timeout: int) -> str | None:
    try:
        import httpx
        prompt = "\n".join(m["content"] for m in messages)
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(
                f"{settings.ollama_base_url}/api/generate",
                json={"model": settings.ollama_model.replace("ollama/", ""),
                      "prompt": prompt, "options": {"num_predict": max_tokens}},
            )
            return resp.json().get("response", "").strip()
    except Exception:
        return None

async def _call_llm(messages: list[dict], max_tokens: int, timeout: int) -> str:
    result = await _call_gemini(messages, max_tokens, timeout)
    if result:
        return result
    result = await _call_groq(messages, max_tokens, timeout)
    if result:
        return result
    result = await _call_ollama(messages, max_tokens, timeout)
    if result:
        return result
    raise Exception("All LLM providers failed")

async def call_council_llm(messages: list[dict], max_tokens: int = 800) -> str:
    return await _call_llm(messages, max_tokens, timeout=30)

async def call_swarm_llm(messages: list[dict], max_tokens: int = 200) -> str:
    return await _call_llm(messages, max_tokens, timeout=15)
