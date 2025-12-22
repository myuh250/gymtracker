import apiClient, { getErrorMessage } from "../api/axios.customize";

/**
 * Admin Service - User Management APIs
 * Connected to backend AdminController endpoints
 */

/**
 * Get all users (Admin only)
 * Backend endpoint: GET /api/admin/users
 */
export const getAllUsers = async () => {
  try {
    const response = await apiClient.get("/api/admin/users");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Get user by ID (Admin only)
 * Backend endpoint: GET /api/admin/users/{id}
 */
export const getUserById = async (id) => {
  try {
    const response = await apiClient.get(`/api/admin/users/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Create new user (Admin only)
 * Backend endpoint: POST /api/admin/users
 * @param {Object} userData - { email, fullName, password, role, isEnabled }
 * Note: password is required, role defaults to ROLE_USER, isEnabled defaults to true
 */
export const createUser = async (userData) => {
  try {
    const response = await apiClient.post("/api/admin/users", userData);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Update user (Admin only)
 * Backend endpoint: PUT /api/admin/users/{id}
 * @param {number} id
 * @param {Object} userData - { email, fullName, password, role, isEnabled }
 * Note: password is optional for updates
 */
export const updateUser = async (id, userData) => {
  try {
    const response = await apiClient.put(`/api/admin/users/${id}`, userData);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Toggle user enabled status (Admin only)
 * Backend endpoint: PATCH /api/admin/users/{id}/toggle-enabled
 */
export const toggleUserEnabled = async (id) => {
  try {
    const response = await apiClient.patch(
      `/api/admin/users/${id}/toggle-enabled`
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Delete user (Admin only)
 * Backend endpoint: DELETE /api/admin/users/{id}
 */
export const deleteUser = async (id) => {
  try {
    await apiClient.delete(`/api/admin/users/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
