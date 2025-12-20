import React, { useState, useEffect } from "react";
import { Table, message, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import {
  getUsers,
  toggleBlockUser,
  getUserById,
} from "../../utils/adminStorage";
import UserProfileModal from "./UserProfileModal";
import { getUserTableColumns } from "./UserTableColumns";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setLoading(true);
    setTimeout(() => {
      setUsers(getUsers());
      setLoading(false);
    }, 300);
  };

  const handleBlockUser = (userId) => {
    const user = toggleBlockUser(userId);
    message.success(
      user.isBlocked
        ? `Đã chặn user ${user.username}`
        : `Đã bỏ chặn user ${user.username}`
    );
    loadUsers();
  };

  const handleViewProfile = (userId) => {
    const user = getUserById(userId);
    setViewUser(user);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = getUserTableColumns({
    onViewProfile: handleViewProfile,
    onBlockUser: handleBlockUser,
  });

  return (
    <div style={{ background: "#fff", padding: 24, borderRadius: 8 }}>
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm user (username, email, tên)..."
          prefix={<SearchOutlined />}
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 400 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Tổng ${total} users`,
        }}
      />

      <UserProfileModal
        user={viewUser}
        open={!!viewUser}
        onClose={() => setViewUser(null)}
      />
    </div>
  );
}
