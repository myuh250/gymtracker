import React, { useEffect } from "react";
import { Modal, Form, Input, message } from "antd";
import { LockOutlined } from "@ant-design/icons";

export default function ResetPasswordModal({ user, open, onClose, onSubmit }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values.newPassword);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      title={`Đổi mật khẩu cho: ${user?.fullName || user?.email || ""}`}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Đổi mật khẩu"
      cancelText="Hủy"
      width={500}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới" },
            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Nhập mật khẩu mới"
            size="large"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Mật khẩu không khớp"));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Xác nhận mật khẩu mới"
            size="large"
            autoComplete="new-password"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
