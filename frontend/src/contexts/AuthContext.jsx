import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";

const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "user";

const AuthContext = createContext(null);

const readUserFromStorage = () => {
  const storedUser = localStorage.getItem(USER_KEY);
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser);
  } catch (error) {
    // Prevent broken JSON from crashing auth restoration.
    return null;
  }
};

const readAuthFromStorage = () => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const user = readUserFromStorage();
  return { token: token || null, user };
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => readAuthFromStorage());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const syncFromStorage = useCallback(() => {
    // Keep React state mirrored to the single source of truth (localStorage).
    setAuthState(readAuthFromStorage());
  }, []);

  useEffect(() => {
    syncFromStorage();
    setLoading(false);
  }, [syncFromStorage]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key && ![ACCESS_TOKEN_KEY, USER_KEY].includes(event.key)) {
        return;
      }
      syncFromStorage(); // Sync auth across tabs on login/logout.
      if (!localStorage.getItem(ACCESS_TOKEN_KEY)) {
        navigate("/login");
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [navigate, syncFromStorage]);

  const login = (userData, accessToken) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    syncFromStorage();

    // Redirect based on role
    if (userData.role === "ROLE_ADMIN") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  const clearAuth = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthState({ token: null, user: null });
  };

  const logout = () => {
    clearAuth();
    navigate("/login");
  };

  const forceLogout = (reason) => {
    // Hook for backend/WebSocket-driven revocation; reason reserved for UI/analytics.
    if (reason) {
      console.warn("Force logout triggered:", reason);
    }
    logout();
  };

  const isAuthenticated = () => !!authState.token && !!authState.user;
  const isAdmin = () => authState.user?.role === "ROLE_ADMIN";

  const value = {
    user: authState.user,
    token: authState.token,
    loading,
    login,
    logout,
    forceLogout,
    isAuthenticated,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
