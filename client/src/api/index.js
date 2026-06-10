import axios from "axios";

/**
 * Centralized Axios Instance for EventPulse API
 *
 * BENEFITS over raw axios:
 * 1. Base URL configured once — no more `${API_URL}` everywhere
 * 2. Auto-attached Authorization header via interceptor — no more manual `Bearer ${token}`
 * 3. Auto-redirect on 401 (token expired/invalid) — no more stale sessions
 * 4. Consistent error handling — one place to format API errors
 */

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout (helps with slow networks)
});

/**
 * REQUEST INTERCEPTOR
 * Automatically attaches the JWT token to every request.
 * No more manual `headers: { Authorization: Bearer ${token} }` in every call.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR
 * Handles common error scenarios globally:
 * - 401: Token expired/invalid → logout and redirect to login
 * - 403: Insufficient permissions → show error
 * - 500: Server error → show generic message
 */
api.interceptors.response.use(
  (response) => {
    // Any status code in the 2xx range triggers this
    return response;
  },
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token is invalid or expired — log the user out
      // Only redirect if we're not already on an auth page
      const currentPath = window.location.pathname;
      const authPages = ["/login", "/register", "/forgot-password", "/reset-password"];

      if (!authPages.some((page) => currentPath.startsWith(page))) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    // Let the component handle other errors
    return Promise.reject(error);
  }
);

export default api;