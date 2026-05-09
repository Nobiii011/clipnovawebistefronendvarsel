// src/services/admin.service.js
// All admin API calls. SUPER_ADMIN only.
// Response shapes confirmed against live backend.

import apiClient from "../api/client";
import { normalizeError } from "../lib/apiError";

// ── Users ─────────────────────────────────────────────────────────────────────
// GET /admin/users → { data: { users: User[], total, page, limit } }
export async function getAdminUsers(params = {}) {
  try {
    const { data } = await apiClient.get("/admin/users", { params });
    return data.data; // { users, total, page, limit }
  } catch (err) { throw normalizeError(err); }
}

export async function getAdminUser(id) {
  try {
    const { data } = await apiClient.get(`/admin/users/${id}`);
    return data.data;
  } catch (err) { throw normalizeError(err); }
}

export async function blockUser(id) {
  try {
    const { data } = await apiClient.patch(`/admin/users/${id}/block`);
    return data.data;
  } catch (err) { throw normalizeError(err); }
}

export async function unblockUser(id) {
  try {
    const { data } = await apiClient.patch(`/admin/users/${id}/unblock`);
    return data.data;
  } catch (err) { throw normalizeError(err); }
}

// ── Withdrawals ───────────────────────────────────────────────────────────────
// GET /withdrawals/admin/all → { data: { withdrawals: [], total, page, limit } }
export async function getAdminWithdrawals(params = {}) {
  try {
    const { data } = await apiClient.get("/withdrawals/admin/all", { params });
    return data.data; // { withdrawals, total, page, limit }
  } catch (err) { throw normalizeError(err); }
}

export async function approveWithdrawal(id, adminNote = "") {
  try {
    const { data } = await apiClient.patch(`/withdrawals/${id}/approve`, { adminNote });
    return data.data;
  } catch (err) { throw normalizeError(err); }
}

export async function rejectWithdrawal(id, adminNote = "") {
  try {
    const { data } = await apiClient.patch(`/withdrawals/${id}/reject`, { adminNote });
    return data.data;
  } catch (err) { throw normalizeError(err); }
}

export async function markWithdrawalPaid(id) {
  try {
    const { data } = await apiClient.patch(`/withdrawals/${id}/paid`);
    return data.data;
  } catch (err) { throw normalizeError(err); }
}

// ── Fraud ─────────────────────────────────────────────────────────────────────
// GET /fraud/flags → { data: FraudFlag[] }  (flat array, no pagination wrapper)
export async function getFraudFlags(params = {}) {
  try {
    const { data } = await apiClient.get("/fraud/flags", { params });
    return data.data ?? [];
  } catch (err) { throw normalizeError(err); }
}

export async function resolveFlag(id) {
  try {
    const { data } = await apiClient.patch(`/fraud/flags/${id}/resolve`);
    return data.data;
  } catch (err) { throw normalizeError(err); }
}

// ── Audit Logs ────────────────────────────────────────────────────────────────
// GET /admin/audit-logs → { data: { logs: [], total, page, limit } }
export async function getAuditLogs(params = {}) {
  try {
    const { data } = await apiClient.get("/admin/audit-logs", { params });
    return data.data; // { logs, total, page, limit }
  } catch (err) { throw normalizeError(err); }
}

// ── Admin Videos ──────────────────────────────────────────────────────────────
// GET /admin/videos → { data: { videos: [], total, page, limit } }
export async function getAdminVideos(params = {}) {
  try {
    const { data } = await apiClient.get("/admin/videos", { params });
    return data.data;
  } catch (err) { throw normalizeError(err); }
}

export async function adminDeleteVideo(id) {
  try {
    await apiClient.delete(`/admin/videos/${id}`);
  } catch (err) { throw normalizeError(err); }
}

// ── Settings ──────────────────────────────────────────────────────────────────
// GET /settings → { data: SystemSetting[] }  (array of { key, value, description })
export async function getSettings() {
  try {
    const { data } = await apiClient.get("/settings");
    return data.data ?? [];
  } catch (err) { throw normalizeError(err); }
}

// PATCH /settings → body: { settings: [{ key, value }] }
export async function updateSettings(settings) {
  try {
    const { data } = await apiClient.patch("/settings", { settings });
    return data.data ?? [];
  } catch (err) { throw normalizeError(err); }
}

// ── Admin Analytics Dashboard ─────────────────────────────────────────────────
// GET /analytics/admin/dashboard → { data: { totalViews, validViews, rejectedViews, totalEarnings, topCreators } }
export async function getAdminDashboard(params = {}) {
  try {
    const { data } = await apiClient.get("/analytics/admin/dashboard", { params });
    return data.data;
  } catch (err) { throw normalizeError(err); }
}
