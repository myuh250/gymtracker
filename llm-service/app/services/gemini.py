import google.generativeai as genai
import logging
from typing import Optional
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
from app.schemas.llm import ChatRequest, ChatResponse, UsageStats

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
            # 1️⃣ Build prompt with context
            prompt = self._build_chat_prompt(request)
            
            # 2️⃣ Call Gemini WITH RETRY - ✅ GỌI _call_gemini_with_retry()
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
    
    def _build_chat_prompt(self, request: ChatRequest) -> str:
        """Build prompt with context and conversation history"""
        
        prompt_parts = [SYSTEM_PROMPT]
        
        if request.context:
            prompt_parts.append(f"\nContext: {request.context}")
        
        if request.conversation_history:
            prompt_parts.append("\nConversation History:")
            for msg in request.conversation_history[-20:]:
                role = msg.role
                content = msg.content
                prompt_parts.append(f"{role}: {content}")
        
        prompt_parts.append(f"\nUser: {request.message}")
        
        return "\n".join(prompt_parts)


def get_gemini_service() -> GeminiService:
    """
    Factory function to create GeminiService instance.
    Use this as a FastAPI dependency.
    
    Returns:
        GeminiService: Configured Gemini service instance
        
    Raises:
        ValueError: If GEMINI_API_KEY is not configured
    """
    return GeminiService()