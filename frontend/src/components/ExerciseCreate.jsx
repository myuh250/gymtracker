import React, { useState, lazy, Suspense } from "react";
import { Button, Space, message, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { uploadExerciseMedia } from "../services/fileUploadService";

const ExerciseFormModal = lazy(() => import("./ExerciseFormModal"));

export default function ExerciseCreate({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (values, file) => {
    try {
      setUploading(true);
      let mediaUrl = undefined;

      // Upload file if provided
      if (file) {
        mediaUrl = await uploadExerciseMedia(file);
      }

      const resultItem = {
        ...values,
        mediaUrl,
        id: Date.now(),
      };

      if (onAdd) await onAdd(resultItem);
      message.success("Đã thêm mới!");
      setOpen(false);
    } catch (error) {
      message.error("Thêm bài tập thất bại: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Space>
      <Button
        type="primary"
        shape="round"
        icon={<PlusOutlined />}
        onClick={() => setOpen(true)}
      >
        Thêm mới
      </Button>

      <Suspense fallback={<Spin />}>
        <ExerciseFormModal
          open={open}
          onCancel={() => setOpen(false)}
          onSubmit={handleSubmit}
          loading={uploading}
        />
      </Suspense>
    </Space>
  );
}
