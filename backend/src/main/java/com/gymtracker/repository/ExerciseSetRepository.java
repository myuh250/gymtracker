package com.gymtracker.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.gymtracker.entity.ExerciseSet;

/**
 * Repository interface for ExerciseSet entity
 * Provides database operations for exercise set management
 */
@Repository
public interface ExerciseSetRepository extends JpaRepository<ExerciseSet, Long> {
    
    /**
     * Find all exercise sets for a specific workout log
     * @param logId Workout log ID
     * @return List of ExerciseSet
     */
    List<ExerciseSet> findByWorkoutLogId(Long logId);
    
    /**
     * Find all exercise sets for a specific workout log, ordered by set number
     * @param logId Workout log ID
     * @return List of ExerciseSet
     */
    List<ExerciseSet> findByWorkoutLogIdOrderBySetNumberAsc(Long logId);
    
    /**
     * Find exercise sets by workout log and exercise
     * @param logId Workout log ID
     * @param exerciseId Exercise ID
     * @return List of ExerciseSet
     */
    List<ExerciseSet> findByWorkoutLogIdAndExerciseId(Long logId, Long exerciseId);
    
    /**
     * Find all exercise sets for a specific exercise
     * @param exerciseId Exercise ID
     * @param pageable Pagination information
     * @return Page of ExerciseSet
     */
    Page<ExerciseSet> findByExerciseId(Long exerciseId, Pageable pageable);
    
    /**
     * Count completed sets in a workout log
     * @param logId Workout log ID
     * @return Count of completed sets
     */
    long countByWorkoutLogIdAndIsCompletedTrue(Long logId);
    
    /**
     * Count total sets in a workout log
     * @param logId Workout log ID
     * @return Count of total sets
     */
    long countByWorkoutLogId(Long logId);
    
    /**
     * Get exercise history for a user (all sets for an exercise by user)
     * @param userId User ID
     * @param exerciseId Exercise ID
     * @param pageable Pagination information
     * @return Page of ExerciseSet
     */
    @Query("SELECT es FROM ExerciseSet es " +
           "WHERE es.workoutLog.user.id = :userId " +
           "AND es.exercise.id = :exerciseId " +
           "ORDER BY es.workoutLog.logDate DESC, es.setNumber ASC")
    Page<ExerciseSet> findExerciseHistoryByUser(
        @Param("userId") Long userId,
        @Param("exerciseId") Long exerciseId,
        Pageable pageable
    );
    
    /**
     * Get max weight for a specific exercise by user
     * @param userId User ID
     * @param exerciseId Exercise ID
     * @return Maximum weight
     */
    @Query("SELECT MAX(es.weight) FROM ExerciseSet es " +
           "WHERE es.workoutLog.user.id = :userId " +
           "AND es.exercise.id = :exerciseId " +
           "AND es.isCompleted = true")
    Double findMaxWeightByUserAndExercise(
        @Param("userId") Long userId,
        @Param("exerciseId") Long exerciseId
    );

    void deleteByWorkoutLogId(Long workoutLogId);
}

