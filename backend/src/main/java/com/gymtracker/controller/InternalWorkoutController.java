package com.gymtracker.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gymtracker.dto.res.ExerciseResponse;
import com.gymtracker.dto.res.WorkoutLogResponse;
import com.gymtracker.service.ExerciseRagService;
import com.gymtracker.service.WorkoutLogRagService;

/**
 * Internal API Controller for RAG service synchronization
 * Protected by service-to-service authentication with scope-based access control
 * 
 * All endpoints require service token with appropriate scopes:
 * - RAG_SYNC: For data synchronization
 * - RAG_READ: For reading exercise/workout data
 * 
 * Note: This controller uses RAG-specific services (ExerciseRagService, WorkoutLogRagService)
 * NOT the core services. This ensures clean separation between backend core and RAG operations.
 */
@RestController
@RequestMapping("/internal")
public class InternalWorkoutController {

    @Autowired
    private ExerciseRagService exerciseRagService;

    @Autowired
    private WorkoutLogRagService workoutLogRagService;

    /**
     * Export all exercises (for initial RAG sync)
     * 
     * @return List of all exercises
     * @scope RAG_SYNC or SERVICE_ADMIN
     */
    @GetMapping("/exercises/export")
    @PreAuthorize("hasAnyAuthority('SCOPE_rag:sync', 'SCOPE_service:admin')")
    public ResponseEntity<List<ExerciseResponse>> exportAllExercises() {
        List<ExerciseResponse> exercises = exerciseRagService.exportAllExercises();
        return ResponseEntity.ok(exercises);
    }

    /**
     * Get exercises updated since a specific timestamp (for incremental sync)
     * 
     * @param since ISO timestamp (e.g., "2025-12-18T10:30:00")
     * @return List of updated exercises
     * @scope RAG_SYNC or SERVICE_ADMIN
     */
    @GetMapping("/exercises/updated-since")
    @PreAuthorize("hasAnyAuthority('SCOPE_rag:sync', 'SCOPE_service:admin')")
    public ResponseEntity<List<ExerciseResponse>> getExercisesUpdatedSince(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since) {
        List<ExerciseResponse> exercises = exerciseRagService.getExercisesUpdatedSince(since);
        return ResponseEntity.ok(exercises);
    }

    /**
     * Get workout logs updated since a specific timestamp (for incremental sync)
     * 
     * @param since ISO timestamp
     * @param userId Optional user ID for user-specific sync
     * @return List of updated workout logs
     * @scope RAG_SYNC or SERVICE_ADMIN
     */
    @GetMapping("/workouts/updated-since")
    @PreAuthorize("hasAnyAuthority('SCOPE_rag:sync', 'SCOPE_service:admin')")
    public ResponseEntity<List<WorkoutLogResponse>> getWorkoutsUpdatedSince(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since,
            @RequestParam(required = false) Long userId) {
        List<WorkoutLogResponse> workouts = workoutLogRagService.getWorkoutsUpdatedSince(since, userId);
        return ResponseEntity.ok(workouts);
    }
}
