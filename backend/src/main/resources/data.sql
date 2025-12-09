-- Sample Exercises Data
-- This file will be executed automatically by Spring Boot on startup if spring.jpa.hibernate.ddl-auto is set to 'create' or 'create-drop'
-- For 'update' mode, you need to manually execute this or use Flyway/Liquibase

-- Chest Exercises
INSERT INTO exercises (name, muscle_group, description, is_custom, created_at, updated_at) 
VALUES 
('Bench Press', 'Chest', 'Classic barbell bench press for chest development', false, NOW(), NOW()),
('Incline Dumbbell Press', 'Chest', 'Targets upper chest with dumbbells on incline bench', false, NOW(), NOW()),
('Push-ups', 'Chest', 'Bodyweight exercise for chest, shoulders, and triceps', false, NOW(), NOW()),
('Chest Fly', 'Chest', 'Isolation exercise for chest using dumbbells or cables', false, NOW(), NOW());

-- Back Exercises
INSERT INTO exercises (name, muscle_group, description, is_custom, created_at, updated_at)
VALUES
('Pull-ups', 'Back', 'Bodyweight exercise for back and biceps', false, NOW(), NOW()),
('Barbell Row', 'Back', 'Compound movement for back thickness', false, NOW(), NOW()),
('Lat Pulldown', 'Back', 'Machine exercise targeting latissimus dorsi', false, NOW(), NOW()),
('Deadlift', 'Back', 'Full body compound exercise, primarily back and legs', false, NOW(), NOW());

-- Shoulder Exercises
INSERT INTO exercises (name, muscle_group, description, is_custom, created_at, updated_at)
VALUES
('Overhead Press', 'Shoulders', 'Standing or seated barbell/dumbbell press', false, NOW(), NOW()),
('Lateral Raise', 'Shoulders', 'Isolation exercise for side delts', false, NOW(), NOW()),
('Front Raise', 'Shoulders', 'Isolation exercise for front delts', false, NOW(), NOW()),
('Face Pull', 'Shoulders', 'Cable exercise for rear delts and upper back', false, NOW(), NOW());

-- Leg Exercises
INSERT INTO exercises (name, muscle_group, description, is_custom, created_at, updated_at)
VALUES
('Squat', 'Legs', 'King of leg exercises, targets quads, glutes, and hamstrings', false, NOW(), NOW()),
('Leg Press', 'Legs', 'Machine exercise for overall leg development', false, NOW(), NOW()),
('Lunges', 'Legs', 'Unilateral exercise for legs and glutes', false, NOW(), NOW()),
('Leg Curl', 'Legs', 'Isolation exercise for hamstrings', false, NOW(), NOW()),
('Calf Raise', 'Legs', 'Isolation exercise for calf muscles', false, NOW(), NOW());

-- Arm Exercises
INSERT INTO exercises (name, muscle_group, description, is_custom, created_at, updated_at)
VALUES
('Barbell Curl', 'Biceps', 'Classic bicep exercise with barbell', false, NOW(), NOW()),
('Hammer Curl', 'Biceps', 'Dumbbell curl with neutral grip', false, NOW(), NOW()),
('Tricep Dip', 'Triceps', 'Bodyweight or weighted exercise for triceps', false, NOW(), NOW()),
('Tricep Pushdown', 'Triceps', 'Cable exercise for tricep isolation', false, NOW(), NOW()),
('Close-Grip Bench Press', 'Triceps', 'Barbell exercise emphasizing triceps', false, NOW(), NOW());

-- Core Exercises
INSERT INTO exercises (name, muscle_group, description, is_custom, created_at, updated_at)
VALUES
('Plank', 'Core', 'Isometric core exercise', false, NOW(), NOW()),
('Crunches', 'Core', 'Classic abdominal exercise', false, NOW(), NOW()),
('Russian Twist', 'Core', 'Rotational core exercise', false, NOW(), NOW()),
('Leg Raise', 'Core', 'Lower abdominal exercise', false, NOW(), NOW());

