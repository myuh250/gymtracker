import React from "react";
import { Card, Tag, Table, message } from "antd";

const WorkoutExerciseCard = React.memo(
  ({
    exerciseId,
    exerciseName,
    sets,
    isCompleted,
    workoutId,
    onToggleComplete,
  }) => {
    return (
      <Card
        key={exerciseId}
        size="small"
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>{exerciseName}</span>
            <Tag
              color={isCompleted ? "success" : "default"}
              style={{
                cursor: "pointer",
                fontSize: 14,
                padding: "4px 12px",
              }}
            >
              {isCompleted ? "✓" : "○"}
            </Tag>
          </div>
        }
        type="inner"
        styles={{ body: { padding: 0 } }}
        style={{ cursor: "pointer" }}
        onClick={(e) => {
          e.stopPropagation();
          if (onToggleComplete) {
            onToggleComplete(workoutId, exerciseId);
            message.success(
              isCompleted
                ? `Đã bỏ đánh dấu hoàn thành "${exerciseName}"`
                : `Đã hoàn thành bài tập "${exerciseName}"!`
            );
          }
        }}
      >
        <Table
          dataSource={sets}
          rowKey="setNumber"
          pagination={false}
          size="small"
          columns={[
            {
              title: "Set",
              dataIndex: "setNumber",
              width: 60,
              align: "center",
              render: (text) => <Tag>{text}</Tag>,
            },
            {
              title: "Kg",
              dataIndex: "weight",
              width: 100,
              render: (val) => <b>{val} kg</b>,
            },
            {
              title: "Reps",
              dataIndex: "reps",
              render: (val) => `${val} reps`,
            },
          ]}
        />
      </Card>
    );
  }
);

export default WorkoutExerciseCard;
