import google.generativeai as genai
import logging
from typing import Optional, List, Any
from functools import lru_cache
from fastapi import HTTPException
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
    after_log
)
from app.prompts.system_prompts import SYSTEM_PROMPT
from app.core.config import settings
from app.schemas.llm import ChatRequest, ChatResponse, UsageStats, ChatMessage

# Create logger
logger = logging.getLogger(__name__)


class GeminiService:
    """Service for interacting with Google Gemini API"""
    
    def __init__(self):
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set in environment variables")
        
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        
        # Only retry recoverable exceptions
        retry=retry_if_exception_type((
            ConnectionError,
            TimeoutError,
            OSError,
        )),
        
        before_sleep=before_sleep_log(logger, logging.WARNING),
        after=after_log(logger, logging.INFO),
        
        # Reraise last exception if all retries fail
        reraise=True
    )
    async def _call_gemini_with_retry(self, prompt: str) -> Any:
        """
        Internal method to call Gemini API with retry logic
        
        Args:
            prompt: The formatted prompt to send
            
        Returns:
            Gemini API response
            
        Raises:
            Exception: If all retry attempts fail
        """
        response = await self.model.generate_content_async(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=settings.GEMINI_TEMPERATURE,
                max_output_tokens=settings.GEMINI_MAX_TOKENS,
            )
        )
        return response
    
    async def chat(self, request: ChatRequest) -> ChatResponse:
        """
        General chat with context
        
        Raises:
            HTTPException: If API call fails or returns empty response
        """
        try:

            prompt = self._build_chat_prompt(request)
            

            response = await self._call_gemini_with_retry(prompt)
            
            # 3️⃣ Validate response
            if not response.text:
                raise HTTPException(
                    status_code=500,
                    detail="Gemini returned empty response"
                )
            
            # 4️⃣ Return structured response
            return ChatResponse(
                response=response.text,
                model=settings.GEMINI_MODEL,
                usage=UsageStats(
                    prompt_tokens=response.usage_metadata.prompt_token_count,
                    completion_tokens=response.usage_metadata.candidates_token_count,
                    total_tokens=response.usage_metadata.total_token_count,
                )
            )
            
        except HTTPException:
            # Re-raise HTTP exceptions as-is
            raise
        except Exception as e:
            # Wrap other exceptions in HTTP exception
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate response: {str(e)}"
            )
    
    async def chat_with_memory(
        self,
        request: ChatRequest,
        memory_messages: Optional[List[ChatMessage]] = None
    ) -> ChatResponse:
        """
        Chat with memory context from Redis
        
        This method prioritizes conversation history from Redis memory
        over the history provided in the request itself.
        
        Args:
            request: Chat request with user message
            memory_messages: Messages from Redis memory (prioritized)
            
        Returns:
            ChatResponse with AI response and usage stats
            
        Raises:
            HTTPException: If API call fails or returns empty response
        """
        try:
            prompt = self._build_chat_prompt(request, memory_messages)
            
            logger.info(
                f"Generating response with memory "
                f"(history length: {len(memory_messages) if memory_messages else 0})"
            )
            
            response = await self._call_gemini_with_retry(prompt)
            
            # Validate response
            if not response.text:
                raise HTTPException(
                    status_code=500,
                    detail="Gemini returned empty response"
                )
            
            return ChatResponse(
                response=response.text,
                model=settings.GEMINI_MODEL,
                usage=UsageStats(
                    prompt_tokens=response.usage_metadata.prompt_token_count,
                    completion_tokens=response.usage_metadata.candidates_token_count,
                    total_tokens=response.usage_metadata.total_token_count,
                )
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to generate response with memory: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate response: {str(e)}"
            )
    
    def _build_chat_prompt(
        self, 
        request: ChatRequest,
        memory_messages: Optional[List[ChatMessage]] = None
    ) -> str:
        """
        Build prompt with context and conversation history
        
        Args:
            request: Chat request with message and optional context
            memory_messages: Messages from Redis memory (prioritized over request history)
            
        Returns:
            Formatted prompt string for Gemini
        """
        prompt_parts = [SYSTEM_PROMPT]
        
        if request.context:
            prompt_parts.append(f"\nContext: {request.context}")
        
        # Prioritize memory messages over request history
        history_to_use = memory_messages or request.conversation_history
        
        if history_to_use:
            prompt_parts.append("\nConversation History:")
            # Save only last 5 messages to avoid context too long
            for msg in history_to_use[-5:]:
                role = msg.role
                content = msg.content
                prompt_parts.append(f"{role}: {content}")
        
        prompt_parts.append(f"\nUser: {request.message}")
        
        return "\n".join(prompt_parts)


@lru_cache
def get_gemini_service() -> GeminiService:
    """
    Factory function to create GeminiService instance (cached, singleton).
    Use this as a FastAPI dependency.
    
    The service is cached to avoid recreating the Gemini model on every request.
    Thread-safe and efficient for high-traffic scenarios.
    
    Returns:
        GeminiService: Configured Gemini service instance (singleton)
        
    Raises:
        ValueError: If GEMINI_API_KEY is not configured
    """
    return GeminiService()