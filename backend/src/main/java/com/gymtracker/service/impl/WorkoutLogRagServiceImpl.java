package com.gymtracker.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gymtracker.dto.res.ExerciseSetResponse;
import com.gymtracker.dto.res.WorkoutLogResponse;
import com.gymtracker.dto.res.WorkoutStatsResponse;
import com.gymtracker.entity.ExerciseSet;
import com.gymtracker.entity.WorkoutLog;
import com.gymtracker.repository.ExerciseSetRepository;
import com.gymtracker.repository.WorkoutLogRepository;
import com.gymtracker.service.WorkoutLogRagService;

/**
 * Implementation of WorkoutLogRagService for RAG data synchronization
 * 
 * This service is exclusively for LLM service data sync operations.
 * It provides read-only access to workout data for specific users.
 */
@Service
public class WorkoutLogRagServiceImpl implements WorkoutLogRagService {

    @Autowired
    private WorkoutLogRepository workoutLogRepository;

    @Autowired
    private ExerciseSetRepository exerciseSetRepository;

    @Override
    @Transactional(readOnly = true)
    public List<WorkoutLogResponse> getUserWorkoutHistory(Long userId, LocalDate startDate, LocalDate endDate, Integer limit) {
        // Set defaults
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        if (startDate == null) {
            startDate = endDate.minusMonths(6); // Default: 6 months ago
        }
        
        // Fetch workout logs for user in date range
        List<WorkoutLog> logs = workoutLogRepository.findByUserIdAndDateRangeList(userId, startDate, endDate);
        
        // Apply limit if provided
        if (limit != null && limit > 0 && logs.size() > limit) {
            logs = logs.subList(0, limit);
        }
        
        return logs.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkoutLogResponse> getWorkoutsUpdatedSince(LocalDateTime since, Long userId) {
        List<WorkoutLog> logs;
        
        if (userId != null) {
            // User-specific incremental sync
            logs = workoutLogRepository.findByUserIdAndUpdatedAtAfter(userId, since);
        } else {
            // Global incremental sync
            logs = workoutLogRepository.findByUpdatedAtAfter(since);
        }
        
        return logs.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public WorkoutStatsResponse getUserWorkoutStats(Long userId, Integer days) {
        // Set default
        if (days == null) {
            days = 30;
        }
        
        LocalDate startDate = LocalDate.now().minusDays(days);
        
        // Fetch workout logs
        List<WorkoutLog> logs = workoutLogRepository.findByUserIdAndDateRangeList(userId, startDate, LocalDate.now());
        
        // Filter only completed workouts
        List<WorkoutLog> completedLogs = logs.stream()
                .filter(WorkoutLog::getIsCompleted)
                .collect(Collectors.toList());
        
        // Calculate basic stats
        int totalWorkouts = completedLogs.size();
        int totalDuration = completedLogs.stream()
                .mapToInt(log -> log.getTotalDurationMinutes() != null ? log.getTotalDurationMinutes() : 0)
                .sum();
        
        // Calculate average workouts per week
        double weeks = days / 7.0;
        double avgWorkoutsPerWeek = weeks > 0 ? totalWorkouts / weeks : 0.0;
        
        // Calculate total volume and collect exercise stats
        Map<String, Integer> exerciseCount = new HashMap<>();
        Map<String, Integer> muscleGroupCount = new HashMap<>();
        double totalVolume = 0.0;
        
        for (WorkoutLog log : completedLogs) {
            List<ExerciseSet> sets = exerciseSetRepository.findByWorkoutLogId(log.getId());
            
            for (ExerciseSet set : sets) {
                if (set.getIsCompleted()) {
                    // Calculate volume (reps * weight)
                    totalVolume += set.getReps() * set.getWeight();
                    
                    // Count exercises
                    String exerciseName = set.getExercise().getName();
                    exerciseCount.put(exerciseName, exerciseCount.getOrDefault(exerciseName, 0) + 1);
                    
                    // Count muscle groups
                    String muscleGroup = set.getExercise().getMuscleGroup();
                    muscleGroupCount.put(muscleGroup, muscleGroupCount.getOrDefault(muscleGroup, 0) + 1);
                }
            }
        }
        
        // Get top 5 favorite exercises
        List<String> favoriteExercises = exerciseCount.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
        
        // Build response
        return WorkoutStatsResponse.builder()
                .totalWorkouts(totalWorkouts)
                .totalVolume(totalVolume)
                .totalDurationMinutes(totalDuration)
                .favoriteExercises(favoriteExercises)
                .averageWorkoutsPerWeek(Math.round(avgWorkoutsPerWeek * 100.0) / 100.0)
                .muscleGroupDistribution(muscleGroupCount)
                .build();
    }

    /**
     * Map WorkoutLog entity to WorkoutLogResponse DTO
     */
    private WorkoutLogResponse mapToResponse(WorkoutLog log) {
        WorkoutLogResponse response = new WorkoutLogResponse();
        response.setId(log.getId());
        response.setLogDate(log.getLogDate());
        response.setNotes(log.getNotes());
        response.setIsCompleted(log.getIsCompleted());
        response.setTotalDurationMinutes(log.getTotalDurationMinutes());
        
        List<ExerciseSet> sets = exerciseSetRepository.findByWorkoutLogId(log.getId());
        response.setSets(sets.stream()
                .map(this::mapSetToResponse)
                .collect(Collectors.toList()));
        
        return response;
    }

    /**
     * Map ExerciseSet entity to ExerciseSetResponse DTO
     */
    private ExerciseSetResponse mapSetToResponse(ExerciseSet set) {
        ExerciseSetResponse response = new ExerciseSetResponse();
        response.setId(set.getId());
        response.setExerciseId(set.getExercise().getId());
        response.setExerciseName(set.getExercise().getName());
        response.setMuscleGroup(set.getExercise().getMuscleGroup());
        response.setSetNumber(set.getSetNumber());
        response.setReps(set.getReps());
        response.setWeight(set.getWeight());
        response.setIsCompleted(set.getIsCompleted());
        response.setNotes(set.getNotes());
        response.setRestTimeSeconds(set.getRestTimeSeconds());
        return response;
    }
}
