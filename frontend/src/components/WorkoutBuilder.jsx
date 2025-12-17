import React, { useState } from "react";
import {
  Modal,
  Button,
  Select,
  DatePicker,
  InputNumber,
  message,
  Card,
  Space,
  Typography,
  Divider,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;
const { Text } = Typography;

export default function WorkoutBuilder({ exercises = [], onCreate }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(dayjs());
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [sessionExercises, setSessionExercises] = useState([]);

  const addExerciseToSession = () => {
    if (!selectedExerciseId) return message.warn("Chọn 1 bài tập trước");
    const found = exercises.find((e) => e.id === selectedExerciseId);
    if (!found) return message.error("Bài tập không tồn tại");
    setSessionExercises((s) => [
      ...s,
      {
        id: Date.now() + Math.random(),
        exerciseId: found.id,
        name: found.name,
        sets: [{ setNumber: 1, reps: 8, weight: 0 }],
      },
    ]);
    setSelectedExerciseId(null);
  };

  const updateSet = (sessionId, setIndex, key, value) => {
    setSessionExercises((s) =>
      s.map((se) => {
        if (se.id !== sessionId) return se;
        const sets = se.sets.map((st, idx) =>
          idx === setIndex ? { ...st, [key]: value } : st
        );
        return { ...se, sets };
      })
    );
  };

  const addSetRow = (sessionId) => {
    setSessionExercises((s) =>
      s.map((se) =>
        se.id === sessionId
          ? {
              ...se,
              sets: [
                ...se.sets,
                { setNumber: se.sets.length + 1, reps: 8, weight: 0 },
              ],
            }
          : se
      )
    );
  };

  const removeExercise = (sessionId) => {
    setSessionExercises((s) => s.filter((se) => se.id !== sessionId));
  };

  const handleCreate = () => {
    if (!sessionExercises.length)
      return message.warn("Thêm ít nhất 1 bài tập vào buổi tập");
    const payload = {
      logDate: date.format("YYYY-MM-DD"),
      notes: "(mock)",
      isCompleted: false,
      totalDurationMinutes: 0,
      sets: sessionExercises.flatMap((se) =>
        se.sets.map((st) => ({
          exerciseId: se.exerciseId,
          setNumber: st.setNumber,
          reps: st.reps,
          weight: st.weight,
        }))
      ),
    };
    if (onCreate) onCreate(payload);
    message.success("Buổi tập đã được lập (mock)");
    setOpen(false);
    setSessionExercises([]);
  };

  return (
    <>
      <Button
        type="primary"
        onClick={() => setOpen(true)}
        style={{ marginLeft: 12 }}
      >
        Tạo buổi tập
      </Button>

      <Modal
        title="Tạo buổi tập - Mock"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleCreate}
        width={800}
      >
        <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
          <DatePicker value={date} onChange={(d) => setDate(d || dayjs())} />
          <Select
            style={{ minWidth: 320 }}
            placeholder="Chọn bài tập để thêm"
            value={selectedExerciseId}
            onChange={(v) => setSelectedExerciseId(v)}
            allowClear
          >
            {exercises.map((e) => (
              <Option key={e.id} value={e.id}>
                {e.name} — {e.muscleGroup}
              </Option>
            ))}
          </Select>
          <Button icon={<PlusOutlined />} onClick={addExerciseToSession}>
            Thêm
          </Button>
        </div>

        <Divider />

        {sessionExercises.length === 0 ? (
          <Text type="secondary">
            Chưa có bài tập nào trong buổi — thêm từ trên.
          </Text>
        ) : (
          <Space direction="vertical" style={{ width: "100%" }}>
            {sessionExercises.map((se) => (
              <Card
                key={se.id}
                size="small"
                title={se.name}
                extra={
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeExercise(se.id)}
                  />
                }
              >
                {se.sets.map((st, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ width: 48 }}>Set {st.setNumber}</Text>
                    <div style={{ display: "flex", gap: 15 }}>
                      <div>
                        <Text type="secondary" style={{ marginRight: 10 }}>
                          Reps{" "}
                        </Text>
                        <InputNumber
                          min={0}
                          value={st.reps}
                          onChange={(v) => updateSet(se.id, idx, "reps", v)}
                        />
                      </div>
                      <div>
                        <Text type="secondary" style={{ marginRight: 10 }}>
                          Weight{" "}
                        </Text>
                        <InputNumber
                          min={0}
                          step={0.5}
                          value={st.weight}
                          onChange={(v) => updateSet(se.id, idx, "weight", v)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ textAlign: "right" }}>
                  <Button size="small" onClick={() => addSetRow(se.id)}>
                    Thêm set
                  </Button>
                </div>
              </Card>
            ))}
          </Space>
        )}
      </Modal>
    </>
  );
}
