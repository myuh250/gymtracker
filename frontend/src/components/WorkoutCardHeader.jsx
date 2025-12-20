import React from "react";
import { Space, Button, Typography, Popconfirm, message } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

export default function WorkoutCardHeader({
  workout,
  exerciseCount,
  totalSets,
  onToggleComplete,
  onEdit,
  onDelete,
}) {
  const handleToggleComplete = (e) => {
    e.stopPropagation();
    if (onToggleComplete) {
      onToggleComplete(workout.id);
      message.success(
        workout.isCompleted
          ? "Đã đánh dấu chưa hoàn thành"
          : "Đã hoàn thành buổi tập!"
      );
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
        paddingRight: 12,
        alignItems: "center",
      }}
    >
      <Space>
        <CalendarOutlined style={{ color: "#1890ff" }} />
        <Text strong>{dayjs(workout.logDate).format("DD/MM/YYYY")}</Text>
        <Button
          type="primary"
          size="small"
          danger={!workout.isCompleted}
          icon={workout.isCompleted ? <CheckCircleOutlined /> : null}
          style={{
            background: workout.isCompleted ? undefined : "#fa8c16",
            borderColor: workout.isCompleted ? undefined : "#fa8c16",
          }}
          onClick={handleToggleComplete}
        >
          {workout.isCompleted ? "Hoàn thành" : "Chưa xong"}
        </Button>
      </Space>
      <Space>
        <Text type="secondary">
          {exerciseCount} Bài tập • {totalSets} Sets
        </Text>
        {onEdit && (
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(workout);
            }}
          />
        )}
        {onDelete && (
          <Popconfirm
            title="Xóa buổi tập?"
            description="Bạn có chắc chắn muốn xóa buổi tập này?"
            onConfirm={(e) => {
              e?.stopPropagation();
              onDelete(workout.id);
            }}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        )}
      </Space>
    </div>
  );
}
