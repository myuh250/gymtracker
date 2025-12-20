import React from "react";
import { Input, Button } from "antd";
import { SendOutlined } from "@ant-design/icons";

export default function ChatInput({ value, onChange, onSend, disabled }) {
  const handleKeyPress = (e) => {
    if (!e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <>
      <Input.TextArea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPressEnter={handleKeyPress}
        placeholder="Nhập tin nhắn..."
        autoSize={{ minRows: 1, maxRows: 4 }}
        disabled={disabled}
        style={{
          border: "none",
          background: "transparent",
          resize: "none",
          boxShadow: "none",
          padding: "6px 12px",
        }}
      />
      <Button
        type="primary"
        shape="circle"
        onClick={onSend}
        disabled={!value?.trim() || disabled}
        icon={<SendOutlined />}
        style={{
          flexShrink: 0,
          background: value?.trim() ? "#2563eb" : "#94a3b8",
        }}
      />
    </>
  );
}
