package com.gymtracker.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gymtracker.dto.req.WorkoutLogRequest;
import com.gymtracker.dto.res.WorkoutLogResponse;
import com.gymtracker.service.WorkoutLogService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutLogController {

    @Autowired
    private WorkoutLogService workoutLogService;

    @PostMapping
    public ResponseEntity<WorkoutLogResponse> createWorkoutLog(@Valid @RequestBody WorkoutLogRequest request) {
        return ResponseEntity.ok(workoutLogService.createWorkoutLog(request));
    }

    @GetMapping
    public ResponseEntity<List<WorkoutLogResponse>> getWorkoutHistory() {
        return ResponseEntity.ok(workoutLogService.getWorkoutHistory());
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<WorkoutLogResponse> getWorkoutLogByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(workoutLogService.getWorkoutLogByDate(date));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkoutLogResponse> updateWorkoutLog(
            @PathVariable Long id,
            @Valid @RequestBody WorkoutLogRequest request) {
        return ResponseEntity.ok(workoutLogService.updateWorkoutLog(id, request));
    }
}
