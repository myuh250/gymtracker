import google.generativeai as genai
import logging
from typing import Optional, List, Any, Dict
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
        Internal method to call Gemini API with retry logic (no tools).
        
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
    async def _call_gemini_with_tools_retry(self, prompt: str, tools: List[Dict]) -> Any:
        """
        Internal method to call Gemini API with tools (Function Calling) and retry logic.
        
        Args:
            prompt: The formatted prompt to send
            tools: List of tool definitions for function calling
            
        Returns:
            Gemini API response (may contain function_call)
            
        Raises:
            Exception: If all retry attempts fail
        """
        response = await self.model.generate_content_async(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=settings.GEMINI_TEMPERATURE,
                max_output_tokens=settings.GEMINI_MAX_TOKENS,
            ),
            tools=tools
        )
        return response
    
    async def chat_with_memory(
        self,
        request: ChatRequest,
        memory_messages: Optional[List[ChatMessage]] = None
    ) -> ChatResponse:
        """
        SHORT-TERM MEMORY: Chat with conversation history only.
        
        This method uses ONLY Redis conversation history (no RAG).
        Use this when the query doesn't need domain knowledge or
        personalized workout data.
        
        Args:
            request: Chat request with user message
            memory_messages: Conversation history from Redis
            
        Returns:
            ChatResponse with AI response and usage stats
            
        Raises:
            HTTPException: If API call fails or returns empty response
        """
        try:
            prompt = self._build_short_term_prompt(request, memory_messages)
            
            logger.info(
                f"Generating SHORT-TERM response "
                f"(history length: {len(memory_messages) if memory_messages else 0})"
            )
            
            response = await self._call_gemini_with_retry(prompt)
            
            # Validate response
            if not response.text:
                raise HTTPException(
                    status_code=500,
                    detail="Gemini returned empty response"
                )
            
            # Build usage stats (defensive: usage_metadata can be None)
            usage = None
            if response.usage_metadata:
                usage = UsageStats(
                    prompt_tokens=response.usage_metadata.prompt_token_count,
                    completion_tokens=response.usage_metadata.candidates_token_count,
                    total_tokens=response.usage_metadata.total_token_count,
                )
            
            return ChatResponse(
                response=response.text,
                model=settings.GEMINI_MODEL,
                usage=usage
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to generate response with memory: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate response: {str(e)}"
            )
    
    def _build_short_term_prompt(
        self,
        request: ChatRequest,
        memory_messages: Optional[List[ChatMessage]] = None
    ) -> str:
        """
        Build prompt for SHORT-TERM path (conversation history only).
        
        Used by: chat_with_memory()
        
        Args:
            request: Chat request with user message
            memory_messages: Conversation history from Redis
            
        Returns:
            Formatted prompt string for Gemini
        """
        prompt_parts = [SYSTEM_PROMPT]
        
        # Add conversation history
        history_to_use = memory_messages or request.conversation_history
        if history_to_use:
            prompt_parts.append("\nConversation History:")
            for msg in history_to_use[-5:]:
                prompt_parts.append(f"{msg.role}: {msg.content}")
        
        prompt_parts.append(f"\nUser: {request.message}")
        
        return "\n".join(prompt_parts)
    
    def _build_long_term_prompt(
        self,
        request: ChatRequest,
        rag_context: str,
        memory_messages: Optional[List[ChatMessage]] = None
    ) -> str:
        """
        Build prompt for LONG-TERM path (RAG + conversation history).
        
        Used by: chat_with_tool_results()
        
        Args:
            request: Chat request with user message
            rag_context: Formatted RAG results (vector search data)
            memory_messages: Conversation history from Redis
            
        Returns:
            Formatted prompt string for Gemini
        """
        prompt_parts = [SYSTEM_PROMPT]
        
        # Add RAG context (long-term memory)
        if rag_context:
            prompt_parts.append(f"\n{rag_context}")
        
        # Add conversation history (short-term memory)
        if memory_messages:
            prompt_parts.append("\nConversation History:")
            for msg in memory_messages[-5:]:
                prompt_parts.append(f"{msg.role}: {msg.content}")
        
        prompt_parts.append(f"\nUser: {request.message}")
        
        return "\n".join(prompt_parts)
    
    async def check_needs_tools(
        self,
        request: ChatRequest,
        tools: List[Dict],
        memory_messages: Optional[List[ChatMessage]] = None
    ) -> Any:
        """
        Check if Gemini needs to use tools (Function Calling).
        
        This is the decision point: does the query need RAG (long-term memory)
        or just conversation history (short-term memory)?
        
        Args:
            request: Chat request
            tools: List of tool definitions
            memory_messages: Conversation history from Redis
            
        Returns:
            Gemini response (may contain function_call or direct text)
            
        Raises:
            HTTPException: If API call fails after retries
        """
        prompt = self._build_short_term_prompt(request, memory_messages)
        
        try:
            response = await self._call_gemini_with_tools_retry(prompt, tools)
            return response
            
        except Exception as e:
            logger.error(f"Error calling Gemini with tools: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate response: {str(e)}"
            )
    
    async def chat_with_tool_results(
        self,
        request: ChatRequest,
        tool_results: List[Dict],
        memory_messages: Optional[List[ChatMessage]] = None
    ) -> ChatResponse:
        """
        LONG-TERM MEMORY: Synthesize response with RAG context.
        
        This method handles RAG-based responses by combining:
        - Vector search results (long-term memory)
        - Conversation history (short-term memory)
        
        Args:
            request: Chat request
            tool_results: Results from RAG tools
            memory_messages: Conversation history from Redis
            
        Returns:
            ChatResponse with RAG-enhanced answer
        """
        try:
            # Format RAG results as context
            rag_context = self._format_tool_results(tool_results)
            
            logger.info(
                f"Building LONG-TERM prompt with RAG context "
                f"(history length: {len(memory_messages) if memory_messages else 0})"
            )
            
            # Build prompt with RAG + conversation history
            prompt = self._build_long_term_prompt(request, rag_context, memory_messages)
            
            # Call Gemini with RAG context
            response = await self._call_gemini_with_retry(prompt)
            
            if not response.text:
                raise HTTPException(
                    status_code=500,
                    detail="Gemini returned empty response"
                )
            
            # Build usage stats (defensive: usage_metadata can be None)
            usage = None
            if response.usage_metadata:
                usage = UsageStats(
                    prompt_tokens=response.usage_metadata.prompt_token_count,
                    completion_tokens=response.usage_metadata.candidates_token_count,
                    total_tokens=response.usage_metadata.total_token_count,
                )
            
            return ChatResponse(
                response=response.text,
                model=settings.GEMINI_MODEL,
                usage=usage
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to synthesize RAG response: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate response: {str(e)}"
            )
    
    def _format_tool_results(self, tool_results: List[Dict]) -> str:
        """
        Format tool execution results for LLM context.
        
        Note: Limits results to top 3 per tool to prevent token explosion.
        """
        MAX_RESULTS_PER_TOOL = 3
        MAX_TEXT_LENGTH = 150
        
        parts = []
        
        for result in tool_results:
            tool_name = result.get('tool', 'unknown')
            
            if tool_name == 'search_exercises':
                parts.append("=== Exercise Knowledge (RAG) ===")
                results = result.get('results', [])[:MAX_RESULTS_PER_TOOL]
                for ex in results:
                    parts.append(f"• {ex['embedding_text'][:MAX_TEXT_LENGTH]}")
                    parts.append(f"  Similarity: {ex['similarity']:.2f}")
            
            elif tool_name == 'search_user_workouts':
                parts.append("\n=== User's Past Workouts (RAG) ===")
                results = result.get('results', [])[:MAX_RESULTS_PER_TOOL]
                for w in results:
                    parts.append(f"• {w['summary_text'][:MAX_TEXT_LENGTH]}")
                    parts.append(f"  Date: {w['workout_date']}, Similarity: {w['similarity']:.2f}")
            
            elif tool_name == 'get_user_stats':
                stats = result.get('stats', {})
                parts.append(f"\n=== User Statistics (last {stats.get('days', 30)} days) ===")
                parts.append(f"• Total workouts: {stats.get('totalWorkouts', 0)}")
                parts.append(f"• Total volume: {stats.get('totalVolume', 0):.0f} kg")
                parts.append(f"• Avg workouts/week: {stats.get('averageWorkoutsPerWeek', 0):.1f}")
        
        return "\n".join(parts)


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