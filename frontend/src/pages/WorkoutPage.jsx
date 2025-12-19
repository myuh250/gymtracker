import React, { useState, useEffect } from "react";
import { Layout, Typography, Divider } from "antd";
import WorkoutBuilder from "../components/WorkoutBuilder";
import WorkoutList from "../components/WorkoutList";
import {
  getExercises,
  getWorkouts,
  addWorkout,
  updateWorkout,
  removeWorkout,
  toggleWorkoutCompleted,
  toggleExerciseCompleted,
} from "../utils/storage";

const { Content } = Layout;
const { Title } = Typography;

export default function WorkoutPage() {
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [editingWorkout, setEditingWorkout] = useState(null);

  useEffect(() => {
    setExercises(getExercises());
    setWorkouts(getWorkouts());
  }, []);

  const handleCreateWorkout = (newWorkoutPayload) => {
    if (editingWorkout) {
      // Update mode
      updateWorkout({ ...newWorkoutPayload, id: editingWorkout.id });
      setEditingWorkout(null);
    } else {
      // Create mode
      addWorkout(newWorkoutPayload);
    }
    setWorkouts(getWorkouts());
  };

  const handleToggleComplete = (workoutId) => {
    toggleWorkoutCompleted(workoutId);
    setWorkouts(getWorkouts());
  };

  const handleToggleExerciseComplete = (workoutId, exerciseId) => {
    toggleExerciseCompleted(workoutId, exerciseId);
    setWorkouts(getWorkouts());
  };

  const handleEditWorkout = (workout) => {
    setEditingWorkout(workout);
  };

  const handleDeleteWorkout = (workoutId) => {
    removeWorkout(workoutId);
    setWorkouts(getWorkouts());
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
            exercises={exercises}
            onCreate={handleCreateWorkout}
            editingWorkout={editingWorkout}
            onCancelEdit={() => setEditingWorkout(null)}
          />
        </div>

        <Divider />

        {/* Phần hiển thị danh sách */}
        <WorkoutList
          workouts={workouts}
          exercises={exercises}
          onToggleComplete={handleToggleComplete}
          onToggleExerciseComplete={handleToggleExerciseComplete}
          onEdit={handleEditWorkout}
          onDelete={handleDeleteWorkout}
        />
      </Content>
    </Layout>
  );
}
