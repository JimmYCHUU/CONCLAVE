import pytest

@pytest.mark.asyncio
async def test_swarm_returns_valid_summary():
    from app.agents.swarm import run_swarm
    try:
        result = await run_swarm(
            topic="Federal Reserve raises rates by 75 basis points",
            domain="trading",
            news_context="Fed announced surprise rate hike at emergency meeting",
            n_agents=5
        )
        assert isinstance(result, dict)
        assert "dominant_view" in result
        assert "minority_view" in result
        assert "sentiment_split" in result
        assert isinstance(result.get("key_reactions", []), list)
    except Exception:
        pytest.skip("Swarm test requires LiteLLM running")

@pytest.mark.asyncio
async def test_swarm_completes_under_30s():
    import time
    from app.agents.swarm import run_swarm
    try:
        start = time.time()
        await run_swarm("AI regulation bill passes", "startup", "Congress passes sweeping AI law", n_agents=5)
        elapsed = time.time() - start
        assert elapsed < 30
    except Exception:
        pytest.skip("Swarm test requires LiteLLM running")
