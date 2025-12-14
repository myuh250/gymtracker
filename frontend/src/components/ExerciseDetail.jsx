import React from "react";
import { Card, Typography, Empty, Tag, Image, Descriptions } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

export default function ExerciseDetail({ exercise }) {
  if (!exercise) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Empty description="Chọn một bài tập để xem chi tiết" />
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        padding: 24,
        overflowY: "auto",
        backgroundColor: "#f0f2f5",
      }}
    >
      <Card bordered={false} style={{ height: "100%", borderRadius: 8 }}>
        {/* Header */}
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 24 }}
        >
          <ThunderboltOutlined
            style={{ fontSize: 32, color: "#1890ff", marginRight: 16 }}
          />
          <div>
            <Title level={2} style={{ margin: 0 }}>
              {exercise.name}
            </Title>
            <Tag color="blue" style={{ marginTop: 8 }}>
              {exercise.muscleGroup}
            </Tag>
          </div>
        </div>

        {/* Media / Video / Image */}
        {exercise.mediaUrl ? (
          <div
            style={{
              marginBottom: 24,
              textAlign: "center",
              background: "#000",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {/* Nếu là ảnh thì dùng Image, nếu video thì dùng thẻ video */}
            <Image
              src={exercise.mediaUrl}
              alt={exercise.name}
              style={{ maxHeight: 400, objectFit: "contain" }}
              fallback="https://via.placeholder.com/800x400?text=No+Image"
            />
          </div>
        ) : (
          <div
            style={{
              height: 200,
              background: "#eee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              marginBottom: 24,
            }}
          >
            <Empty
              description="Chưa có hình ảnh minh họa"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}

        {/* Description */}
        <Descriptions title="Thông tin bài tập" column={1} bordered>
          <Descriptions.Item label="Mô tả">
            <Paragraph style={{ margin: 0 }}>
              {exercise.description ||
                "Chưa có mô tả chi tiết cho bài tập này."}
            </Paragraph>
          </Descriptions.Item>
          {/* Bạn có thể thêm các trường khác như Độ khó, Dụng cụ... vào đây sau */}
        </Descriptions>
      </Card>
    </div>
  );
}
