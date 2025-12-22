import apiClient, { getErrorMessage } from "../api/axios.customize";

/**
 * Get all workout logs for current user
 */
export const getWorkoutLogs = async () => {
  try {
    const response = await apiClient.get("/api/workouts");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Get workout log by date
 */
export const getWorkoutLogByDate = async (date) => {
  try {
    const response = await apiClient.get(`/api/workouts/date/${date}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Create new workout log
 * @param {Object} workoutLog - { logDate, notes, isCompleted, totalDurationMinutes, sets: [...] }
 */
export const createWorkoutLog = async (workoutLog) => {
  try {
    const response = await apiClient.post("/api/workouts", workoutLog);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Update workout log
 */
export const updateWorkoutLog = async (id, workoutLog) => {
  try {
    const response = await apiClient.put(`/api/workouts/${id}`, workoutLog);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Delete workout log
 * Note: Backend doesn't have DELETE endpoint - need to implement
 */
export const deleteWorkoutLog = async (id) => {
  try {
    // TODO: Backend needs to implement DELETE /api/workouts/{id}
    await apiClient.delete(`/api/workouts/${id}`);
  } catch (error) {
    // Fallback: Use PUT to mark as deleted or throw error
    throw new Error("Delete workout not implemented in backend yet");
  }
};

/**
 * Toggle workout completion status
 * Note: Backend doesn't have this endpoint - workaround with PUT
 */
export const toggleWorkoutCompletion = async (id) => {
  try {
    // Workaround: Get current workout, toggle isCompleted, then PUT
    const current = await apiClient.get(`/api/workouts/${id}`);
    const updated = {
      ...current.data,
      isCompleted: !current.data.isCompleted,
    };
    const response = await apiClient.put(`/api/workouts/${id}`, updated);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Toggle set completion status
 * Note: Backend doesn't have this endpoint - workaround with PUT
 */
export const toggleSetCompletion = async (workoutId, setId) => {
  try {
    // Workaround: Get workout, find set, toggle, then PUT entire workout
    const current = await apiClient.get(`/api/workouts/${workoutId}`);
    const workout = current.data;
    const updatedSets = workout.sets.map((set) =>
      set.id === setId ? { ...set, isCompleted: !set.isCompleted } : set
    );
    const response = await apiClient.put(`/api/workouts/${workoutId}`, {
      ...workout,
      sets: updatedSets,
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
