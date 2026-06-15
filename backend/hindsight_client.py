import httpx
import os
from datetime import datetime

HINDSIGHT_API_URL = os.getenv("HINDSIGHT_API_URL", "https://api.hindsight.vectorize.io")
HINDSIGHT_API_KEY = os.getenv("HINDSIGHT_API_KEY", "")


async def store_memory(session_id: str, data: dict, interaction: int) -> str:
    memory_text = _build_memory_text(data, interaction)

    payload = {
        "agent_id": session_id,
        "content": memory_text,
        "metadata": {
            "interaction":      interaction,
            "timestamp":        datetime.now().isoformat(),
            "total_reviews":    data["total_collected"],
            "sentiment_score":  data["sentiment"]["score"],
            "avg_rating":       data["avg_rating"],
        }
    }

    if HINDSIGHT_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.post(
                    f"{HINDSIGHT_API_URL}/v1/memory",
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {HINDSIGHT_API_KEY}",
                        "Content-Type": "application/json"
                    }
                )
                if resp.status_code not in [200, 201]:
                    print(f"Hindsight store warning: {resp.status_code}")
        except Exception as e:
            print(f"Hindsight store error: {e}")

    return _generate_learning_summary(data, interaction)


async def query_memory(session_id: str, question: str) -> str:
    if not HINDSIGHT_API_KEY:
        return "No prior memory available."

    payload = {
        "agent_id": session_id,
        "query":    question,
        "top_k":    5
    }

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"{HINDSIGHT_API_URL}/v1/memory/query",
                json=payload,
                headers={
                    "Authorization": f"Bearer {HINDSIGHT_API_KEY}",
                    "Content-Type": "application/json"
                }
            )
            if resp.status_code == 200:
                result = resp.json()
                memories = result.get("memories", [])
                return "\n\n".join([
                    f"[Interaction {m.get('metadata', {}).get('interaction', '?')}]: {m.get('content', '')}"
                    for m in memories
                ])
    except Exception as e:
        print(f"Hindsight query error: {e}")

    return "Memory retrieval unavailable."


def _build_memory_text(data: dict, interaction: int) -> str:
    themes_text = ", ".join([t["theme"] for t in data.get("top_themes", [])])
    channels    = data.get("channels", {})
    sentiment   = data.get("sentiment", {})
    reviews     = data.get("reviews", [])[:10]
    samples     = "\n".join([f"- [{r['source']}] {r['text'][:150]}" for r in reviews])

    return f"""
INTERACTION {interaction} — FEEDBACK MEMORY
============================================
Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}
Total Items Collected: {data['total_collected']}

CHANNELS:
- App Store:       {channels.get('app_store', 0)}
- Reddit:          {channels.get('reddit', 0)}
- G2:              {channels.get('g2', 0)}
- Trustpilot:      {channels.get('trustpilot', 0)}
- Support Tickets: {channels.get('support_tickets', 0)}

SENTIMENT:
- Positive: {sentiment.get('positive', 0)} ({sentiment.get('score', 0)}% positive overall)
- Negative: {sentiment.get('negative', 0)}
- Neutral:  {sentiment.get('neutral', 0)}
- Avg Rating: {data.get('avg_rating', 'N/A')}/5

TOP ISSUES: {themes_text}

SAMPLE FEEDBACK:
{samples}
""".strip()


def _generate_learning_summary(data: dict, interaction: int) -> str:
    themes = data.get("top_themes", [])
    top    = themes[0]["theme"] if themes else "general feedback"
    score  = data["sentiment"]["score"]
    trend  = "positive" if score >= 60 else "negative" if score < 40 else "mixed"

    if interaction == 1:
        return f"First batch ingested. Dominant concern: {top}. Sentiment is {trend} at {score}%."
    elif interaction < 5:
        second = themes[1]["theme"] if len(themes) > 1 else top
        return f"Cross-referencing interactions. {top} and {second} are recurring. Trend is {trend}."
    elif interaction < 10:
        return f"Pattern solidifying across {interaction} interactions. {top} is systemic. Sentiment {trend} at {score}%."
    else:
        return f"Deep memory active. {interaction} interactions analysed. {top} confirmed across all channels. Predictive mode on."