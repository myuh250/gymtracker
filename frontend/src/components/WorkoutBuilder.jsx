import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Select,
  DatePicker,
  message,
  Space,
  Typography,
  Divider,
} from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import ExerciseSessionCard from "./ExerciseSessionCard";

const { Option } = Select;
const { Text } = Typography;

export default function WorkoutBuilder({
  exercises = [],
  workouts = [],
  onCreate,
  editingWorkout = null,
  onCancelEdit,
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(dayjs());
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [filterMuscleGroup, setFilterMuscleGroup] = useState(null);
  const [sessionExercises, setSessionExercises] = useState([]);

  // Lấy danh sách muscle groups có trong exercises
  const availableMuscleGroups = React.useMemo(() => {
    const groups = new Set(
      exercises.map((ex) => ex.muscleGroup).filter(Boolean)
    );
    return Array.from(groups).sort();
  }, [exercises]);

  // Filter exercises theo muscle group
  const filteredExercises = React.useMemo(() => {
    if (!filterMuscleGroup) return exercises;
    return exercises.filter((ex) => ex.muscleGroup === filterMuscleGroup);
  }, [exercises, filterMuscleGroup]);

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
            id: s.id || Date.now() + Math.random(),
            setNumber: s.setNumber,
            reps: s.reps,
            weight: s.weight,
            isCompleted: s.isCompleted || false,
            notes: s.notes || "",
            restTimeSeconds: s.restTimeSeconds || 60,
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
        sets: [
          {
            id: Date.now() + Math.random(),
            setNumber: 1,
            reps: 8,
            weight: 0,
            isCompleted: false,
            notes: "",
            restTimeSeconds: 60,
          },
        ],
      },
    ]);
    setSelectedExerciseId(null);
  };

  const updateSet = (sessionId, newSets) => {
    setSessionExercises((s) =>
      s.map((se) => (se.id === sessionId ? { ...se, sets: newSets } : se))
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
                {
                  id: Date.now() + Math.random(),
                  setNumber: se.sets.length + 1,
                  reps: 8,
                  weight: 0,
                  isCompleted: false,
                  notes: "",
                  restTimeSeconds: 60,
                },
              ],
            }
          : se
      )
    );
  };

  const removeExercise = (sessionId) => {
    setSessionExercises((s) => s.filter((se) => se.id !== sessionId));
  };

  const handleCreate = async () => {
    if (!sessionExercises.length)
      return message.warn("Thêm ít nhất 1 bài tập vào buổi tập");
    const payload = {
      logDate: date.format("YYYY-MM-DD"),
      notes: "(mock)",
      isCompleted: editingWorkout ? editingWorkout.isCompleted : false,
      totalDurationMinutes: 0,
      sets: sessionExercises.flatMap((se) =>
        se.sets.map((st) => ({
          id: st.id,
          exerciseId: se.exerciseId,
          setNumber: st.setNumber,
          reps: st.reps,
          weight: st.weight,
          isCompleted: st.isCompleted || false,
          notes: st.notes || "",
          restTimeSeconds: st.restTimeSeconds || 60,
        }))
      ),
    };

    try {
      // Wait for onCreate to complete - it will show success/error messages
      if (onCreate) await onCreate(payload);
      // Only close modal if successful (no error thrown)
      handleClose();
    } catch (error) {
      // Error already handled by onCreate, just don't close modal
      console.error("Workout creation failed:", error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSessionExercises([]);
    setDate(dayjs());
    setFilterMuscleGroup(null);
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
          <DatePicker
            value={date}
            onChange={(d) => setDate(d || dayjs())}
            disabledDate={(current) => {
              // Don't disable when editing current workout
              if (
                editingWorkout &&
                current.format("YYYY-MM-DD") === editingWorkout.logDate
              ) {
                return false;
              }
              // Disable dates that already have workouts
              return workouts.some(
                (w) => w.logDate === current.format("YYYY-MM-DD")
              );
            }}
            format="DD/MM/YYYY"
          />
          <Select
            style={{ minWidth: 160 }}
            placeholder="Lọc nhóm cơ"
            value={filterMuscleGroup}
            onChange={setFilterMuscleGroup}
            allowClear
          >
            {availableMuscleGroups.map((group) => (
              <Option key={group} value={group}>
                {group}
              </Option>
            ))}
          </Select>
          <Select
            style={{ minWidth: 280 }}
            placeholder="Chọn bài tập để thêm"
            value={selectedExerciseId}
            onChange={(v) => setSelectedExerciseId(v)}
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {filteredExercises.map((e) => (
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
          <Space orientation="vertical" style={{ width: "100%" }}>
            {sessionExercises.map((se) => (
              <ExerciseSessionCard
                key={se.id}
                exercise={se}
                onUpdateSet={updateSet}
                onAddSet={addSetRow}
                onRemove={removeExercise}
              />
            ))}
          </Space>
        )}
      </Modal>
    </>
  );
}
