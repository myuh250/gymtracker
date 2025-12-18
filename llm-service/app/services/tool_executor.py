import logging
from typing import Dict, Any, List

from app.services.vector_search_service import get_vector_search_service
from app.clients.backend_client import BackendAPIClient

logger = logging.getLogger(__name__)


class ToolExecutor:
    """Execute tools requested by Gemini Function Calling"""
    
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
            tool_args: Arguments from Gemini
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
        """Execute get_user_stats tool"""
        async with BackendAPIClient() as client:
            stats = await client.get_user_stats(
                user_id=user_id,
                days=args.get('days', 30)
            )
        
        return {
            "tool": "get_user_stats",
            "stats": stats
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