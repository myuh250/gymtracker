import React from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import NotificationListener from "../components/NotificationListener";

const { Content } = Layout;

export default function MainLayout() {
  const { user } = useAuth();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <NotificationListener />
      <Sidebar user={user} />
      <Layout>
        <Content style={{ padding: 24, background: "#fff" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
