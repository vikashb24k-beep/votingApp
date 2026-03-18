import axios from "axios";

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

const getStoredToken = () => {
  const storage = getBrowserStorage();
  if (!storage) {
    return null;
  }

  try {
    return storage.getItem("vote-token");
  } catch (error) {
    return null;
  }
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
