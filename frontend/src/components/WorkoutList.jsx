import React, { useMemo } from "react";
import { Card, Tag, Typography, Collapse, Table, Empty, Space } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Title } = Typography;
const { Panel } = Collapse;

export default function WorkoutList({ workouts = [], exercises = [] }) {
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
      <Title level={4}>
        <ClockCircleOutlined /> Lịch sử tập luyện
      </Title>

      <Collapse defaultActiveKey={[0]} ghost>
        {workouts.map((workout, index) => {
          const groupedExercises = groupSetsByExercise(workout.sets);
          const exerciseIds = Object.keys(groupedExercises);
          const totalSets = workout.sets.length;

          return (
            <Panel
              key={index}
              header={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    paddingRight: 12,
                  }}
                >
                  <Space>
                    <CalendarOutlined style={{ color: "#1890ff" }} />
                    <Text strong>
                      {dayjs(workout.logDate).format("DD/MM/YYYY")}
                    </Text>
                    <Tag color={workout.isCompleted ? "green" : "orange"}>
                      {workout.isCompleted ? "Đã xong" : "Chưa xong"}
                    </Tag>
                  </Space>
                  <Text type="secondary">
                    {exerciseIds.length} Bài tập • {totalSets} Sets
                  </Text>
                </div>
              }
              style={{
                background: "#fff",
                borderRadius: 8,
                marginBottom: 12,
                border: "1px solid #f0f0f0",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {exerciseIds.map((exId) => {
                  const sets = groupedExercises[exId];
                  const exerciseName = getExerciseName(Number(exId));

                  return (
                    <Card
                      key={exId}
                      size="small"
                      title={exerciseName}
                      type="inner"
                      bodyStyle={{ padding: 0 }}
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
                })}
              </div>
            </Panel>
          );
        })}
      </Collapse>
    </Space>
  );
}
