package com.gymtracker.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gymtracker.dto.res.WorkoutLogResponse;
import com.gymtracker.dto.res.WorkoutStatsResponse;
import com.gymtracker.service.WorkoutLogRagService;

/**
 * Internal User API Controller for RAG personalized queries
 * Protected by service-to-service authentication
 * 
 * These endpoints provide user-specific data for personalized RAG features.
 * 
 * Note: This controller uses WorkoutLogRagService NOT the core WorkoutLogService.
 * This ensures clean separation between backend core and RAG operations.
 */
@RestController
@RequestMapping("/internal/users")
public class InternalUserController {

    @Autowired
    private WorkoutLogRagService workoutLogRagService;

    /**
     * Get workout history for a specific user with date range (for personalized RAG)
     * 
     * @param userId User ID
     * @param startDate Start date (optional, default: 6 months ago)
     * @param endDate End date (optional, default: today)
     * @param limit Limit number of results (optional, default: 100)
     * @return List of workout logs for the user
     * @scope RAG_READ or SERVICE_ADMIN
     */
    @GetMapping("/{userId}/workouts")
    @PreAuthorize("hasAnyAuthority('SCOPE_rag:read', 'SCOPE_service:admin')")
    public ResponseEntity<List<WorkoutLogResponse>> getUserWorkouts(
            @PathVariable Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false, defaultValue = "100") Integer limit) {
        
        List<WorkoutLogResponse> workouts = workoutLogRagService.getUserWorkoutHistory(userId, startDate, endDate, limit);
        return ResponseEntity.ok(workouts);
    }

    /**
     * Get aggregated workout statistics for a user
     * 
     * @param userId User ID
     * @param days Number of days to look back (optional, default: 30)
     * @return Workout statistics
     * @scope RAG_READ or SERVICE_ADMIN
     */
    @GetMapping("/{userId}/stats")
    @PreAuthorize("hasAnyAuthority('SCOPE_rag:read', 'SCOPE_service:admin')")
    public ResponseEntity<WorkoutStatsResponse> getUserStats(
            @PathVariable Long userId,
            @RequestParam(required = false, defaultValue = "30") Integer days) {
        
        WorkoutStatsResponse stats = workoutLogRagService.getUserWorkoutStats(userId, days);
        return ResponseEntity.ok(stats);
    }
}
