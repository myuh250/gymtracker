import React, { useState, useRef, useEffect } from "react";
import { Button, Input, Avatar, Typography, Tooltip, Spin } from "antd";
import {
  MessageOutlined,
  RobotOutlined,
  CloseOutlined,
  SendOutlined,
  DeleteOutlined,
  UserOutlined,
} from "@ant-design/icons";

// CSS Animation và custom scrollbar
const styles = `
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(20px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .chat-container {
    animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  /* Tùy chỉnh thanh cuộn cho đẹp hơn */
  .custom-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scroll::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  .custom-scroll::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }
  .custom-scroll::-webkit-scrollbar-thumb:hover {
    background: #aaa;
  }
`;

const { Text } = Typography;

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Xin chào, tôi là 'Trợ lí Gym Pro'! 💪 Tôi có thể giúp gì cho việc tập luyện của bạn hôm nay?",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  // Tự động cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  const sendMessage = () => {
    if (!input || !input.trim()) return;
    const text = input.trim();
    const userMsg = { id: Date.now(), sender: "user", text, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Fake API call
    setTimeout(() => {
      const botMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text: `Bot đã nhận: "${text}".\nBạn nhớ giữ cường độ tập luyện nhé! 🏋️`,
        time: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setLoading(false);
    }, 1000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: "bot",
        text: "Đã xóa lịch sử. Chúng ta bắt đầu lại nhé!",
        time: new Date(),
      },
    ]);
  };

  return (
    <>
      <style>{styles}</style>

      {/* Open chat */}
      {!open && (
        <div style={{ position: "fixed", bottom: 30, right: 30, zIndex: 1000 }}>
          <Tooltip title="Chat với Gym Pro AI" placement="left">
            <Button
              type="primary"
              shape="circle"
              size="large"
              onClick={() => setOpen(true)}
              style={{
                width: 60,
                height: 60,
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                border: "none",
                boxShadow: "0 8px 24px rgba(37, 99, 235, 0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s",
              }}
              icon={<MessageOutlined style={{ fontSize: 24, color: "#fff" }} />}
            />
          </Tooltip>
        </div>
      )}

      {/* Cửa sổ Chat */}
      {open && (
        <div
          className="chat-container"
          style={{
            position: "fixed",
            bottom: 30,
            right: 30,
            zIndex: 1200,
            width: 360,
            height: 520,
            borderRadius: 20,
            boxShadow: "0 12px 48px rgba(0,0,0,0.15)",
            background: "#ffffff",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              background: "linear-gradient(135deg, #2563eb, #3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              color: "#fff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <Avatar
                  style={{ backgroundColor: "#fff", color: "#2563eb" }}
                  icon={<RobotOutlined />}
                  size="large"
                />
                <span
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 10,
                    height: 10,
                    background: "#4ade80",
                    borderRadius: "50%",
                    border: "2px solid #fff",
                  }}
                />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>Gym Pro AI</div>
                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.9,
                    display: "flex",
                    gap: 4,
                  }}
                >
                  <span style={{ color: "#4ade80" }}>●</span> Online
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <Tooltip title="Xóa lịch sử">
                <Button
                  type="text"
                  icon={<DeleteOutlined style={{ color: "#fff" }} />}
                  onClick={handleClearChat}
                  size="small"
                />
              </Tooltip>
              <Tooltip title="Đóng">
                <Button
                  type="text"
                  icon={<CloseOutlined style={{ color: "#fff" }} />}
                  onClick={() => setOpen(false)}
                  size="small"
                />
              </Tooltip>
            </div>
          </div>

          {/* Body List Messages */}
          <div
            ref={listRef}
            className="custom-scroll"
            style={{
              flex: 1,
              padding: "20px 16px",
              overflowY: "auto",
              background: "#f8fafc",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{ textAlign: "center", fontSize: 12, color: "#94a3b8" }}
            >
              Hôm nay, {new Date().toLocaleTimeString().slice(0, 5)}
            </div>

            {messages.map((msg) => {
              const isBot = msg.sender === "bot";
              return (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent: isBot ? "flex-start" : "flex-end",
                    alignItems: "flex-end",
                    gap: 8,
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
                      borderRadius: isBot
                        ? "16px 16px 16px 4px" // Bot: vuông góc dưới trái
                        : "16px 16px 4px 16px", // User: vuông góc dưới phải
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
                    {msg.text}
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
            })}

            {loading && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Avatar
                  size="small"
                  icon={<RobotOutlined />}
                  style={{ backgroundColor: "#e0e7ff", color: "#2563eb" }}
                />
                <div
                  style={{
                    padding: "10px 16px",
                    background: "#fff",
                    borderRadius: "16px 16px 16px 4px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <Spin size="small" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div
            style={{
              padding: "16px",
              background: "#fff",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 8,
                background: "#f8fafc",
                padding: 8,
                borderRadius: 24,
                border: "1px solid #e2e8f0",
                transition: "border 0.2s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
            >
              <Input.TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Nhập tin nhắn..."
                autoSize={{ minRows: 1, maxRows: 4 }}
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
                onClick={sendMessage}
                disabled={!input.trim() && !loading}
                icon={<SendOutlined />}
                style={{
                  flexShrink: 0,
                  background: input.trim() ? "#2563eb" : "#94a3b8", // Đổi màu khi có text
                }}
              />
            </div>
            <div
              style={{
                textAlign: "center",
                fontSize: 10,
                color: "#cbd5e1",
                marginTop: 6,
              }}
            >
              Powered by GymPro Tech
            </div>
          </div>
        </div>
      )}
    </>
  );
}
