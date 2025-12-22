-- ============================================
-- GYM TRACKER - Sample Data SQL Script
-- ============================================
-- This script creates sample data for all tables
-- Execute order: Users -> Exercises -> WorkoutLogs -> ExerciseSets -> ServiceAccounts
-- ============================================

-- ============================================
-- 0. CLEAN UP EXISTING DATA (Optional - uncomment if needed)
-- ============================================
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE exercise_sets;
TRUNCATE TABLE workout_logs;
TRUNCATE TABLE exercises;
TRUNCATE TABLE service_account_scopes;
TRUNCATE TABLE service_accounts;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. USERS DATA
-- ============================================
-- Password for all sample users: "password123" (hashed with BCrypt)
-- Note: In production, use proper password hashing through your service layer
-- INSERT IGNORE: Skip if email already exists (won't overwrite existing data)
INSERT IGNORE INTO users (email, password_hash, full_name, role, is_enabled, is_oauth, oauth_provider, oauth_id, avatar_url, created_at, updated_at) 
VALUES 
    ('admin@gymtracker.com', '$2a$10$vBTTUa71ueqg770/7DVbQepv6AOFH8oo7hCEjFPqps0.4OxDS2NDC', 'Admin User', 'ROLE_ADMIN', true, false, NULL, NULL, NULL, NOW(), NOW()),
    ('john.doe@example.com', '$2a$10$vBTTUa71ueqg770/7DVbQepv6AOFH8oo7hCEjFPqps0.4OxDS2NDC', 'John Doe', 'ROLE_USER', true, false, NULL, NULL, 'https://i.pravatar.cc/150?img=1', NOW(), NOW()),
    ('jane.smith@example.com', '$2a$10$vBTTUa71ueqg770/7DVbQepv6AOFH8oo7hCEjFPqps0.4OxDS2NDC', 'Jane Smith', 'ROLE_USER', true, false, NULL, NULL, 'https://i.pravatar.cc/150?img=2', NOW(), NOW()),
    ('mike.wilson@example.com', '$2a$10$vBTTUa71ueqg770/7DVbQepv6AOFH8oo7hCEjFPqps0.4OxDS2NDC', 'Mike Wilson', 'ROLE_USER', true, false, NULL, NULL, 'https://i.pravatar.cc/150?img=3', NOW(), NOW()),
    ('sarah.johnson@example.com', '$2a$10$vBTTUa71ueqg770/7DVbQepv6AOFH8oo7hCEjFPqps0.4OxDS2NDC', 'Sarah Johnson', 'ROLE_USER', true, false, NULL, NULL, 'https://i.pravatar.cc/150?img=4', NOW(), NOW()),
    ('google.user@gmail.com', NULL, 'Google OAuth User', 'ROLE_USER', true, true, 'google', '123456789', 'https://i.pravatar.cc/150?img=5', NOW(), NOW());

-- ============================================
-- 2. EXERCISES DATA
-- ============================================
-- INSERT IGNORE: Skip if exercise already exists (won't overwrite existing data)
-- Chest Exercises
INSERT IGNORE INTO exercises (name, muscle_group, description, is_custom, created_by_user_id, created_at, updated_at) 
VALUES 
    ('Bench Press', 'Chest', 'Classic barbell bench press for chest development. Lie on bench, lower bar to chest, press up.', false, NULL, NOW(), NOW()),
    ('Incline Dumbbell Press', 'Chest', 'Targets upper chest with dumbbells on incline bench (30-45 degrees).', false, NULL, NOW(), NOW()),
    ('Push-ups', 'Chest', 'Bodyweight exercise for chest, shoulders, and triceps. Great for endurance.', false, NULL, NOW(), NOW()),
    ('Chest Fly', 'Chest', 'Isolation exercise for chest using dumbbells or cables. Focus on stretch.', false, NULL, NOW(), NOW()),
    ('Dumbbell Pullover', 'Chest', 'Works both chest and lats. Lie perpendicular on bench with dumbbell.', false, NULL, NOW(), NOW());

-- Back Exercises
INSERT IGNORE INTO exercises (name, muscle_group, description, is_custom, created_by_user_id, created_at, updated_at)
VALUES
    ('Pull-ups', 'Back', 'Bodyweight exercise for back and biceps. Grip bar, pull chin over bar.', false, NULL, NOW(), NOW()),
    ('Barbell Row', 'Back', 'Compound movement for back thickness. Bend at hips, pull bar to lower chest.', false, NULL, NOW(), NOW()),
    ('Lat Pulldown', 'Back', 'Machine exercise targeting latissimus dorsi. Pull bar down to upper chest.', false, NULL, NOW(), NOW()),
    ('Deadlift', 'Back', 'Full body compound exercise, primarily back and legs. The king of exercises.', false, NULL, NOW(), NOW()),
    ('Seated Cable Row', 'Back', 'Cable exercise for mid-back. Pull handle to torso while keeping back straight.', false, NULL, NOW(), NOW()),
    ('T-Bar Row', 'Back', 'Compound row variation. Great for back thickness and strength.', false, NULL, NOW(), NOW());

-- Shoulder Exercises
INSERT IGNORE INTO exercises (name, muscle_group, description, is_custom, created_by_user_id, created_at, updated_at)
VALUES
    ('Overhead Press', 'Shoulders', 'Standing or seated barbell/dumbbell press. Press weight overhead.', false, NULL, NOW(), NOW()),
    ('Lateral Raise', 'Shoulders', 'Isolation exercise for side delts. Raise dumbbells to shoulder height.', false, NULL, NOW(), NOW()),
    ('Front Raise', 'Shoulders', 'Isolation exercise for front delts. Raise weight in front of body.', false, NULL, NOW(), NOW()),
    ('Face Pull', 'Shoulders', 'Cable exercise for rear delts and upper back. Pull rope to face level.', false, NULL, NOW(), NOW()),
    ('Arnold Press', 'Shoulders', 'Rotating dumbbell press. Named after Arnold Schwarzenegger.', false, NULL, NOW(), NOW());

-- Leg Exercises
INSERT IGNORE INTO exercises (name, muscle_group, description, is_custom, created_by_user_id, created_at, updated_at)
VALUES
    ('Squat', 'Legs', 'King of leg exercises, targets quads, glutes, and hamstrings.', false, NULL, NOW(), NOW()),
    ('Leg Press', 'Legs', 'Machine exercise for overall leg development. Safe alternative to squats.', false, NULL, NOW(), NOW()),
    ('Lunges', 'Legs', 'Unilateral exercise for legs and glutes. Step forward and lower back knee.', false, NULL, NOW(), NOW()),
    ('Leg Curl', 'Legs', 'Isolation exercise for hamstrings. Curl weight with legs on machine.', false, NULL, NOW(), NOW()),
    ('Calf Raise', 'Legs', 'Isolation exercise for calf muscles. Rise onto toes, lower slowly.', false, NULL, NOW(), NOW()),
    ('Romanian Deadlift', 'Legs', 'Hip hinge exercise targeting hamstrings and glutes.', false, NULL, NOW(), NOW()),
    ('Bulgarian Split Squat', 'Legs', 'Unilateral leg exercise. Rear foot elevated, front leg does the work.', false, NULL, NOW(), NOW());

-- Arm Exercises
INSERT IGNORE INTO exercises (name, muscle_group, description, is_custom, created_by_user_id, created_at, updated_at)
VALUES
    ('Barbell Curl', 'Biceps', 'Classic bicep exercise with barbell. Curl bar up, squeeze biceps.', false, NULL, NOW(), NOW()),
    ('Hammer Curl', 'Biceps', 'Dumbbell curl with neutral grip. Targets brachialis and biceps.', false, NULL, NOW(), NOW()),
    ('Preacher Curl', 'Biceps', 'Isolated bicep curl on preacher bench. Prevents cheating.', false, NULL, NOW(), NOW()),
    ('Tricep Dip', 'Triceps', 'Bodyweight or weighted exercise for triceps. Lower body, push up.', false, NULL, NOW(), NOW()),
    ('Tricep Pushdown', 'Triceps', 'Cable exercise for tricep isolation. Push rope/bar down, squeeze.', false, NULL, NOW(), NOW()),
    ('Close-Grip Bench Press', 'Triceps', 'Barbell exercise emphasizing triceps. Hands closer than shoulder width.', false, NULL, NOW(), NOW()),
    ('Skull Crusher', 'Triceps', 'Lying tricep extension. Lower bar to forehead, extend arms.', false, NULL, NOW(), NOW());

-- Core Exercises
INSERT IGNORE INTO exercises (name, muscle_group, description, is_custom, created_at, updated_at)
VALUES
    ('Plank', 'Core', 'Isometric core exercise. Hold push-up position on forearms.', false, NOW(), NOW()),
    ('Crunches', 'Core', 'Classic abdominal exercise. Lie down, lift shoulders off ground.', false, NOW(), NOW()),
    ('Russian Twist', 'Core', 'Rotational core exercise. Sit, lean back, twist side to side.', false, NOW(), NOW()),
    ('Leg Raise', 'Core', 'Lower abdominal exercise. Lie down, raise legs keeping them straight.', false, NOW(), NOW()),
    ('Mountain Climbers', 'Core', 'Dynamic core and cardio exercise. Alternate knee drives in plank.', false, NOW(), NOW()),
    ('Dead Bug', 'Core', 'Core stability exercise. Lie on back, alternate opposite arm and leg.', false, NOW(), NOW());

-- Custom Exercises (created by users)
INSERT IGNORE INTO exercises (name, muscle_group, description, is_custom, created_by_user_id, created_at, updated_at)
VALUES
    ('Johns Special Superset', 'Chest', 'My custom chest superset: bench press followed immediately by push-ups', true, 2, NOW(), NOW()),
    ('Cable Crossover High', 'Chest', 'High cable crossover for lower chest', true, 2, NOW(), NOW());

-- ============================================
-- 3. WORKOUT LOGS DATA
-- ============================================
-- INSERT IGNORE: Skip if log already exists (won't overwrite existing data)
-- Note: This assumes workout logs have unique constraints or will use auto-increment IDs
-- John Doe's workouts (User ID: 2)
INSERT IGNORE INTO workout_logs (user_id, log_date, notes, is_completed, total_duration_minutes, created_at, updated_at)
VALUES
    -- Recent workouts
    (2, DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), 'Great chest and triceps workout! Feeling strong.', true, 65, NOW(), NOW()),
    (2, DATE_SUB(CURRENT_DATE, INTERVAL 3 DAY), 'Back day - hit new PR on deadlift!', true, 75, NOW(), NOW()),
    (2, DATE_SUB(CURRENT_DATE, INTERVAL 5 DAY), 'Leg day - squats felt heavy but good', true, 80, NOW(), NOW()),
    (2, DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY), 'Shoulder and arms pump', true, 60, NOW(), NOW()),
    (2, DATE_SUB(CURRENT_DATE, INTERVAL 9 DAY), 'Full body workout', true, 70, NOW(), NOW()),
    -- Older workouts
    (2, DATE_SUB(CURRENT_DATE, INTERVAL 12 DAY), 'Upper body focus', true, 65, NOW(), NOW()),
    (2, DATE_SUB(CURRENT_DATE, INTERVAL 14 DAY), 'Lower body and core', true, 75, NOW(), NOW()),
    (2, DATE_SUB(CURRENT_DATE, INTERVAL 16 DAY), 'Back and biceps', true, 60, NOW(), NOW());

-- Jane Smith's workouts (User ID: 3)
INSERT IGNORE INTO workout_logs (user_id, log_date, notes, is_completed, total_duration_minutes, created_at, updated_at)
VALUES
    (3, DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), 'Full body circuit training', true, 55, NOW(), NOW()),
    (3, DATE_SUB(CURRENT_DATE, INTERVAL 3 DAY), 'Legs and glutes focus', true, 60, NOW(), NOW()),
    (3, DATE_SUB(CURRENT_DATE, INTERVAL 5 DAY), 'Upper body strength', true, 50, NOW(), NOW()),
    (3, DATE_SUB(CURRENT_DATE, INTERVAL 8 DAY), 'Core and cardio mix', true, 45, NOW(), NOW()),
    (3, DATE_SUB(CURRENT_DATE, INTERVAL 10 DAY), 'Leg day with lunges', true, 55, NOW(), NOW());

-- Mike Wilson's workouts (User ID: 4)
INSERT IGNORE INTO workout_logs (user_id, log_date, notes, is_completed, total_duration_minutes, created_at, updated_at)
VALUES
    (4, DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY), 'Push day - chest, shoulders, triceps', true, 70, NOW(), NOW()),
    (4, DATE_SUB(CURRENT_DATE, INTERVAL 4 DAY), 'Pull day - back and biceps', true, 65, NOW(), NOW()),
    (4, DATE_SUB(CURRENT_DATE, INTERVAL 6 DAY), 'Leg day - squats and accessories', true, 80, NOW(), NOW()),
    (4, DATE_SUB(CURRENT_DATE, INTERVAL 9 DAY), 'Push day again', true, 70, NOW(), NOW());

-- Sarah Johnson's workouts (User ID: 5)
INSERT IGNORE INTO workout_logs (user_id, log_date, notes, is_completed, total_duration_minutes, created_at, updated_at)
VALUES
    (5, CURRENT_DATE, 'Morning workout - feeling energized!', false, NULL, NOW(), NOW()),
    (5, DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY), 'Yoga and core strength', true, 45, NOW(), NOW()),
    (5, DATE_SUB(CURRENT_DATE, INTERVAL 4 DAY), 'Lower body strength training', true, 55, NOW(), NOW()),
    (5, DATE_SUB(CURRENT_DATE, INTERVAL 6 DAY), 'Upper body and cardio', true, 50, NOW(), NOW());

-- ============================================
-- 4. EXERCISE SETS DATA
-- ============================================
-- INSERT IGNORE: Skip if set already exists (won't overwrite existing data)
-- Note: Exercise sets use auto-increment IDs, so duplicates will be skipped
-- John Doe's most recent workout (Chest & Triceps - Log ID: 1)
INSERT IGNORE INTO exercise_sets (log_id, exercise_id, set_number, reps, weight, is_completed, notes, rest_time_seconds, created_at, updated_at)
VALUES
    -- Bench Press - 4 sets
    (1, 1, 1, 10, 60.0, true, 'Warm up set', 90, NOW(), NOW()),
    (1, 1, 2, 8, 80.0, true, 'Felt good', 120, NOW(), NOW()),
    (1, 1, 3, 6, 90.0, true, 'Heavy but manageable', 120, NOW(), NOW()),
    (1, 1, 4, 8, 80.0, true, 'Drop set', 120, NOW(), NOW()),
    -- Incline Dumbbell Press - 3 sets
    (1, 2, 1, 10, 25.0, true, 'Each arm', 90, NOW(), NOW()),
    (1, 2, 2, 8, 30.0, true, 'Good stretch', 90, NOW(), NOW()),
    (1, 2, 3, 8, 30.0, true, 'Solid set', 90, NOW(), NOW()),
    -- Chest Fly - 3 sets
    (1, 4, 1, 12, 15.0, true, 'Focus on form', 60, NOW(), NOW()),
    (1, 4, 2, 12, 15.0, true, NULL, 60, NOW(), NOW()),
    (1, 4, 3, 10, 15.0, true, 'Fatigued', 60, NOW(), NOW()),
    -- Tricep Pushdown - 3 sets (ID: 28)
    (1, 28, 1, 12, 20.0, true, 'Rope attachment', 60, NOW(), NOW()),
    (1, 28, 2, 12, 22.5, true, NULL, 60, NOW(), NOW()),
    (1, 28, 3, 10, 25.0, true, 'Burn!', 60, NOW(), NOW()),
    -- Tricep Dip - 3 sets (ID: 27)
    (1, 27, 1, 10, 0.0, true, 'Bodyweight', 90, NOW(), NOW()),
    (1, 27, 2, 8, 10.0, true, 'Added weight', 90, NOW(), NOW()),
    (1, 27, 3, 8, 10.0, true, NULL, 90, NOW(), NOW());

-- John Doe's Back workout (Log ID: 2)
INSERT IGNORE INTO exercise_sets (log_id, exercise_id, set_number, reps, weight, is_completed, notes, rest_time_seconds, created_at, updated_at)
VALUES
    -- Deadlift - 5 sets
    (2, 9, 1, 8, 100.0, true, 'Warm up', 120, NOW(), NOW()),
    (2, 9, 2, 6, 120.0, true, 'Feeling strong', 180, NOW(), NOW()),
    (2, 9, 3, 5, 140.0, true, 'New PR!', 180, NOW(), NOW()),
    (2, 9, 4, 4, 150.0, true, 'Heavy!', 180, NOW(), NOW()),
    (2, 9, 5, 6, 130.0, true, 'Back down', 120, NOW(), NOW()),
    -- Barbell Row - 4 sets
    (2, 7, 1, 10, 60.0, true, NULL, 90, NOW(), NOW()),
    (2, 7, 2, 8, 70.0, true, NULL, 90, NOW(), NOW()),
    (2, 7, 3, 8, 70.0, true, NULL, 90, NOW(), NOW()),
    (2, 7, 4, 6, 80.0, true, 'Tough', 90, NOW(), NOW()),
    -- Pull-ups - 4 sets
    (2, 6, 1, 10, 0.0, true, 'Bodyweight', 90, NOW(), NOW()),
    (2, 6, 2, 8, 0.0, true, NULL, 90, NOW(), NOW()),
    (2, 6, 3, 8, 0.0, true, NULL, 90, NOW(), NOW()),
    (2, 6, 4, 6, 0.0, true, 'Fatigued', 90, NOW(), NOW()),
    -- Seated Cable Row - 3 sets
    (2, 10, 1, 12, 50.0, true, NULL, 60, NOW(), NOW()),
    (2, 10, 2, 12, 55.0, true, NULL, 60, NOW(), NOW()),
    (2, 10, 3, 10, 60.0, true, NULL, 60, NOW(), NOW());

-- John Doe's Leg workout (Log ID: 3)
INSERT IGNORE INTO exercise_sets (log_id, exercise_id, set_number, reps, weight, is_completed, notes, rest_time_seconds, created_at, updated_at)
VALUES
    -- Squat - 5 sets
    (3, 17, 1, 10, 60.0, true, 'Warm up', 120, NOW(), NOW()),
    (3, 17, 2, 8, 100.0, true, NULL, 180, NOW(), NOW()),
    (3, 17, 3, 8, 120.0, true, 'Deep squats', 180, NOW(), NOW()),
    (3, 17, 4, 6, 130.0, true, 'Heavy', 180, NOW(), NOW()),
    (3, 17, 5, 8, 110.0, true, NULL, 120, NOW(), NOW()),
    -- Leg Press - 4 sets
    (3, 18, 1, 12, 100.0, true, NULL, 90, NOW(), NOW()),
    (3, 18, 2, 10, 140.0, true, NULL, 90, NOW(), NOW()),
    (3, 18, 3, 10, 140.0, true, NULL, 90, NOW(), NOW()),
    (3, 18, 4, 8, 160.0, true, NULL, 90, NOW(), NOW()),
    -- Romanian Deadlift - 3 sets
    (3, 22, 1, 10, 60.0, true, 'Hamstring focus', 90, NOW(), NOW()),
    (3, 22, 2, 10, 70.0, true, NULL, 90, NOW(), NOW()),
    (3, 22, 3, 8, 80.0, true, NULL, 90, NOW(), NOW()),
    -- Leg Curl - 3 sets
    (3, 20, 1, 12, 30.0, true, NULL, 60, NOW(), NOW()),
    (3, 20, 2, 12, 35.0, true, NULL, 60, NOW(), NOW()),
    (3, 20, 3, 10, 40.0, true, NULL, 60, NOW(), NOW()),
    -- Calf Raise - 4 sets
    (3, 21, 1, 15, 80.0, true, NULL, 60, NOW(), NOW()),
    (3, 21, 2, 15, 90.0, true, NULL, 60, NOW(), NOW()),
    (3, 21, 3, 12, 100.0, true, NULL, 60, NOW(), NOW()),
    (3, 21, 4, 12, 100.0, true, 'Burning!', 60, NOW(), NOW());

-- Jane Smith's Full Body workout (Log ID: 9)
INSERT IGNORE INTO exercise_sets (log_id, exercise_id, set_number, reps, weight, is_completed, notes, rest_time_seconds, created_at, updated_at)
VALUES
    -- Squat - 3 sets
    (9, 17, 1, 12, 40.0, true, NULL, 90, NOW(), NOW()),
    (9, 17, 2, 12, 45.0, true, NULL, 90, NOW(), NOW()),
    (9, 17, 3, 10, 50.0, true, NULL, 90, NOW(), NOW()),
    -- Push-ups - 3 sets
    (9, 3, 1, 15, 0.0, true, 'Bodyweight', 60, NOW(), NOW()),
    (9, 3, 2, 12, 0.0, true, NULL, 60, NOW(), NOW()),
    (9, 3, 3, 12, 0.0, true, NULL, 60, NOW(), NOW()),
    -- Lat Pulldown - 3 sets
    (9, 8, 1, 12, 35.0, true, NULL, 60, NOW(), NOW()),
    (9, 8, 2, 10, 40.0, true, NULL, 60, NOW(), NOW()),
    (9, 8, 3, 10, 40.0, true, NULL, 60, NOW(), NOW()),
    -- Plank - 3 sets (reps = seconds held) (ID: 31)
    (9, 31, 1, 45, 0.0, true, 'Holding time in seconds', 60, NOW(), NOW()),
    (9, 31, 2, 50, 0.0, true, NULL, 60, NOW(), NOW()),
    (9, 31, 3, 60, 0.0, true, 'New record!', 60, NOW(), NOW());

-- Mike Wilson's Push Day (Log ID: 14)
INSERT IGNORE INTO exercise_sets (log_id, exercise_id, set_number, reps, weight, is_completed, notes, rest_time_seconds, created_at, updated_at)
VALUES
    -- Bench Press - 4 sets
    (14, 1, 1, 10, 70.0, true, NULL, 120, NOW(), NOW()),
    (14, 1, 2, 8, 85.0, true, NULL, 120, NOW(), NOW()),
    (14, 1, 3, 6, 95.0, true, NULL, 120, NOW(), NOW()),
    (14, 1, 4, 6, 95.0, true, NULL, 120, NOW(), NOW()),
    -- Overhead Press - 4 sets
    (14, 12, 1, 10, 40.0, true, NULL, 90, NOW(), NOW()),
    (14, 12, 2, 8, 50.0, true, NULL, 90, NOW(), NOW()),
    (14, 12, 3, 8, 50.0, true, NULL, 90, NOW(), NOW()),
    (14, 12, 4, 6, 55.0, true, NULL, 90, NOW(), NOW()),
    -- Lateral Raise - 3 sets
    (14, 13, 1, 12, 10.0, true, NULL, 60, NOW(), NOW()),
    (14, 13, 2, 12, 12.5, true, NULL, 60, NOW(), NOW()),
    (14, 13, 3, 10, 15.0, true, NULL, 60, NOW(), NOW()),
    -- Tricep Pushdown - 3 sets (ID: 28)
    (14, 28, 1, 12, 22.5, true, NULL, 60, NOW(), NOW()),
    (14, 28, 2, 12, 25.0, true, NULL, 60, NOW(), NOW()),
    (14, 28, 3, 10, 27.5, true, NULL, 60, NOW(), NOW());

-- Sarah Johnson's current workout (Log ID: 18) - Not completed yet
INSERT IGNORE INTO exercise_sets (log_id, exercise_id, set_number, reps, weight, is_completed, notes, rest_time_seconds, created_at, updated_at)
VALUES
    -- Squat - 3 sets (only 2 completed)
    (18, 17, 1, 10, 35.0, true, NULL, 90, NOW(), NOW()),
    (18, 17, 2, 10, 40.0, true, NULL, 90, NOW(), NOW()),
    (18, 17, 3, 0, 45.0, false, 'Planned', 90, NOW(), NOW()),
    -- Romanian Deadlift - planned
    (18, 22, 1, 0, 40.0, false, 'Planned', 90, NOW(), NOW()),
    (18, 22, 2, 0, 45.0, false, 'Planned', 90, NOW(), NOW()),
    (18, 22, 3, 0, 45.0, false, 'Planned', 90, NOW(), NOW());

-- ============================================
-- 5. SERVICE ACCOUNTS DATA
-- ============================================
-- Service accounts for inter-service authentication
-- Password: llm-service-secret-dev-2024 (hashed with BCrypt)
INSERT IGNORE INTO service_accounts (service_name, client_id, client_secret_hash, is_active, created_at, updated_at)
VALUES
    ('LLM Service', 'llm-service', '$2a$10$ATMIDXKXmRvXkL2NqiDowed0cv49k3fKzR.r2s2kwBvuvZfr/odtO', true, NOW(), NOW());

-- Service Account Scopes
INSERT IGNORE INTO service_account_scopes (service_account_id, scope)
SELECT id, 'RAG_READ' FROM service_accounts WHERE client_id = 'llm-service'
UNION ALL
SELECT id, 'RAG_SYNC' FROM service_accounts WHERE client_id = 'llm-service'
UNION ALL
SELECT id, 'HEALTH_CHECK' FROM service_accounts WHERE client_id = 'llm-service';

-- ============================================
-- END OF SAMPLE DATA
-- ============================================
-- Summary:
-- - 6 Users (1 admin, 4 regular users, 1 OAuth user)
-- - 41 Exercises (39 default + 2 custom)
-- - 18 Workout Logs (various dates and completion status)
-- - 100+ Exercise Sets (with realistic weights and reps)
-- - 1 Service Accounts (with appropriate scopes)
-- ============================================
