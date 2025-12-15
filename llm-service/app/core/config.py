from typing import List, Optional
from pydantic import Field, field_validator, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration settings"""
    
    # App metadata
    APP_NAME: str = "Gym Tracker LLM Service"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "AI/LLM service for workout suggestions, analysis, and knowledge queries"
    
    # API documentation
    DOCS_URL: str = "/docs"
    REDOC_URL: str = "/redoc"
    
    # CORS settings - stored as string, parsed to list
    ALLOWED_ORIGINS_STR: str = Field(
        default="http://localhost:5173,http://localhost:8080",
        description="Comma-separated list of allowed origins"
    )
    
    # Gemini API settings
    GEMINI_API_KEY: str = Field(
        ..., # Required environment variable
        description="Gemini API key"
    )
    GEMINI_MODEL: str = Field(
        default="gemini-2.5-flash",
        description="Gemini model name"
    )
    GEMINI_TEMPERATURE: float = Field(
        default=0.7,
        ge=0.0,
        le=2.0,
        description="Temperature for response generation"
    )
    GEMINI_MAX_TOKENS: int = Field(
        default=2048,
        gt=0,
        description="Maximum tokens for response"
    )
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )
    
    # REDIS settings
    REDIS_HOST: str = Field(
        default="localhost",
        description="Redis host"
    )
    REDIS_PORT: int = Field(
        default=6379,
        description="Redis port"
    )
    REDIS_DB: int = Field(
        default=0,
        description="Redis database number (0-15)"
    )
    REDIS_PASSWORD: Optional[str] = Field(
        default=None,
        description="Redis password (if auth enabled)"
    )
    REDIS_MAX_CONNECTIONS: int = Field(
        default=10,
        description="Maximum Redis pool connections"
    )
    
    # Session settings
    SESSION_TTL_SECONDS: int = Field(
        default=7200,  
        description="Session expiry time in seconds"
    )
    MAX_MESSAGES_PER_SESSION: int = Field(
        default=50,
        description="Maximum messages to keep per session"
    )
    
    @computed_field
    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        """Parse comma-separated origins into a list"""
        return [
            origin.strip() 
            for origin in self.ALLOWED_ORIGINS_STR.split(",") 
            if origin.strip()
        ]


# Create a global settings instance
settings = Settings()

