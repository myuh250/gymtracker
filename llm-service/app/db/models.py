from datetime import datetime
from typing import List

from sqlalchemy import (
    BigInteger,
    Column,
    String,
    Text,
    Integer,
    Float,
    Date,
    DateTime,
    Index,
)
from pgvector.sqlalchemy import Vector

from app.db.database import Base


class ExerciseEmbedding(Base):
    """
    Exercise embeddings for general gym knowledge RAG.
    
    Stores vector embeddings of exercises for semantic search.
    Synced with backend Exercise entity (name, muscle_group, description, media_url, is_custom, created_by_user_id)
    """
    __tablename__ = "exercise_embeddings"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    exercise_id = Column(BigInteger, nullable=False, unique=True, index=True)
    
    # Content
    embedding_text = Column(Text, nullable=False)  # Combined text from name + description
    embedding = Column(Vector(768), nullable=False)  # Gemini embedding dimension
    
    # Metadata for filtering (from backend Exercise entity)
    muscle_group = Column(String(50))  # Matches backend muscleGroup
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index(
            'idx_exercise_embeddings_vector',
            'embedding',
            postgresql_using='ivfflat',
            postgresql_with={'lists': 100},
            postgresql_ops={'embedding': 'vector_cosine_ops'}
        ),
    )

    def __repr__(self):
        return f"<ExerciseEmbedding(id={self.id}, exercise_id={self.exercise_id})>"


class WorkoutLogEmbedding(Base):
    """
    Workout log embeddings for personalized user history RAG.
    
    Stores vector embeddings of user workout logs (last 3-6 months only).
    """
    __tablename__ = "workout_log_embeddings"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, nullable=False, index=True)
    workout_log_id = Column(BigInteger, nullable=False, unique=True)
    
    # Content
    summary_text = Column(Text, nullable=False)
    embedding = Column(Vector(768), nullable=False)
    
    # Metadata
    workout_date = Column(Date, nullable=False, index=True)
    total_volume = Column(Float)
    exercise_count = Column(Integer)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index('idx_workout_embeddings_user', 'user_id'),
        Index('idx_workout_embeddings_date', 'workout_date'),
        Index(
            'idx_workout_embeddings_vector',
            'embedding',
            postgresql_using='ivfflat',
            postgresql_with={'lists': 100},
            postgresql_ops={'embedding': 'vector_cosine_ops'}
        ),
    )

    def __repr__(self):
        return f"<WorkoutLogEmbedding(id={self.id}, user_id={self.user_id}, workout_log_id={self.workout_log_id})>"


class KnowledgeBase(Base):
    """
    Curated gym knowledge base for RAG.
    
    Stores manually curated or scraped gym knowledge (form tips, nutrition, etc.)
    """
    __tablename__ = "knowledge_base"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(50), index=True)  # 'form', 'nutrition', 'recovery', 'programming'
    embedding = Column(Vector(768), nullable=False)
    source = Column(String(100))
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index('idx_knowledge_category', 'category'),
        Index(
            'idx_knowledge_embedding',
            'embedding',
            postgresql_using='ivfflat',
            postgresql_with={'lists': 100},
            postgresql_ops={'embedding': 'vector_cosine_ops'}
        ),
    )

    def __repr__(self):
        return f"<KnowledgeBase(id={self.id}, title='{self.title}')>"


class SyncMetadata(Base):
    """
    Sync metadata for tracking data synchronization from backend.
    
    Tracks sync jobs, durations, and status for monitoring.
    """
    __tablename__ = "sync_metadata"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    
    sync_type = Column(String(50), nullable=False, index=True)  # 'exercise', 'workout', 'knowledge'
    last_sync_at = Column(DateTime, nullable=False)
    sync_duration_ms = Column(Integer)
    entities_synced = Column(Integer)
    status = Column(String(20))  # 'success', 'failed', 'partial'
    error_message = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index('idx_sync_metadata_type_time', 'sync_type', 'last_sync_at'),
    )

    def __repr__(self):
        return f"<SyncMetadata(id={self.id}, sync_type='{self.sync_type}', status='{self.status}')>"
