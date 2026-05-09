// src/services/link.service.js
// GET /l/:shortCode  → public, no auth → { video: { id, title, videoUrl }, link: { id, shortCode } }
// POST /links        → create link for video (auth required)
// GET /links/video/:videoId → get all links for a video (auth required)
// PATCH /links/:id/toggle  → toggle link active/inactive

import apiClient from "../api/client";
import { normalizeError } from "../lib/apiError";

// Public — no auth needed
export async function resolveShortLink(shortCode) {
  try {
    const r = await fetch(`/api/l/${shortCode}`);
    const d = await r.json();
    if (!d.success) throw { message: d.message, status: r.status };
    return d.data; // { video: { id, title, description, videoUrl }, link: { id, shortCode } }
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function createLink(videoId) {
  try {
    const { data } = await apiClient.post("/links", { videoId });
    return data.data;
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function getVideoLinks(videoId) {
  try {
    const { data } = await apiClient.get(`/links/video/${videoId}`);
    return data.data ?? [];
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function toggleLink(linkId) {
  try {
    const { data } = await apiClient.patch(`/links/${linkId}/toggle`);
    return data.data;
  } catch (err) {
    throw normalizeError(err);
  }
}
