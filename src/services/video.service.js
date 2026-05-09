// src/services/video.service.js
// All video API calls. Backend reality:
// GET  /videos                → { data: Video[] }
// POST /videos                → { data: Video }  (type: DIRECT_UPLOAD, title required)
// GET  /videos/:id            → { data: Video }
// PATCH /videos/:id           → { data: Video }
// DELETE /videos/:id          → { data: null }
// Video status enum: UPLOADING | READY | FAILED | DELETED

import apiClient from "../api/client";
import { normalizeError } from "../lib/apiError";

export async function getVideos(params = {}) {
  try {
    const { data } = await apiClient.get("/videos", { params });
    return data.data ?? [];
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function getVideo(id) {
  try {
    const { data } = await apiClient.get(`/videos/${id}`);
    return data.data;
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function createVideo(payload) {
  // payload: { title, description?, type: "DIRECT_UPLOAD" }
  try {
    const { data } = await apiClient.post("/videos", {
      type: "DIRECT_UPLOAD",
      ...payload,
    });
    return data.data;
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function updateVideo(id, payload) {
  try {
    const { data } = await apiClient.patch(`/videos/${id}`, payload);
    return data.data;
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function deleteVideo(id) {
  try {
    await apiClient.delete(`/videos/${id}`);
  } catch (err) {
    throw normalizeError(err);
  }
}
