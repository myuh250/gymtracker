import React, { useEffect } from "react";
import { Modal, Form, Input, Select, message } from "antd";

const { Option } = Select;

export default function UserFormModal({
  user,
  open,
  onClose,
  onSubmit,
  mode = "create",
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (mode === "edit" && user) {
        form.setFieldsValue({
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, user, mode, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      title={mode === "create" ? "Tạo User mới" : "Chỉnh sửa User"}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={mode === "create" ? "Tạo" : "Cập nhật"}
      cancelText="Hủy"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          role: "ROLE_USER",
        }}
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[
            { required: true, message: "Vui lòng nhập username" },
            {
              min: 3,
              message: "Username phải có ít nhất 3 ký tự",
            },
            {
              pattern: /^[a-zA-Z0-9_]+$/,
              message: "Username chỉ được chứa chữ, số và dấu gạch dưới",
            },
          ]}
        >
          <Input
            placeholder="Nhập username"
            disabled={mode === "edit"}
            autoComplete="off"
          />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input placeholder="Nhập email" autoComplete="off" />
        </Form.Item>

        <Form.Item
          label="Họ tên"
          name="fullName"
          rules={[
            { required: true, message: "Vui lòng nhập họ tên" },
            { min: 2, message: "Họ tên phải có ít nhất 2 ký tự" },
          ]}
        >
          <Input placeholder="Nhập họ tên đầy đủ" autoComplete="off" />
        </Form.Item>

        {mode === "create" && (
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
            ]}
          >
            <Input.Password
              placeholder="Nhập mật khẩu"
              autoComplete="new-password"
            />
          </Form.Item>
        )}

        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: "Vui lòng chọn role" }]}
        >
          <Select placeholder="Chọn role">
            <Option value="ROLE_USER">User</Option>
            <Option value="ROLE_ADMIN">Admin</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
