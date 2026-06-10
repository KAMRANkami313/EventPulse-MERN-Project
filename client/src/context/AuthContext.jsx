import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api";

/**
 * AuthContext — Centralized authentication state management
 *
 * PROBLEMS SOLVED:
 * - Token/user read from localStorage in 9+ files → now in ONE place
 * - Stale user data → refreshUser() fetches latest from server
 * - Manual `headers: { Authorization: Bearer ${token} }` everywhere → api interceptor handles it
 * - No logout function shared → logout() available everywhere via useAuth()
 *
 * USAGE in any component:
 *   const { user, token, login, logout, refreshUser } = useAuth();
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  const [loading, setLoading] = useState(false);

  // Keep localStorage in sync with state
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  /**
   * Login — Stores token and user data after successful authentication
   */
  const login = useCallback((tokenValue, userData) => {
    setToken(tokenValue);
    setUser(userData);
  }, []);

  /**
   * Logout — Clears all auth state and redirects to login
   */
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }, []);

  /**
   * Refresh User — Fetches the latest user data from the server
   * Useful after profile updates to keep state in sync
   */
  const refreshUser = useCallback(async () => {
    if (!user?._id) return;
    try {
      const response = await api.get(`/users/${user._id}`);
      if (response.data) {
        const userData = response.data;
        // Preserve the token since the API doesn't return it
        setUser(userData);
        return userData;
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
    return null;
  }, [user?._id]);

  /**
   * Update User — Partially updates the user state (e.g., after profile edit)
   * Merges new data with existing user state
   */
  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      if (!prev) return updates;
      return { ...prev, ...updates };
    });
  }, []);

  /**
   * Check if the current user is an admin
   */
  const isAdmin = user?.role === "admin";

  /**
   * Check if the user is authenticated
   */
  const isAuthenticated = Boolean(token && user);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    refreshUser,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook — Access auth state from any component
 *
 * Usage:
 *   import { useAuth } from "../context/AuthContext";
 *   const { user, token, login, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;