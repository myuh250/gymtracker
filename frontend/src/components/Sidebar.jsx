import React from "react";
import { Layout, Menu, Button, Typography, Avatar, Tag } from "antd";
import {
  ThunderboltOutlined,
  ScheduleOutlined,
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const { Sider } = Layout;
const { Title, Text } = Typography;

export default function Sidebar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { key: "/", icon: <ThunderboltOutlined />, label: "Bài tập" },
    { key: "/workout", icon: <ScheduleOutlined />, label: "Tập Luyện" },
    ...(isAdmin()
      ? [{ key: "/admin", icon: <SettingOutlined />, label: "Quản lý Admin" }]
      : []),
  ];

  // highlight khi chọn
  const activeKey = location.pathname === "/" ? "/" : location.pathname;

  return (
    <Sider
      width={260}
      theme="light"
      style={{
        borderRight: "1px solid #f0f0f0",
        height: "100vh",
        position: "sticky",
        top: 0,
        left: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 90,
          display: "flex",
          alignItems: "center",
          paddingLeft: 28,
          gap: 12,
        }}
      >
        <ThunderboltOutlined style={{ fontSize: 32, color: "#000" }} />
        <Title
          level={3}
          style={{ margin: 0, letterSpacing: 1, fontWeight: 800 }}
        >
          GYM PRO
        </Title>
      </div>

      {/* Menulist */}
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[activeKey]}
        items={menuItems}
        onClick={(e) => navigate(e.key)}
        style={{
          borderRight: 0,
          fontSize: 16,
          padding: "0 16px",
          fontWeight: 500,
        }}
      />

      {/* User Info & Logout */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          padding: "24px",
          width: "100%",
          borderTop: "1px solid #f0f0f0",
        }}
      >
        {/* User Info */}
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginBottom: 16,
            padding: "12px",
            background: "#f5f5f5",
            borderRadius: 8,
          }}
        >
          <Avatar
            size={40}
            src={user?.avatarUrl}
            icon={<UserOutlined />}
            style={{ objectFit: "cover" }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text strong style={{ fontSize: 14, display: "block" }} ellipsis>
              {user?.fullName || user?.username || "User"}
            </Text>
            <Tag
              color={user?.role === "ROLE_ADMIN" ? "red" : "blue"}
              style={{ fontSize: 11, marginTop: 4 }}
            >
              {user?.role === "ROLE_ADMIN" ? "Admin" : "User"}
            </Tag>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          type="default"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          block
          size="large"
        >
          Đăng xuất
        </Button>
      </div>
    </Sider>
  );
}
