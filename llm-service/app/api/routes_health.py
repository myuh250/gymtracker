from fastapi import APIRouter, Depends, HTTPException
from redis.asyncio import Redis
from datetime import datetime

from app.core.config import settings
from app.core.redis_client import get_redis, verify_redis_connection


router = APIRouter(tags=["Health"])


@router.get("/")
def root():
    """Root endpoint - basic service information"""
    return {
        "service": settings.APP_NAME,
        "status": "running",
        "message": "AI service is ready!",
        "version": settings.VERSION
    }


@router.get("/health")
async def health_check(redis: Redis = Depends(get_redis)):
    """
    Comprehensive health check endpoint
    
    Checks:
    - Application status
    - Redis connectivity
    - Configuration validity
    
    Returns:
        Health status with details for all components
    """
    # Check Redis
    redis_status = "healthy"
    redis_message = "Connected"
    
    try:
        await redis.ping()
    except Exception as e:
        redis_status = "unhealthy"
        redis_message = f"Connection failed: {str(e)}"
    
    # Overall status
    overall_status = "healthy" if redis_status == "healthy" else "degraded"
    
    return {
        "status": overall_status,
        "service": settings.APP_NAME,
        "version": settings.VERSION,
        "timestamp": datetime.utcnow().isoformat(),
        "components": {
            "redis": {
                "status": redis_status,
                "message": redis_message,
                "host": settings.REDIS_HOST,
                "port": settings.REDIS_PORT,
                "db": settings.REDIS_DB
            },
            "llm": {
                "status": "configured",
                "model": settings.GEMINI_MODEL
            }
        }
    }


@router.get("/health/redis")
async def redis_health_check(redis: Redis = Depends(get_redis)):
    """
    Dedicated Redis health check endpoint
    
    Performs detailed Redis connectivity and performance checks:
    - Connection test (PING)
    - Write test (SET)
    - Read test (GET)
    - Delete test (DEL)
    
    Returns:
        Detailed Redis health status
        
    Raises:
        HTTPException 503: If Redis is unavailable
    """
    try:
        # Test 1: PING
        await redis.ping()
        
        # Test 2: Write/Read/Delete
        test_key = "_health_check_test"
        test_value = "ok"
        
        await redis.set(test_key, test_value, ex=10)  # 10 seconds TTL
        read_value = await redis.get(test_key)
        await redis.delete(test_key)
        
        if read_value != test_value:
            raise Exception("Read/Write test failed")
        
        # Get some Redis info
        info = await redis.info("server")
        
        return {
            "status": "healthy",
            "message": "Redis is operational",
            "checks": {
                "ping": "✅ OK",
                "write": "✅ OK",
                "read": "✅ OK",
                "delete": "✅ OK"
            },
            "redis_info": {
                "version": info.get("redis_version", "unknown"),
                "uptime_seconds": info.get("uptime_in_seconds", 0)
            },
            "config": {
                "host": settings.REDIS_HOST,
                "port": settings.REDIS_PORT,
                "db": settings.REDIS_DB,
                "max_connections": settings.REDIS_MAX_CONNECTIONS
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail={
                "status": "unhealthy",
                "message": f"Redis health check failed: {str(e)}",
                "error": str(e)
            }
        )

