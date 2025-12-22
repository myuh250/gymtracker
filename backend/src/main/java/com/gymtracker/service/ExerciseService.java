package com.gymtracker.service;

import java.util.List;

import com.gymtracker.dto.req.ExerciseRequest;
import com.gymtracker.dto.res.ExerciseResponse;

public interface ExerciseService {
    List<ExerciseResponse> getAllExercises();
    ExerciseResponse createExercise(ExerciseRequest request);
    ExerciseResponse updateExercise(Long id, ExerciseRequest request);
    void deleteExercise(Long id);
    ExerciseResponse getExerciseById(Long id);
}
