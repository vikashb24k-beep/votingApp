import { createContext, useContext, useEffect, useState } from "react";
import apiClient from "../api/client";

const AuthContext = createContext(null);

const STORAGE_TOKEN_KEY = "vote-token";
const STORAGE_USER_KEY = "vote-user";
const getBrowserStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
};

const hasStorage = () => Boolean(getBrowserStorage());

const readStorage = (key) => {
  const storage = getBrowserStorage();
  if (!storage) {
    return null;
  }

  try {
    return storage.getItem(key);
  } catch (error) {
    return null;
  }
};

const writeStorage = (key, value) => {
  const storage = getBrowserStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(key, value);
  } catch (error) {
    // Ignore storage write failures so auth state can still live in memory.
  }
};

const removeStorage = (key) => {
  const storage = getBrowserStorage();
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(key);
  } catch (error) {
    // Ignore storage cleanup failures to avoid breaking logout/session reset.
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => readStorage(STORAGE_TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const rawUser = readStorage(STORAGE_USER_KEY);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser);
    } catch (error) {
      removeStorage(STORAGE_USER_KEY);
      return null;
    }
  });
  const [bootstrapping, setBootstrapping] = useState(Boolean(token));

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        removeStorage(STORAGE_USER_KEY);
        setUser(null);
        setBootstrapping(false);
        return;
      }

      try {
        const { data } = await apiClient.get("/profile");
        setUser(data.user);
        writeStorage(STORAGE_USER_KEY, JSON.stringify(data.user));
      } catch (error) {
        logout();
      } finally {
        setBootstrapping(false);
      }
    };

    bootstrap();
  }, [token]);

  const persistSession = (nextToken, nextUser) => {
    writeStorage(STORAGE_TOKEN_KEY, nextToken);
    writeStorage(STORAGE_USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const login = (nextToken, nextUser) => {
    persistSession(nextToken, nextUser);
  };

  const logout = () => {
    removeStorage(STORAGE_TOKEN_KEY);
    removeStorage(STORAGE_USER_KEY);
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    const { data } = await apiClient.get("/profile");
    setUser(data.user);
    writeStorage(STORAGE_USER_KEY, JSON.stringify(data.user));
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
