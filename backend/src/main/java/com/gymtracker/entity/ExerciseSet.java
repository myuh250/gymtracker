package com.gymtracker.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * ExerciseSet Entity representing a single set performed in a workout session
 * Contains details about the set number, reps, weight, and completion status
 */
@Entity
@Table(name = "exercise_sets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseSet extends BaseEntity {
    
    @NotNull(message = "Set number is required")
    @Min(value = 1, message = "Set number must be at least 1")
    @Column(name = "set_number", nullable = false)
    private Integer setNumber;
    
    @NotNull(message = "Reps is required")
    @Min(value = 0, message = "Reps must be at least 0")
    @Column(name = "reps", nullable = false)
    private Integer reps;
    
    @NotNull(message = "Weight is required")
    @Min(value = 0, message = "Weight must be at least 0")
    @Column(name = "weight", nullable = false)
    private Double weight;
    
    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = false;
    
    @Column(name = "notes", length = 500)
    private String notes;
    
    @Column(name = "rest_time_seconds")
    private Integer restTimeSeconds;
    
    // Relationships
    @NotNull(message = "Workout log is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "log_id", nullable = false)
    private WorkoutLog workoutLog;
    
    @NotNull(message = "Exercise is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;
}

