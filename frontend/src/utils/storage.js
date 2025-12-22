import * as exerciseService from "../services/exerciseService";
import * as workoutService from "../services/workoutService";

// ==============================================
// Exercise Functions - API Integration
// ==============================================

export async function getExercises() {
  try {
    const response = await exerciseService.getExercises();
    return response.data || response || [];
  } catch (error) {
    console.error("getExercises error:", error);
    return [];
  }
}

export async function addExercise(item) {
  try {
    const response = await exerciseService.createExercise(item);
    return response.data || response;
  } catch (error) {
    console.error("addExercise error:", error);
    throw error;
  }
}

export async function updateExercise(item) {
  try {
    const response = await exerciseService.updateExercise(item.id, item);
    return response.data || response;
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
    const response = await workoutService.getWorkoutLogs();
    return response.data || response || [];
  } catch (error) {
    console.error("getWorkouts error:", error);
    return [];
  }
}

export async function addWorkout(workout) {
  try {
    const response = await workoutService.createWorkoutLog(workout);
    return response.data || response;
  } catch (error) {
    console.error("addWorkout error:", error);
    throw error;
  }
}

export async function updateWorkout(workout) {
  try {
    const response = await workoutService.updateWorkoutLog(workout.id, workout);
    return response.data || response;
  } catch (error) {
    console.error("updateWorkout error:", error);
    throw error;
  }
}

export async function toggleWorkoutCompleted(id) {
  try {
    const response = await workoutService.toggleWorkoutCompletion(id);
    return response.data || response;
  } catch (error) {
    console.error("toggleWorkoutCompleted error:", error);
    throw error;
  }
}

export async function toggleSetCompleted(workoutId, setId) {
  try {
    const response = await workoutService.toggleSetCompletion(workoutId, setId);
    return response.data || response;
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
