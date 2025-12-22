import React from "react";
import { Avatar } from "antd";
import { RobotOutlined, UserOutlined } from "@ant-design/icons";

export default function ChatMessage({ message }) {
  const isBot = message.sender === "bot";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isBot ? "flex-start" : "flex-end",
        alignItems: "flex-end",
        gap: 8,
        marginBottom: 16,
      }}
    >
      {isBot && (
        <Avatar
          size="small"
          icon={<RobotOutlined />}
          style={{ backgroundColor: "#e0e7ff", color: "#2563eb" }}
        />
      )}
      <div
        style={{
          maxWidth: "75%",
          padding: "12px 16px",
          borderRadius: isBot ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
          background: isBot
            ? "#ffffff"
            : "linear-gradient(135deg, #3b82f6, #2563eb)",
          color: isBot ? "#334155" : "#ffffff",
          boxShadow: isBot
            ? "0 2px 8px rgba(0,0,0,0.05)"
            : "0 4px 12px rgba(37, 99, 235, 0.2)",
          fontSize: 14,
          lineHeight: 1.5,
          wordBreak: "break-word",
        }}
      >
        {message.text}
      </div>
      {!isBot && (
        <Avatar
          size="small"
          icon={<UserOutlined />}
          style={{ backgroundColor: "#dbeafe", color: "#3b82f6" }}
        />
      )}
    </div>
  );
}
