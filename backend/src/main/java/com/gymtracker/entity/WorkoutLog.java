package com.gymtracker.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * WorkoutLog Entity representing a specific workout session
 * Contains the date of the workout and related exercise sets
 */
@Entity
@Table(name = "workout_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutLog extends BaseEntity {
    
    @NotNull(message = "Workout date is required")
    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = false;
    
    @Column(name = "total_duration_minutes")
    private Integer totalDurationMinutes;
    
    // Relationships
    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @OneToMany(mappedBy = "workoutLog", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExerciseSet> exerciseSets = new ArrayList<>();
    
    // Helper methods for bidirectional relationship
    public void addExerciseSet(ExerciseSet exerciseSet) {
        exerciseSets.add(exerciseSet);
        exerciseSet.setWorkoutLog(this);
    }
    
    public void removeExerciseSet(ExerciseSet exerciseSet) {
        exerciseSets.remove(exerciseSet);
        exerciseSet.setWorkoutLog(null);
    }
}

