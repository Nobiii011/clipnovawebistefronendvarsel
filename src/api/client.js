// ─────────────────────────────────────────────────────────────────────────────
// src/api/client.js
// Production-grade axios instance with refresh token queue system.
//
// CRITICAL FEATURES:
// 1. Only ONE refresh request happens even if 20 requests fail simultaneously
// 2. Failed requests are queued and retried after refresh succeeds
// 3. _retry flag prevents infinite interceptor loops
// 4. Refresh endpoint itself is never intercepted
// 5. Hard logout on refresh failure (no infinite retry)
//
// SECURITY:
// - withCredentials: true → sends HttpOnly cookies if backend uses them
// - Access token in Authorization header
// - Refresh token in localStorage (or cookie if backend sets it)
// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios";
import { tokenStorage } from "../lib/tokenStorage";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 15000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // Tokens stored in localStorage, not cookies
});

// ── REFRESH QUEUE STATE ──────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

// ── REQUEST INTERCEPTOR ──────────────────────────────────────────────────────
// Attach access token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── RESPONSE INTERCEPTOR ─────────────────────────────────────────────────────
// Handle 401 with refresh token queue
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh logic if:
    // 1. Not a 401 error
    // 2. Already retried (prevent infinite loop)
    // 3. Request is to /auth/refresh itself
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    // If refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Mark as retrying to prevent infinite loop
    originalRequest._retry = true;
    isRefreshing = true;

    // Attempt refresh
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      // No refresh token → hard logout
      isRefreshing = false;
      tokenStorage.clearAll();
      processQueue(new Error("No refresh token available"), null);
      window.location.href = "/login";
      return Promise.reject(error);
    }

    try {
      // Call refresh endpoint
      const response = await axios.post(
        `${apiClient.defaults.baseURL}/auth/refresh`,
        { refreshToken },
        { withCredentials: false }
      );

      // Backend: { success: true, data: { accessToken, refreshToken } }
      const { accessToken, refreshToken: newRefreshToken } = response.data?.data || {};
      if (!accessToken) {
        throw new Error("No access token in refresh response");
      }
      // Rotate refresh token if backend issued a new one
      if (newRefreshToken) tokenStorage.setRefreshToken(newRefreshToken);

      // Store new access token
      tokenStorage.setAccessToken(accessToken);

      // Retry all queued requests
      processQueue(null, accessToken);

      // Retry original request
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      // Refresh failed → hard logout
      processQueue(refreshError, null);
      tokenStorage.clearAll();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
