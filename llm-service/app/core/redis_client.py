from redis.asyncio import Redis, ConnectionPool
from functools import lru_cache
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


@lru_cache
def get_redis_pool() -> ConnectionPool:
    """
    Create Redis connection pool (cached, thread-safe)
    """
    logger.info(f"Creating Redis connection pool: {settings.REDIS_HOST}:{settings.REDIS_PORT}")
    return ConnectionPool(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        db=settings.REDIS_DB,
        password=settings.REDIS_PASSWORD,
        max_connections=settings.REDIS_MAX_CONNECTIONS,
        decode_responses=True,  # Auto decode bytes to str
    )


def get_redis() -> Redis:
    """
    FastAPI dependency to get Redis client
    """
    return Redis(connection_pool=get_redis_pool())


async def verify_redis_connection() -> bool:
    """
    Verify Redis connection is working
    
    Returns:
        bool: True if connection successful, False otherwise
    """
    try:
        redis = get_redis()
        await redis.ping()
        logger.info("✅ Redis connection verified")
        return True
    except Exception as e:
        logger.error(f"❌ Redis connection failed: {e}")
        return False