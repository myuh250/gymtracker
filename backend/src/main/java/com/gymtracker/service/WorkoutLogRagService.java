package com.gymtracker.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.gymtracker.dto.res.WorkoutLogResponse;
import com.gymtracker.dto.res.WorkoutStatsResponse;

/**
 * Service interface for WorkoutLog RAG (Retrieval-Augmented Generation) operations
 * 
 * This service is specifically for RAG data synchronization and should NOT be used
 * for regular backend core operations. Use WorkoutLogService for core operations.
 * 
 * Purpose: Provide workout data to LLM service for personalized RAG features
 */
public interface WorkoutLogRagService {
    
    /**
     * Get all user IDs in the system
     * 
     * @return List of all user IDs
     * @apiNote Used for syncing all users' workout data to RAG system
     */
    List<Long> getAllUserIds();
    
    /**
     * Get workout history for a specific user with date range (for personalized RAG)
     * 
     * @param userId User ID
     * @param startDate Start date (optional, default: 6 months ago)
     * @param endDate End date (optional, default: today)
     * @param limit Limit number of results (optional, default: 100)
     * @return List of workout logs for the user
     * @apiNote Used for user-specific RAG context building
     */
    List<WorkoutLogResponse> getUserWorkoutHistory(Long userId, LocalDate startDate, LocalDate endDate, Integer limit);
    
    /**
     * Get workout logs updated since a specific timestamp (for incremental sync)
     * 
     * @param since Timestamp to compare (ISO 8601 format)
     * @param userId User ID (optional, for user-specific sync)
     * @return List of workout logs updated after the given timestamp
     * @apiNote Used for scheduled incremental sync (every 5 minutes)
     */
    List<WorkoutLogResponse> getWorkoutsUpdatedSince(LocalDateTime since, Long userId);
    
    /**
     * Get aggregated workout statistics for a user
     * 
     * @param userId User ID
     * @param days Number of days to look back (optional, default: 30)
     * @return Workout statistics including volume, favorite exercises, etc.
     * @apiNote Used for enhanced personalization in RAG responses
     */
    WorkoutStatsResponse getUserWorkoutStats(Long userId, Integer days);
}
