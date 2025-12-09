package com.gymtracker.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.gymtracker.entity.Exercise;

/**
 * Repository interface for Exercise entity
 * Provides database operations for exercise management
 */
@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    
    /**
     * Find exercises by muscle group
     * @param muscleGroup Muscle group name
     * @param pageable Pagination information
     * @return Page of Exercise
     */
    Page<Exercise> findByMuscleGroup(String muscleGroup, Pageable pageable);
    
    /**
     * Find exercises by name containing (case-insensitive search)
     * @param name Exercise name keyword
     * @param pageable Pagination information
     * @return Page of Exercise
     */
    Page<Exercise> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    /**
     * Find all system exercises (not custom)
     * @param pageable Pagination information
     * @return Page of Exercise
     */
    Page<Exercise> findByIsCustomFalse(Pageable pageable);
    
    /**
     * Find custom exercises created by a specific user
     * @param userId User ID
     * @param pageable Pagination information
     * @return Page of Exercise
     */
    Page<Exercise> findByIsCustomTrueAndCreatedByUserId(Long userId, Pageable pageable);
    
    /**
     * Search exercises by name or muscle group
     * @param keyword Search keyword
     * @param pageable Pagination information
     * @return Page of Exercise
     */
    @Query("SELECT e FROM Exercise e WHERE " +
           "LOWER(e.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.muscleGroup) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Exercise> searchByNameOrMuscleGroup(@Param("keyword") String keyword, Pageable pageable);
    
    /**
     * Get distinct muscle groups
     * @return List of unique muscle group names
     */
    @Query("SELECT DISTINCT e.muscleGroup FROM Exercise e ORDER BY e.muscleGroup")
    List<String> findDistinctMuscleGroups();
}

