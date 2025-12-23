import React, { lazy, Suspense } from "react";
import { Layout, Typography, Menu, Button, Avatar, Tag, Spin } from "antd";
import {
  ThunderboltOutlined,
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";
import AdminNotification from "../components/admin/AdminNotification";

const UserManagement = lazy(() => import("../components/admin/UserManagement"));

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function AdminPage() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Admin Sidebar */}
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

        {/* Admin Menu */}
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={["/admin"]}
          items={[
            {
              key: "/admin",
              icon: <SettingOutlined />,
              label: "Quản lý User",
            },
          ]}
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
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              icon={<UserOutlined />}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text strong style={{ fontSize: 14, display: "block" }} ellipsis>
                {user?.fullName || user?.username || "Admin"}
              </Text>
              <Tag color="red" style={{ fontSize: 11, marginTop: 4 }}>
                Admin
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

      {/* Main Content */}
      <Layout style={{ background: "#f5f7fa" }}>
        <Content
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "24px",
            width: "100%",
          }}
        >
          <Title level={2} style={{ marginBottom: 24 }}>
            Admin Dashboard
          </Title>
          <Suspense
            fallback={
              <Spin
                size="large"
                style={{ display: "block", margin: "50px auto" }}
              />
            }
          >
            <UserManagement />
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  );
}
