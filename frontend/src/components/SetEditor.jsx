import React from "react";
import { InputNumber, Input, Checkbox, Typography } from "antd";

const { Text } = Typography;

export default function SetEditor({ set, onUpdate }) {
  const handleChange = (key, value) => {
    onUpdate({ ...set, [key]: value });
  };

  return (
    <div
      style={{
        marginBottom: 16,
        padding: 12,
        background: "#fafafa",
        borderRadius: 4,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text strong style={{ width: 60 }}>
          Set {set.setNumber}
        </Text>
        <div
          style={{
            display: "flex",
            gap: 12,
            flex: 1,
            flexWrap: "wrap",
          }}
        >
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Reps
            </Text>
            <InputNumber
              min={0}
              value={set.reps}
              onChange={(v) => handleChange("reps", v)}
              size="small"
              style={{ width: 70 }}
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Weight (kg)
            </Text>
            <InputNumber
              min={0}
              step={0.5}
              value={set.weight}
              onChange={(v) => handleChange("weight", v)}
              size="small"
              style={{ width: 80 }}
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Rest (s)
            </Text>
            <InputNumber
              min={0}
              step={5}
              value={set.restTimeSeconds}
              onChange={(v) => handleChange("restTimeSeconds", v)}
              size="small"
              style={{ width: 70 }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <Checkbox
              checked={set.isCompleted}
              onChange={(e) => handleChange("isCompleted", e.target.checked)}
            >
              Done
            </Checkbox>
          </div>
        </div>
      </div>
      <div>
        <Input
          placeholder="Notes (optional)"
          value={set.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          size="small"
        />
      </div>
    </div>
  );
}
