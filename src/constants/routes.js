// Centralized route path constants.
// Always import from here — never hardcode paths in components.

export const ROUTES = {
  // Public
  LANDING: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  WATCH: "/watch/:shortCode",

  // Creator (protected)
  DASHBOARD: "/dashboard",
  UPLOAD: "/upload",
  UPLOADED_VIDEOS: "/uploaded-videos",
  VIDEO_VIEW: "/videos/:id",
  TELEGRAM: "/telegram",
  REFERRALS: "/referrals",
  PAYMENTS: "/payments",
  WITHDRAWALS: "/withdrawals",
  SUPPORT: "/support",
  ANALYTICS: "/analytics",
  SETTINGS: "/settings",

  // Admin (protected + role-gated)
  ADMIN: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_WITHDRAWALS: "/admin/withdrawals",
  ADMIN_FRAUD: "/admin/fraud",
  ADMIN_ANALYTICS: "/admin/analytics",
  ADMIN_AUDIT_LOGS: "/admin/audit-logs",
  ADMIN_SETTINGS: "/admin/settings",
};
