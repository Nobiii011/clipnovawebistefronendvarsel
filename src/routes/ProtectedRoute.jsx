// ─────────────────────────────────────────────────────────────────────────────
// src/routes/ProtectedRoute.jsx
// Guards all creator routes.
// - Shows spinner while session is being restored (prevents flash)
// - Preserves intended route via `state.from` for post-login redirect
// ─────────────────────────────────────────────────────────────────────────────

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../constants/routes";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, initialized } = useAuth();
  const location = useLocation();

  if (!initialized) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve intended route so Login can redirect back after success
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return children;
}
