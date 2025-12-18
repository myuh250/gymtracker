package com.gymtracker.service;

import java.time.LocalDateTime;
import java.util.List;

import com.gymtracker.dto.res.ExerciseResponse;

/**
 * Service interface for Exercise RAG (Retrieval-Augmented Generation) operations
 * 
 * This service is specifically for RAG data synchronization and should NOT be used
 * for regular backend core operations. Use ExerciseService for core operations.
 * 
 * Purpose: Provide exercise data to LLM service for RAG database sync
 */
public interface ExerciseRagService {
    
    /**
     * Export all exercises for initial RAG sync
     * 
     * @return List of all exercises ordered by ID
     * @apiNote Used for initial RAG database population
     */
    List<ExerciseResponse> exportAllExercises();
    
    /**
     * Get exercises updated since a specific timestamp (for incremental sync)
     * 
     * @param since Timestamp to compare (ISO 8601 format)
     * @return List of exercises updated after the given timestamp
     * @apiNote Used for scheduled incremental sync (every 5 minutes)
     */
    List<ExerciseResponse> getExercisesUpdatedSince(LocalDateTime since);
}
