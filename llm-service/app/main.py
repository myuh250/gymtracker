from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Create FastAPI instance
app = FastAPI(
    title="Gym Tracker LLM Service",
    description="AI/LLM service for workout suggestions, analysis, and knowledge queries",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:8080"  # Default for development
)

# Parse origins
origins = [origin.strip() for origin in allowed_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "service": "Gym Tracker LLM Service",
        "status": "running",
        "message": "AI service is ready!"
    }

@app.get("/health")
def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "service": "llm-service",
        "version": "1.0.0"
    }
