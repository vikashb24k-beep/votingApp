export function getApiErrorMessage(error, fallbackMessage) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.code === "ECONNABORTED") {
    return "Request timed out. Please try again.";
  }

  if (error?.message === "Network Error") {
    return "Cannot reach backend server. Make sure the API is running on http://localhost:3000.";
  }

  return fallbackMessage;
}
