package com.gymtracker.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gymtracker.dto.res.ExerciseResponse;
import com.gymtracker.entity.Exercise;
import com.gymtracker.repository.ExerciseRepository;
import com.gymtracker.service.ExerciseRagService;

/**
 * Implementation of ExerciseRagService for RAG data synchronization
 * 
 * This service is exclusively for LLM service data sync operations.
 * It provides read-only access to exercise data without user context.
 */
@Service
public class ExerciseRagServiceImpl implements ExerciseRagService {

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ExerciseResponse> exportAllExercises() {
        // Export all exercises for initial RAG sync (no user filtering)
        List<Exercise> exercises = exerciseRepository.findAllOrdered();
        return exercises.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExerciseResponse> getExercisesUpdatedSince(LocalDateTime since) {
        // Get exercises updated after a specific timestamp (for incremental sync)
        List<Exercise> exercises = exerciseRepository.findByUpdatedAtAfter(since);
        return exercises.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Map Exercise entity to ExerciseResponse DTO
     */
    private ExerciseResponse mapToResponse(Exercise exercise) {
        ExerciseResponse response = new ExerciseResponse();
        response.setId(exercise.getId());
        response.setName(exercise.getName());
        response.setMuscleGroup(exercise.getMuscleGroup());
        response.setDescription(exercise.getDescription());
        response.setMediaUrl(exercise.getMediaUrl());
        response.setIsCustom(exercise.getIsCustom());
        response.setCreatedByUserId(exercise.getCreatedByUserId());
        return response;
    }
}
