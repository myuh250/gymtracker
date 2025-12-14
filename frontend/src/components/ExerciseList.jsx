import React, { useState } from "react";
import {
  List,
  Button,
  Input,
  Select,
  Modal,
  Form,
  Popconfirm,
  Typography,
  Tag,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { Text } = Typography;

export default function ExerciseList({
  data,
  onSelect,
  selectedId,
  onAdd,
  onEdit,
  onDelete,
}) {
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState(null); // Lọc theo nhóm cơ

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  // Search
  const listHienThi = data.filter((item) => {
    const matchName = item.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchType = filterType ? item.muscleGroup === filterType : true;
    return matchName && matchType;
  });

  const openAddModal = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (item, e) => {
    e.stopPropagation(); // Chặn không chọn bài tập
    setEditingItem(item); // Gán bài cần sửa
    form.setFieldsValue(item); // Điền dữ liệu cũ vào form
    setIsModalOpen(true);
  };

  const handleSave = (values) => {
    if (editingItem) {
      // Gộp ID cũ + Dữ liệu mới nhập từ form
      onEdit({ ...editingItem, ...values });
    } else {
      // Nếu editingItem là null => Là hành động THÊM
      onAdd(values);
    }
    setIsModalOpen(false);
  };

  return (
    <div
      style={{
        width: 400,
        borderLeft: "1px solid #ddd",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
      }}
    >
      <div
        style={{
          padding: 16,
          borderBottom: "1px solid #eee",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Text strong style={{ fontSize: 16 }}>
          Danh sách bài tập
        </Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
          Tạo mới
        </Button>
      </div>

      {/* Tìm kiếm + Dropdown */}
      <div style={{ padding: 16, background: "#fafafa" }}>
        <Input
          placeholder="Tìm tên bài..."
          prefix={<SearchOutlined />}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 8 }}
        />
        <Select
          placeholder="Lọc theo nhóm cơ"
          allowClear
          style={{ width: "100%" }}
          onChange={(value) => setFilterType(value)}
        >
          {["Chest", "Back", "Legs", "Shoulders", "Abs", "Cardio"].map((m) => (
            <Option key={m} value={m}>
              {m}
            </Option>
          ))}
        </Select>
      </div>

      {/* List bài tập */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 10px" }}>
        <List
          dataSource={listHienThi}
          renderItem={(item) => (
            <List.Item
              onClick={() => onSelect(item)}
              style={{
                cursor: "pointer",
                background: selectedId === item.id ? "#e6f7ff" : "transparent",
                borderRadius: 8,
                padding: "12px",
                marginBottom: 4,
              }}
              actions={[
                <Button
                  type="text"
                  icon={<EditOutlined style={{ color: "orange" }} />}
                  onClick={(e) => openEditModal(item, e)}
                />,

                <Popconfirm
                  title="Xác nhận xoá ?"
                  onConfirm={(e) => {
                    e.stopPropagation(); // Chặn sự kiện
                    onDelete(item.id);
                  }}
                  onCancel={(e) => e.stopPropagation()}
                >
                  <Button
                    type="text"
                    icon={<DeleteOutlined style={{ color: "red" }} />}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <ThunderboltOutlined
                    style={{ fontSize: 24, color: "#1890ff" }}
                  />
                }
                title={item.name}
                description={<Tag color="blue">{item.muscleGroup}</Tag>}
              />
            </List.Item>
          )}
        />
      </div>

      <Modal
        title={editingItem ? "Sửa bài tập" : "Thêm bài tập mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null} // Tắt nút mặc định để dùng nút trong Form
      >
        <Form layout="vertical" form={form} onFinish={handleSave}>
          <Form.Item
            name="name"
            label="Tên bài tập"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="muscleGroup"
            label="Nhóm cơ"
            rules={[{ required: true }]}
          >
            <Select>
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
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item name="mediaUrl" label="Link Ảnh/Video">
            <Input />
          </Form.Item>

          <div style={{ textAlign: "right" }}>
            <Button
              onClick={() => setIsModalOpen(false)}
              style={{ marginRight: 8 }}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Lưu lại
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
