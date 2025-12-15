from fastapi import APIRouter, Depends, HTTPException, Header, Response
from typing import Optional
import uuid

from app.schemas.llm import ChatRequest, ChatResponse, ChatMessage
from app.schemas.memory import SessionHistory
from app.services.gemini import GeminiService, get_gemini_service
from app.services.memory_service import MemoryService, get_memory_service

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])


@router.post("/", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    response_obj: Response,
    session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    gemini: GeminiService = Depends(get_gemini_service),
    memory: MemoryService = Depends(get_memory_service)
) -> ChatResponse:
    """
    Chat with LLM assistant with conversation memory
    
    Flow:
    1. Get or create session_id
    2. Save user message to Redis
    3. Load conversation history from memory
    4. Call Gemini with history context
    5. Save assistant response to memory
    6. Return response with session_id in header + body
    
    Headers:
        X-Session-ID: Optional session identifier for conversation continuity
        
    Returns:
        ChatResponse with X-Session-ID header set
        
    Raises:
        HTTPException: If LLM call fails
    """
    # Get or create session_id
    if not session_id:
        session_id = str(uuid.uuid4())
    
    try:
        # Save user message FIRST (before LLM call for better tracing)
        user_msg = ChatMessage(role="user", content=request.message)
        await memory.save_message(session_id, user_msg)
        
        # Load conversation history from Redis
        history = await memory.get_recent_messages(session_id, limit=5)
        
        # Call Gemini with memory context
        response = await gemini.chat_with_memory(request, memory_messages=history)
        
        # Save assistant response
        ai_msg = ChatMessage(role="assistant", content=response.response)
        await memory.save_message(session_id, ai_msg)
        
        # Set session_id in response header
        response_obj.headers["X-Session-ID"] = session_id
        
        # Add session_id to response body (convenient for FE)
        response.session_id = session_id
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Chat failed: {str(e)}"
        )


@router.get("/history", response_model=SessionHistory)
async def get_history(
    session_id: str = Header(..., alias="X-Session-ID"),
    limit: int = 50,
    memory: MemoryService = Depends(get_memory_service)
) -> SessionHistory:
    """
    Get conversation history for a session
    
    Args:
        session_id: Session identifier from header (required)
        limit: Maximum number of messages to return (max 50, default 50)
        
    Returns:
        SessionHistory with messages list (empty list if no messages yet)
    """
    # Clamp limit to max 50
    limit = min(limit, 50)
    
    # Get messages (returns empty list if session doesn't exist)
    messages = await memory.get_recent_messages(session_id, limit=limit)
    
    # Get metadata if exists
    metadata = await memory.get_session_metadata(session_id)
    
    return SessionHistory(
        session_id=session_id,
        message_count=metadata.message_count if metadata else 0,
        messages=messages
    )


@router.delete("/session")
async def delete_session(
    session_id: str = Header(..., alias="X-Session-ID"),
    memory: MemoryService = Depends(get_memory_service)
):
    """
    Delete a conversation session
    
    Args:
        session_id: Session identifier from header (required)
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If session doesn't exist or deletion fails
    """
    deleted = await memory.delete_session(session_id)
    
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail=f"Session {session_id} not found"
        )
    
    return {
        "message": "Session deleted successfully",
        "session_id": session_id
    }

