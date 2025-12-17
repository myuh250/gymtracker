import React, { useEffect, useState } from "react";
import { Layout } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const { Content } = Layout;

export default function MainLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ fullName: "Guest" });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userStr));
  }, [navigate]);

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
