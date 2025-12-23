import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { message, Spin } from "antd";
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../api/axios.customize";

const parseJwt = (token) => {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch (e) {
    return null;
  }
};

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const handleOAuthCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const userId = params.get("userId");

        if (!token || !userId) {
          message.error("Không nhận được thông tin từ Google");
          navigate("/login", { replace: true });
          return;
        }

        // Clean up old localStorage items
        ["mockAccessToken", "exercises", "botpress-webchat"].forEach((k) =>
          localStorage.removeItem(k)
        );

        // Store token first so API calls can authenticate
        localStorage.setItem("accessToken", token);

        // Fetch full user profile including avatarUrl
        const response = await apiClient.get(`/api/users/${userId}`);
        const userData = response.data;

        // Build user object with avatar
        const user = {
          userId: userData.id,
          email: userData.email,
          fullName: userData.fullName,
          role: userData.role,
          avatarUrl: userData.avatarUrl, // Google avatar URL
        };

        // Use AuthContext login to save and redirect
        login(user, token);

        message.success("Đăng nhập Google thành công!");
      } catch (error) {
        console.error("OAuth callback error:", error);
        message.error("Đăng nhập thất bại. Vui lòng thử lại");
        localStorage.removeItem("accessToken");
        navigate("/login", { replace: true });
      }
    };

    handleOAuthCallback();
  }, [login, navigate]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <Spin size="large" />
      <div style={{ color: "#666", fontSize: 16 }}>
        Đang hoàn tất đăng nhập...
      </div>
    </div>
  );
}
