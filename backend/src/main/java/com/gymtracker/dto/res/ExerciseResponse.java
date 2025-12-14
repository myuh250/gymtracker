package com.gymtracker.dto.res;

import lombok.Data;

@Data
public class ExerciseResponse {
    private Long id;
    private String name;
    private String muscleGroup;
    private String description;
    private String mediaUrl;
    private Boolean isCustom;
    private Long createdByUserId;
}
