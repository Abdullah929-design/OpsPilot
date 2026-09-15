import axios from "axios";

// Dynamically resolve the backend URL based on the current frontend domain
const getApiBaseUrl = () => {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "http://opspilot.test/api";
  }
  // Maps frontend domain (e.g. acme.opspilot.test:3000) to API domain (http://acme.opspilot.test/api)
  return `${window.location.protocol}//${window.location.hostname}/api`;
};

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
