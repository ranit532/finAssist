# conversation.py
# Pydantic models for requests/responses
from pydantic import BaseModel
from typing import Optional, Dict, Any

class ConversationRequest(BaseModel):
    text: Optional[str] = None
    audio_data: Optional[bytes] = None
    session_id: Optional[str] = None

class ConversationResponse(BaseModel):
    text: str
    intent: Optional[str] = None
    entities: Optional[Dict[str, Any]] = None
    action_result: Optional[Dict[str, Any]] = None
    sentiment: Optional[str] = None
    audio_data: Optional[bytes] = None
    stage: Optional[str] = None  # New: signals current workflow stage