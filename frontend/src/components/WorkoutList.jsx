import React, { useMemo, useState } from "react";
import {
  Card,
  Tag,
  Typography,
  Collapse,
  Table,
  Empty,
  Space,
  Button,
  DatePicker,
  Popconfirm,
  message,
} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import WorkoutExerciseCard from "./WorkoutExerciseCard";

const { Text, Title } = Typography;

export default function WorkoutList({
  workouts = [],
  exercises = [],
  onToggleComplete,
  onToggleExerciseComplete,
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
    <Space orientation="vertical" style={{ width: "100%", marginTop: 24 }}>
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  paddingRight: 12,
                  alignItems: "center",
                }}
              >
                <Space>
                  <CalendarOutlined style={{ color: "#1890ff" }} />
                  <Text strong>
                    {dayjs(workout.logDate).format("DD/MM/YYYY")}
                  </Text>
                  <Button
                    type="primary"
                    size="small"
                    danger={!workout.isCompleted}
                    icon={workout.isCompleted ? <CheckCircleOutlined /> : null}
                    style={{
                      background: workout.isCompleted ? undefined : "#fa8c16",
                      borderColor: workout.isCompleted ? undefined : "#fa8c16",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleComplete) {
                        onToggleComplete(workout.id);
                        message.success(
                          workout.isCompleted
                            ? "Đã đánh dấu chưa hoàn thành"
                            : "Đã hoàn thành buổi tập!"
                        );
                      }
                    }}
                  >
                    {workout.isCompleted ? "Hoàn thành" : "Chưa xong"}
                  </Button>
                </Space>
                <Space>
                  <Text type="secondary">
                    {exerciseIds.length} Bài tập • {totalSets} Sets
                  </Text>
                  {onEdit && (
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(workout);
                      }}
                    />
                  )}
                  {onDelete && (
                    <Popconfirm
                      title="Xóa buổi tập?"
                      description="Bạn có chắc chắn muốn xóa buổi tập này?"
                      onConfirm={(e) => {
                        e?.stopPropagation();
                        onDelete(workout.id);
                      }}
                      okText="Xóa"
                      cancelText="Hủy"
                    >
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Popconfirm>
                  )}
                </Space>
              </div>
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
                  const completedExercises = workout.completedExercises || [];
                  const isExerciseCompleted = completedExercises.includes(
                    Number(exId)
                  );

                  return (
                    <WorkoutExerciseCard
                      key={exId}
                      exerciseId={Number(exId)}
                      exerciseName={exerciseName}
                      sets={sets}
                      isCompleted={isExerciseCompleted}
                      workoutId={workout.id}
                      onToggleComplete={onToggleExerciseComplete}
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
