import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

from app.core.config import get_settings
from app.db.models import Base

settings = get_settings()


async def init_database():
    """Initialize database with pgvector extension and create tables."""
    print(f"Connecting to database: {settings.DATABASE_URL}")
    
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    
    try:
        async with engine.begin() as conn:
            # Create pgvector extension
            print("\n📦 Creating pgvector extension...")
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            
            # Create all tables
            print("📋 Creating tables...")
            await conn.run_sync(Base.metadata.create_all)
            
            # Verify tables created
            result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            tables = [row[0] for row in result]
            
            # Verify vector extension
            result = await conn.execute(text("""
                SELECT extname, extversion 
                FROM pg_extension 
                WHERE extname = 'vector'
            """))
            vector_info = result.first()
            
            # Print success summary
            print("\n" + "="*50)
            print("✓ Database initialization successful!")
            print("="*50)
            if vector_info:
                print(f"✓ Vector extension version: {vector_info[1]}")
            print(f"✓ Tables created: {len(tables)}")
            for table in tables:
                print(f"  - {table}")
            print("="*50 + "\n")
            
    except Exception as e:
        print("\n" + "="*50)
        print(f"✗ Error initializing database: {e}")
        print("="*50 + "\n")
        raise
    finally:
        await engine.dispose()


async def drop_database():
    """Drop all tables (use with caution!)."""
    print(f"WARNING: Dropping all tables from: {settings.DATABASE_URL}")
    response = input("Are you sure? Type 'yes' to continue: ")
    
    if response.lower() != 'yes':
        print("Operation cancelled.")
        return
    
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    
    try:
        async with engine.begin() as conn:
            print("Dropping tables...")
            await conn.run_sync(Base.metadata.drop_all)
            print("✓ All tables dropped")
    except Exception as e:
        print(f"✗ Error dropping database: {e}")
        raise
    finally:
        await engine.dispose()


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--drop":
        asyncio.run(drop_database())
    else:
        asyncio.run(init_database())
