import json
import logging
from typing import Optional, List, Any, Dict
from functools import lru_cache
from fastapi import HTTPException
from openai import AsyncOpenAI, OpenAIError, APIError, RateLimitError
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


class OpenAIService:
    """Service for interacting with OpenAI API"""
    
    def __init__(self):
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is not set in environment variables")
        
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
    
    def _convert_tools_to_openai_format(self, tools: List[Dict]) -> List[Dict]:
        """
        Convert dictionary tools to OpenAI function calling format.
        
        Args:
            tools: List of tool definitions as dictionaries
            
        Returns:
            List of tool objects compatible with OpenAI API
        """
        openai_tools = []
        for tool in tools:
            openai_tools.append({
                "type": "function",
                "function": {
                    "name": tool["name"],
                    "description": tool["description"],
                    "parameters": tool["parameters"]
                }
            })
        return openai_tools
    
    def _build_messages(
        self,
        request: ChatRequest,
        memory_messages: Optional[List[ChatMessage]] = None,
        rag_context: Optional[str] = None
    ) -> List[Dict[str, str]]:
        """
        Build messages array for OpenAI API.
        
        Args:
            request: Chat request with user message
            memory_messages: Conversation history from Redis
            rag_context: Optional RAG context for long-term memory
            
        Returns:
            List of message objects for OpenAI API
        """
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        # Add RAG context if provided (long-term memory)
        if rag_context:
            messages.append({
                "role": "system",
                "content": f"Context from knowledge base:\n{rag_context}"
            })
        
        # Add conversation history (short-term memory)
        history_to_use = memory_messages or request.conversation_history
        if history_to_use:
            for msg in history_to_use[-5:]:  # Last 5 messages
                messages.append({
                    "role": msg.role,
                    "content": msg.content
                })
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": request.message
        })
        
        return messages
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        
        # Only retry recoverable exceptions
        retry=retry_if_exception_type((
            ConnectionError,
            TimeoutError,
            OSError,
            RateLimitError,
        )),
        
        before_sleep=before_sleep_log(logger, logging.WARNING),
        after=after_log(logger, logging.INFO),
        
        # Reraise last exception if all retries fail
        reraise=True
    )
    async def _call_openai_with_retry(
        self,
        messages: List[Dict[str, str]],
        tools: Optional[List[Dict]] = None
    ) -> Any:
        """
        Internal method to call OpenAI API with retry logic.
        
        Args:
            messages: List of message objects
            tools: Optional list of tool definitions for function calling
            
        Returns:
            OpenAI API response
            
        Raises:
            Exception: If all retry attempts fail
        """
        kwargs = {
            "model": self.model,
            "messages": messages,
            "temperature": settings.OPENAI_TEMPERATURE,
            "max_tokens": settings.OPENAI_MAX_TOKENS,
        }
        
        if tools:
            kwargs["tools"] = tools
        
        response = await self.client.chat.completions.create(**kwargs)
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
            messages = self._build_messages(request, memory_messages)
            
            logger.info(
                f"Generating SHORT-TERM response "
                f"(history length: {len(memory_messages) if memory_messages else 0})"
            )
            
            response = await self._call_openai_with_retry(messages)
            
            # Validate response
            if not response.choices or not response.choices[0].message.content:
                raise HTTPException(
                    status_code=500,
                    detail="OpenAI returned empty response"
                )
            
            # Build usage stats
            usage = None
            if response.usage:
                usage = UsageStats(
                    prompt_tokens=response.usage.prompt_tokens,
                    completion_tokens=response.usage.completion_tokens,
                    total_tokens=response.usage.total_tokens,
                )
            
            return ChatResponse(
                response=response.choices[0].message.content,
                model=self.model,
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
    
    async def check_needs_tools(
        self,
        request: ChatRequest,
        tools: List[Dict],
        memory_messages: Optional[List[ChatMessage]] = None
    ) -> Any:
        """
        Check if OpenAI needs to use tools (Function Calling).
        
        This is the decision point: does the query need RAG (long-term memory)
        or just conversation history (short-term memory)?
        
        Args:
            request: Chat request
            tools: List of tool definitions
            memory_messages: Conversation history from Redis
            
        Returns:
            OpenAI response (may contain tool_calls or direct text)
            
        Raises:
            HTTPException: If API call fails after retries
        """
        messages = self._build_messages(request, memory_messages)
        openai_tools = self._convert_tools_to_openai_format(tools)
        
        try:
            response = await self._call_openai_with_retry(messages, tools=openai_tools)
            return response
            
        except Exception as e:
            logger.error(f"Error calling OpenAI with tools: {e}")
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
            logger.info("RAG context length=%d preview=%s",
                         len(rag_context) if rag_context else 0,
                         (rag_context[:500] + '...') if rag_context and len(rag_context) > 500 else rag_context)
            
            logger.info(
                f"Building LONG-TERM prompt with RAG context "
                f"(history length: {len(memory_messages) if memory_messages else 0})"
            )
            
            # Build messages with RAG + conversation history
            messages = self._build_messages(request, memory_messages, rag_context)
            
            # Call OpenAI with RAG context
            response = await self._call_openai_with_retry(messages)
            
            if not response.choices or not response.choices[0].message.content:
                raise HTTPException(
                    status_code=500,
                    detail="OpenAI returned empty response"
                )
            
            # Build usage stats
            usage = None
            if response.usage:
                usage = UsageStats(
                    prompt_tokens=response.usage.prompt_tokens,
                    completion_tokens=response.usage.completion_tokens,
                    total_tokens=response.usage.total_tokens,
                )
            
            return ChatResponse(
                response=response.choices[0].message.content,
                model=self.model,
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
        MAX_TEXT_LENGTH = 250
        
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
            
            elif tool_name == 'get_user_workout_history':
                parts.append("\n=== User's Workout History (RAG) ===")
                workouts = result.get('workouts', [])
                parts.append(f"Found {len(workouts)} workout(s):\n")
                
                for i, workout in enumerate(workouts):
                    # Extract date and basic info (try multiple field name formats)
                    date = workout.get('logDate') or workout.get('workoutDate') or workout.get('date') or workout.get('workout_date', 'Unknown')
                    notes = workout.get('notes', '')
                    sets = workout.get('sets', [])
                    
                    # Format workout summary
                    parts.append(f"📅 {date}")
                    if notes:
                        parts.append(f"   Notes: {notes[:100]}")
                    if sets:
                        parts.append(f"   Exercises: {len(sets)} sets completed")
                    parts.append("")  # Empty line for readability
        
        return "\n".join(parts)


@lru_cache
def get_openai_service() -> OpenAIService:
    """
    Factory function to create OpenAIService instance (cached, singleton).
    Use this as a FastAPI dependency.
    
    The service is cached to avoid recreating the OpenAI client on every request.
    Thread-safe and efficient for high-traffic scenarios.
    
    Returns:
        OpenAIService: Configured OpenAI service instance (singleton)
        
    Raises:
        ValueError: If OPENAI_API_KEY is not configured
    """
    return OpenAIService()
