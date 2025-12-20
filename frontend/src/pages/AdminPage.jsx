import React, { useState, useEffect } from "react";
import { Layout, Tabs, Typography } from "antd";
import { UserOutlined, BarChartOutlined } from "@ant-design/icons";
import UserManagement from "../components/admin/UserManagement";

const { Content } = Layout;
const { Title } = Typography;

export default function AdminPage() {
  const items = [
    {
      key: "users",
      label: (
        <span>
          <UserOutlined />
          Quản lý Users
        </span>
      ),
      children: <UserManagement />,
    },
    {
      key: "stats",
      label: (
        <span>
          <BarChartOutlined />
          Thống kê
        </span>
      ),
      children: <div style={{ padding: 24 }}>Thống kê (Coming soon)</div>,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
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
        <Tabs defaultActiveKey="users" items={items} />
      </Content>
    </Layout>
  );
}
