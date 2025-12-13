import React from "react";
import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Result
        status="success"
        title="Đăng nhập thành công!"
        subTitle="Chào mừng bạn đến với hệ thống."
        extra={[
          <Button type="primary" key="console">
            Dashboard
          </Button>,
          <Button key="logout" onClick={handleLogout} danger>
            Đăng xuất
          </Button>,
        ]}
      />
    </div>
  );
}
