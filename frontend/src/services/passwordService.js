import axios from "../api/axios.customize";

export const forgotPassword = async (email, newPassword) => {
  const response = await axios.post("/api/auth/forgot-password", {
    email,
    newPassword,
  });
  return response.data;
};
