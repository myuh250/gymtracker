package com.gymtracker.service;

import java.time.LocalDate;
import java.util.List;

import com.gymtracker.dto.req.WorkoutLogRequest;
import com.gymtracker.dto.res.WorkoutLogResponse;

public interface WorkoutLogService {
    WorkoutLogResponse createWorkoutLog(WorkoutLogRequest request);
    List<WorkoutLogResponse> getWorkoutHistory();
    WorkoutLogResponse getWorkoutById(Long id);
    WorkoutLogResponse getWorkoutLogByDate(LocalDate date);
    WorkoutLogResponse updateWorkoutLog(Long id, WorkoutLogRequest request);
    void deleteWorkoutLog(Long id);
}
