import React from "react";
import { Layout, Typography } from "antd";
import UserManagement from "../components/admin/UserManagement";

const { Content } = Layout;
const { Title } = Typography;

export default function AdminPage() {
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
        <UserManagement />
      </Content>
    </Layout>
  );
}
