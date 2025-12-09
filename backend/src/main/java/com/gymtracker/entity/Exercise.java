package com.gymtracker.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Exercise Entity representing a specific exercise definition
 * Contains exercise details like name, muscle group, description, and media
 */
@Entity
@Table(name = "exercises")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Exercise extends BaseEntity {
    
    @NotBlank(message = "Exercise name is required")
    @Size(min = 2, max = 100, message = "Exercise name must be between 2 and 100 characters")
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    
    @NotBlank(message = "Muscle group is required")
    @Size(max = 50, message = "Muscle group must not exceed 50 characters")
    @Column(name = "muscle_group", nullable = false, length = 50)
    private String muscleGroup;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "media_url", length = 500)
    private String mediaUrl;
    
    @Column(name = "is_custom", nullable = false)
    private Boolean isCustom = false;
    
    @Column(name = "created_by_user_id")
    private Long createdByUserId;
    
    // Relationships
    @OneToMany(mappedBy = "exercise", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExerciseSet> exerciseSets = new ArrayList<>();
    
    // Helper methods for bidirectional relationship
    public void addExerciseSet(ExerciseSet exerciseSet) {
        exerciseSets.add(exerciseSet);
        exerciseSet.setExercise(this);
    }
    
    public void removeExerciseSet(ExerciseSet exerciseSet) {
        exerciseSets.remove(exerciseSet);
        exerciseSet.setExercise(null);
    }
}

