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

  useEffect(() => {
    setExercises(getExercises());
  }, []);

  const handleAdd = (newItem) => {
    const itemWithId = { ...newItem, id: Date.now() };
    addExercise(itemWithId);
    setExercises(getExercises());
    message.success("Đã thêm thành công!");
  };

  const handleEdit = async (updatedItem) => {
    // Convert File to base64 if present
    if (updatedItem.mediaFile instanceof File) {
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(updatedItem.mediaFile);
      });
      updatedItem = { ...updatedItem, mediaUrl: dataUrl, mediaFile: undefined };
    }
    updateExercise(updatedItem);
    setExercises(getExercises());
    if (selectedExercise?.id === updatedItem.id) {
      setSelectedExercise(updatedItem);
    }
    message.success("Đã sửa thành công!");
  };

  const handleDelete = (idToDelete) => {
    removeExercise(idToDelete);
    setExercises(getExercises());
    if (selectedExercise?.id === idToDelete) {
      setSelectedExercise(null);
    }
    message.success("Đã xóa bài tập!");
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
