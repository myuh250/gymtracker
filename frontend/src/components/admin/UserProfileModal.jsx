import React from "react";
import { Modal, Descriptions, Tag } from "antd";
import dayjs from "dayjs";

export default function UserProfileModal({ user, open, onClose }) {
  if (!user) return null;

  return (
    <Modal
      title="Thông tin User"
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item label="ID">{user.id}</Descriptions.Item>
        <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
        <Descriptions.Item label="Họ tên">{user.fullName}</Descriptions.Item>
        <Descriptions.Item label="Role">
          <Tag color={user.role === "ROLE_ADMIN" ? "red" : "blue"}>
            {user.role}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={user.isEnabled ? "green" : "red"}>
            {user.isEnabled ? "Hoạt động" : "Đã chặn"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="OAuth">
          {user.isOauth ? (
            <Tag color="blue">{user.oauthProvider}</Tag>
          ) : (
            <Tag>Email/Password</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">
          {dayjs(user.createdAt).format("DD/MM/YYYY HH:mm")}
        </Descriptions.Item>
        <Descriptions.Item label="Cập nhật lần cuối">
          {dayjs(user.updatedAt).format("DD/MM/YYYY HH:mm")}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
}
