package com.gymtracker.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.gymtracker.dto.req.ExerciseRequest;
import com.gymtracker.dto.res.ExerciseResponse;
import com.gymtracker.entity.Exercise;
import com.gymtracker.entity.User;
import com.gymtracker.repository.ExerciseRepository;
import com.gymtracker.repository.UserRepository;
import com.gymtracker.service.ExerciseService;

@Service
public class ExerciseServiceImpl implements ExerciseService {

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public List<ExerciseResponse> getAllExercises() {
        User user = getCurrentUser();
        List<Exercise> exercises = exerciseRepository.findByCreatedByUserIdIsNullOrCreatedByUserId(user.getId());
        return exercises.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public ExerciseResponse createExercise(ExerciseRequest request) {
        User user = getCurrentUser();
        Exercise exercise = new Exercise();
        exercise.setName(request.getName());
        exercise.setMuscleGroup(request.getMuscleGroup());
        exercise.setDescription(request.getDescription());
        exercise.setMediaUrl(request.getMediaUrl());
        exercise.setIsCustom(true);
        exercise.setCreatedByUserId(user.getId());

        Exercise saved = exerciseRepository.save(exercise);
        return mapToResponse(saved);
    }

    @Override
    public ExerciseResponse updateExercise(Long id, ExerciseRequest request) {
        User user = getCurrentUser();
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exercise not found"));

        // Admin có thể edit mọi bài tập, User chỉ edit bài tập custom của mình
        boolean isAdmin = user.getRole().name().equals("ROLE_ADMIN");
        boolean canEdit = isAdmin || (exercise.getIsCustom() && exercise.getCreatedByUserId().equals(user.getId()));
        
        if (!canEdit) {
            throw new RuntimeException("You can only edit your own custom exercises");
        }

        exercise.setName(request.getName());
        exercise.setMuscleGroup(request.getMuscleGroup());
        exercise.setDescription(request.getDescription());
        exercise.setMediaUrl(request.getMediaUrl());

        Exercise saved = exerciseRepository.save(exercise);
        return mapToResponse(saved);
    }

    @Override
    public void deleteExercise(Long id) {
        User user = getCurrentUser();
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exercise not found"));

        // Admin có thể delete mọi bài tập, User chỉ delete bài tập custom của mình
        boolean isAdmin = user.getRole().name().equals("ROLE_ADMIN");
        boolean canDelete = isAdmin || (exercise.getIsCustom() && exercise.getCreatedByUserId().equals(user.getId()));
        
        if (!canDelete) {
            throw new RuntimeException("You can only delete your own custom exercises");
        }

        exerciseRepository.delete(exercise);
    }

    @Override
    public ExerciseResponse getExerciseById(Long id) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exercise not found"));
        return mapToResponse(exercise);
    }

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
