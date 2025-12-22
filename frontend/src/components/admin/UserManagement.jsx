import React, { useState, useEffect } from "react";
import { Table, message, Input, Button } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import {
  getUsers,
  toggleBlockUser,
  getUserById,
  createUser,
  updateUser,
} from "../../utils/adminStorage";
import UserProfileModal from "./UserProfileModal";
import UserFormModal from "./UserFormModal";
import { getUserTableColumns } from "./UserTableColumns";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
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

  const handleCreateUser = () => {
    setFormMode("create");
    setEditUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (userId) => {
    const user = getUserById(userId);
    setEditUser(user);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleFormSubmit = (values) => {
    try {
      if (formMode === "create") {
        createUser(values);
        message.success("Tạo user thành công!");
      } else {
        updateUser(editUser.id, values);
        message.success("Cập nhật user thành công!");
      }
      setIsFormOpen(false);
      setEditUser(null);
      loadUsers();
    } catch (error) {
      message.error("Có lỗi xảy ra: " + error.message);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditUser(null);
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
    onEditUser: handleEditUser,
  });

  return (
    <div style={{ background: "#fff", padding: 24, borderRadius: 8 }}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Input
          placeholder="Tìm kiếm user (username, email, tên)..."
          prefix={<SearchOutlined />}
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 400 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateUser}
        >
          Tạo User mới
        </Button>
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

      <UserFormModal
        user={editUser}
        open={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        mode={formMode}
      />
    </div>
  );
}
