import apiClient, { getErrorMessage } from "../api/axios.customize";

/**
 * Get all exercises for current user
 */
export const getExercises = async () => {
  try {
    const response = await apiClient.get("/api/exercises");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Get exercise by ID
 */
export const getExerciseById = async (id) => {
  try {
    const response = await apiClient.get(`/api/exercises/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Create new exercise
 * @param {Object} exercise - { name, muscleGroup, description }
 */
export const createExercise = async (exercise) => {
  try {
    const response = await apiClient.post("/api/exercises", exercise);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Update exercise
 */
export const updateExercise = async (id, exercise) => {
  try {
    const response = await apiClient.put(`/api/exercises/${id}`, exercise);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Delete exercise
 */
export const deleteExercise = async (id) => {
  try {
    await apiClient.delete(`/api/exercises/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
