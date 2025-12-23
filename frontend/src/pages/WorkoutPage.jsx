import React, { useState, useEffect, lazy, Suspense } from "react";
import { Layout, Typography, Divider, message, Spin } from "antd";
import WorkoutList from "../components/WorkoutList";
import {
  getExercises,
  getWorkouts,
  addWorkout,
  updateWorkout,
  removeWorkout,
  toggleWorkoutCompleted,
  toggleSetCompleted,
} from "../utils/storage";

const WorkoutBuilder = lazy(() => import("../components/WorkoutBuilder"));

const { Content } = Layout;
const { Title } = Typography;

export default function WorkoutPage() {
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [exercisesData, workoutsData] = await Promise.all([
        getExercises(),
        getWorkouts(),
      ]);
      setExercises(exercisesData);
      setWorkouts(workoutsData);
    } catch (error) {
      message.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkout = async (newWorkoutPayload) => {
    try {
      if (editingWorkout) {
        // Update mode
        await updateWorkout({ ...newWorkoutPayload, id: editingWorkout.id });
        message.success("Buổi tập đã được cập nhật");
        setEditingWorkout(null);
      } else {
        // Create mode - Check duplicate date first
        const existingWorkout = workouts.find(
          (w) => w.logDate === newWorkoutPayload.logDate
        );
        if (existingWorkout) {
          message.error(
            `Đã có buổi tập cho ngày ${newWorkoutPayload.logDate}. Vui lòng chọn ngày khác hoặc chỉnh sửa buổi tập hiện có.`
          );
          throw new Error("Duplicate workout date");
        }
        await addWorkout(newWorkoutPayload);
        message.success("Buổi tập đã được tạo");
      }
      await loadData();
    } catch (error) {
      // Parse backend error message for duplicate date
      const errorMsg = error?.message || "";
      if (errorMsg.includes("already exists")) {
        message.error("Đã có buổi tập cho ngày này. Vui lòng chọn ngày khác.");
      } else if (errorMsg !== "Duplicate workout date") {
        // Don't show error message again for duplicate (already shown above)
        message.error("Lưu buổi tập thất bại: " + errorMsg);
      }
      throw error; // Re-throw to let WorkoutBuilder know it failed
    }
  };

  const handleToggleComplete = async (workoutId) => {
    try {
      await toggleWorkoutCompleted(workoutId);
      await loadData();
    } catch (error) {
      message.error("Cập nhật trạng thái thất bại");
    }
  };

  const handleToggleSetComplete = async (workoutId, setId) => {
    try {
      await toggleSetCompleted(workoutId, setId);
      await loadData();
    } catch (error) {
      message.error("Cập nhật set thất bại");
    }
  };

  const handleEditWorkout = (workout) => {
    setEditingWorkout(workout);
  };

  const handleDeleteWorkout = async (workoutId) => {
    try {
      await removeWorkout(workoutId);
      await loadData();
      message.success("Đã xóa buổi tập");
    } catch (error) {
      message.error("Xóa buổi tập thất bại");
    }
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
          <Suspense fallback={<Spin />}>
            <WorkoutBuilder
              exercises={exercises}
              workouts={workouts}
              onCreate={handleCreateWorkout}
              editingWorkout={editingWorkout}
              onCancelEdit={() => setEditingWorkout(null)}
            />
          </Suspense>
        </div>

        <Divider />

        {/* Phần hiển thị danh sách */}
        <WorkoutList
          workouts={workouts}
          exercises={exercises}
          onToggleComplete={handleToggleComplete}
          onToggleSetComplete={handleToggleSetComplete}
          onEdit={handleEditWorkout}
          onDelete={handleDeleteWorkout}
        />
      </Content>
    </Layout>
  );
}
