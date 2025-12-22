import React, { useEffect, useState, useRef } from "react";
import { Typography, Empty, Tag, Image, Space } from "antd";
import { FireFilled } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

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

export default function ExerciseDetail({ exercise }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    setMediaError(false);
    if (!exercise) {
      setPreviewUrl(null);
      setIsVideo(false);
      return;
    }

    if (exercise.mediaUrl) {
      setPreviewUrl(exercise.mediaUrl);
      const isVid =
        /\.(mp4|webm|ogg|mov)(\?|$)/i.test(exercise.mediaUrl) ||
        /video/i.test(exercise.mediaUrl) ||
        exercise.mediaUrl.startsWith("data:video/");
      setIsVideo(isVid);
    } else {
      setPreviewUrl(null);
      setIsVideo(false);
    }
  }, [exercise]);

  if (!exercise) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#fff",
        }}
      >
        <Empty
          description={
            <Text type="secondary">Chọn một bài tập để xem chi tiết</Text>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  const muscleColor = getMuscleColor(exercise.muscleGroup);

  return (
    <div
      style={{
        flex: 1,
        height: "100%",
        overflowY: "auto",
        background: "#fff",
        padding: "24px 32px",
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Header Information */}
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ marginBottom: 12, color: "#1e293b" }}>
            {exercise.name}
          </Title>

          <Space size="large" style={{ marginBottom: 8 }}>
            <Space>
              <Text type="secondary">Nhóm cơ chính:</Text>
              <Tag color={muscleColor} style={{ margin: 0, fontWeight: 600 }}>
                {exercise.muscleGroup}
              </Tag>
            </Space>
          </Space>
        </div>

        {/* Media */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            marginBottom: 32,
            maxHeight: 500,
            minHeight: 200,
          }}
        >
          {previewUrl && !mediaError ? (
            isVideo ? (
              <video
                ref={videoRef}
                src={previewUrl}
                autoPlay
                muted
                loop
                playsInline
                controls={false}
                onError={() => {
                  console.error("Video load error");
                  setMediaError(true);
                }}
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  maxHeight: 500,
                  objectFit: "contain",
                  display: "block",
                  pointerEvents: "none",
                  borderRadius: 12,
                }}
              />
            ) : (
              <Image
                src={previewUrl}
                alt={exercise.name}
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  maxHeight: 500,
                  objectFit: "contain",
                  display: "block",
                  borderRadius: 12,
                }}
                fallback="https://via.placeholder.com/800x400?text=No+Image"
                preview={false}
                onError={() => setMediaError(true)}
              />
            )
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: 32,
                opacity: 0.5,
              }}
            >
              <FireFilled
                style={{ fontSize: 48, color: muscleColor, marginBottom: 16 }}
              />
              <Text type="secondary">
                {mediaError
                  ? "Không thể tải media"
                  : "Chưa có hình ảnh minh họa"}
              </Text>
            </div>
          )}
        </div>

        {/* Description Section */}
        <div>
          <Title level={5} style={{ marginBottom: 12 }}>
            Hướng dẫn kỹ thuật
          </Title>
          <Paragraph
            style={{ fontSize: 15, lineHeight: 1.6, color: "#334155" }}
          >
            {exercise.description || (
              <Text type="secondary" italic>
                Chưa có mô tả chi tiết cho bài tập này.
              </Text>
            )}
          </Paragraph>
        </div>
      </div>
    </div>
  );
}
