import React, { useState, useEffect } from "react";
import { Table, message, Input, Button } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import {
  getAllUsers,
  getUserById,
  toggleUserEnabled,
  createUser as createUserAPI,
  updateUser as updateUserAPI,
} from "../../services/adminService";
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

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      message.error("Không thể tải danh sách users: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      await toggleUserEnabled(userId);
      message.success("Đã cập nhật trạng thái user");
      await loadUsers();
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleViewProfile = async (userId) => {
    try {
      const user = await getUserById(userId);
      setViewUser(user);
    } catch (error) {
      message.error("Không thể tải thông tin user: " + error.message);
    }
  };

  const handleCreateUser = () => {
    setFormMode("create");
    setEditUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = async (userId) => {
    try {
      const user = await getUserById(userId);
      setEditUser(user);
      setFormMode("edit");
      setIsFormOpen(true);
    } catch (error) {
      message.error("Không thể tải thông tin user: " + error.message);
    }
  };

  const handleFormSubmit = async (values) => {
    try {
      if (formMode === "create") {
        await createUserAPI(values);
        message.success("Tạo user thành công!");
      } else {
        await updateUserAPI(editUser.id, values);
        message.success("Cập nhật user thành công!");
      }
      setIsFormOpen(false);
      setEditUser(null);
      await loadUsers();
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditUser(null);
  };

  const filteredUsers = users.filter(
    (user) =>
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
