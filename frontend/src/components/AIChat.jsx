import React, { useState, useRef, useEffect } from "react";
import { Button, Input, Avatar, Typography, Tooltip, Spin, message as antdMessage } from "antd";
import {
  MessageOutlined,
  RobotOutlined,
  CloseOutlined,
  DeleteOutlined,
  UserOutlined,
  WarningOutlined,
  ReloadOutlined,
  SendOutlined,
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import * as chatService from "../services/chatService";
import ChatInput from "./ChatInput";

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
  
  /* Markdown styling cho bot messages */
  .markdown-content {
    font-size: 14px;
    line-height: 1.6;
  }
  .markdown-content p {
    margin: 0 0 8px 0;
  }
  .markdown-content p:last-child {
    margin-bottom: 0;
  }
  .markdown-content strong {
    font-weight: 600;
    color: #1e293b;
  }
  .markdown-content em {
    font-style: italic;
  }
  .markdown-content ul, .markdown-content ol {
    margin: 8px 0;
    padding-left: 20px;
  }
  .markdown-content li {
    margin: 4px 0;
  }
  .markdown-content code {
    background: #f1f5f9;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
    font-family: 'Courier New', monospace;
  }
  .markdown-content pre {
    background: #f1f5f9;
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 8px 0;
  }
  .markdown-content pre code {
    background: none;
    padding: 0;
  }
  .markdown-content h1, .markdown-content h2, .markdown-content h3 {
    margin: 12px 0 8px 0;
    font-weight: 600;
  }
  .markdown-content h1 { font-size: 18px; }
  .markdown-content h2 { font-size: 16px; }
  .markdown-content h3 { font-size: 15px; }
  .markdown-content blockquote {
    border-left: 3px solid #e2e8f0;
    padding-left: 12px;
    margin: 8px 0;
    color: #64748b;
  }
  .markdown-content a {
    color: #2563eb;
    text-decoration: underline;
  }
`;

const { Text } = Typography;

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serviceAvailable, setServiceAvailable] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const listRef = useRef(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  // Load current user info once for display / debugging
  useEffect(() => {
    const user = chatService.getCurrentChatUser();
    setCurrentUser(user || null);
  }, []);


  useEffect(() => {
    const loadChatHistory = async () => {
      if (!open || isInitialized.current) return;
      
      setLoadingHistory(true);
      try {
        // Check service health
        const isHealthy = await chatService.checkLLMHealth();
        setServiceAvailable(isHealthy);

        if (!isHealthy) {
          setMessages([
            {
              id: Date.now(),
              sender: "system",
              text: "⚠️ Không thể kết nối đến AI service. Vui lòng thử lại sau.",
              time: new Date(),
            },
          ]);
          return;
        }

        // Load existing session history
        const sessionId = chatService.getCurrentSessionId();
        if (sessionId) {
          const history = await chatService.getChatHistory(20);
          
          if (history.messages && history.messages.length > 0) {
            // Convert API format to component format
            const formattedMessages = history.messages.map((msg, idx) => ({
              id: Date.now() + idx,
              sender: msg.role === "user" ? "user" : "bot",
              text: msg.content,
              time: new Date(),
            }));
            setMessages(formattedMessages);
          } else {
            // New session - show welcome message
            setMessages([
              {
                id: Date.now(),
                sender: "bot",
                text: "Xin chào, tôi là 'Trợ lí Gym Pro'! 💪 Tôi có thể giúp gì cho việc tập luyện của bạn hôm nay?",
                time: new Date(),
              },
            ]);
          }
        } else {
          // No session yet - show welcome message
          setMessages([
            {
              id: Date.now(),
              sender: "bot",
              text: "Xin chào, tôi là 'Trợ lí Gym Pro'! 💪 Tôi có thể giúp gì cho việc tập luyện của bạn hôm nay?",
              time: new Date(),
            },
          ]);
        }

        isInitialized.current = true;
      } catch (err) {
        console.error("Failed to load chat history:", err);
        setMessages([
          {
            id: Date.now(),
            sender: "bot",
            text: "Xin chào, tôi là 'Trợ lí Gym Pro'! 💪 Tôi có thể giúp gì cho việc tập luyện của bạn hôm nay?",
            time: new Date(),
          },
        ]);
        isInitialized.current = true;
      } finally {
        setLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [open]);

  const sendMessage = async () => {
    if (!input || !input.trim() || loading) return;
    
    const text = input.trim();
    const userMsg = { id: Date.now(), sender: "user", text, time: new Date() };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      // Call LLM service
      const response = await chatService.sendMessage(text);
      
      const botMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text: response.response,
        time: new Date(),
      };
      
      setMessages((prev) => [...prev, botMsg]);
      setServiceAvailable(true);
    } catch (err) {
      console.error("Send message error:", err);
      setError(err.message);
      
      const errorMsg = {
        id: Date.now() + 1,
        sender: "system",
        text: `⚠️ Không thể gửi tin nhắn: ${err.message}`,
        time: new Date(),
        isError: true,
      };
      
      setMessages((prev) => [...prev, errorMsg]);
      setServiceAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  const retryLastMessage = async () => {
    // Find last user message
    const lastUserMessage = [...messages].reverse().find(msg => msg.sender === "user");
    if (!lastUserMessage) return;

    setInput(lastUserMessage.text);
    // User can press send again
  };

  const handleReconnect = async () => {
    setLoadingHistory(true);
    setError(null);
    
    try {
      // Check service health
      const isHealthy = await chatService.checkLLMHealth();
      setServiceAvailable(isHealthy);

      if (isHealthy) {
        // Reset and reload
        isInitialized.current = false;
        
        // Load session history
        const sessionId = chatService.getCurrentSessionId();
        if (sessionId) {
          const history = await chatService.getChatHistory(20);
          
          if (history.messages && history.messages.length > 0) {
            const formattedMessages = history.messages.map((msg, idx) => ({
              id: Date.now() + idx,
              sender: msg.role === "user" ? "user" : "bot",
              text: msg.content,
              time: new Date(),
            }));
            setMessages(formattedMessages);
          } else {
            setMessages([
              {
                id: Date.now(),
                sender: "bot",
                text: "Xin chào, tôi là 'Trợ lí Gym Pro'! 💪 Tôi có thể giúp gì cho việc tập luyện của bạn hôm nay?",
                time: new Date(),
              },
            ]);
          }
        } else {
          setMessages([
            {
              id: Date.now(),
              sender: "bot",
              text: "Xin chào, tôi là 'Trợ lí Gym Pro'! 💪 Tôi có thể giúp gì cho việc tập luyện của bạn hôm nay?",
              time: new Date(),
            },
          ]);
        }
        
        isInitialized.current = true;
        antdMessage.success("Đã kết nối lại thành công!");
      } else {
        setMessages([
          {
            id: Date.now(),
            sender: "system",
            text: "⚠️ Vẫn chưa thể kết nối đến AI service. Vui lòng kiểm tra xem service đã chạy chưa.",
            time: new Date(),
          },
        ]);
        antdMessage.error("Vẫn chưa kết nối được. Hãy đảm bảo LLM service đang chạy.");
      }
    } catch (err) {
      console.error("Reconnect failed:", err);
      setServiceAvailable(false);
      setMessages([
        {
          id: Date.now(),
          sender: "system",
          text: "⚠️ Không thể kết nối đến AI service. Vui lòng thử lại sau.",
          time: new Date(),
        },
      ]);
      antdMessage.error("Kết nối thất bại!");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleClearChat = async () => {
    try {
      setLoading(true);
      
      // Delete session on backend
      await chatService.deleteSession();
      
      // Clear local messages and show welcome message
      setMessages([
        {
          id: Date.now(),
          sender: "bot",
          text: "Đã xóa lịch sử. Chúng ta bắt đầu lại nhé! 💪",
          time: new Date(),
        },
      ]);
      
      setError(null);
      antdMessage.success("Đã xóa lịch sử chat thành công");
    } catch (err) {
      console.error("Clear chat error:", err);
      antdMessage.error("Không thể xóa lịch sử chat");
      
      // Still clear local messages on error
      setMessages([
        {
          id: Date.now(),
          sender: "bot",
          text: "Đã xóa lịch sử local. Chúng ta bắt đầu lại nhé! 💪",
          time: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
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
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <span>
                    <span style={{ color: "#4ade80" }}>●</span> Online
                  </span>
                  {currentUser && (
                    <span style={{ color: "#e0f2fe" }}>
                      Đang chat cho:{" "}
                      <strong>
                        {currentUser.fullName || currentUser.email || "User"}
                      </strong>
                    </span>
                  )}
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
            }}
          >
            {loadingHistory ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Spin size="large">
                  <div style={{ marginTop: 8, color: "#94a3b8" }}>
                    Đang tải lịch sử chat...
                  </div>
                </Spin>
              </div>
            ) : (
              <>
                <div
                  style={{ textAlign: "center", fontSize: 12, color: "#94a3b8" }}
                >
                  Hôm nay, {new Date().toLocaleTimeString().slice(0, 5)}
                </div>

                {messages.map((msg) => {
                  const isBot = msg.sender === "bot";
                  const isSystem = msg.sender === "system";
                  const isError = msg.isError;

                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: "flex",
                        justifyContent: isBot || isSystem ? "flex-start" : "flex-end",
                        alignItems: "flex-end",
                        gap: 8,
                      }}
                    >
                      {(isBot || isSystem) && (
                        <Avatar
                          size="small"
                          icon={isError ? <WarningOutlined /> : <RobotOutlined />}
                          style={{
                            backgroundColor: isError ? "#fee2e2" : "#e0e7ff",
                            color: isError ? "#dc2626" : "#2563eb",
                          }}
                        />
                      )}
                      <div
                        style={{
                          maxWidth: "75%",
                          padding: "12px 16px",
                          borderRadius: isBot || isSystem
                            ? "16px 16px 16px 4px"
                            : "16px 16px 4px 16px",
                          background: isSystem
                            ? isError
                              ? "#fef2f2"
                              : "#f1f5f9"
                            : isBot
                            ? "#ffffff"
                            : "linear-gradient(135deg, #3b82f6, #2563eb)",
                          color: isBot || isSystem ? "#334155" : "#ffffff",
                          boxShadow: isBot || isSystem
                            ? "0 2px 8px rgba(0,0,0,0.05)"
                            : "0 4px 12px rgba(37, 99, 235, 0.2)",
                          fontSize: 14,
                          lineHeight: 1.5,
                          wordBreak: "break-word",
                          whiteSpace: isBot ? "normal" : "pre-wrap",
                        }}
                      >
                        {isBot ? (
                          <div className="markdown-content">
                            <ReactMarkdown>
                              {msg.text}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          msg.text
                        )}
                      </div>
                      {!isBot && !isSystem && (
                        <Avatar
                          size="small"
                          icon={<UserOutlined />}
                          style={{ backgroundColor: "#dbeafe", color: "#3b82f6" }}
                        />
                      )}
                    </div>
                  );
                })}
              </>
            )}

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
            {/* Error banner với retry */}
            {!serviceAvailable && (
              <div
                style={{
                  marginBottom: 12,
                  padding: "10px 14px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 13,
                  color: "#991b1b",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <WarningOutlined />
                  <span>AI service không khả dụng</span>
                </div>
                <Button
                  type="primary"
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={handleReconnect}
                  loading={loadingHistory}
                  style={{
                    background: "#dc2626",
                    borderColor: "#dc2626",
                    fontSize: 12,
                  }}
                >
                  Kết nối lại
                </Button>
              </div>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 8,
                background: "#f8fafc",
                padding: 8,
                borderRadius: 24,
                border: "1px solid #e2e8f0",
              }}
            >
              <ChatInput
                value={input}
                onChange={setInput}
                onSend={sendMessage}
                disabled={!serviceAvailable || loadingHistory}
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
              Powered by GymPro Tech • {serviceAvailable ? "🟢 Online" : "🔴 Offline"}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
