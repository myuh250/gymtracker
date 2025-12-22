import React, { useState, useMemo, useCallback } from "react";
import { Input, Select, Typography, message, Empty, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import ExerciseCard from "./ExerciseCard";
import ExerciseFormModal from "./ExerciseFormModal";
import ExerciseCreate from "./ExerciseCreate";
import { uploadExerciseMedia } from "../services/fileUploadService";

const { Option } = Select;
const { Title } = Typography;

const styles = `
  .exercise-item{transition:all .18s; border:1px solid transparent}
  .exercise-item:hover{transform:translateY(-2px);box-shadow:0 10px 25px -5px rgba(0,0,0,.05)}
  .item-actions{opacity:0;pointer-events:none;transition:opacity .18s}
  .exercise-item:hover .item-actions{opacity:1;pointer-events:auto}
  .exercise-item.active{background:#eff6ff!important;border-color:#bfdbfe!important}
`;

export default function ExerciseList({
  data,
  onSelect,
  selectedId,
  onAdd,
  onEdit,
  onDelete,
}) {
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [modalState, setModalState] = useState({ open: false, item: null });

  // Tối ưu filter bằng useMemo
  const listHienThi = useMemo(() => {
    return data.filter((item) => {
      const matchName = item.name
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const matchType = filterType ? item.muscleGroup === filterType : true;
      return matchName && matchType;
    });
  }, [data, searchText, filterType]);

  const handleOpenEdit = useCallback((item, e) => {
    e.stopPropagation();
    setModalState({ open: true, item });
  }, []);

  const handleCloseModal = useCallback(
    () => setModalState({ open: false, item: null }),
    []
  );

  const handleSubmit = useCallback(
    async (values, file) => {
      const { item } = modalState;

      try {
        setUploading(true);
        let mediaUrl = item?.mediaUrl; // Keep existing URL

        // Upload new file if provided
        if (file) {
          mediaUrl = await uploadExerciseMedia(file);
        }

        const resultItem = {
          ...(item || {}),
          ...values,
          mediaUrl,
          id: item ? item.id : Date.now(),
        };

        if (item) {
          await onEdit(resultItem);
          message.success("Đã cập nhật!");
        } else {
          await onAdd(resultItem);
          message.success("Đã thêm mới!");
        }
        setModalState({ open: false, item: null });
      } catch (error) {
        message.error("Lỗi: " + error.message);
      } finally {
        setUploading(false);
      }
    },
    [modalState, onEdit, onAdd]
  );

  return (
    <div
      style={{
        width: 420,
        height: "100%",
        borderRight: "1px solid #f0f0f0",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        boxShadow: "2px 0 8px rgba(0,0,0,0.02)",
      }}
    >
      {/* Inject CSS vào trang */}
      <style>{styles}</style>

      {/* Header */}
      <div
        style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid #f0f0f0",
          background: "#fff",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Danh sách bài tập
          </Title>
          <ExerciseCreate onAdd={onAdd} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ borderRadius: 8, background: "#f8fafc" }}
          />
          <Select
            placeholder="Nhóm cơ"
            allowClear
            style={{ width: 140 }}
            onChange={setFilterType}
          >
            <Option value="">
              <Tag>Tất cả</Tag>
            </Option>
            {["Chest", "Back", "Legs", "Shoulders", "Abs", "Cardio"].map(
              (m) => (
                <Option key={m} value={m}>
                  <Tag color="blue">{m}</Tag>
                </Option>
              )
            )}
          </Select>
        </div>
      </div>

      {/* List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 20px",
          background: "#f8fafc",
        }}
      >
        {listHienThi.length === 0 ? (
          <Empty description="Trống" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          listHienThi.map((item) => (
            <ExerciseCard
              key={item.id}
              item={item}
              isSelected={selectedId === item.id}
              onSelect={onSelect}
              onEdit={handleOpenEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      <ExerciseFormModal
        open={modalState.open}
        initialValues={modalState.item}
        onCancel={handleCloseModal}
        onSubmit={handleSubmit}
        loading={uploading}
      />
    </div>
  );
}
