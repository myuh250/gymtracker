import logging
from typing import Dict, Any, List
from datetime import datetime, timedelta
from sqlalchemy import select, func, desc

from app.services.vector_search_service import get_vector_search_service
from app.db.database import AsyncSessionLocal
from app.db.models import WorkoutLogEmbedding, ExerciseEmbedding

logger = logging.getLogger(__name__)


class ToolExecutor:
    """Execute tools requested by OpenAI Function Calling"""
    
    def __init__(self):
        self.search_service = get_vector_search_service()
    
    async def execute(
        self, 
        tool_name: str, 
        tool_args: Dict[str, Any],
        user_id: int
    ) -> Dict[str, Any]:
        """
        Execute a tool and return results.
        
        Args:
            tool_name: Name of tool to execute
            tool_args: Arguments from OpenAI
            user_id: Current user ID
            
        Returns:
            Tool execution results
        """
        logger.info(f"Executing tool: {tool_name} with args: {tool_args}")
        
        try:
            if tool_name == "search_exercises":
                return await self._search_exercises(tool_args)
            
            elif tool_name == "search_user_workouts":
                return await self._search_user_workouts(tool_args, user_id)
            
            elif tool_name == "get_user_stats":
                return await self._get_user_stats(tool_args, user_id)
            
            elif tool_name == "get_user_workout_history":
                return await self._get_user_workout_history(tool_args, user_id)
            
            else:
                return {"error": f"Unknown tool: {tool_name}"}
        
        except Exception as e:
            logger.error(f"Tool execution error: {e}")
            return {"error": str(e)}
    
    async def _search_exercises(self, args: Dict) -> Dict:
        """Execute search_exercises tool"""
        results = await self.search_service.search_exercises(
            query=args['query'],
            limit=args.get('limit', 5),
            muscle_group=args.get('muscle_group')
        )
        
        return {
            "tool": "search_exercises",
            "results": results,
            "count": len(results)
        }
    
    async def _search_user_workouts(self, args: Dict, user_id: int) -> Dict:
        """Execute search_user_workouts tool"""
        results = await self.search_service.search_user_workouts(
            user_id=user_id,
            query=args['query'],
            limit=args.get('limit', 5)
        )
        
        return {
            "tool": "search_user_workouts",
            "results": results,
            "count": len(results)
        }
    
    async def _get_user_stats(self, args: Dict, user_id: int) -> Dict:
        """Execute get_user_stats tool - query PostgreSQL directly"""
        days = args.get('days', 30)
        cutoff_date = datetime.now().date() - timedelta(days=days)
        
        async with AsyncSessionLocal() as session:
            # Get total workouts count
            total_workouts_query = select(func.count(WorkoutLogEmbedding.id)).where(
                WorkoutLogEmbedding.user_id == user_id,
                WorkoutLogEmbedding.workout_date >= cutoff_date
            )
            total_workouts_result = await session.execute(total_workouts_query)
            total_workouts = total_workouts_result.scalar() or 0
            
            # Get total volume and duration
            stats_query = select(
                func.sum(WorkoutLogEmbedding.total_volume).label('total_volume'),
                func.avg(WorkoutLogEmbedding.total_volume).label('avg_volume')
            ).where(
                WorkoutLogEmbedding.user_id == user_id,
                WorkoutLogEmbedding.workout_date >= cutoff_date
            )
            stats_result = await session.execute(stats_query)
            stats_row = stats_result.first()
            
            total_volume = float(stats_row.total_volume) if stats_row.total_volume else 0.0
            avg_volume = float(stats_row.avg_volume) if stats_row.avg_volume else 0.0
            
            # Calculate average workouts per week
            weeks = max(days / 7, 1)
            avg_workouts_per_week = total_workouts / weeks if weeks > 0 else 0
            
            # Get recent workout dates for streak calculation
            recent_workouts_query = select(WorkoutLogEmbedding.workout_date).where(
                WorkoutLogEmbedding.user_id == user_id,
                WorkoutLogEmbedding.workout_date >= cutoff_date
            ).order_by(desc(WorkoutLogEmbedding.workout_date))
            recent_result = await session.execute(recent_workouts_query)
            workout_dates = [row[0] for row in recent_result.fetchall()]
        
        stats = {
            "totalWorkouts": total_workouts,
            "totalVolume": round(total_volume, 2),
            "averageVolume": round(avg_volume, 2),
            "averageWorkoutsPerWeek": round(avg_workouts_per_week, 2),
            "periodDays": days,
            "recentWorkoutDates": [date.isoformat() for date in workout_dates[:10]]  # Last 10 dates
        }
        
        return {
            "tool": "get_user_stats",
            "stats": stats
        }
    
    async def _get_user_workout_history(self, args: Dict, user_id: int) -> Dict:
        """Execute get_user_workout_history tool - query PostgreSQL directly"""
        
        days = min(args.get('days', 30), 180)  # Cap at 180 days
        limit = min(args.get('limit', 20), 100)  # Cap at 100
        
        start_date = (datetime.now() - timedelta(days=days)).date()
        
        async with AsyncSessionLocal() as session:
            # Query workout logs from PostgreSQL
            query = select(WorkoutLogEmbedding).where(
                WorkoutLogEmbedding.user_id == user_id,
                WorkoutLogEmbedding.workout_date >= start_date
            ).order_by(
                desc(WorkoutLogEmbedding.workout_date)
            ).limit(limit)
            
            result = await session.execute(query)
            workout_logs = result.scalars().all()
            
            # Format workouts for response
            workouts = []
            for workout in workout_logs:
                workouts.append({
                    "workoutLogId": workout.workout_log_id,
                    "workoutDate": workout.workout_date.isoformat(),
                    "summaryText": workout.summary_text,
                    "totalVolume": workout.total_volume,
                    "exerciseCount": workout.exercise_count,
                    "createdAt": workout.created_at.isoformat()
                })
        
        return {
            "tool": "get_user_workout_history",
            "workouts": workouts,
            "count": len(workouts)
        }
    
    async def execute_multiple(
        self,
        tool_calls: List[Dict[str, Any]],
        user_id: int
    ) -> List[Dict[str, Any]]:
        """Execute multiple tools in parallel (if needed)"""
        results = []
        
        for tool_call in tool_calls:
            result = await self.execute(
                tool_name=tool_call['name'],
                tool_args=tool_call['args'],
                user_id=user_id
            )
            results.append(result)
        
        return results


# Singleton
def get_tool_executor() -> ToolExecutor:
    return ToolExecutor()