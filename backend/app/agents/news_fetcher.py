import httpx
from app.config import settings

async def fetch_news(topic: str, domain: str = "general") -> str:
    if settings.gnews_api_key:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(
                    "https://gnews.io/api/v4/search",
                    params={"q": topic, "lang": "en", "max": 5, "apikey": settings.gnews_api_key},
                )
                if resp.status_code == 200:
                    articles = resp.json().get("articles", [])
                    if articles:
                        headlines = [f"{a['title']}: {a.get('description', '')}" for a in articles[:5]]
                        return " | ".join(headlines)
        except Exception:
            pass

    return f"Recent developments in {topic} are generating significant discussion across {domain} markets and media."
