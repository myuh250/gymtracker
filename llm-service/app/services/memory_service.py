from redis.asyncio import Redis
from typing import Optional, List
from datetime import datetime, timezone
import json
import logging
from fastapi import Depends

from app.schemas.memory import ConversationSession, SessionMetadata, SessionSummary
from app.schemas.llm import ChatMessage
from app.core.config import settings
from app.core.redis_client import get_redis

logger = logging.getLogger(__name__)

class MemoryService:
    """
    Short-term memory service using Redis
    
    Handles:
    - Session management
    - Message storage with TTL
    - Conversation history trimming
    - Metadata tracking
    
    Architecture:
    - Redis keys: session:{id} (messages) + session:{id}:meta (metadata)
    - Auto-expire with TTL
    - FIFO message trimming when exceeding max_messages
    """
    
    def __init__(self, redis: Redis):
        self.redis = redis
        self.ttl = settings.SESSION_TTL_SECONDS
        self.max_messages = settings.MAX_MESSAGES_PER_SESSION
    
    def _session_key(self, session_id: str) -> str:
        """Generate Redis key for session messages"""
        return f"session:{session_id}"
    
    def _metadata_key(self, session_id: str) -> str:
        """Generate Redis key for session metadata"""
        return f"session:{session_id}:meta"
    
    async def get_session(self, session_id: str) -> Optional[ConversationSession]:
        """
        Get full session with messages
        
        Returns:
            ConversationSession if exists, None otherwise
        """
        try:
            # Get messages
            messages_json = await self.redis.get(self._session_key(session_id))
            if not messages_json:
                return None
            
            # Get metadata
            meta_json = await self.redis.get(self._metadata_key(session_id))
            if not meta_json:
                return None
            
            # Parse
            messages = [ChatMessage(**msg) for msg in json.loads(messages_json)]
            metadata = SessionMetadata(**json.loads(meta_json))
            
            return ConversationSession(metadata=metadata, messages=messages)
            
        except Exception as e:
            logger.error(f"Failed to get session {session_id}: {e}")
            return None
    
    async def save_message(
        self, 
        session_id: str, 
        message: ChatMessage,
        user_id: Optional[int] = None
    ):
        """
        Save a message to session
        
        Creates new session if doesn't exist.
        Auto-trims messages if exceeding max_messages (FIFO).
        Resets TTL on every save.
        
        Args:
            session_id: Unique session identifier
            message: ChatMessage to append
            user_id: Optional user ID (for new sessions)
            
        Raises:
            Exception: If Redis operation fails
        """
        try:
            session = await self.get_session(session_id)
            
            if session is None:
                # Create new session
                session = ConversationSession(
                    metadata=SessionMetadata(
                        session_id=session_id,
                        user_id=user_id,
                        created_at=datetime.now(timezone.utc),
                        last_active=datetime.now(timezone.utc),
                        message_count=0
                    ),
                    messages=[]
                )
                logger.info(f"Creating new session {session_id}")
            
            # Add message (metadata.last_active auto-updated in add_message)
            session.add_message(message)
            
            # Keep only last N messages (FIFO trimming)
            if len(session.messages) > self.max_messages:
                trimmed = len(session.messages) - self.max_messages
                session.messages = session.messages[-self.max_messages:]
                logger.warning(f"Trimmed {trimmed} old messages from {session_id}")
            
            # Save to Redis with TTL (atomic update)
            await self.redis.setex(
                self._session_key(session_id),
                self.ttl,
                json.dumps([msg.model_dump() for msg in session.messages])
            )
            
            await self.redis.setex(
                self._metadata_key(session_id),
                self.ttl,
                session.metadata.model_dump_json()
            )
            
            logger.info(
                f"Saved {message.role} message to {session_id} "
                f"({len(session.messages)}/{self.max_messages} messages)"
            )
            
        except Exception as e:
            logger.error(f"Failed to save message to {session_id}: {e}")
            raise
    
    async def get_recent_messages(
        self, 
        session_id: str, 
        limit: int = 10
    ) -> List[ChatMessage]:
        """
        Get last N messages from session
        
        Args:
            session_id: Session identifier
            limit: Number of recent messages to return
        """
        session = await self.get_session(session_id)
        if session is None:
            return []
        
        return session.messages[-limit:]
    
    async def delete_session(self, session_id: str) -> bool:
        """Delete session from Redis"""
        try:
            deleted = await self.redis.delete(
                self._session_key(session_id),
                self._metadata_key(session_id)
            )
            return deleted > 0
        except Exception as e:
            logger.error(f"Failed to delete session {session_id}: {e}")
            return False
    
    async def extend_session_ttl(self, session_id: str):
        """Extend session expiry time (refresh TTL)"""
        await self.redis.expire(self._session_key(session_id), self.ttl)
        await self.redis.expire(self._metadata_key(session_id), self.ttl)
    
    async def get_session_metadata(self, session_id: str) -> Optional[SessionMetadata]:
        """
        Get only metadata without messages (lightweight)
        
        Useful for:
        - Session listing
        - Quick status check
        - Avoiding loading heavy message list
        """
        try:
            meta_json = await self.redis.get(self._metadata_key(session_id))
            if not meta_json:
                return None
            return SessionMetadata(**json.loads(meta_json))
        except Exception as e:
            logger.error(f"Failed to get metadata for {session_id}: {e}")
            return None
    
    async def get_session_summary(self, session_id: str) -> Optional[SessionSummary]:
        """
        Get session summary for listing/preview
        
        Returns:
            SessionSummary with preview of last message, or None if session doesn't exist
            
        Usage:
            Ideal for chat list sidebar in frontend
        """
        try:
            metadata = await self.get_session_metadata(session_id)
            if not metadata:
                return None
            
            # Get last message for preview
            messages = await self.get_recent_messages(session_id, limit=1)
            preview = ""
            if messages:
                last_msg = messages[-1]
                # Take first 50 chars of content
                preview = last_msg.content[:50] + ("..." if len(last_msg.content) > 50 else "")
            
            return SessionSummary(
                session_id=metadata.session_id,
                message_count=metadata.message_count,
                created_at=metadata.created_at,
                last_active=metadata.last_active,
                preview=preview
            )
        except Exception as e:
            logger.error(f"Failed to get summary for {session_id}: {e}")
            return None


def get_memory_service(redis: Redis = Depends(get_redis)) -> MemoryService:
    """
    FastAPI dependency to inject MemoryService
    
    Usage in route:
        @router.post("/chat")
        async def chat(
            memory: MemoryService = Depends(get_memory_service)
        ):
            await memory.save_message(...)
    
    Note: 
        This is a sync function because creating MemoryService instance
        doesn't require any async operations. Redis client is automatically
        injected via Depends(get_redis).
    """
    return MemoryService(redis)