from fastapi import FastAPI
from app.core.config import settings
from app.core.security import setup_cors
from app.api.routes_health import router as health_router
from app.api.routes_chat import router as chat_router


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
