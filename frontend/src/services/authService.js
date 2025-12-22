import apiClient, { getErrorMessage } from "../api/axios.customize";

/**
 * Login with email/password
 * @param {Object} credentials - { email, password }
 * @returns {Promise<{token, email, fullName, role}>}
 */
export const login = async (credentials) => {
  try {
    const response = await apiClient.post("/api/auth/login", credentials);
    // Backend returns: { token, email, fullName, role }
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Register new user
 * @param {Object} userData - { fullName, email, password }
 * @returns {Promise<{token, email, fullName, role}>}
 */
export const register = async (userData) => {
  try {
    const response = await apiClient.post("/api/auth/register", userData);
    // Backend returns: { token, email, fullName, role }
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Logout current user
 */
export const logout = async () => {
  try {
    await apiClient.post("/api/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get("/api/auth/me");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Refresh access token (called automatically by interceptor)
 */
export const refreshToken = async () => {
  try {
    const response = await apiClient.get("/api/auth/refresh");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
