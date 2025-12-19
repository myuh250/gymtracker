"""Migrate to OpenAI embeddings (768 -> 1536 dimensions)

Revision ID: 002
Revises: 001
Create Date: 2024-12-19

This migration updates the vector dimension from 768 (Gemini) to 1536 (OpenAI text-embedding-3-small).
Since pgvector doesn't support altering vector dimensions, we need to:
1. Drop existing tables
2. Recreate with new dimension
3. Re-sync data from backend

WARNING: This will DELETE all existing RAG data. 
Run sync_data.py after migration to repopulate.
"""
from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector


# revision identifiers, used by Alembic.
revision = '002_migrate_to_openai'
down_revision = '001_initial_rag_schema'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Upgrade schema to use 1536-dimensional vectors (OpenAI embeddings).
    
    Steps:
    1. Drop existing tables (exercise_embeddings, workout_embeddings)
    2. Recreate with new vector dimension (1536)
    """
    # Drop existing tables (cascades will handle foreign keys if any)
    op.execute('DROP TABLE IF EXISTS workout_embeddings CASCADE')
    op.execute('DROP TABLE IF EXISTS exercise_embeddings CASCADE')
    
    # Recreate exercise_embeddings with 1536 dimensions
    op.create_table(
        'exercise_embeddings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('exercise_id', sa.Integer(), nullable=False),
        sa.Column('exercise_name', sa.String(length=255), nullable=False),
        sa.Column('muscle_group', sa.String(length=100), nullable=True),
        sa.Column('embedding_text', sa.Text(), nullable=False),
        sa.Column('embedding', Vector(1536), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('exercise_id')
    )
    
    # Create indexes for exercise_embeddings
    op.create_index('idx_exercise_embeddings_muscle_group', 'exercise_embeddings', ['muscle_group'], unique=False)
    
    # Recreate workout_embeddings with 1536 dimensions
    op.create_table(
        'workout_embeddings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('workout_log_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('workout_date', sa.Date(), nullable=False),
        sa.Column('summary_text', sa.Text(), nullable=False),
        sa.Column('embedding', Vector(1536), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('workout_log_id')
    )
    
    # Create indexes for workout_embeddings
    op.create_index('idx_workout_embeddings_user_id', 'workout_embeddings', ['user_id'], unique=False)
    op.create_index('idx_workout_embeddings_workout_date', 'workout_embeddings', ['workout_date'], unique=False)
    
    print("\n✅ Migration complete!")
    print("⚠️  WARNING: All RAG data has been deleted.")
    print("📝 Next step: Run 'python sync_data.py' to repopulate embeddings with OpenAI.")


def downgrade() -> None:
    """
    Downgrade schema back to 768-dimensional vectors (Gemini embeddings).
    
    This is a destructive operation that will also delete all data.
    """
    # Drop existing tables
    op.drop_table('workout_embeddings')
    op.drop_table('exercise_embeddings')
    
    # Recreate with 768 dimensions (Gemini)
    op.create_table(
        'exercise_embeddings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('exercise_id', sa.Integer(), nullable=False),
        sa.Column('exercise_name', sa.String(length=255), nullable=False),
        sa.Column('muscle_group', sa.String(length=100), nullable=True),
        sa.Column('embedding_text', sa.Text(), nullable=False),
        sa.Column('embedding', Vector(768), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_index('idx_exercise_embeddings_exercise_id', 'exercise_embeddings', ['exercise_id'], unique=False)
    op.create_index('idx_exercise_embeddings_muscle_group', 'exercise_embeddings', ['muscle_group'], unique=False)
    
    op.create_table(
        'workout_embeddings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('workout_log_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('workout_date', sa.Date(), nullable=False),
        sa.Column('summary_text', sa.Text(), nullable=False),
        sa.Column('embedding', Vector(768), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_index('idx_workout_embeddings_workout_log_id', 'workout_embeddings', ['workout_log_id'], unique=False)
    op.create_index('idx_workout_embeddings_user_id', 'workout_embeddings', ['user_id'], unique=False)
    op.create_index('idx_workout_embeddings_workout_date', 'workout_embeddings', ['workout_date'], unique=False)
