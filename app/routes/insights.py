from fastapi import APIRouter
from typing import List
# from app.database.cosmos_client import get_conversation_insights

router = APIRouter()

@router.get("/{session_id}")
async def get_insights(session_id: str):
    # insights = get_conversation_insights(session_id)
    insights = {
        "session_id": session_id,
        "sentiment_distribution": {"Positive": 5, "Neutral": 2, "Negative": 1},
        "key_items": ["OrderID: 12345", "Product: Widget"]
    }  # Placeholder
    return insights