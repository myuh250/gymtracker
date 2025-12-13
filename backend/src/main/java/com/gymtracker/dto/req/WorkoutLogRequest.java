package com.gymtracker.dto.req;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WorkoutLogRequest {
    @NotNull(message = "Date is required")
    private LocalDate logDate;
    
    private String notes;
    private Boolean isCompleted;
    private Integer totalDurationMinutes;
    
    // Optional: Create sets immediately
    private List<ExerciseSetRequest> sets;
}
