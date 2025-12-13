package com.gymtracker.dto.req;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ExerciseSetRequest {
    private Long id; // For updates

    @NotNull
    private Long exerciseId;

    @NotNull
    @Min(1)
    private Integer setNumber;

    @NotNull
    @Min(0)
    private Integer reps;

    @NotNull
    @Min(0)
    private Double weight;

    private Boolean isCompleted;
    private String notes;
    private Integer restTimeSeconds;
}
