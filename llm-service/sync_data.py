"""
Simple Manual Sync Script for RAG Data

Usage:
    python sync_data.py                    # Sync all (exercises + user 1 workouts)
    python sync_data.py --exercises-only   # Only sync exercises
    python sync_data.py --user 1           # Only sync workouts for user 1
    python sync_data.py --user 1 --days 90 # Sync last 90 days for user 1

Requirements:
    - Backend must be running (http://localhost:8080)
    - PostgreSQL must be running
    - .env file with GEMINI_API_KEY and BACKEND_SERVICE_TOKEN
"""

import asyncio
import argparse
import time
import sys
from datetime import datetime, timedelta
from typing import List, Dict, Any

from sqlalchemy import select, delete
from sqlalchemy.dialects.postgresql import insert

# Add app to path
sys.path.insert(0, '.')

from app.core.config import get_settings
from app.db.database import AsyncSessionLocal, engine
from app.db.models import ExerciseEmbedding, WorkoutLogEmbedding, SyncMetadata
from app.clients.backend_client import BackendAPIClient
from app.services.embedding_service import get_embedding_service

settings = get_settings()


class SyncStats:
    """Track sync statistics"""
    def __init__(self):
        self.exercises_synced = 0
        self.workouts_synced = 0
        self.total_duration = 0.0
        self.errors = []


async def sync_exercises(stats: SyncStats) -> None:
    """
    Sync all exercises from backend to vector DB.
    
    Steps:
    1. Fetch exercises from backend
    2. Generate embeddings
    3. Upsert to database
    """
    print("\n" + "=" * 70)
    print("📚 Syncing Exercises")
    print("=" * 70)
    
    start_time = time.time()
    
    try:
        # Step 1: Fetch from backend
        print("\n[1/3] Fetching exercises from backend...", end=" ", flush=True)
        async with BackendAPIClient() as client:
            exercises = await client.export_all_exercises()
        print(f"✓ ({len(exercises)} exercises)")
        
        if not exercises:
            print("⚠️  No exercises found in backend")
            return
        
        # Step 2: Generate embeddings
        print("[2/3] Generating embeddings...", end=" ", flush=True)
        embedding_service = get_embedding_service()
        
        # Prepare texts
        texts = [
            embedding_service.prepare_exercise_text(ex) 
            for ex in exercises
        ]
        
        # Generate embeddings in batch
        embeddings = await embedding_service.generate_embeddings_batch(texts)
        print(f"✓ ({len(embeddings)} vectors)")
        
        # Step 3: Save to database
        print("[3/3] Saving to database...", end=" ", flush=True)
        async with AsyncSessionLocal() as session:
            for exercise, embedding_vector, text in zip(exercises, embeddings, texts):
                # Upsert using PostgreSQL ON CONFLICT
                stmt = insert(ExerciseEmbedding).values(
                    exercise_id=exercise['id'],
                    embedding_text=text,
                    embedding=embedding_vector,
                    muscle_group=exercise.get('muscleGroup'),
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                
                # Update if exercise_id already exists
                stmt = stmt.on_conflict_do_update(
                    index_elements=['exercise_id'],
                    set_={
                        'embedding_text': text,
                        'embedding': embedding_vector,
                        'muscle_group': exercise.get('muscleGroup'),
                        'updated_at': datetime.utcnow()
                    }
                )
                
                await session.execute(stmt)
            
            await session.commit()
        
        print(f"✓")
        
        stats.exercises_synced = len(exercises)
        elapsed = time.time() - start_time
        
        print(f"\n✅ Exercises sync completed in {elapsed:.2f}s")
        print(f"   Total: {len(exercises)} exercises")
        print(f"   Cache size: {embedding_service.get_cache_size()} embeddings")
        
    except Exception as e:
        print(f"\n❌ Error syncing exercises: {e}")
        stats.errors.append(f"Exercises: {e}")
        import traceback
        traceback.print_exc()


async def sync_all_workouts(days: int, stats: SyncStats) -> None:
    """
    Sync workout logs for ALL users in database.
    
    Uses per-user endpoint to fetch workouts and manually inject userId.
    This approach doesn't require userId in the backend response.
    
    Args:
        days: Number of days of history to sync (default: 180)
        stats: Stats tracker
    """
    # Hardcoded user IDs for development
    USER_IDS = [1, 2, 3, 4, 5]
    
    print("\n" + "=" * 70)
    print(f"💪 Syncing Workouts for ALL Users (last {days} days)")
    print("=" * 70)
    print(f"Target users: {USER_IDS}")
    
    start_time = time.time()
    
    try:
        # Step 1: Fetch workouts for each user
        print(f"\n[1/3] Fetching workouts from backend...")
        
        start_date = datetime.now() - timedelta(days=days)
        end_date = datetime.now()
        
        all_workouts = []
        successful_users = []
        
        async with BackendAPIClient() as client:
            for user_id in USER_IDS:
                print(f"   User {user_id}...", end=" ", flush=True)
                
                try:
                    workouts = await client.get_user_workouts(
                        user_id=user_id,
                        start_date=start_date,
                        end_date=end_date,
                        limit=1000
                    )
                    
                    # Manually inject userId into each workout
                    for workout in workouts:
                        workout['userId'] = user_id
                    
                    all_workouts.extend(workouts)
                    successful_users.append(user_id)
                    print(f"✓ ({len(workouts)} workouts)")
                    
                except Exception as e:
                    print(f"✗ Error: {str(e)[:50]}")
        
        print(f"\n✓ Total: {len(all_workouts)} workouts from {len(successful_users)} users")
        
        if not all_workouts:
            print("⚠️  No workouts found for any user")
            return
        
        # Step 2: Generate embeddings
        print("\n[2/3] Generating embeddings...", end=" ", flush=True)
        embedding_service = get_embedding_service()
        
        # Prepare texts
        texts = [
            embedding_service.prepare_workout_text(workout)
            for workout in all_workouts
        ]
        
        # Generate embeddings in batch
        embeddings = await embedding_service.generate_embeddings_batch(texts)
        print(f"✓ ({len(embeddings)} vectors)")
        
        # Step 3: Save to database
        print("[3/3] Saving to database...", end=" ", flush=True)
        saved_count = 0
        async with AsyncSessionLocal() as session:
            for workout, embedding_vector, text in zip(all_workouts, embeddings, texts):
                # Calculate metadata
                total_volume = 0.0
                exercise_count = len(workout.get('sets', []))
                
                for exercise_set in workout.get('sets', []):
                    if exercise_set.get('isCompleted'):
                        reps = exercise_set.get('reps', 0)
                        weight = exercise_set.get('weight', 0)
                        total_volume += reps * weight
                
                # Get user_id from workout (we injected it earlier)
                user_id = workout.get('userId')
                if not user_id:
                    continue
                
                # Upsert using PostgreSQL ON CONFLICT
                stmt = insert(WorkoutLogEmbedding).values(
                    user_id=user_id,
                    workout_log_id=workout['id'],
                    summary_text=text,
                    embedding=embedding_vector,
                    workout_date=datetime.fromisoformat(workout['logDate']).date(),
                    total_volume=total_volume,
                    exercise_count=exercise_count,
                    created_at=datetime.utcnow()
                )
                
                # Update if workout_log_id already exists
                stmt = stmt.on_conflict_do_update(
                    index_elements=['workout_log_id'],
                    set_={
                        'summary_text': text,
                        'embedding': embedding_vector,
                        'workout_date': datetime.fromisoformat(workout['logDate']).date(),
                        'total_volume': total_volume,
                        'exercise_count': exercise_count
                    }
                )
                
                await session.execute(stmt)
                saved_count += 1
            
            await session.commit()
        
        print(f"✓ ({saved_count} saved)")
        
        stats.workouts_synced = saved_count
        elapsed = time.time() - start_time
        
        print(f"\n✅ All users workouts sync completed in {elapsed:.2f}s")
        print(f"   Total: {len(all_workouts)} workouts")
        print(f"   Saved: {saved_count} embeddings")
        print(f"   Users: {len(successful_users)} users ({successful_users})")
        print(f"   Date range: last {days} days")
        print(f"   Cache size: {embedding_service.get_cache_size()} embeddings")
        
    except Exception as e:
        print(f"\n❌ Error syncing all workouts: {e}")
        stats.errors.append(f"All Workouts: {e}")
        import traceback
        traceback.print_exc()


async def sync_user_workouts(user_id: int, days: int, stats: SyncStats) -> None:
    """
    Sync workout logs for a specific user.
    
    Args:
        user_id: User ID to sync workouts for
        days: Number of days of history to sync (default: 180)
        stats: Stats tracker
    """
    print("\n" + "=" * 70)
    print(f"💪 Syncing Workouts for User {user_id} (last {days} days)")
    print("=" * 70)
    
    start_time = time.time()
    
    try:
        # Step 1: Fetch workouts from backend
        print("\n[1/3] Fetching workouts from backend...", end=" ", flush=True)
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        async with BackendAPIClient() as client:
            workouts = await client.get_user_workouts(
                user_id=user_id,
                start_date=start_date,
                end_date=end_date,
                limit=1000
            )
        
        print(f"✓ ({len(workouts)} workouts)")
        
        if not workouts:
            print("⚠️  No workouts found for this user")
            return
        
        # Step 2: Generate embeddings
        print("[2/3] Generating embeddings...", end=" ", flush=True)
        embedding_service = get_embedding_service()
        
        # Prepare texts
        texts = [
            embedding_service.prepare_workout_text(workout)
            for workout in workouts
        ]
        
        # Generate embeddings in batch
        embeddings = await embedding_service.generate_embeddings_batch(texts)
        print(f"✓ ({len(embeddings)} vectors)")
        
        # Step 3: Save to database
        print("[3/3] Saving to database...", end=" ", flush=True)
        async with AsyncSessionLocal() as session:
            for workout, embedding_vector, text in zip(workouts, embeddings, texts):
                # Calculate metadata
                total_volume = 0.0
                exercise_count = len(workout.get('sets', []))
                
                for exercise_set in workout.get('sets', []):
                    if exercise_set.get('isCompleted'):
                        reps = exercise_set.get('reps', 0)
                        weight = exercise_set.get('weight', 0)
                        total_volume += reps * weight
                
                # Upsert using PostgreSQL ON CONFLICT
                stmt = insert(WorkoutLogEmbedding).values(
                    user_id=user_id,
                    workout_log_id=workout['id'],
                    summary_text=text,
                    embedding=embedding_vector,
                    workout_date=datetime.fromisoformat(workout['logDate']).date(),
                    total_volume=total_volume,
                    exercise_count=exercise_count,
                    created_at=datetime.utcnow()
                )
                
                # Update if workout_log_id already exists
                stmt = stmt.on_conflict_do_update(
                    index_elements=['workout_log_id'],
                    set_={
                        'summary_text': text,
                        'embedding': embedding_vector,
                        'workout_date': datetime.fromisoformat(workout['logDate']).date(),
                        'total_volume': total_volume,
                        'exercise_count': exercise_count
                    }
                )
                
                await session.execute(stmt)
            
            await session.commit()
        
        print(f"✓")
        
        stats.workouts_synced = len(workouts)
        elapsed = time.time() - start_time
        
        print(f"\n✅ Workouts sync completed in {elapsed:.2f}s")
        print(f"   Total: {len(workouts)} workouts")
        print(f"   Date range: {start_date.date()} to {end_date.date()}")
        print(f"   Cache size: {embedding_service.get_cache_size()} embeddings")
        
    except Exception as e:
        print(f"\n❌ Error syncing workouts: {e}")
        stats.errors.append(f"Workouts: {e}")
        import traceback
        traceback.print_exc()


async def verify_database() -> bool:
    """Verify database connection and tables exist."""
    try:
        async with AsyncSessionLocal() as session:
            # Try a simple query
            result = await session.execute(select(ExerciseEmbedding).limit(1))
            return True
    except Exception as e:
        print(f"❌ Database error: {e}")
        print("\n💡 Solution:")
        print("   Run: alembic upgrade head")
        print("   Or: python app/db/init_db.py")
        return False


async def verify_backend() -> bool:
    """Verify backend is reachable."""
    try:
        async with BackendAPIClient() as client:
            is_healthy = await client.health_check()
            return is_healthy
    except Exception as e:
        print(f"❌ Backend connection error: {e}")
        print("\n💡 Solution:")
        print("   1. Start backend: cd backend && mvn spring-boot:run")
        print("   2. Check BACKEND_SERVICE_TOKEN in .env")
        return False


async def main():
    """Main sync orchestrator"""
    parser = argparse.ArgumentParser(
        description='Sync RAG data from backend to vector database',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python sync_data.py                      # Sync exercises + user 1 workouts
  python sync_data.py --all-users          # Sync exercises + ALL users workouts
  python sync_data.py --exercises-only     # Only exercises
  python sync_data.py --user 2 --days 90   # User 2, last 90 days
        """
    )
    
    parser.add_argument(
        '--exercises-only',
        action='store_true',
        help='Only sync exercises (skip workouts)'
    )
    
    parser.add_argument(
        '--user',
        type=int,
        help='Sync workouts for specific user ID'
    )
    
    parser.add_argument(
        '--all-users',
        action='store_true',
        help='Sync workouts for ALL users in database'
    )
    
    parser.add_argument(
        '--days',
        type=int,
        default=180,
        help='Number of days of workout history to sync (default: 180)'
    )
    
    parser.add_argument(
        '--skip-verify',
        action='store_true',
        help='Skip pre-flight checks'
    )
    
    args = parser.parse_args()
    
    # Print header
    print("\n" + "=" * 70)
    print("🔄 RAG Data Sync Script")
    print("=" * 70)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Backend: {settings.BACKEND_BASE_URL}")
    print(f"Database: {settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}")
    
    # Pre-flight checks
    if not args.skip_verify:
        print("\n🔍 Running pre-flight checks...")
        
        print("   Checking database connection...", end=" ", flush=True)
        if not await verify_database():
            return
        print("✓")
        
        print("   Checking backend connection...", end=" ", flush=True)
        if not await verify_backend():
            return
        print("✓")
    
    # Initialize stats
    stats = SyncStats()
    overall_start = time.time()
    
    # Execute sync based on arguments
    try:
        if args.exercises_only:
            # Only sync exercises
            await sync_exercises(stats)
            
        elif args.all_users:
            # Sync exercises + ALL users workouts
            await sync_exercises(stats)
            await sync_all_workouts(args.days, stats)
            
        elif args.user:
            # Only sync workouts for specific user
            await sync_user_workouts(args.user, args.days, stats)
            
        else:
            # Default: Sync exercises + workouts for user 1
            await sync_exercises(stats)
            await sync_user_workouts(user_id=1, days=args.days, stats=stats)
        
        # Print summary
        overall_elapsed = time.time() - overall_start
        
        print("\n" + "=" * 70)
        print("📊 Sync Summary")
        print("=" * 70)
        print(f"✓ Exercises synced: {stats.exercises_synced}")
        print(f"✓ Workouts synced:  {stats.workouts_synced}")
        print(f"⏱️  Total duration:   {overall_elapsed:.2f}s")
        
        if stats.errors:
            print(f"\n⚠️  Errors encountered: {len(stats.errors)}")
            for error in stats.errors:
                print(f"   - {error}")
        else:
            print("\n✅ All sync operations completed successfully!")
        
        print("=" * 70 + "\n")
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Sync interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    print("\n💡 Make sure:")
    print("   1. Backend is running (http://localhost:8080)")
    print("   2. PostgreSQL is running")
    print("   3. .env has GEMINI_API_KEY and BACKEND_SERVICE_TOKEN")
    print("   4. Database tables created (alembic upgrade head)")
    
    asyncio.run(main())
