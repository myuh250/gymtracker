import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from sqlalchemy import select

from app.services.embedding_service import get_embedding_service
from app.db.database import AsyncSessionLocal
from app.db.models import ExerciseEmbedding, WorkoutLogEmbedding

logger = logging.getLogger(__name__)


@dataclass
class SearchResult:
    """Combined search result with exercises and workouts."""
    exercises: List[Dict[str, Any]]
    workouts: List[Dict[str, Any]]
    query: str
    total_results: int


class VectorSearchService:
    """Semantic search service for RAG."""
    
    MIN_SIMILARITY = 0.3  # Giảm từ 0.5 xuống 0.3 để hỗ trợ cross-language search
    
    def __init__(self):
        self.embedding_service = get_embedding_service()
    
    async def search_exercises(
        self,
        query: str,
        limit: int = 5,
        muscle_group: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Semantic search for exercises.
        
        Returns exercises with similarity >= MIN_SIMILARITY, ordered by relevance.
        """
        logger.info(f"Searching exercises: '{query}' (limit: {limit})")
        
        query_embedding = await self.embedding_service.generate_embedding(query)
        logger.debug(
            "Query embedding generated for exercises: len=%d type=%s sample=%s",
            len(query_embedding) if hasattr(query_embedding, '__len__') else -1,
            type(query_embedding),
            (query_embedding[:5] if hasattr(query_embedding, '__getitem__') else query_embedding)
        )
        
        async with AsyncSessionLocal() as session:
            similarity_expr = 1 - ExerciseEmbedding.embedding.cosine_distance(query_embedding)
            
            # Build base query
            query_stmt = select(
                ExerciseEmbedding,
                similarity_expr.label('similarity')
            )
            
            if muscle_group:
                query_stmt = query_stmt.where(ExerciseEmbedding.muscle_group == muscle_group)
            
            # Order by similarity FIRST (descending), then limit
            query_stmt = query_stmt.order_by(similarity_expr.desc()).limit(limit * 2)  # Get more for filtering
            
            result = await session.execute(query_stmt)
            
            # Filter by threshold AFTER ordering
            results: List[Dict[str, Any]] = []
            all_similarities: List[float] = []  # For debugging
            for row in result:
                exercise, similarity = row[0], float(row[1])
                all_similarities.append(similarity)
                
                if similarity >= self.MIN_SIMILARITY:
                    results.append({
                        'id': exercise.id,
                        'exercise_id': exercise.exercise_id,
                        'embedding_text': exercise.embedding_text,
                        'muscle_group': exercise.muscle_group,
                        'similarity': similarity
                    })
                    
                    # Stop once we have enough results
                    if len(results) >= limit:
                        break
            
            # Debug logging: show top similarities even if below threshold
            if all_similarities:
                logger.debug(f"Top similarities: {all_similarities[:5]}")
                logger.info(f"Found {len(results)} exercises (similarity >= {self.MIN_SIMILARITY})")
                if len(results) == 0 and all_similarities[0] < self.MIN_SIMILARITY:
                    logger.warning(
                        f"No results above threshold {self.MIN_SIMILARITY}. "
                        f"Top similarity was {all_similarities[0]:.3f}. "
                        f"Consider lowering MIN_SIMILARITY or checking data quality."
                    )
            else:
                logger.warning("No exercises found in database (empty table?)")
        
        return results
    
    async def search_user_workouts(
        self,
        user_id: int,
        query: str,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Semantic search for user's workout history.
        
        Returns workouts with similarity >= MIN_SIMILARITY, ordered by relevance.
        """
        logger.info(f"Searching workouts: user={user_id}, query='{query}' (limit: {limit})")
        
        query_embedding = await self.embedding_service.generate_embedding(query)
        logger.debug(
            "Query embedding generated for workouts: len=%d type=%s sample=%s",
            len(query_embedding) if hasattr(query_embedding, '__len__') else -1,
            type(query_embedding),
            (query_embedding[:5] if hasattr(query_embedding, '__getitem__') else query_embedding)
        )
        
        async with AsyncSessionLocal() as session:
            similarity_expr = 1 - WorkoutLogEmbedding.embedding.cosine_distance(query_embedding)
            
            query_stmt = select(
                WorkoutLogEmbedding,
                similarity_expr.label('similarity')
            ).where(
                WorkoutLogEmbedding.user_id == user_id,
                similarity_expr >= self.MIN_SIMILARITY  # Filter threshold
            ).order_by(
                similarity_expr.desc()  # Order by similarity (desc)
            ).limit(limit)
            
            result = await session.execute(query_stmt)
            
            results = []
            for row in result:
                workout, similarity = row[0], row[1]
                results.append({
                    'id': workout.id,
                    'user_id': workout.user_id,
                    'workout_log_id': workout.workout_log_id,
                    'summary_text': workout.summary_text,
                    'workout_date': workout.workout_date,
                    'total_volume': workout.total_volume,
                    'exercise_count': workout.exercise_count,
                    'similarity': float(similarity)
                })
        logger.debug("Workout similarities: %s", [r['similarity'] for r in results])
        
        logger.info(f"Found {len(results)} workouts (similarity >= {self.MIN_SIMILARITY})")
        return results
    
    async def hybrid_search(
        self,
        query: str,
        user_id: Optional[int] = None,
        exercise_limit: int = 3,
        workout_limit: int = 3
    ) -> SearchResult:
        """
        Combined search: exercises + user workouts.
        
        Main RAG retrieval - returns general knowledge + personalized context.
        """
        logger.info(f"Hybrid search: '{query}' (user_id: {user_id})")
        
        exercises = await self.search_exercises(query, limit=exercise_limit)
        
        workouts = []
        if user_id is not None:
            workouts = await self.search_user_workouts(user_id, query, limit=workout_limit)
        
        result = SearchResult(
            exercises=exercises,
            workouts=workouts,
            query=query,
            total_results=len(exercises) + len(workouts)
        )
        
        logger.info(f"Found {len(exercises)} exercises + {len(workouts)} workouts")
        return result
    

# Singleton
_vector_search_service: Optional[VectorSearchService] = None


def get_vector_search_service() -> VectorSearchService:
    """Get or create singleton instance."""
    global _vector_search_service
    if _vector_search_service is None:
        _vector_search_service = VectorSearchService()
    return _vector_search_service
