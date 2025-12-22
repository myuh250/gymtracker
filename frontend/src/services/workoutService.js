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
 * Delete workout log (Note: Backend doesn't have DELETE endpoint yet)
 */
export const deleteWorkoutLog = async (id) => {
  try {
    await apiClient.delete(`/api/workouts/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Toggle workout completion status (Note: Backend doesn't have this endpoint yet)
 */
export const toggleWorkoutCompletion = async (id) => {
  try {
    const response = await apiClient.patch(
      `/api/workouts/${id}/toggle-complete`
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Toggle set completion status (Note: Backend doesn't have this endpoint yet)
 */
export const toggleSetCompletion = async (workoutId, setId) => {
  try {
    const response = await apiClient.patch(
      `/api/workouts/${workoutId}/sets/${setId}/toggle-complete`
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
