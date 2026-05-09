// ─────────────────────────────────────────────────────────────────────────────
// src/routes/AdminRoute.jsx
// Guards admin-only routes.
// - Not authenticated → /login
// - Authenticated but not admin → / (creator dashboard)
// - Admin → renders children
// ─────────────────────────────────────────────────────────────────────────────

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../constants/routes";

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, initialized } = useAuth();
  const location = useLocation();

  if (!initialized) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    // Creator trying to access admin → send to creator dashboard
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
}
