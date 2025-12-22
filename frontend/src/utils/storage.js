import * as exerciseService from "../services/exerciseService";
import * as workoutService from "../services/workoutService";

// ==============================================
// Exercise Functions - API Integration
// ==============================================

export async function getExercises() {
  try {
    const data = await exerciseService.getExercises();
    // Backend returns ExerciseResponse[] directly
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("getExercises error:", error);
    return [];
  }
}

export async function addExercise(item) {
  try {
    // Transform to backend format: { name, muscleGroup, description, mediaUrl? }
    const request = {
      name: item.name,
      muscleGroup: item.muscleGroup,
      description: item.description || "",
    };
    // Only include mediaUrl if it exists (backend can't handle file upload yet)
    if (item.mediaUrl) {
      request.mediaUrl = item.mediaUrl;
    }
    const response = await exerciseService.createExercise(request);
    return response;
  } catch (error) {
    console.error("addExercise error:", error);
    throw error;
  }
}

export async function updateExercise(item) {
  try {
    const request = {
      name: item.name,
      muscleGroup: item.muscleGroup,
      description: item.description || "",
    };
    // Only include mediaUrl if it exists
    if (item.mediaUrl) {
      request.mediaUrl = item.mediaUrl;
    }
    const response = await exerciseService.updateExercise(item.id, request);
    return response;
  } catch (error) {
    console.error("updateExercise error:", error);
    throw error;
  }
}

export async function removeExercise(id) {
  try {
    await exerciseService.deleteExercise(id);
    return id;
  } catch (error) {
    console.error("removeExercise error:", error);
    throw error;
  }
}

// ==============================================
// Workout Functions - API Integration
// ==============================================

export async function getWorkouts() {
  try {
    const data = await workoutService.getWorkoutLogs();
    // Backend returns WorkoutLogResponse[] directly
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("getWorkouts error:", error);
    return [];
  }
}

export async function addWorkout(workout) {
  try {
    // Transform frontend format to backend WorkoutLogRequest
    const request = {
      logDate: workout.logDate,
      notes: workout.notes || "",
      isCompleted: workout.isCompleted || false,
      sets: (workout.sets || []).map((set) => ({
        exerciseId: set.exerciseId,
        setNumber: set.setNumber,
        reps: set.reps,
        weight: set.weight,
        isCompleted: set.isCompleted || false,
        notes: set.notes || "",
        restTimeSeconds: set.restTimeSeconds || 60,
      })),
    };
    // Only include totalDurationMinutes if it exists
    if (workout.totalDurationMinutes) {
      request.totalDurationMinutes = workout.totalDurationMinutes;
    }
    const response = await workoutService.createWorkoutLog(request);
    return response;
  } catch (error) {
    console.error("addWorkout error:", error);
    throw error;
  }
}

export async function updateWorkout(workout) {
  try {
    const request = {
      logDate: workout.logDate,
      notes: workout.notes || "",
      isCompleted: workout.isCompleted || false,
      sets: (workout.sets || []).map((set) => ({
        id: set.id, // Include for updates
        exerciseId: set.exerciseId,
        setNumber: set.setNumber,
        reps: set.reps,
        weight: set.weight,
        isCompleted: set.isCompleted || false,
        notes: set.notes || "",
        restTimeSeconds: set.restTimeSeconds || 60,
      })),
    };
    // Only include totalDurationMinutes if it exists
    if (workout.totalDurationMinutes) {
      request.totalDurationMinutes = workout.totalDurationMinutes;
    }
    const response = await workoutService.updateWorkoutLog(workout.id, request);
    return response;
  } catch (error) {
    console.error("updateWorkout error:", error);
    throw error;
  }
}

export async function toggleWorkoutCompleted(id) {
  try {
    const response = await workoutService.toggleWorkoutCompletion(id);
    return response;
  } catch (error) {
    console.error("toggleWorkoutCompleted error:", error);
    throw error;
  }
}

export async function toggleSetCompleted(workoutId, setId) {
  try {
    const response = await workoutService.toggleSetCompletion(workoutId, setId);
    return response;
  } catch (error) {
    console.error("toggleSetCompleted error:", error);
    throw error;
  }
}

export async function removeWorkout(id) {
  try {
    await workoutService.deleteWorkoutLog(id);
    return id;
  } catch (error) {
    console.error("removeWorkout error:", error);
    throw error;
  }
}
