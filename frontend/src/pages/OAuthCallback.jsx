import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { message, Spin } from "antd";
import { useAuth } from "../contexts/AuthContext";

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

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userId = params.get("userId");

    if (!token) {
      message.error("Không nhận được token từ Google");
      navigate("/login", { replace: true });
      return;
    }

    // Dọn rác cũ trong localStorage từ luồng mock
    ["mockAccessToken", "exercises", "botpress-webchat"].forEach((k) =>
      localStorage.removeItem(k)
    );

    // Decode JWT để lấy email/role nếu có
    const payload = parseJwt(token);
    const derivedEmail = payload?.sub || payload?.email;
    const derivedRole = payload?.role || "ROLE_USER";
    const derivedName =
      payload?.fullName || payload?.name || payload?.given_name || derivedEmail;

    const user = {
      id: userId ? Number(userId) : payload?.userId ?? null,
      email: derivedEmail || "unknown",
      fullName: derivedName || "User",
      role: derivedRole,
    };

    localStorage.setItem("accessToken", token);
    login(user, token);

    message.success("Đăng nhập Google thành công!");
    // Dùng hard redirect để chắc chắn thoát khỏi /login và tải lại state SPA
    window.location.replace("/");
  }, [login, navigate]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <Spin tip="Đang hoàn tất đăng nhập..." size="large" />
    </div>
  );
}
