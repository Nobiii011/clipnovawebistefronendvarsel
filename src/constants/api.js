// All backend API endpoint paths.
// Import from here — never hardcode endpoint strings in hooks or services.

export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: "/auth/login",
  AUTH_LOGOUT: "/auth/logout",
  AUTH_REFRESH: "/auth/refresh",
  AUTH_ME: "/auth/me",

  // Videos
  VIDEOS: "/videos",
  VIDEO_BY_ID: (id) => `/videos/${id}`,
  VIDEO_UPLOAD: "/videos/upload",
  VIDEO_DELETE: (id) => `/videos/${id}`,

  // Analytics
  ANALYTICS_OVERVIEW: "/analytics/overview",
  ANALYTICS_VIEWS: "/analytics/views",
  ANALYTICS_EARNINGS: "/analytics/earnings",
  ANALYTICS_TOP_VIDEOS: "/analytics/top-videos",

  // Wallet
  WALLET_BALANCE: "/wallet/balance",
  WALLET_TRANSACTIONS: "/wallet/transactions",

  // Withdrawals
  WITHDRAWALS: "/withdrawals",
  WITHDRAWAL_REQUEST: "/withdrawals/request",
  WITHDRAWAL_BY_ID: (id) => `/withdrawals/${id}`,

  // Referrals
  REFERRALS: "/referrals",
  REFERRAL_LINK: "/referrals/link",

  // Settings
  SETTINGS: "/settings",
  SETTINGS_UPDATE: "/settings",

  // Admin
  ADMIN_USERS: "/admin/users",
  ADMIN_USER_BY_ID: (id) => `/admin/users/${id}`,
  ADMIN_USER_BAN: (id) => `/admin/users/${id}/ban`,
  ADMIN_USER_UNBAN: (id) => `/admin/users/${id}/unban`,
  ADMIN_WITHDRAWALS: "/admin/withdrawals",
  ADMIN_WITHDRAWAL_APPROVE: (id) => `/admin/withdrawals/${id}/approve`,
  ADMIN_WITHDRAWAL_REJECT: (id) => `/admin/withdrawals/${id}/reject`,
  ADMIN_FRAUD_FLAGS: "/admin/fraud",
  ADMIN_ANALYTICS: "/admin/analytics",
  ADMIN_AUDIT_LOGS: "/admin/audit-logs",
  ADMIN_SETTINGS: "/admin/settings",
};
