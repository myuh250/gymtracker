from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
from app.schemas.llm import ChatMessage


class SessionMetadata(BaseModel):
    """Metadata for a conversation session"""
    session_id: str
    user_id: Optional[int] = None
    created_at: datetime
    last_active: datetime
    message_count: int = 0


class ConversationSession(BaseModel):
    """Complete conversation session data"""
    metadata: SessionMetadata
    messages: List[ChatMessage] = Field(default_factory=list)
    
    def add_message(self, message: ChatMessage):
        """Add message and update metadata"""
        self.messages.append(message)
        self.metadata.message_count += 1
        self.metadata.last_active = datetime.now(timezone.utc)


class SessionSummary(BaseModel):
    """Summary info for listing sessions"""
    session_id: str
    message_count: int
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_active: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    preview: str


class SessionHistory(BaseModel):
    """Response model for session history endpoint"""
    session_id: str
    message_count: int
    messages: List[ChatMessage] = Field(default_factory=list)

