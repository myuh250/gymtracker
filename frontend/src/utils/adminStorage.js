// Mock user management với localStorage
const MOCK_USERS = [
  {
    id: 1,
    username: "admin",
    email: "admin@gymtracker.com",
    fullName: "Admin User",
    role: "ROLE_ADMIN",
    isBlocked: false,
    createdAt: "2025-01-01",
    lastLogin: "2025-12-20",
  },
  {
    id: 2,
    username: "john_doe",
    email: "john@example.com",
    fullName: "John Doe",
    role: "ROLE_USER",
    isBlocked: false,
    createdAt: "2025-01-15",
    lastLogin: "2025-12-19",
  },
  {
    id: 3,
    username: "jane_smith",
    email: "jane@example.com",
    fullName: "Jane Smith",
    role: "ROLE_USER",
    isBlocked: false,
    createdAt: "2025-02-01",
    lastLogin: "2025-12-18",
  },
];

export function getUsers() {
  try {
    const raw = localStorage.getItem("admin_users");
    if (!raw) {
      localStorage.setItem("admin_users", JSON.stringify(MOCK_USERS));
      return MOCK_USERS.slice();
    }
    return JSON.parse(raw) || [];
  } catch (e) {
    console.error("getUsers error", e);
    return MOCK_USERS.slice();
  }
}

export function saveUsers(users) {
  try {
    localStorage.setItem("admin_users", JSON.stringify(users || []));
  } catch (e) {
    console.error("saveUsers error", e);
  }
}

export function getUserById(id) {
  const users = getUsers();
  return users.find((u) => u.id === id);
}

export function toggleBlockUser(id) {
  const users = getUsers();
  const updated = users.map((u) =>
    u.id === id ? { ...u, isBlocked: !u.isBlocked } : u
  );
  saveUsers(updated);
  return updated.find((u) => u.id === id);
}

export function updateUser(user) {
  const users = getUsers();
  const updated = users.map((u) => (u.id === user.id ? user : u));
  saveUsers(updated);
  return user;
}
