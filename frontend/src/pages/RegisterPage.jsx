import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";

const { Title, Text } = Typography;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // Hook để thao tác với form (reset, validate...)
  const [form] = Form.useForm();

  const onFinish = (values) => {
    // values = { username, email, password, confirm }
    console.log("Register values:", values);
    setLoading(true);

    // --- MOCK API REGISTER ---
    setTimeout(() => {
      message.success("Đăng ký tài khoản thành công!");
      setLoading(false);
      navigate("/login");
    }, 1500);
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
          {/* USERNAME */}
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
              { min: 4, message: "Tên đăng nhập phải có ít nhất 4 ký tự!" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Ví dụ: user123"
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
