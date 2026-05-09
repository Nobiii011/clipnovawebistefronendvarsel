// ─────────────────────────────────────────────────────────────────────────────
// src/services/auth.service.js
// All auth API calls go through here — never call apiClient directly from UI.
// Backend response shape: { success: boolean, message: string, data?: {...} }
// ─────────────────────────────────────────────────────────────────────────────

import apiClient from "../api/client";
import { normalizeError } from "../lib/apiError";
import { tokenStorage } from "../lib/tokenStorage";

export async function register(name, email, password) {
  try {
    const { data } = await apiClient.post("/auth/register", { name, email, password });
    const { accessToken, refreshToken, user } = data.data;
    if (accessToken) tokenStorage.setAccessToken(accessToken);
    if (refreshToken) tokenStorage.setRefreshToken(refreshToken);
    const normalizedUser = { ...user, id: user.id || user._id };
    return { user: normalizedUser, accessToken, refreshToken };
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function login(email, password) {
  try {
    const { data } = await apiClient.post("/auth/login", { email, password });
    // Backend: { success: true, data: { user, accessToken, refreshToken } }
    const { accessToken, refreshToken, user } = data.data;

    if (accessToken) tokenStorage.setAccessToken(accessToken);
    if (refreshToken) tokenStorage.setRefreshToken(refreshToken);

    // Normalize user._id to user.id for frontend consistency
    const normalizedUser = { ...user, id: user.id || user._id };
    return { user: normalizedUser, accessToken, refreshToken };
  } catch (err) {
    throw normalizeError(err);
  }
}

/**
 * Logout — calls backend to invalidate session, then clears local tokens.
 */
export async function logout() {
  try {
    // Backend requires refreshToken in body to invalidate the session server-side
    const refreshToken = tokenStorage.getRefreshToken();
    await apiClient.post("/auth/logout", { refreshToken });
  } catch {
    // Ignore logout errors — always clear local state
  } finally {
    tokenStorage.clearAll();
  }
}

/**
 * Refresh access token using stored refresh token.
 * Returns new accessToken string.
 */
export async function refreshSession() {
  try {
    const refreshToken = tokenStorage.getRefreshToken();
    const { data } = await apiClient.post("/auth/refresh", { refreshToken });
    // Backend: { success: true, data: { accessToken, refreshToken } }
    const { accessToken, refreshToken: newRefreshToken } = data.data;

    if (accessToken) tokenStorage.setAccessToken(accessToken);
    if (newRefreshToken) tokenStorage.setRefreshToken(newRefreshToken);
    return accessToken;
  } catch (err) {
    tokenStorage.clearAll();
    throw normalizeError(err);
  }
}

/**
 * Fetch current authenticated user from /auth/me.
 * Returns normalized user object.
 */
export async function getCurrentUser() {
  try {
    const { data } = await apiClient.get("/auth/me");
    // Backend: { success: true, data: { _id, name, email, role, ... } }
    const user = data.data;
    if (!user) return null;
    
    // Normalize _id to id for frontend consistency
    return { ...user, id: user.id || user._id };
  } catch (err) {
    throw normalizeError(err);
  }
}
