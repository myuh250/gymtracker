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
-- Chest Exercises
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (1, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Classic barbell bench press for chest development. Lie on bench, lower bar to chest, press up.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766547364/gymtracker/exercises/file_ngvpdp.mp4', 'Chest', 'Bench Press');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (2, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Targets upper chest with dumbbells on incline bench (30-45 degrees).', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766547433/gymtracker/exercises/file_ipqzps.mp4', 'Chest', 'Incline Dumbbell Press');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (3, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Bodyweight exercise for chest, shoulders, and triceps. Great for endurance.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766547970/gymtracker/exercises/file_wg8wk6.mp4', 'Chest', 'Push-ups');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (4, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Isolation exercise for chest using dumbbells or cables. Focus on stretch.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766546825/gymtracker/exercises/file_c0kmys.mp4', 'Chest', 'Chest Fly');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (5, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Works both chest and lats. Lie perpendicular on bench with dumbbell.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549164/Dumbbell-Pullover_Chest_oqbvu2.mp4', 'Chest', 'Dumbbell Pullover');

-- Back Exercises
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (6, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Bodyweight exercise for back and biceps. Grip bar, pull chin over bar.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549783/Pull-up_Back_scycct.mp4', 'Back', 'Pull-ups');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (7, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Compound movement for back thickness. Bend at hips, pull bar to lower chest.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549147/00271201-Barbell-Bent-Over-Row_Back_uhlgn8.mp4', 'Back', 'Barbell Row');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (8, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Machine exercise targeting latissimus dorsi. Pull bar down to upper chest.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549986/Latpulldown_txetnt.mp4', 'Back', 'Lat Pulldown');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (9, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Full body compound exercise, primarily back and legs. The king of exercises.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549146/00321201-Barbell-Deadlift_Hips-FIX_dcihga.mp4', 'Back', 'Deadlift');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (10, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Cable exercise for mid-back. Pull handle to torso while keeping back straight.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549148/01801201-Cable-Low-Seated-Row_Back_ivagms.mp4', 'Back', 'Seated Cable Row');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (11, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Compound row variation. Great for back thickness and strength.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549596/06061201-Lever-T-bar-Row-_plate-loaded__Back_hw6pjv.mp4', 'Back', 'T-Bar Row');

-- Shoulder Exercises
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (12, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Standing or seated barbell/dumbbell press. Press weight overhead.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549159/Barbell-Standing-Military-Press-_without-rack__Shoulders_gtmeqd.mp4', 'Shoulders', 'Overhead Press');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (13, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Isolation exercise for side delts. Raise dumbbells to shoulder height.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549163/Dumbbell-Lateral-Raise_shoulder_dnfmpu.mp4', 'Shoulders', 'Lateral Raise');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (14, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Isolation exercise for front delts. Raise weight in front of body.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549576/03101201-Dumbbell-Front-Raise_Shoulders_bgttes.mp4', 'Shoulders', 'Front Raise');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (15, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Cable exercise for rear delts and upper back. Pull rope to face level.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549722/77441201-Cable-Standing-Supinated-Face-Pull-_with-rope__Sho_fr2kmz.mp4', 'Shoulders', 'Face Pull');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (16, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Rotating dumbbell press. Named after Arnold Schwarzenegger.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549574/02871201-Dumbbell-Arnold-Press-II_Shoulders_tw9hnq.mp4', 'Shoulders', 'Arnold Press');

-- Leg Exercises
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (17, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'King of leg exercises, targets quads, glutes, and hamstrings.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549146/00431201-Barbell-Full-Squat_Thighs_o4me0a.mp4', 'Legs', 'Squat');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (18, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Machine exercise for overall leg development. Safe alternative to squats.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549150/07391201-Sled-45-Leg-Press_Hips_vz7u1y.mp4', 'Legs', 'Leg Press');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (19, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Unilateral exercise for legs and glutes. Step forward and lower back knee.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549151/14601201-Walking-Lunge-Male_Hips_hwzyem.mp4', 'Legs', 'Lunges');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (20, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Isolation exercise for hamstrings. Curl weight with legs on machine.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766555793/05861201-Lever-Lying-Leg-Curl_Thighs_qxyphh.mp4', 'Legs', 'Leg Curl');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (21, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Isolation exercise for calf muscles. Rise onto toes, lower slowly.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549577/04171201-Dumbbell-Standing-Calf-Raise_Calves_hgpysy.mp4', 'Legs', 'Calf Raise');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (22, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Hip hinge exercise targeting hamstrings and glutes.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549148/00851201-Barbell-Romanian-Deadlift_Hips-FIX__frvr9k.mp4', 'Legs', 'Romanian Deadlift');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (23, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Unilateral leg exercise. Rear foot elevated, front leg does the work.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549688/22901201-Dumbbell-Bulgarian-Split-Squat-_female__Thighs_pgladn.mp4', 'Legs', 'Bulgarian Split Squat');

-- Arm Exercises
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (24, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Classic bicep exercise with barbell. Curl bar up, squeeze biceps.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549146/00311201-Barbell-Curl_Upper-Arms_gockkm.mp4', 'Biceps', 'Barbell Curl');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (25, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Dumbbell curl with neutral grip. Targets brachialis and biceps.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549149/03121201-Dumbbell-Hammer-Curl-_version-2__Upper-Arms_dnjfor.mp4', 'Biceps', 'Hammer Curl');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (26, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Isolated bicep curl on preacher bench. Prevents cheating.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549148/00701201-Barbell-Preacher-Curl_Upper-Arms_xmz59f.mp4', 'Biceps', 'Preacher Curl');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (27, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Bodyweight or weighted exercise for triceps. Lower body, push up.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549150/08141201-Triceps-Dip_Upper-Arms_v0fwmz.mp4', 'Triceps', 'Tricep Dip');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (28, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Cable exercise for tricep isolation. Push rope/bar down, squeeze.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766555846/02011201-Cable-Pushdown_Upper-Arms_miblnw.mp4', 'Triceps', 'Tricep Pushdown');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (29, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Barbell exercise emphasizing triceps. Hands closer than shoulder width.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549147/00601201-Barbell-Lying-Triceps-Extension-Skull-Crusher_Upper-Arms_sbtrte.mp4', 'Triceps', 'Close-Grip Bench Press');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (30, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Lying tricep extension. Lower bar to forehead, extend arms.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549481/00601201-Barbell-Lying-Triceps-Extension-Skull-Crusher_Upper-Arms_wpsceg.mp4', 'Triceps', 'Skull Crusher');

-- Core Exercises
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (31, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Isometric core exercise. Hold push-up position on forearms.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549150/04631201-Front-Plank-m_waist_i49pzg.mp4', 'Core', 'Plank');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (32, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Classic abdominal exercise. Lie down, lift shoulders off ground.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549572/02741201-Crunch-Floor-m_waist_qi9yab.mp4', 'Core', 'Crunches');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (33, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Rotational core exercise. Sit, lean back, twist side to side.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549607/06871201-Russian-Twist_waist_l0gh4q.mp4', 'Core', 'Russian Twist');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (34, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Lower abdominal exercise. Lie down, raise legs keeping them straight.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549657/11631201-Lying-Leg-Raise_Waist_d4xyda.mp4', 'Core', 'Leg Raise');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (35, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Dynamic core and cardio exercise. Alternate knee drives in plank.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766555864/75311201-Plank-Alternate-Knee-Tuck-_female__Waist__1_ixsxw9.mp4', 'Core', 'Mountain Climbers');
INSERT IGNORE INTO `exercises` (`id`, `created_at`, `updated_at`, `created_by_user_id`, `description`, `is_custom`, `media_url`, `muscle_group`, `name`) VALUES (36, '2025-12-24 03:50:46.000000', '2025-12-24 03:50:46.000000', NULL, 'Core stability exercise. Lie on back, alternate opposite arm and leg.', b'0', 'https://res.cloudinary.com/ds8ybvuij/video/upload/v1766549747/78391201-Dead-Bug-_VERSION-3_-_female__Waist__awenev.mp4', 'Core', 'Dead Bug');

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
