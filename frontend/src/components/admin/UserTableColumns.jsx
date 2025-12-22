import React from "react";
import { Tag, Space, Button, Popconfirm } from "antd";
import {
  EyeOutlined,
  StopOutlined,
  CheckCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

export const getUserTableColumns = ({
  onViewProfile,
  onBlockUser,
  onEditUser,
}) => [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    width: 60,
  },
  {
    title: "Username",
    dataIndex: "username",
    key: "username",
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
    title: "Email",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "Họ tên",
    dataIndex: "fullName",
    key: "fullName",
  },
  {
    title: "Trạng thái",
    dataIndex: "isBlocked",
    key: "isBlocked",
    width: 120,
    render: (isBlocked) => (
      <Tag color={isBlocked ? "red" : "green"}>
        {isBlocked ? "Đã chặn" : "Hoạt động"}
      </Tag>
    ),
  },
  {
    title: "Lần đăng nhập cuối",
    dataIndex: "lastLogin",
    key: "lastLogin",
    width: 140,
    render: (date) => dayjs(date).format("DD/MM/YYYY"),
  },
  {
    title: "Hành động",
    key: "action",
    width: 240,
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
        {record.role !== "ROLE_ADMIN" && (
          <Popconfirm
            title={record.isBlocked ? "Bỏ chặn user?" : "Chặn user?"}
            description={
              record.isBlocked
                ? `Cho phép ${record.username} truy cập lại?`
                : `Ngăn ${record.username} đăng nhập?`
            }
            onConfirm={() => onBlockUser(record.id)}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <Button
              type="link"
              danger={!record.isBlocked}
              icon={
                record.isBlocked ? <CheckCircleOutlined /> : <StopOutlined />
              }
              size="small"
            >
              {record.isBlocked ? "Bỏ chặn" : "Chặn"}
            </Button>
          </Popconfirm>
        )}
      </Space>
    ),
  },
];
