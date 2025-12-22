import React from "react";
import { Navigate } from "react-router-dom";
import { Spin } from "antd";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({
  children,
  requireAdmin = false,
  requireUser = false,
}) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // Not authenticated → redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Admin trying to access user routes → redirect to admin
  if (requireUser && isAdmin()) {
    return <Navigate to="/admin" replace />;
  }

  // User trying to access admin routes → redirect to home
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  // All checks passed → render children
  return children;
};

export default ProtectedRoute;
