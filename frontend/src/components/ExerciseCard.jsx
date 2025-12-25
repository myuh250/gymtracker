import React from "react";
import { Button, Popconfirm, Typography, Tag } from "antd";
import { EditOutlined, DeleteOutlined, FireFilled } from "@ant-design/icons";

const { Text } = Typography;

const ExerciseCard = React.memo(
  ({
    item,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
    currentUserId,
    userRole,
  }) => {
    // Kiểm tra quyền: Admin có thể edit/delete tất cả, User chỉ được edit/delete bài tập custom của mình
    const isAdmin = userRole === "ROLE_ADMIN";
    const canModify =
      isAdmin || (item.isCustom && item.createdByUserId === currentUserId);

    const getMuscleColor = (muscle) => {
      const colors = {
        Chest: "volcano",
        Back: "geekblue",
        Legs: "red",
        Shoulders: "gold",
        Abs: "purple",
        Cardio: "green",
      };
      return colors[muscle] || "blue";
    };

    const isVideo = (url) => {
      if (!url) return false;
      return /\.(mp4|webm|ogg|mov)$/i.test(url) || url.includes("video");
    };

    const renderAvatar = () => {
      if (!item.mediaUrl) {
        return (
          <FireFilled
            style={{
              fontSize: 24,
              color: getMuscleColor(item.muscleGroup),
            }}
          />
        );
      }

      if (isVideo(item.mediaUrl)) {
        return (
          <video
            src={item.mediaUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: 12,
            }}
            muted
          />
        );
      }

      return (
        <img
          src={item.mediaUrl}
          alt={item.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: 12,
          }}
        />
      );
    };

    return (
      <div
        className={`exercise-item ${isSelected ? "active" : ""}`}
        onClick={() => onSelect(item)}
        style={{
          position: "relative",
          background: "#fff",
          borderRadius: 16,
          padding: "16px",
          marginBottom: 12,
          cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {renderAvatar()}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <Text
              strong
              style={{
                fontSize: 15,
                color: "#1e293b",
                marginBottom: 4,
                display: "block",
              }}
              ellipsis
            >
              {item.name}
            </Text>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <Tag
                color={getMuscleColor(item.muscleGroup)}
                style={{
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 10,
                  lineHeight: "18px",
                  margin: 0,
                }}
              >
                {item.muscleGroup?.toUpperCase()}
              </Tag>
            </div>
            <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
              {item.description || "Chưa có mô tả chi tiết"}
            </Text>
          </div>
        </div>

        {/* Action Buttons: Chỉ hiện khi có quyền */}
        {canModify && (
          <div
            className="item-actions"
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              display: "flex",
              gap: 4,
              background: isSelected ? "#eff6ff" : "#fff",
              borderRadius: 20,
              paddingLeft: 8,
            }}
          >
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={(e) => onEdit(item, e)}
              style={{ color: "#64748b" }}
            />
            <Popconfirm
              title="Xoá bài tập?"
              onConfirm={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              onCancel={(e) => e.stopPropagation()}
              okText="Xoá"
              cancelText="Hủy"
              okButtonProps={{ danger: true, type: "primary" }}
              placement="left"
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => e.stopPropagation()}
              />
            </Popconfirm>
          </div>
        )}
      </div>
    );
  }
);

export default ExerciseCard;
