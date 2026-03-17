import { createContext, useContext, useEffect, useState } from "react";
import apiClient from "../api/client";

const AuthContext = createContext(null);

const STORAGE_TOKEN_KEY = "vote-token";
const STORAGE_USER_KEY = "vote-user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const rawUser = localStorage.getItem(STORAGE_USER_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  });
  const [bootstrapping, setBootstrapping] = useState(Boolean(token));

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setBootstrapping(false);
        return;
      }

      try {
        const { data } = await apiClient.get("/profile");
        setUser(data.user);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data.user));
      } catch (error) {
        logout();
      } finally {
        setBootstrapping(false);
      }
    };

    bootstrap();
  }, [token]);

  const persistSession = (nextToken, nextUser) => {
    localStorage.setItem(STORAGE_TOKEN_KEY, nextToken);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const login = (nextToken, nextUser) => {
    persistSession(nextToken, nextUser);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    const { data } = await apiClient.get("/profile");
    setUser(data.user);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data.user));
    return data.user;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        bootstrapping,
        isAuthenticated: Boolean(token && user),
        login,
        logout,
        refreshProfile,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
