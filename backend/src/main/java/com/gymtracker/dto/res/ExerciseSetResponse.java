package com.gymtracker.dto.res;

import lombok.Data;

@Data
public class ExerciseSetResponse {
    private Long id;
    private Long exerciseId;
    private String exerciseName;
    private String muscleGroup;
    private Integer setNumber;
    private Integer reps;
    private Double weight;
    private Boolean isCompleted;
    private String notes;
    private Integer restTimeSeconds;
}
