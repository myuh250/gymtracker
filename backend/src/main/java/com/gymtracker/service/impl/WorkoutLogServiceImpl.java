package com.gymtracker.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gymtracker.dto.req.ExerciseSetRequest;
import com.gymtracker.dto.req.WorkoutLogRequest;
import com.gymtracker.dto.res.ExerciseSetResponse;
import com.gymtracker.dto.res.WorkoutLogResponse;
import com.gymtracker.entity.Exercise;
import com.gymtracker.entity.ExerciseSet;
import com.gymtracker.entity.User;
import com.gymtracker.entity.WorkoutLog;
import com.gymtracker.repository.ExerciseRepository;
import com.gymtracker.repository.ExerciseSetRepository;
import com.gymtracker.repository.UserRepository;
import com.gymtracker.repository.WorkoutLogRepository;
import com.gymtracker.service.WorkoutLogService;

@Service
public class WorkoutLogServiceImpl implements WorkoutLogService {

    @Autowired
    private WorkoutLogRepository workoutLogRepository;

    @Autowired
    private ExerciseSetRepository exerciseSetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    @Transactional
    public WorkoutLogResponse createWorkoutLog(WorkoutLogRequest request) {
        User user = getCurrentUser();
        
        // Check if log already exists for date
        if (workoutLogRepository.findByUserIdAndLogDate(user.getId(), request.getLogDate()).isPresent()) {
            throw new RuntimeException("Workout log already exists for this date");
        }

        WorkoutLog log = new WorkoutLog();
        log.setUser(user);
        log.setLogDate(request.getLogDate());
        log.setNotes(request.getNotes());
        log.setIsCompleted(request.getIsCompleted() != null ? request.getIsCompleted() : false);
        log.setTotalDurationMinutes(request.getTotalDurationMinutes());

        WorkoutLog savedLog = workoutLogRepository.save(log);

        if (request.getSets() != null && !request.getSets().isEmpty()) {
            saveSets(savedLog, request.getSets());
        }

        return mapToResponse(savedLog);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkoutLogResponse> getWorkoutHistory() {
        User user = getCurrentUser();
        List<WorkoutLog> logs = workoutLogRepository.findByUserIdOrderByLogDateDesc(user.getId());
        return logs.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public WorkoutLogResponse getWorkoutById(Long id) {
        User user = getCurrentUser();
        WorkoutLog log = workoutLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout log not found"));
        
        if (!log.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        return mapToResponse(log);
    }

    @Override
    @Transactional(readOnly = true)
    public WorkoutLogResponse getWorkoutLogByDate(java.time.LocalDate date) {
        User user = getCurrentUser();
        WorkoutLog log = workoutLogRepository.findByUserIdAndLogDate(user.getId(), date)
                .orElseThrow(() -> new RuntimeException("Workout log not found for date: " + date));
        return mapToResponse(log);
    }

    @Override
    @Transactional
    public WorkoutLogResponse updateWorkoutLog(Long id, WorkoutLogRequest request) {
        User user = getCurrentUser();
        WorkoutLog log = workoutLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout log not found"));

        if (!log.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        log.setNotes(request.getNotes());
        if (request.getIsCompleted() != null) log.setIsCompleted(request.getIsCompleted());
        if (request.getTotalDurationMinutes() != null) log.setTotalDurationMinutes(request.getTotalDurationMinutes());

        workoutLogRepository.save(log);

        if (request.getSets() != null) {
             exerciseSetRepository.deleteByWorkoutLogId(log.getId());
             saveSets(log, request.getSets());
        }
        
        return mapToResponse(log);
    }
    
    private void saveSets(WorkoutLog log, List<ExerciseSetRequest> setRequests) {
        for (ExerciseSetRequest setReq : setRequests) {
            Exercise exercise = exerciseRepository.findById(setReq.getExerciseId())
                    .orElseThrow(() -> new RuntimeException("Exercise not found"));

            ExerciseSet set = new ExerciseSet();
            set.setWorkoutLog(log);
            set.setExercise(exercise);
            set.setSetNumber(setReq.getSetNumber());
            set.setReps(setReq.getReps());
            set.setWeight(setReq.getWeight());
            set.setIsCompleted(setReq.getIsCompleted() != null ? setReq.getIsCompleted() : false);
            set.setNotes(setReq.getNotes());
            set.setRestTimeSeconds(setReq.getRestTimeSeconds());
            
            exerciseSetRepository.save(set);
        }
    }

    private WorkoutLogResponse mapToResponse(WorkoutLog log) {
        WorkoutLogResponse response = new WorkoutLogResponse();
        response.setId(log.getId());
        response.setLogDate(log.getLogDate());
        response.setNotes(log.getNotes());
        response.setIsCompleted(log.getIsCompleted());
        response.setTotalDurationMinutes(log.getTotalDurationMinutes());
        
        List<ExerciseSet> sets = exerciseSetRepository.findByWorkoutLogId(log.getId());
        response.setSets(sets.stream().map(this::mapSetToResponse).collect(Collectors.toList()));
        
        return response;
    }
    
    private ExerciseSetResponse mapSetToResponse(ExerciseSet set) {
        ExerciseSetResponse response = new ExerciseSetResponse();
        response.setId(set.getId());
        response.setExerciseId(set.getExercise().getId());
        response.setExerciseName(set.getExercise().getName());
        response.setMuscleGroup(set.getExercise().getMuscleGroup());
        response.setSetNumber(set.getSetNumber());
        response.setReps(set.getReps());
        response.setWeight(set.getWeight());
        response.setIsCompleted(set.getIsCompleted());
        response.setNotes(set.getNotes());
        response.setRestTimeSeconds(set.getRestTimeSeconds());
        return response;
    }

    @Override
    @Transactional
    public void deleteWorkoutLog(Long id) {
        User user = getCurrentUser();
        WorkoutLog log = workoutLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout log not found"));

        if (!log.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        // Delete associated exercise sets first (cascade should handle this, but explicit for clarity)
        exerciseSetRepository.deleteByWorkoutLogId(id);
        
        // Delete the workout log
        workoutLogRepository.delete(log);
    }
}
