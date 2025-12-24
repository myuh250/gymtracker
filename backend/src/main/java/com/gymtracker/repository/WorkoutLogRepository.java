package com.gymtracker.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.gymtracker.entity.WorkoutLog;

/**
 * Repository interface for WorkoutLog entity
 * Provides database operations for workout log management
 */
@Repository
public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, Long> {
    
    /**
     * Find all workout logs for a specific user
     * @param userId User ID
     * @param pageable Pagination information
     * @return Page of WorkoutLog
     */
    Page<WorkoutLog> findByUserId(Long userId, Pageable pageable);
    
    /**
     * Find workout log by user and date
     * @param userId User ID
     * @param logDate Workout date
     * @return Optional of WorkoutLog
     */
    Optional<WorkoutLog> findByUserIdAndLogDate(Long userId, LocalDate logDate);

    /**
     * Find all workout logs for a specific user ordered by date descending
     * @param userId User ID
     * @return List of WorkoutLog
     */
    List<WorkoutLog> findByUserIdOrderByLogDateDesc(Long userId);
    
    /**
     * Find workout logs by user and date range
     * @param userId User ID
     * @param startDate Start date
     * @param endDate End date
     * @param pageable Pagination information
     * @return Page of WorkoutLog
     */
    @Query("SELECT wl FROM WorkoutLog wl WHERE wl.user.id = :userId " +
           "AND wl.logDate BETWEEN :startDate AND :endDate " +
           "ORDER BY wl.logDate DESC")
    Page<WorkoutLog> findByUserIdAndDateRange(
        @Param("userId") Long userId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        Pageable pageable
    );
    
    /**
     * Find completed workout logs by user
     * @param userId User ID
     * @param pageable Pagination information
     * @return Page of WorkoutLog
     */
    Page<WorkoutLog> findByUserIdAndIsCompletedTrue(Long userId, Pageable pageable);
    
    /**
     * Count workout logs by user
     * @param userId User ID
     * @return Count of workout logs
     */
    long countByUserId(Long userId);
    
    /**
     * Count completed workout logs by user
     * @param userId User ID
     * @return Count of completed workout logs
     */
    long countByUserIdAndIsCompletedTrue(Long userId);
    
    // ========== RAG Sync Methods ==========
    
    /**
     * Get all distinct user IDs who have workout logs
     */
    @Query("SELECT DISTINCT wl.user.id FROM WorkoutLog wl ORDER BY wl.user.id")
    List<Long> findAllDistinctUserIds();
    
    /**
     * Find workout logs for a specific user with date range (for personalized RAG)
     */
    @Query("SELECT wl FROM WorkoutLog wl WHERE wl.user.id = :userId " +
           "AND wl.logDate BETWEEN :startDate AND :endDate " +
           "ORDER BY wl.logDate DESC")
    List<WorkoutLog> findByUserIdAndDateRangeList(
        @Param("userId") Long userId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    /**
     * Find workout logs updated since a specific timestamp (for incremental sync)
     */
    @Query("SELECT wl FROM WorkoutLog wl WHERE wl.updatedAt > :since ORDER BY wl.updatedAt ASC")
    List<WorkoutLog> findByUpdatedAtAfter(@Param("since") java.time.LocalDateTime since);
    
    /**
     * Find workout logs updated since timestamp for a specific user
     */
    @Query("SELECT wl FROM WorkoutLog wl WHERE wl.user.id = :userId " +
           "AND wl.updatedAt > :since ORDER BY wl.updatedAt ASC")
    List<WorkoutLog> findByUserIdAndUpdatedAtAfter(
        @Param("userId") Long userId,
        @Param("since") java.time.LocalDateTime since
    );
    
    /**
     * Get workout statistics for a user within a date range
     */
    @Query("SELECT COUNT(wl) as totalWorkouts, " +
           "SUM(COALESCE(wl.totalDurationMinutes, 0)) as totalDuration " +
           "FROM WorkoutLog wl " +
           "WHERE wl.user.id = :userId " +
           "AND wl.logDate >= :startDate " +
           "AND wl.isCompleted = true")
    Object[] getWorkoutStatsByUserAndDateRange(
        @Param("userId") Long userId,
        @Param("startDate") LocalDate startDate
    );
}

