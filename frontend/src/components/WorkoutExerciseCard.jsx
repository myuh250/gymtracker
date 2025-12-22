import React from "react";
import { Card, Tag, Table, message, Checkbox } from "antd";

const WorkoutExerciseCard = React.memo(
  ({ exerciseId, exerciseName, sets, workoutId, onToggleSetComplete }) => {
    const completedCount = sets.filter((s) => s.isCompleted).length;
    const totalSets = sets.length;
    const allCompleted = completedCount === totalSets;

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
            <Tag color={allCompleted ? "success" : "processing"}>
              {completedCount}/{totalSets} sets
            </Tag>
          </div>
        }
        type="inner"
        styles={{ body: { padding: 0 } }}
      >
        <Table
          dataSource={sets}
          rowKey={(record) => record.id || record.setNumber}
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
              width: 80,
              render: (val) => <b>{val} kg</b>,
            },
            {
              title: "Reps",
              dataIndex: "reps",
              width: 80,
              render: (val) => `${val} reps`,
            },
            {
              title: "Rest",
              dataIndex: "restTimeSeconds",
              width: 70,
              render: (val) => (val ? `${val}s` : "-"),
            },
            {
              title: "Done",
              dataIndex: "isCompleted",
              width: 70,
              align: "center",
              render: (isCompleted, record) => (
                <Checkbox
                  checked={isCompleted}
                  onChange={(e) => {
                    e.stopPropagation();
                    if (onToggleSetComplete) {
                      onToggleSetComplete(workoutId, record.id);
                      message.success(
                        isCompleted
                          ? `Bỏ đánh dấu Set ${record.setNumber}`
                          : `Hoàn thành Set ${record.setNumber}!`
                      );
                    }
                  }}
                />
              ),
            },
          ]}
        />
        {sets.some((s) => s.notes) && (
          <div
            style={{ padding: "8px 12px", background: "#fafafa", fontSize: 12 }}
          >
            {sets
              .filter((s) => s.notes)
              .map((s) => (
                <div key={s.id || s.setNumber}>
                  <Tag size="small">Set {s.setNumber}</Tag> {s.notes}
                </div>
              ))}
          </div>
        )}
      </Card>
    );
  }
);

export default WorkoutExerciseCard;
