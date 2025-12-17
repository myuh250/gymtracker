import React, { useState } from "react";
import { Layout, Typography, Divider } from "antd";
import WorkoutBuilder from "../components/WorkoutBuilder";
import WorkoutList from "../components/WorkoutList";

const { Content } = Layout;
const { Title } = Typography;

const SAMPLE_EXERCISES = [
  { id: 1, name: "Hít đất (Push Up)", muscleGroup: "Chest" },
  { id: 2, name: "Kéo xà (Pull Up)", muscleGroup: "Back" },
  { id: 3, name: "Squat (Gánh tạ)", muscleGroup: "Legs" },
  { id: 4, name: "Đẩy vai (Overhead Press)", muscleGroup: "Shoulders" },
];

export default function WorkoutPage() {
  // State lưu danh sách các buổi tập
  const [workouts, setWorkouts] = useState([]);

  // Hàm xử lý khi tạo buổi tập thành công từ Modal
  const handleCreateWorkout = (newWorkoutPayload) => {
    console.log("New Workout Payload:", newWorkoutPayload);

    // Thêm buổi tập mới vào đầu danh sách
    setWorkouts((prev) => [newWorkoutPayload, ...prev]);
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <Content
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "24px",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Title level={2} style={{ margin: 0 }}>
            Gym Tracker
          </Title>
          {/* Nút tạo nằm trong Component Builder */}
          <WorkoutBuilder
            exercises={SAMPLE_EXERCISES}
            onCreate={handleCreateWorkout}
          />
        </div>

        <Divider />

        {/* Phần hiển thị danh sách */}
        <WorkoutList workouts={workouts} exercises={SAMPLE_EXERCISES} />
      </Content>
    </Layout>
  );
}
