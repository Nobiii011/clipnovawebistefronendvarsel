// ─────────────────────────────────────────────────────────────────────────────
// src/lib/tokenStorage.js
// Single source of truth for JWT token persistence.
//
// SECURITY TRADEOFFS — READ BEFORE MODIFYING:
//
// OPTION A (current): Store tokens in localStorage
//   ✅ Survives page refresh / tab close
//   ✅ Simple to implement
//   ❌ Vulnerable to XSS — any injected script can read tokens
//   → Acceptable for MVP if CSP headers are set on the backend
//
// OPTION B (recommended for production hardening):
//   Access token → memory only (React state / module variable)
//   Refresh token → HttpOnly cookie (set by backend, JS cannot read it)
//   ✅ Refresh token is XSS-proof
//   ✅ Access token never persisted to disk
//   ❌ Access token lost on page refresh → must call /auth/refresh on mount
//   → Requires backend to set Set-Cookie: refreshToken; HttpOnly; Secure; SameSite=Strict
//
// CURRENT IMPLEMENTATION: Option A (localStorage for both tokens).
// When backend is updated to issue HttpOnly refresh cookies,
// remove setRefreshToken / getRefreshToken from here and rely on cookies.
// The refresh call in client.js will work automatically because
// axios withCredentials:true will send the cookie.
// ─────────────────────────────────────────────────────────────────────────────

const ACCESS_TOKEN_KEY = "nx_access_token";
const REFRESH_TOKEN_KEY = "nx_refresh_token";

export const tokenStorage = {
  // ── Access Token ──────────────────────────────────────────
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setAccessToken(token) {
    if (!token) return;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  removeAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  // ── Refresh Token ─────────────────────────────────────────
  // NOTE: If backend switches to HttpOnly cookies, remove these
  // three methods and delete all calls to them in auth.service.js.
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setRefreshToken(token) {
    if (!token) return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
  removeRefreshToken() {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  // ── Clear All ─────────────────────────────────────────────
  // Call this on logout or refresh failure — clears both tokens atomically.
  clearAll() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  // ── Utility ───────────────────────────────────────────────
  hasTokens() {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  },
};
