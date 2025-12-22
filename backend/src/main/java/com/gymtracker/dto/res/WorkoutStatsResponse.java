package com.gymtracker.dto.res;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for workout statistics
 * Used for RAG context and analytics
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutStatsResponse {
    /**
     * Total number of completed workouts in the time period
     */
    private Integer totalWorkouts;
    
    /**
     * Total workout volume (could be calculated from sets/reps)
     */
    private Double totalVolume;
    
    /**
     * List of most frequently used exercises
     */
    private List<String> favoriteExercises;
    
    /**
     * Average workouts per week
     */
    private Double averageWorkoutsPerWeek;
    
    /**
     * Distribution of exercises by muscle group
     * Key: muscle group name, Value: count of exercises
     */
    private Map<String, Integer> muscleGroupDistribution;
    
    /**
     * Total duration in minutes
     */
    private Integer totalDurationMinutes;
}
