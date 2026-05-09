// ─────────────────────────────────────────────────────────────────────────────
// src/context/AuthContext.jsx
// Full session restore flow:
//   1. Try /auth/me with stored access token
//   2. If 401 → attempt refresh
//   3. Retry /auth/me with new token
//   4. If still fails → clean logout
//
// `initialized` prevents ProtectedRoute from flashing before session check.
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { tokenStorage } from "../lib/tokenStorage";
import { getCurrentUser, logout as logoutService, refreshSession } from "../services/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false); // true after session check completes

  // ── RESTORE SESSION ON MOUNT ───────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      // No token at all → skip API call
      if (!tokenStorage.hasTokens()) {
        setInitialized(true);
        return;
      }

      try {
        // Step 1: Try /auth/me with current access token
        const userData = await getCurrentUser();
        if (!cancelled) setUser(userData);
      } catch (err) {
        if (err.status === 401) {
          // Step 2: Access token expired → try refresh
          try {
            await refreshSession();
            // Step 3: Retry /auth/me with new token
            const userData = await getCurrentUser();
            if (!cancelled) setUser(userData);
          } catch {
            // Step 4: Refresh failed → clean logout
            tokenStorage.clearAll();
          }
        } else {
          // Non-auth error (network, 500) → clear tokens to be safe
          tokenStorage.clearAll();
        }
      } finally {
        if (!cancelled) setInitialized(true);
      }
    }

    restoreSession();
    return () => { cancelled = true; };
  }, []);

  // ── AUTH ACTIONS ───────────────────────────────────────────────────────────

  // Called after successful login — stores tokens + sets user
  const loginSuccess = useCallback((userData, accessToken, refreshToken) => {
    tokenStorage.setAccessToken(accessToken);
    if (refreshToken) tokenStorage.setRefreshToken(refreshToken);
    setUser(userData);
  }, []);

  // Full logout — calls backend + clears local state
  const logout = useCallback(async () => {
    await logoutService();
    setUser(null);
  }, []);

  // ── DERIVED STATE ──────────────────────────────────────────────────────────
  const value = useMemo(
    () => ({
      user,
      initialized,                    // true once session check is done
      isLoading: !initialized,        // alias for backwards compat
      isAuthenticated: !!user,
      // Backend uses CREATOR_ADMIN, PLATFORM_ADMIN, or SUPER_ADMIN
      isAdmin: user?.role === "PLATFORM_ADMIN" || user?.role === "SUPER_ADMIN" || user?.role === "admin",
      loginSuccess,
      logout,
      setUser,
    }),
    [user, initialized, loginSuccess, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
