import React, { useState } from "react";
import { Form, Input, Button, Card, Divider, Typography, message } from "antd";
import { GoogleOutlined, UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { login as loginAPI } from "../services/authService";

const { Title, Text } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);
    message.loading({ content: "Đang chuyển đến Google...", key: "auth" });
    const baseUrl =
      import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:8080";
    // Spring Security default entry point for OAuth2 login
    window.location.href = `${baseUrl}/oauth2/authorization/google`;
  };

  const onFinish = async (values) => {
    setLoading(true);

    try {
      // Call real API - Backend expects { email, password }
      const response = await loginAPI({
        email: values.email,
        password: values.password,
      });

      // Backend returns: { token, email, fullName, role, userId, avatarUrl }
      const { token, email, fullName, role, userId, avatarUrl } = response;

      // Create user object for AuthContext (include userId for RAG/AIChat and avatarUrl)
      const user = { userId, email, fullName, role, avatarUrl };

      // Save to localStorage and AuthContext
      localStorage.setItem("accessToken", token);
      login(user, token);

      message.success(`Xin chào, ${fullName}!`);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg =
        error.response?.data?.message || error.message || "Đăng nhập thất bại";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
      }}
    >
      <Card style={{ width: 400, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <Title level={2}>Đăng Nhập</Title>
          <Text type="secondary">Chào mừng bạn quay trở lại</Text>
        </div>

        <Form
          name="login_form"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Tên đăng nhập"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
              size="large"
              style={{ marginTop: 10 }}
            />
          </Form.Item>

          <div style={{ textAlign: "right", marginBottom: 16 }}>
            <Link to="/forgot-password" style={{ fontSize: 14 }}>
              Quên mật khẩu?
            </Link>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ color: "#aaa", fontSize: "14px" }}>HOẶC</Divider>

        <Button
          block
          icon={<GoogleOutlined />}
          size="large"
          onClick={handleGoogleLogin}
          loading={loading}
          style={{
            backgroundColor: "#DB4437",
            color: "white",
            borderColor: "#DB4437",
            marginBottom: 20,
          }}
        >
          Đăng nhập bằng Google
        </Button>

        <div style={{ textAlign: "center", marginTop: 10 }}>
          <Text>Chưa có tài khoản? </Text>
          <Link to="/register" style={{ fontWeight: "bold" }}>
            Đăng ký ngay
          </Link>
        </div>
      </Card>
    </div>
  );
}
