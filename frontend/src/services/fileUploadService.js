import apiClient, { getErrorMessage } from "../api/axios.customize";

/**
 * Upload exercise media file (image or video)
 * @param {File} file - File to upload
 * @returns {Promise<string>} URL of uploaded file
 */
export const uploadExerciseMedia = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(
      "/api/exercises/upload-media",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data; // Returns URL string
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
