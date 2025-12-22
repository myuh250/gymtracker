import React, { useMemo, useState } from "react";
import { Typography, Collapse, Empty, Space, DatePicker } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import WorkoutExerciseCard from "./WorkoutExerciseCard";
import WorkoutCardHeader from "./WorkoutCardHeader";

const { Title } = Typography;

export default function WorkoutList({
  workouts = [],
  exercises = [],
  onToggleComplete,
  onToggleSetComplete,
  onEdit,
  onDelete,
}) {
  const [filterDate, setFilterDate] = useState(null);

  const filteredWorkouts = useMemo(() => {
    if (!filterDate) return workouts;
    return workouts.filter((w) => dayjs(w.logDate).isSame(filterDate, "day"));
  }, [workouts, filterDate]);
  // Helper: Tìm tên bài tập từ ID
  const getExerciseName = (id) => {
    const ex = exercises.find((e) => e.id === id);
    return ex ? ex.name : "Unknown Exercise";
  };

  // Helper: Gom nhóm các sets phẳng thành danh sách bài tập
  // Input: [ {exId: 1, set: 1}, {exId: 1, set: 2}, {exId: 2, set: 1} ]
  // Output: { 1: [set1, set2], 2: [set1] }
  const groupSetsByExercise = (flatSets) => {
    return flatSets.reduce((acc, set) => {
      if (!acc[set.exerciseId]) {
        acc[set.exerciseId] = [];
      }
      acc[set.exerciseId].push(set);
      return acc;
    }, {});
  };

  if (workouts.length === 0) {
    return (
      <Empty
        description="Chưa có lịch sử tập luyện"
        style={{ marginTop: 40 }}
      />
    );
  }

  return (
    <Space direction="vertical" style={{ width: "100%", marginTop: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          <ClockCircleOutlined /> Lịch sử tập luyện
        </Title>
        <Space>
          <DatePicker
            placeholder="Lọc theo ngày"
            value={filterDate}
            onChange={setFilterDate}
            format="DD/MM/YYYY"
            allowClear
          />
        </Space>
      </div>

      <Collapse
        defaultActiveKey={[0]}
        ghost
        items={filteredWorkouts.map((workout, index) => {
          const groupedExercises = groupSetsByExercise(workout.sets || []);
          const exerciseIds = Object.keys(groupedExercises);
          const totalSets = (workout.sets || []).length;

          return {
            key: index,
            label: (
              <WorkoutCardHeader
                workout={workout}
                exerciseCount={exerciseIds.length}
                totalSets={totalSets}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ),
            style: {
              background: "#fff",
              borderRadius: 8,
              marginBottom: 12,
              border: "1px solid #f0f0f0",
            },
            children: (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {exerciseIds.map((exId) => {
                  const sets = groupedExercises[exId];
                  const exerciseName = getExerciseName(Number(exId));

                  return (
                    <WorkoutExerciseCard
                      key={exId}
                      exerciseId={Number(exId)}
                      exerciseName={exerciseName}
                      sets={sets}
                      workoutId={workout.id}
                      onToggleSetComplete={onToggleSetComplete}
                    />
                  );
                })}
              </div>
            ),
          };
        })}
      />
    </Space>
  );
}
