export function getApiErrorMessage(error, fallbackMessage) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.code === "ECONNABORTED") {
    return "Request timed out. Please try again.";
  }

  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  if (error?.message === "Network Error") {
    return `Cannot reach backend server. Make sure the API is running on ${apiBaseUrl}.`;
  }

  return fallbackMessage;
}
