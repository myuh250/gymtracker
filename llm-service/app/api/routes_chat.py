from fastapi import APIRouter, Depends, HTTPException

from app.schemas.llm import ChatRequest, ChatResponse
from app.services.gemini import GeminiService, get_gemini_service

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])


@router.post("/", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    service: GeminiService = Depends(get_gemini_service)
) -> ChatResponse:
    """
    Chat with the LLM assistant
    
    This endpoint allows users to send messages to the AI assistant,
    optionally including context and conversation history.
    
    Args:
        request: Chat request with message, context, and history
        service: Injected GeminiService instance
        
    Returns:
        ChatResponse: AI-generated response with usage statistics
        
    Raises:
        HTTPException: If the request fails or API returns error
    """
    return await service.chat(request)

