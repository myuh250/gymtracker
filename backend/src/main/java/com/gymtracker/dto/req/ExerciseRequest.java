package com.gymtracker.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ExerciseRequest {
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank(message = "Muscle group is required")
    @Size(max = 50)
    private String muscleGroup;

    private String description;
    private String mediaUrl;
}
