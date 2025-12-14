package com.gymtracker.dto.res;

import java.time.LocalDate;
import java.util.List;

import lombok.Data;

@Data
public class WorkoutLogResponse {
    private Long id;
    private LocalDate logDate;
    private String notes;
    private Boolean isCompleted;
    private Integer totalDurationMinutes;
    private List<ExerciseSetResponse> sets;
}
