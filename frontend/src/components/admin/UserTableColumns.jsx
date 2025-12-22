import React from "react";
import { Tag, Space, Button, Popconfirm } from "antd";
import {
  EyeOutlined,
  StopOutlined,
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

export const getUserTableColumns = ({
  onViewProfile,
  onBlockUser,
  onEditUser,
  onDeleteUser,
  onResetPassword,
}) => [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    width: 60,
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    render: (text, record) => (
      <Space>
        <span>{text}</span>
        {record.role === "ROLE_ADMIN" && (
          <Tag color="red" style={{ fontSize: 10 }}>
            ADMIN
          </Tag>
        )}
      </Space>
    ),
  },
  {
    title: "Họ tên",
    dataIndex: "fullName",
    key: "fullName",
  },
  {
    title: "Trạng thái",
    dataIndex: "isEnabled",
    key: "isEnabled",
    width: 120,
    render: (isEnabled) => (
      <Tag color={isEnabled ? "green" : "red"}>
        {isEnabled ? "Hoạt động" : "Đã chặn"}
      </Tag>
    ),
  },
  {
    title: "Ngày tạo",
    dataIndex: "createdAt",
    key: "createdAt",
    width: 140,
    render: (date) => dayjs(date).format("DD/MM/YYYY"),
  },
  {
    title: "Hành động",
    key: "action",
    width: 300,
    render: (_, record) => (
      <Space>
        <Button
          type="link"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => onViewProfile(record.id)}
        >
          Xem
        </Button>
        <Button
          type="link"
          icon={<EditOutlined />}
          size="small"
          onClick={() => onEditUser(record.id)}
        >
          Sửa
        </Button>
        <Button
          type="link"
          icon={<KeyOutlined />}
          size="small"
          onClick={() => onResetPassword(record.id)}
        >
          Đổi MK
        </Button>
        {record.role !== "ROLE_ADMIN" && (
          <>
            <Popconfirm
              title={record.isEnabled ? "Chặn user?" : "Bỏ chặn user?"}
              description={
                record.isEnabled
                  ? `Ngăn ${record.email} đăng nhập?`
                  : `Cho phép ${record.email} truy cập lại?`
              }
              onConfirm={() => onBlockUser(record.id)}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <Button
                type="link"
                danger={record.isEnabled}
                icon={
                  record.isEnabled ? <StopOutlined /> : <CheckCircleOutlined />
                }
                size="small"
              >
                {record.isEnabled ? "Chặn" : "Bỏ chặn"}
              </Button>
            </Popconfirm>
            <Popconfirm
              title="Xóa user?"
              description={`Bạn có chắc muốn xóa ${record.email}? Hành động này không thể hoàn tác!`}
              onConfirm={() => onDeleteUser(record.id)}
              okText="Xóa"
              okType="danger"
              cancelText="Hủy"
            >
              <Button type="link" danger icon={<DeleteOutlined />} size="small">
                Xóa
              </Button>
            </Popconfirm>
          </>
        )}
      </Space>
    ),
  },
];
