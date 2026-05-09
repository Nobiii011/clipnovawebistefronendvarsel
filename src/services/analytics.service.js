// src/services/analytics.service.js
// Backend reality:
// GET /analytics/overview → { data: { totalViews, validViews, rejectedViews, totalEarnings } }
// Only one analytics endpoint exists. No per-video analytics, no date range filtering.

import apiClient from "../api/client";
import { normalizeError } from "../lib/apiError";

export async function getAnalyticsOverview(params) {
  try {
    const { data } = await apiClient.get("/analytics/overview", { params });
    return data.data;
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function getTimeSeries(params) {
  try {
    const { data } = await apiClient.get("/analytics/timeseries", { params });
    return data.data ?? [];
  } catch (err) {
    throw normalizeError(err);
  }
}
