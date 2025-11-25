# conversation.py
# Pydantic models for requests/responses
from pydantic import BaseModel
from typing import Optional, Dict, Any

class ConversationRequest(BaseModel):
    text: Optional[str] = None
    audio_data: Optional[bytes] = None
    session_id: Optional[str] = None

class TransactionDetail(BaseModel):
    id: str
    merchant: str
    info: str
    address: str
    amount: float
    timestamp: str

class ConversationResponse(BaseModel):
    text: str
    intent: Optional[str] = None
    entities: Optional[Dict[str, Any]] = None
    action_result: Optional[Dict[str, Any]] = None
    sentiment: Optional[str] = None
    sentiment_score: Optional[float] = None  # Real-time sentiment score for chart
    audio_data: Optional[bytes] = None
    stage: Optional[str] = None  # New: signals current workflow stage
    user: Optional[Dict[str, Any]] = None  # User details
    transactions: Optional[list[TransactionDetail]] = None  # Last 10 transactions