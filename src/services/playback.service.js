// src/services/playback.service.js
// POST /playback/session  { linkId, fingerprint? } → { sessionId }
// POST /playback/event    { sessionId, eventType, positionSeconds? }
// POST /playback/finalize { sessionId }
// No auth required — public endpoints

import { normalizeError } from "../lib/apiError";

const BASE = "/api";

async function post(path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const d = await r.json();
  if (!d.success) throw { message: d.message, status: r.status };
  return d.data;
}

export async function createSession(linkId, fingerprint) {
  try {
    return await post("/playback/session", { linkId, fingerprint });
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function sendEvent(sessionId, eventType, positionSeconds) {
  try {
    return await post("/playback/event", { sessionId, eventType, positionSeconds });
  } catch {
    // Events are fire-and-forget — never throw
  }
}

export async function finalizeSession(sessionId) {
  try {
    return await post("/playback/finalize", { sessionId });
  } catch {
    // Best-effort
  }
}
