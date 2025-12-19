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
    
    MIN_SIMILARITY = 0.6  # Filter out irrelevant results
    
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
        
        async with AsyncSessionLocal() as session:
            similarity_expr = 1 - ExerciseEmbedding.embedding.cosine_distance(query_embedding)
            
            query_stmt = select(
                ExerciseEmbedding,
                similarity_expr.label('similarity')
            ).where(
                similarity_expr >= self.MIN_SIMILARITY  # Filter threshold
            )
            
            if muscle_group:
                query_stmt = query_stmt.where(ExerciseEmbedding.muscle_group == muscle_group)
            
            query_stmt = query_stmt.order_by(
                ExerciseEmbedding.embedding.cosine_distance(query_embedding).asc()  # Explicit ASC
            ).limit(limit)
            
            result = await session.execute(query_stmt)
            
            results = []
            for row in result:
                exercise, similarity = row[0], row[1]
                results.append({
                    'id': exercise.id,
                    'exercise_id': exercise.exercise_id,
                    'embedding_text': exercise.embedding_text,
                    'muscle_group': exercise.muscle_group,
                    'similarity': float(similarity)
                })
        
        logger.info(f"Found {len(results)} exercises (similarity >= {self.MIN_SIMILARITY})")
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
        
        async with AsyncSessionLocal() as session:
            similarity_expr = 1 - WorkoutLogEmbedding.embedding.cosine_distance(query_embedding)
            
            query_stmt = select(
                WorkoutLogEmbedding,
                similarity_expr.label('similarity')
            ).where(
                WorkoutLogEmbedding.user_id == user_id,
                similarity_expr >= self.MIN_SIMILARITY  # Filter threshold
            ).order_by(
                WorkoutLogEmbedding.embedding.cosine_distance(query_embedding).asc()  # Explicit ASC
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
