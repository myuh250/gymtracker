import React from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../contexts/AuthContext";

const { Content } = Layout;

export default function MainLayout() {
  const { user } = useAuth();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar user={user} />
      <Layout>
        <Content style={{ padding: 24, background: "#fff" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
