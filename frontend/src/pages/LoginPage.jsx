import React, { useState } from "react";
import { Form, Input, Button, Card, Divider, Typography, message } from "antd";
import { GoogleOutlined, UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";

const { Title, Text } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);
    message.loading({ content: "Đang kết nối tới Google...", key: "auth" });

    setTimeout(() => {
      const mockOAuthToken = "google_oauth2_token_xyz_123";
      localStorage.setItem("accessToken", mockOAuthToken);

      message.success({ content: "Đăng nhập Google thành công!", key: "auth" });
      setLoading(false);
      navigate("/");
    }, 1500);
  };

  const onFinish = (values) => {
    console.log("Form values:", values);
    setLoading(true);

    setTimeout(() => {
      localStorage.setItem("accessToken", "standard_token_abc_456");

      message.success("Đăng nhập thành công!");
      setLoading(false);
      navigate("/");
    }, 1000);
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
            name="username"
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
            />
          </Form.Item>

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
