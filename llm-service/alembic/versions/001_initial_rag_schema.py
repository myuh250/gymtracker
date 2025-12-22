"""Initial RAG schema

Revision ID: 001_initial_rag_schema
Revises: 
Create Date: 2025-12-18 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector


# revision identifiers, used by Alembic.
revision: str = '001_initial_rag_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable pgvector extension
    op.execute('CREATE EXTENSION IF NOT EXISTS vector')
    
    # Create exercise_embeddings table
    op.create_table(
        'exercise_embeddings',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('exercise_id', sa.BigInteger(), nullable=False),
        sa.Column('embedding_text', sa.Text(), nullable=False),
        sa.Column('embedding', Vector(768), nullable=False),
        sa.Column('muscle_group', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('exercise_id')
    )
    op.create_index('idx_exercise_id', 'exercise_embeddings', ['exercise_id'])
    op.execute(
        'CREATE INDEX idx_exercise_embeddings_vector ON exercise_embeddings '
        'USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)'
    )
    
    # Create workout_log_embeddings table
    op.create_table(
        'workout_log_embeddings',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.BigInteger(), nullable=False),
        sa.Column('workout_log_id', sa.BigInteger(), nullable=False),
        sa.Column('summary_text', sa.Text(), nullable=False),
        sa.Column('embedding', Vector(768), nullable=False),
        sa.Column('workout_date', sa.Date(), nullable=False),
        sa.Column('total_volume', sa.Float(), nullable=True),
        sa.Column('exercise_count', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('workout_log_id')
    )
    op.create_index('idx_workout_embeddings_user', 'workout_log_embeddings', ['user_id'])
    op.create_index('idx_workout_embeddings_date', 'workout_log_embeddings', ['workout_date'], 
                    postgresql_order_by='workout_date DESC')
    op.execute(
        'CREATE INDEX idx_workout_embeddings_vector ON workout_log_embeddings '
        'USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)'
    )
    
    # Create knowledge_base table
    op.create_table(
        'knowledge_base',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=True),
        sa.Column('embedding', Vector(768), nullable=False),
        sa.Column('source', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_knowledge_category', 'knowledge_base', ['category'])
    op.execute(
        'CREATE INDEX idx_knowledge_embedding ON knowledge_base '
        'USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)'
    )
    
    # Create sync_metadata table
    op.create_table(
        'sync_metadata',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('sync_type', sa.String(length=50), nullable=False),
        sa.Column('last_sync_at', sa.DateTime(), nullable=False),
        sa.Column('sync_duration_ms', sa.Integer(), nullable=True),
        sa.Column('entities_synced', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_sync_metadata_type_time', 'sync_metadata', ['sync_type', 'last_sync_at'],
                    postgresql_order_by='last_sync_at DESC')


def downgrade() -> None:
    op.drop_index('idx_sync_metadata_type_time', table_name='sync_metadata')
    op.drop_table('sync_metadata')
    
    op.execute('DROP INDEX IF EXISTS idx_knowledge_embedding')
    op.drop_index('idx_knowledge_category', table_name='knowledge_base')
    op.drop_table('knowledge_base')
    
    op.execute('DROP INDEX IF EXISTS idx_workout_embeddings_vector')
    op.drop_index('idx_workout_embeddings_date', table_name='workout_log_embeddings')
    op.drop_index('idx_workout_embeddings_user', table_name='workout_log_embeddings')
    op.drop_table('workout_log_embeddings')
    
    op.execute('DROP INDEX IF EXISTS idx_exercise_embeddings_vector')
    op.drop_index('idx_exercise_id', table_name='exercise_embeddings')
    op.drop_table('exercise_embeddings')
    
    op.execute('DROP EXTENSION IF EXISTS vector')
