import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Upload, Button } from "antd";
import { PictureOutlined, VideoCameraOutlined } from "@ant-design/icons";

const { Option } = Select;

export default function ExerciseFormModal({
  open,
  onCancel,
  onSubmit,
  initialValues,
}) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          name: initialValues.name,
          muscleGroup: initialValues.muscleGroup,
          description: initialValues.description,
        });
      } else {
        form.resetFields();
      }
      setFileList([]);
    }
  }, [open, initialValues, form]);

  const onFinish = (values) => {
    onSubmit(values, fileList[0]?.originFileObj || null);
  };

  return (
    <Modal
      title={initialValues ? " Chỉnh sửa bài tập" : " Thêm bài tập mới"}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
      maskClosable={false}
      centered
      width={450}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        requiredMark={false}
        style={{ marginTop: 20 }}
      >
        <Form.Item
          name="name"
          label="Tên bài tập"
          rules={[{ required: true, message: "Nhập tên bài tập" }]}
        >
          <Input placeholder="Ví dụ: Đẩy ngực" size="large" />
        </Form.Item>
        <Form.Item
          name="muscleGroup"
          label="Nhóm cơ"
          rules={[{ required: true }]}
        >
          <Select placeholder="Chọn nhóm cơ" size="large">
            {["Chest", "Back", "Legs", "Shoulders", "Abs", "Cardio"].map(
              (m) => (
                <Option key={m} value={m}>
                  {m}
                </Option>
              )
            )}
          </Select>
        </Form.Item>
        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={3} maxLength={100} showCount />
        </Form.Item>
        <Form.Item label="Media (Ảnh/Video)">
          <Upload
            accept="image/*,video/*"
            beforeUpload={() => false}
            fileList={fileList}
            onChange={({ fileList: fl }) => setFileList(fl)}
            maxCount={1}
            listType="picture-card"
            showUploadList={{ showPreviewIcon: false }}
          >
            {fileList.length < 1 && (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{ display: "flex", gap: 4, justifyContent: "center" }}
                >
                  <PictureOutlined />
                  <VideoCameraOutlined />
                </div>
                <div style={{ marginTop: 4, fontSize: 10 }}>Upload</div>
              </div>
            )}
          </Upload>
        </Form.Item>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 20,
          }}
        >
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            {initialValues ? "Lưu" : "Tạo mới"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
