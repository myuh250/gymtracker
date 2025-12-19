import logging
import hashlib
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime

from openai import AsyncOpenAI
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
    after_log
)

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    """
    Service for generating vector embeddings using OpenAI API.
    
    Features:
    - Single and batch embedding generation
    - In-memory caching to reduce API calls
    - Automatic retry with exponential backoff
    - Text preparation helpers for exercises and workouts
    """
    
    # OpenAI embedding model and configuration
    EMBEDDING_MODEL = "text-embedding-3-small"
    EMBEDDING_DIMENSION = 1536  # OpenAI text-embedding-3-small dimension
    MAX_BATCH_SIZE = 100  # OpenAI API limit
    
    def __init__(self):
        """Initialize OpenAI API configuration and cache."""
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is not set in environment variables")
        
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        
        # Simple in-memory cache: {text_hash: embedding}
        self._cache: Dict[str, List[float]] = {}
        
        logger.info(f"EmbeddingService initialized with model: {self.EMBEDDING_MODEL}")
    
    def _get_cache_key(self, text: str) -> str:
        """
        Generate cache key from text using hash.
        
        Args:
            text: Input text
            
        Returns:
            MD5 hash of the text
        """
        return hashlib.md5(text.encode('utf-8')).hexdigest()
    
    def _get_from_cache(self, text: str) -> Optional[List[float]]:
        """
        Retrieve embedding from cache if exists.
        
        Args:
            text: Input text
            
        Returns:
            Cached embedding or None
        """
        cache_key = self._get_cache_key(text)
        return self._cache.get(cache_key)
    
    def _save_to_cache(self, text: str, embedding: List[float]) -> None:
        """
        Save embedding to cache.
        
        Args:
            text: Input text
            embedding: Generated embedding vector
        """
        cache_key = self._get_cache_key(text)
        self._cache[cache_key] = embedding
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((
            ConnectionError,
            TimeoutError,
            OSError,
        )),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        after=after_log(logger, logging.INFO),
        reraise=True
    )
    async def generate_embedding(self, text: str, use_cache: bool = True) -> List[float]:
        """
        Generate embedding for a single text.
        
        Args:
            text: Input text to embed
            use_cache: Whether to use cache (default: True)
            
        Returns:
            Embedding vector (1536 dimensions for text-embedding-3-small)
            
        Raises:
            ValueError: If text is empty
            Exception: If API call fails after retries
        """
        if not text or not text.strip():
            raise ValueError("Text cannot be empty")
        
        # Check cache first
        if use_cache:
            cached = self._get_from_cache(text)
            if cached is not None:
                logger.debug(f"Cache hit for text: {text[:50]}...")
                return cached
        
        logger.debug(f"Generating embedding for text: {text[:50]}...")
        
        try:
            # Call OpenAI API
            response = await self.client.embeddings.create(
                model=self.EMBEDDING_MODEL,
                input=text
            )
            
            embedding = response.data[0].embedding
            
            # Validate embedding dimension
            if len(embedding) != self.EMBEDDING_DIMENSION:
                raise ValueError(
                    f"Unexpected embedding dimension: {len(embedding)} "
                    f"(expected {self.EMBEDDING_DIMENSION})"
                )
            
            # Save to cache
            if use_cache:
                self._save_to_cache(text, embedding)
            
            logger.debug(f"Successfully generated embedding (dim: {len(embedding)})")
            return embedding
            
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            raise
    
    async def generate_embeddings_batch(
        self,
        texts: List[str],
        use_cache: bool = True
    ) -> List[List[float]]:
        """
        Generate embeddings for multiple texts with batching.
        
        This method automatically splits large lists into batches
        of MAX_BATCH_SIZE to comply with API limits.
        
        Args:
            texts: List of texts to embed
            use_cache: Whether to use cache (default: True)
            
        Returns:
            List of embedding vectors
            
        Raises:
            ValueError: If texts list is empty
        """
        if not texts:
            raise ValueError("Texts list cannot be empty")
        
        logger.info(f"Generating embeddings for {len(texts)} texts")
        
        embeddings: List[List[float]] = []
        
        # Process in batches
        for i in range(0, len(texts), self.MAX_BATCH_SIZE):
            batch = texts[i:i + self.MAX_BATCH_SIZE]
            batch_num = i // self.MAX_BATCH_SIZE + 1
            total_batches = (len(texts) + self.MAX_BATCH_SIZE - 1) // self.MAX_BATCH_SIZE
            
            logger.info(f"Processing batch {batch_num}/{total_batches} ({len(batch)} texts)")
            
            # Check cache and separate cached/uncached
            cached_embeddings: Dict[int, List[float]] = {}
            uncached_texts: List[tuple[int, str]] = []
            
            for idx, text in enumerate(batch):
                if use_cache:
                    cached = self._get_from_cache(text)
                    if cached is not None:
                        cached_embeddings[idx] = cached
                        continue
                
                uncached_texts.append((idx, text))
            
            logger.info(
                f"Batch {batch_num}: {len(cached_embeddings)} cached, "
                f"{len(uncached_texts)} need API call"
            )
            
            # Generate embeddings for uncached texts
            if uncached_texts:
                try:
                    # Extract just the texts for API call
                    texts_to_embed = [text for _, text in uncached_texts]
                    
                    # Call OpenAI API for batch
                    response = await self.client.embeddings.create(
                        model=self.EMBEDDING_MODEL,
                        input=texts_to_embed
                    )
                    
                    # Store results with original indices
                    for (idx, text), embedding_data in zip(uncached_texts, response.data):
                        embedding = embedding_data.embedding
                        cached_embeddings[idx] = embedding
                        
                        # Save to cache
                        if use_cache:
                            self._save_to_cache(text, embedding)
                
                except Exception as e:
                    logger.error(f"Batch {batch_num} failed: {e}")
                    raise
            
            # Reconstruct embeddings in original order
            batch_embeddings = [cached_embeddings[idx] for idx in range(len(batch))]
            embeddings.extend(batch_embeddings)
        
        logger.info(f"Successfully generated {len(embeddings)} embeddings")
        return embeddings
    
    # ========== Helper Methods for Text Preparation ==========
    
    @staticmethod
    def prepare_exercise_text(exercise: Dict[str, Any]) -> str:
        """
        Prepare exercise data for embedding.
        
        Combines name, muscle group, and description into a single text
        optimized for semantic search.
        
        Args:
            exercise: Exercise dict from backend API with keys:
                - name: Exercise name
                - muscleGroup: Target muscle group
                - description: Exercise description (optional)
                
        Returns:
            Formatted text string
            
        Example:
            >>> exercise = {
            ...     "name": "Bench Press",
            ...     "muscleGroup": "CHEST",
            ...     "description": "Barbell chest press on flat bench"
            ... }
            >>> prepare_exercise_text(exercise)
            "Bench Press | Muscle Group: CHEST | Description: Barbell chest press on flat bench"
        """
        parts = []
        
        # Exercise name (required)
        if name := exercise.get('name'):
            parts.append(name)
        
        # Muscle group
        if muscle_group := exercise.get('muscleGroup'):
            parts.append(f"Muscle Group: {muscle_group}")
        
        # Description
        if description := exercise.get('description'):
            parts.append(f"Description: {description}")
        
        return " | ".join(parts) if parts else "Unknown Exercise"
    
    @staticmethod
    def prepare_workout_text(workout: Dict[str, Any]) -> str:
        """
        Prepare workout log data for embedding.
        
        Creates a summary of the workout including date, exercises,
        volume, and notes.
        
        Args:
            workout: Workout dict from backend API with keys:
                - logDate: Workout date
                - sets: List of exercise sets
                - notes: User notes (optional)
                - totalDurationMinutes: Duration (optional)
                
        Returns:
            Formatted text string
            
        Example:
            >>> workout = {
            ...     "logDate": "2024-01-15",
            ...     "sets": [
            ...         {"exerciseName": "Bench Press", "reps": 10, "weight": 80},
            ...         {"exerciseName": "Squat", "reps": 12, "weight": 100}
            ...     ],
            ...     "notes": "Good session",
            ...     "totalDurationMinutes": 60
            ... }
            >>> prepare_workout_text(workout)
            "Workout on 2024-01-15 | Exercises: Bench Press (10 reps x 80kg), Squat ..."
        """
        parts = []
        
        # Workout date
        if log_date := workout.get('logDate'):
            parts.append(f"Workout on {log_date}")
        
        # Exercise summary
        if sets := workout.get('sets'):
            exercise_summary = []
            for exercise_set in sets:
                exercise_name = exercise_set.get('exerciseName', 'Unknown')
                reps = exercise_set.get('reps', 0)
                weight = exercise_set.get('weight', 0)
                exercise_summary.append(
                    f"{exercise_name} ({reps} reps x {weight}kg)"
                )
            
            if exercise_summary:
                parts.append(f"Exercises: {', '.join(exercise_summary[:5])}")  # Limit to 5
        
        # Duration
        if duration := workout.get('totalDurationMinutes'):
            parts.append(f"Duration: {duration} minutes")
        
        # User notes
        if notes := workout.get('notes'):
            parts.append(f"Notes: {notes}")
        
        return " | ".join(parts) if parts else "Empty Workout"
    
    def clear_cache(self) -> int:
        """
        Clear the embedding cache.
        
        Returns:
            Number of entries cleared
        """
        count = len(self._cache)
        self._cache.clear()
        logger.info(f"Cleared {count} entries from embedding cache")
        return count
    
    def get_cache_size(self) -> int:
        """
        Get current cache size.
        
        Returns:
            Number of cached embeddings
        """
        return len(self._cache)


# Singleton instance factory
_embedding_service: Optional[EmbeddingService] = None


def get_embedding_service() -> EmbeddingService:
    """
    Get or create singleton EmbeddingService instance.
    
    Returns:
        EmbeddingService instance
        
    Raises:
        ValueError: If OPENAI_API_KEY is not configured
    """
    global _embedding_service
    
    if _embedding_service is None:
        _embedding_service = EmbeddingService()
    
    return _embedding_service
