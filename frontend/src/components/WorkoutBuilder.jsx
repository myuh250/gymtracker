import React, { useState, useEffect } from "react";
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
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;
const { Text } = Typography;

export default function WorkoutBuilder({
  exercises = [],
  onCreate,
  editingWorkout = null,
  onCancelEdit,
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(dayjs());
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [sessionExercises, setSessionExercises] = useState([]);

  // When editingWorkout changes, open modal and populate form
  useEffect(() => {
    if (editingWorkout) {
      setOpen(true);
      setDate(dayjs(editingWorkout.logDate));

      // Group sets by exerciseId
      const grouped = {};
      (editingWorkout.sets || []).forEach((set) => {
        if (!grouped[set.exerciseId]) {
          grouped[set.exerciseId] = [];
        }
        grouped[set.exerciseId].push(set);
      });

      // Convert to sessionExercises format
      const sessExs = Object.entries(grouped).map(([exId, sets]) => {
        const exercise = exercises.find((e) => e.id === Number(exId));
        return {
          id: Date.now() + Math.random(),
          exerciseId: Number(exId),
          name: exercise ? exercise.name : `Exercise ${exId}`,
          sets: sets.map((s) => ({
            setNumber: s.setNumber,
            reps: s.reps,
            weight: s.weight,
          })),
        };
      });

      setSessionExercises(sessExs);
    }
  }, [editingWorkout, exercises]);

  const addExerciseToSession = () => {
    if (!selectedExerciseId) return message.warning("Vui lòng chọn bài tập");
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
      isCompleted: editingWorkout ? editingWorkout.isCompleted : false,
      completedExercises: editingWorkout
        ? editingWorkout.completedExercises
        : [],
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
    message.success(
      editingWorkout ? "Buổi tập đã được cập nhật" : "Buổi tập đã được lập"
    );
    handleClose();
  };

  const handleClose = () => {
    setOpen(false);
    setSessionExercises([]);
    setDate(dayjs());
    if (editingWorkout && onCancelEdit) {
      onCancelEdit();
    }
  };

  return (
    <>
      <Button
        type="primary"
        icon={editingWorkout ? <EditOutlined /> : undefined}
        onClick={() => setOpen(true)}
        style={{ marginLeft: 12 }}
      >
        {editingWorkout ? "Chỉnh sửa buổi tập" : "Tạo buổi tập"}
      </Button>

      <Modal
        title={editingWorkout ? "Chỉnh sửa buổi tập" : "Tạo buổi tập - Mock"}
        open={open}
        onCancel={handleClose}
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
