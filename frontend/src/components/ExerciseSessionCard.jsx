import React from "react";
import { Card, Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import SetEditor from "./SetEditor";

export default function ExerciseSessionCard({
  exercise,
  onUpdateSet,
  onAddSet,
  onRemove,
}) {
  const handleUpdateSet = (setIndex, updatedSet) => {
    const newSets = exercise.sets.map((s, idx) =>
      idx === setIndex ? updatedSet : s
    );
    onUpdateSet(exercise.id, newSets);
  };

  return (
    <Card
      size="small"
      title={exercise.name}
      extra={
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onRemove(exercise.id)}
        />
      }
    >
      {exercise.sets.map((set, idx) => (
        <SetEditor
          key={idx}
          set={set}
          onUpdate={(updatedSet) => handleUpdateSet(idx, updatedSet)}
        />
      ))}
      <div style={{ textAlign: "right" }}>
        <Button size="small" onClick={() => onAddSet(exercise.id)}>
          Thêm set
        </Button>
      </div>
    </Card>
  );
}
