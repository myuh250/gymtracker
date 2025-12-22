import httpx
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type
)

from app.core.config import get_settings


class BackendAPIError(Exception):
    """Base exception for backend API errors"""
    pass


class AuthenticationError(BackendAPIError):
    """Raised when service token is invalid or expired"""
    pass


class PermissionError(BackendAPIError):
    """Raised when service lacks required scope"""
    pass


class BackendAPIClient:
    """
    HTTP client for communicating with backend RAG endpoints.
    
    All endpoints require service token with appropriate scopes:
    - rag:read - For reading exercise/workout data
    - rag:sync - For data synchronization
    
    Features:
    - Automatic retry with exponential backoff
    - Service token authentication
    - Proper error handling
    - Request/response logging
    """
    
    def __init__(self, base_url: Optional[str] = None, service_token: Optional[str] = None):
        """
        Initialize backend API client.
        
        Args:
            base_url: Backend base URL (default from settings)
            service_token: Service authentication token (default from settings)
        """
        settings = get_settings()
        
        self.base_url = base_url or settings.BACKEND_BASE_URL
        self.service_token = service_token or settings.BACKEND_SERVICE_TOKEN
        
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=30.0,
            headers={
                "Authorization": f"Bearer {self.service_token}",
                "Content-Type": "application/json"
            }
        )
    
    async def close(self):
        """Close HTTP client connection"""
        await self.client.aclose()
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10),
        retry=retry_if_exception_type((httpx.RequestError, httpx.TimeoutException))
    )
    async def _request(
        self, 
        method: str, 
        endpoint: str, 
        **kwargs
    ) -> Dict[str, Any]:
        """
        Make HTTP request with retry logic.
        
        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint path
            **kwargs: Additional request parameters
            
        Returns:
            Response JSON data
            
        Raises:
            AuthenticationError: Service token invalid (401)
            PermissionError: Insufficient scope (403)
            BackendAPIError: Other API errors
            ConnectionError: Network/connection errors
        """
        try:
            response = await self.client.request(method, endpoint, **kwargs)
            response.raise_for_status()
            return response.json()
            
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 401:
                raise AuthenticationError(
                    "Service token invalid or expired. "
                    "Please regenerate token from backend."
                )
            elif e.response.status_code == 403:
                raise PermissionError(
                    f"Insufficient scope for {endpoint}. "
                    "Service account needs 'rag:read' or 'rag:sync' scope."
                )
            elif e.response.status_code >= 500:
                raise BackendAPIError(
                    f"Backend server error ({e.response.status_code}): {e.response.text}"
                )
            else:
                raise BackendAPIError(
                    f"API request failed ({e.response.status_code}): {e.response.text}"
                )
                
        except httpx.RequestError as e:
            raise ConnectionError(
                f"Failed to connect to backend at {self.base_url}: {str(e)}"
            )
    
    # ========== Exercise Endpoints ==========
    
    async def export_all_exercises(self) -> List[Dict[str, Any]]:
        """
        Export all exercises (for initial RAG sync).
        
        Endpoint: GET /internal/exercises/export
        Required scope: rag:sync or service:admin
        
        Returns:
            List of exercise objects with:
            - id: Exercise ID
            - name: Exercise name
            - muscleGroup: Target muscle group
            - description: Exercise description
            - mediaUrl: Media URL (if available)
            - isCustom: Whether custom exercise
            - createdByUserId: Creator user ID (if custom)
        """
        return await self._request("GET", "/internal/exercises/export")
    
    async def get_exercises_updated_since(
        self, 
        since: datetime
    ) -> List[Dict[str, Any]]:
        """
        Get exercises updated since a specific timestamp (for incremental sync).
        
        Endpoint: GET /internal/exercises/updated-since
        Required scope: rag:sync or service:admin
        
        Args:
            since: Timestamp to compare (exercises updated after this)
            
        Returns:
            List of updated exercise objects
        """
        params = {"since": since.isoformat()}
        return await self._request(
            "GET", 
            "/internal/exercises/updated-since",
            params=params
        )
    
    # ========== Workout Endpoints ==========
    
    async def get_workouts_updated_since(
        self,
        since: datetime,
        user_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Get workout logs updated since a specific timestamp (for incremental sync).
        
        Endpoint: GET /internal/workouts/updated-since
        Required scope: rag:sync or service:admin
        
        Args:
            since: Timestamp to compare
            user_id: Optional user ID for user-specific sync
            
        Returns:
            List of updated workout log objects with exercise sets
        """
        params = {"since": since.isoformat()}
        if user_id is not None:
            params["userId"] = user_id
            
        return await self._request(
            "GET",
            "/internal/workouts/updated-since",
            params=params
        )
    
    # ========== User-Specific Endpoints ==========
    
    async def get_user_workouts(
        self,
        user_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Get workout history for a specific user (for personalized RAG).
        
        Endpoint: GET /internal/users/{userId}/workouts
        Required scope: rag:read or service:admin
        
        Args:
            user_id: User ID
            start_date: Start date (default: 6 months ago)
            end_date: End date (default: today)
            limit: Max results (default: 100)
            
        Returns:
            List of workout logs with exercise sets
        """
        params = {"limit": limit}
        
        if start_date:
            params["startDate"] = start_date.date().isoformat()
        if end_date:
            params["endDate"] = end_date.date().isoformat()
            
        return await self._request(
            "GET",
            f"/internal/users/{user_id}/workouts",
            params=params
        )
    
    async def get_user_stats(
        self,
        user_id: int,
        days: int = 30
    ) -> Dict[str, Any]:
        """
        Get aggregated workout statistics for a user.
        
        Endpoint: GET /internal/users/{userId}/stats
        Required scope: rag:read or service:admin
        
        Args:
            user_id: User ID
            days: Number of days to look back (default: 30)
            
        Returns:
            Workout statistics:
            - totalWorkouts: Total completed workouts
            - totalVolume: Total volume (reps * weight)
            - totalDurationMinutes: Total duration
            - favoriteExercises: Top 5 exercises
            - averageWorkoutsPerWeek: Weekly average
            - muscleGroupDistribution: Exercise count by muscle group
        """
        params = {"days": days}
        return await self._request(
            "GET",
            f"/internal/users/{user_id}/stats",
            params=params
        )
    
    # ========== Health Check ==========
    
    async def health_check(self) -> bool:
        """
        Check if backend is reachable and service token is valid.
        
        Returns:
            True if backend is healthy, False otherwise
        """
        try:
            # Try a simple endpoint to verify connectivity
            await self._request("GET", "/internal/exercises/export")
            return True
        except Exception:
            return False
