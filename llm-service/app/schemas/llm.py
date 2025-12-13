from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Literal
from app.utils.text import normalize_text

class UsageStats(BaseModel):
    """Token usage statistics"""
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int

class ChatMessage(BaseModel):
    """Message in a chat"""
    role: Literal["user", "assistant", "system"]
    content: str = Field(..., description="Content of the message")
    
    @field_validator("content", mode="before")
    @classmethod
    def normalize_content(cls, v: str) -> str:
        return normalize_text(v, forbid_empty=True)

class ChatRequest(BaseModel):
    """Request for chat with LLM"""
    message: str = Field(..., max_length=2000, description="Message to send to the LLM")
    context: Optional[str] = Field(
        None, 
        description="Additional context (user's workout history, goals, etc.)"
    )
    conversation_history: Optional[List[ChatMessage]] = Field(
        default=None,
        max_length=20, 
        description="Previous messages (max 20 for performance)"
    )
    
    @field_validator("message", mode="before")
    @classmethod
    def normalize_message(cls, v: str) -> str:
        return normalize_text(v, forbid_empty=True)
    

class ChatResponse(BaseModel):
    """Response from LLM"""
    response: str
    model: str
    usage: Optional[UsageStats] = None
