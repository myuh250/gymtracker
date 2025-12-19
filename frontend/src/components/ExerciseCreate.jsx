import React, { useState } from "react";
import { Button, Space, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import ExerciseFormModal from "./ExerciseFormModal";

export default function ExerciseCreate({ onAdd }) {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (values, file) => {
    let mediaUrl = undefined;
    if (file) {
      mediaUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }
    const resultItem = {
      ...values,
      mediaUrl,
      id: Date.now(),
    };
    if (onAdd) onAdd(resultItem);
    message.success("Đã thêm mới!");
    setOpen(false);
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

      <ExerciseFormModal
        open={open}
        onCancel={() => setOpen(false)}
        onSubmit={handleSubmit}
      />
    </Space>
  );
}
