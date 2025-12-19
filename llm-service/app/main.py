from fastapi import FastAPI
import logging

from app.core.config import settings
from app.core.security import setup_cors
from app.core.redis_client import get_redis_pool, verify_redis_connection
from app.api.routes_health import router as health_router
from app.api.routes_chat import router as chat_router

# ====================================
# Logging Configuration
# ====================================
# Configure logging BEFORE app initialization
# FastAPI/Uvicorn only configures uvicorn.access and uvicorn.error
# This enables logging for all app modules
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
)

logger = logging.getLogger(__name__)

# Create FastAPI instance
app = FastAPI(
    title=settings.APP_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    docs_url=settings.DOCS_URL,
    redoc_url=settings.REDOC_URL,
)

# Setup middleware
setup_cors(app)

# Include routers
app.include_router(health_router)
app.include_router(chat_router)


# ====================================
# Lifecycle Events
# ====================================

@app.on_event("startup")
async def startup_event():
    """
    Application startup event
    
    Initializes and verifies all required connections:
    - Redis connection pool
    - OpenAI API configuration
    """
    logger.info(f"🚀 Starting {settings.APP_NAME} v{settings.VERSION}")
    
    # Verify Redis connection
    try:
        redis_ok = await verify_redis_connection()
        if redis_ok:
            logger.info("✅ Redis connection verified")
        else:
            logger.error("❌ Redis connection failed - service may not work properly")
    except Exception as e:
        logger.error(f"❌ Failed to verify Redis connection: {e}")
    
    logger.info("✅ Application startup complete")


@app.on_event("shutdown")
async def shutdown_event():
    """
    Application shutdown event
    
    Gracefully closes all connections:
    - Redis connection pool cleanup
    """
    logger.info("🛑 Shutting down application...")
    
    try:
        pool = get_redis_pool()
        await pool.disconnect()
        logger.info("✅ Redis connection pool closed")
    except Exception as e:
        logger.error(f"❌ Error closing Redis pool: {e}")
    
    logger.info("✅ Application shutdown complete")
