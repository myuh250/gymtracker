from fastapi import APIRouter
from app.core.config import settings


router = APIRouter(tags=["Health"])


@router.get("/")
def root():
    """Root endpoint - basic service information"""
    return {
        "service": settings.APP_NAME,
        "status": "running",
        "message": "AI service is ready!"
    }


@router.get("/health")
def health_check():
    """Detailed health check endpoint"""
    return {
        "status": "healthy",
        "service": "llm-service",
        "version": settings.VERSION
    }

