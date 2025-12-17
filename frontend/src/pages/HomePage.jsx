import React, { useState } from "react";
import { message } from "antd";
import ExerciseList from "../components/ExerciseList";
import ExerciseDetail from "../components/ExerciseDetail";

const DATA_MAU = [
  {
    id: 1,
    name: "Hít đất",
    muscleGroup: "Chest",
    description: "Tập ngực",
    mediaUrl: "",
  },
  {
    id: 2,
    name: "Kéo xà",
    muscleGroup: "Back",
    description: "Tập lưng",
    mediaUrl: "",
  },
];

export default function HomePage() {
  const [exercises, setExercises] = useState(DATA_MAU);
  const [selectedExercise, setSelectedExercise] = useState(null);

  // add
  const handleAdd = (newItem) => {
    const itemWithId = { ...newItem, id: Date.now() }; // Tạo ID giả bằng thời gian hiện tại
    setExercises([...exercises, itemWithId]); // Gộp bài cũ + bài mới
    message.success("Đã thêm thành công!");
  };

  // edit
  const handleEdit = (updatedItem) => {
    // Duyệt qua danh sách, tìm ID trùng thì thay bằng thằng mới
    const newList = exercises.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    setExercises(newList);

    // Nếu đang xem chi tiết bài này thì cập nhật luôn cái đang xem
    if (selectedExercise?.id === updatedItem.id) {
      setSelectedExercise(updatedItem);
    }
    message.success("Đã sửa thành công!");
  };

  // delete
  const handleDelete = (idToDelete) => {
    // Giữ lại những thằng KHÁC cái ID cần xóa
    const newList = exercises.filter((item) => item.id !== idToDelete);
    setExercises(newList);

    // Nếu đang xem bài bị xóa thì reset về null
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
