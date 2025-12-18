from fastapi import APIRouter, Depends, HTTPException, Header, Response
from typing import Optional, List, Dict, Any
import uuid
import logging

from app.schemas.llm import ChatRequest, ChatResponse, ChatMessage, UsageStats
from app.schemas.memory import SessionHistory
from app.services.gemini import GeminiService, get_gemini_service
from app.services.memory_service import MemoryService, get_memory_service
from app.tools import ALL_TOOLS
from app.services.tool_executor import get_tool_executor
from app.core.config import settings

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])
logger = logging.getLogger(__name__)


@router.post("/", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    response_obj: Response,
    session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    user_id: Optional[int] = Header(None, alias="X-User-ID"),  # Optional for now
    gemini: GeminiService = Depends(get_gemini_service),
    memory: MemoryService = Depends(get_memory_service)
) -> ChatResponse:
    """
    Intelligent Chat with Dual Memory System
    
    Architecture:
        1. Load conversation history (SHORT-TERM: Redis)
        2. Ask Gemini: need tools? (Decision point)
        3. Branch:
           - Tools needed → LONG-TERM path (RAG)
           - No tools → SHORT-TERM path (Redis only)
    
    Two distinct paths:
        PATH 1 (LONG-TERM): Execute RAG → Synthesize with vector data
        PATH 2 (SHORT-TERM): Direct response from conversation history
    
    Headers:
        X-Session-ID: Optional session identifier
        X-User-ID: Optional user ID for personalized RAG
    """
    if not session_id:
        session_id = str(uuid.uuid4())
    
    try:
        # Save user message
        user_msg = ChatMessage(role="user", content=request.message)
        await memory.save_message(session_id, user_msg)
        
        # Load conversation history from Redis
        history = await memory.get_recent_messages(session_id, limit=5)
        
        # Check if Gemini needs tools (RAG decision point)
        gemini_response = await gemini.check_needs_tools(
            request=request,
            tools=ALL_TOOLS,
            memory_messages=history
        )
        
        # Extract tool calls if any
        tool_calls = _extract_tool_calls(gemini_response)
        
        if tool_calls:
            logger.info(f"LONG-TERM MEMORY: Gemini needs {len(tool_calls)} tool(s)")
            for tc in tool_calls:
                logger.info(f"   → Tool: {tc['name']} with args: {tc['args']}")
            
            # Execute RAG tools
            tool_executor = get_tool_executor()
            tool_results = await tool_executor.execute_multiple(
                tool_calls=tool_calls,
                user_id=user_id or 1
            )
            
            # Synthesize with RAG + conversation history
            response = await gemini.chat_with_tool_results(
                request=request,
                tool_results=tool_results,
                memory_messages=history
            )
            
            logger.info("✅ Response: LONG-TERM (RAG) + SHORT-TERM (Redis)")
            
        else:
            response = await gemini.chat_with_memory(
                request=request,
                memory_messages=history
            )
            
            logger.info("✅ Response: SHORT-TERM (Redis) only")
        
        # Save assistant response
        ai_msg = ChatMessage(role="assistant", content=response.response)
        await memory.save_message(session_id, ai_msg)
        
        # Set headers
        response_obj.headers["X-Session-ID"] = session_id
        response.session_id = session_id
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Chat failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Chat failed: {str(e)}"
        )


def _extract_tool_calls(gemini_response) -> List[Dict[str, Any]]:
    """Extract tool calls from Gemini response"""
    tool_calls = []
    
    try:
        for part in gemini_response.candidates[0].content.parts:
            if hasattr(part, 'function_call') and part.function_call:
                tool_calls.append({
                    'name': part.function_call.name,
                    'args': dict(part.function_call.args)
                })
    except (IndexError, AttributeError):
        pass
    
    return tool_calls


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

