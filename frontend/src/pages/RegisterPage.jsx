import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { register as registerAPI } from "../services/authService";

const { Title, Text } = Typography;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // Hook để thao tác với form (reset, validate...)
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);

    try {
      // Call real API - Backend expects { fullName, email, password }
      await registerAPI({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      });

      message.success("Đăng ký tài khoản thành công!");
      navigate("/login");
    } catch (error) {
      console.error("Register error:", error);
      const errorMsg =
        error.response?.data?.message || error.message || "Đăng ký thất bại";
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
      <Card style={{ width: 450, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <Title level={2}>Đăng Ký </Title>
        </div>

        <Form
          form={form}
          name="register_form"
          layout="vertical"
          onFinish={onFinish}
          scrollToFirstError
        >
          {/* FULL NAME */}
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[
              { required: true, message: "Vui lòng nhập họ và tên!" },
              { min: 2, message: "Họ và tên phải có ít nhất 2 ký tự!" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Ví dụ: Nguyễn Văn A"
              size="large"
            />
          </Form.Item>

          {/* EMAIL  */}
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { type: "email", message: "Email không hợp lệ!" },
              { required: true, message: "Vui lòng nhập Email!" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="user@example.com"
              size="large"
            />
          </Form.Item>

          {/* MẬT KHẨU */}
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
            hasFeedback // Hiển thị icon check xanh khi đúng
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
              size="large"
            />
          </Form.Item>

          {/* NHẬP LẠI MẬT KHẨU  */}
          <Form.Item
            name="confirm"
            label="Nhập lại mật khẩu"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Hai mật khẩu không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Xác nhận mật khẩu"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 30 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
            >
              Đăng Ký
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center" }}>
          <Text>Đã có tài khoản? </Text>
          <Link to="/login" style={{ fontWeight: "bold" }}>
            Đăng nhập ngay
          </Link>
        </div>
      </Card>
    </div>
  );
}
