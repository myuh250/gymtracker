import React, { useState, useEffect } from "react";
import { message } from "antd";
import ExerciseList from "../components/ExerciseList";
import ExerciseDetail from "../components/ExerciseDetail";
import {
  getExercises,
  addExercise,
  updateExercise,
  removeExercise,
} from "../utils/storage";

export default function HomePage() {
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    setLoading(true);
    try {
      const data = await getExercises();
      setExercises(data);
    } catch (error) {
      message.error("Không thể tải danh sách bài tập");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (newItem) => {
    try {
      const itemWithId = { ...newItem, id: Date.now() };
      await addExercise(itemWithId);
      await loadExercises();
      message.success("Đã thêm thành công!");
    } catch (error) {
      message.error("Thêm bài tập thất bại");
    }
  };

  const handleEdit = async (updatedItem) => {
    try {
      // Convert File to base64 if present
      if (updatedItem.mediaFile instanceof File) {
        const dataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(updatedItem.mediaFile);
        });
        updatedItem = {
          ...updatedItem,
          mediaUrl: dataUrl,
          mediaFile: undefined,
        };
      }
      await updateExercise(updatedItem);
      await loadExercises();
      if (selectedExercise?.id === updatedItem.id) {
        setSelectedExercise(updatedItem);
      }
      message.success("Đã sửa thành công!");
    } catch (error) {
      message.error("Cập nhật bài tập thất bại");
    }
  };

  const handleDelete = async (idToDelete) => {
    try {
      await removeExercise(idToDelete);
      await loadExercises();
      if (selectedExercise?.id === idToDelete) {
        setSelectedExercise(null);
      }
      message.success("Đã xóa bài tập!");
    } catch (error) {
      message.error("Xóa bài tập thất bại");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#fff" }}>
      <ExerciseDetail exercise={selectedExercise} />

      <ExerciseList
        data={exercises}
        onSelect={setSelectedExercise}
        selectedId={selectedExercise?.id} // ID đang chọn
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
