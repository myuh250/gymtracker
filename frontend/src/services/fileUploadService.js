import apiClient, { getErrorMessage } from "../api/axios.customize";

/**
 * Upload exercise media file (image or video) to Cloudinary
 * @param {File} file - File to upload
 * @returns {Promise<string>} Cloudinary URL of uploaded file
 */
export const uploadExerciseMedia = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post("/api/cloudinary/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Response format: { url: "https://res.cloudinary.com/...", message: "..." }
    return response.data.url;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
