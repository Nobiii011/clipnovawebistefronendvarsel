// ─────────────────────────────────────────────────────────────────────────────
// src/lib/apiError.js
// Normalizes raw axios errors into clean, user-readable error objects.
// NO raw backend stack traces ever reach the UI.
//
// Usage:
//   import { normalizeError } from "../lib/apiError";
//   catch (err) { throw normalizeError(err); }
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} NormalizedError
 * @property {string}  message   - Human-readable message safe to show in UI
 * @property {number}  status    - HTTP status code (0 = network error)
 * @property {string}  code      - Machine-readable error code
 * @property {Object}  [fields]  - Validation field errors { fieldName: message }
 */

const STATUS_MESSAGES = {
  400: "Invalid request. Please check your input.",
  401: "Your session has expired. Please log in again.",
  403: "You do not have permission to perform this action.",
  404: "The requested resource was not found.",
  409: "A conflict occurred. This resource may already exist.",
  422: "Validation failed. Please check your input.",
  429: "Too many requests. Please slow down.",
  500: "Server error. Please try again later.",
  502: "Server is temporarily unavailable.",
  503: "Service unavailable. Please try again later.",
};

/**
 * Normalize any axios error into a consistent shape.
 * @param {import("axios").AxiosError} error
 * @returns {NormalizedError}
 */
export function normalizeError(error) {
  // Network error — no response received (CORS, offline, server down)
  if (!error.response) {
    return {
      message: "Network error. Please check your connection.",
      status: 0,
      code: "NETWORK_ERROR",
    };
  }

  const { status, data } = error.response;

  // Extract validation field errors if backend sends them
  const fields = data?.errors || data?.fieldErrors || null;

  // Backend may send { message: "..." } or { error: "..." }
  const backendMessage = data?.message || data?.error || null;

  // Use backend message only if it's a safe user-facing string (not a stack trace)
  const isSafeMessage =
    backendMessage &&
    typeof backendMessage === "string" &&
    backendMessage.length < 200 &&
    !backendMessage.includes("at ") && // filter stack traces
    !backendMessage.includes("Error:");

  const message = isSafeMessage
    ? backendMessage
    : STATUS_MESSAGES[status] || "An unexpected error occurred.";

  return {
    message,
    status,
    code: data?.code || `HTTP_${status}`,
    ...(fields && { fields }),
  };
}

/**
 * Returns true if the error is a 401 Unauthorized.
 */
export function isUnauthorized(error) {
  return error?.response?.status === 401;
}

/**
 * Returns true if the error is a network/connection error.
 */
export function isNetworkError(error) {
  return !error?.response;
}
