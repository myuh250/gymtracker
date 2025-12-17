import React, { useState, useMemo, useCallback } from "react";
import {
  List,
  Input,
  Select,
  Popconfirm,
  Typography,
  Tag,
  message,
  Empty,
  Button,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  FireFilled,
} from "@ant-design/icons";

const { Option } = Select;
const { Text, Title } = Typography;

const styles = `
  .exercise-item{transition:all .18s; border:1px solid transparent}
  .exercise-item:hover{transform:translateY(-2px);box-shadow:0 10px 25px -5px rgba(0,0,0,.05)}
  .item-actions{opacity:0;pointer-events:none;transition:opacity .18s}
  .exercise-item:hover .item-actions{opacity:1;pointer-events:auto}
  .exercise-item.active{background:#eff6ff!important;border-color:#bfdbfe!important}
`;

const ExerciseItem = React.memo(
  ({ item, isSelected, onSelect, onEdit, onDelete }) => {
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
              background: item.mediaUrl
                ? `url(${item.mediaUrl}) center/cover no-repeat`
                : "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {!item.mediaUrl && (
              <FireFilled
                style={{
                  fontSize: 24,
                  color: getMuscleColor(item.muscleGroup),
                }}
              />
            )}
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

        {/* Action Buttons: Ẩn/Hiện bằng CSS Class .item-actions */}
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
      </div>
    );
  }
);

import ExerciseFormModal from "./ExerciseFormModal";
import ExerciseCreate from "./ExerciseCreate";

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
    (values, file) => {
      const { item } = modalState;
      const mediaUrl = file ? URL.createObjectURL(file) : item?.mediaUrl;

      const resultItem = {
        ...(item || {}),
        ...values,
        mediaUrl,
        mediaFile: file,
        id: item ? item.id : Date.now(),
      };

      if (item) {
        onEdit(resultItem);
        message.success("Đã cập nhật!");
      } else {
        onAdd(resultItem);
        message.success("Đã thêm mới!");
      }
      setModalState({ open: false, item: null });
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
        <List
          dataSource={listHienThi}
          locale={{
            emptyText: (
              <Empty description="Trống" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ),
          }}
          renderItem={(item) => (
            <ExerciseItem
              key={item.id}
              item={item}
              isSelected={selectedId === item.id}
              onSelect={onSelect}
              onEdit={handleOpenEdit}
              onDelete={onDelete}
            />
          )}
        />
      </div>

      <ExerciseFormModal
        open={modalState.open}
        initialValues={modalState.item}
        onCancel={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
